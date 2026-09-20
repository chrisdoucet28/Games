import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TeamIcon } from "../shared/TeamIcon";
import { Icon } from "../shared/Icon";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { GameProps } from "../../types";
import { teamsGridCols, GAME_MODES, GAME_ICONS } from "../../data/constants";
import { denseRank } from "../../utils/ranking";
import { RankBadge } from "../shared/RankBadge";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { FlagPromptButton } from "../shared/FlagPromptButton";
import { PhoneJoinPanel } from "../shared/PhoneJoinPanel";
import { PhoneReconnectBadge } from "../shared/PhoneReconnectBadge";
import { RELAY_TUTORIAL_STEPS } from "../../data/tutorials/relay";
import { playSound } from "../../lib/sounds";
import { setMusicGame, setMusicContext, stopMusic } from "../../lib/music";
import {
  generateSessionCode, openRelayChannel, closeChannel,
  type RelayPhase, type RelayStatePayload, type RelayActionPayload,
} from "../../lib/liveSession";

const GM = GAME_MODES.find(g => g.id === "relay")!;

// Each team gets this many question turns (one question or guess per turn, teams take turns in
// order). Guessing a word early is what earns more words — a team that wastes questions runs out.
const QUESTIONS_PER_TEAM = 10;
const POINTS_PER_WORD = 10;

type Phase = "welcome" | "ready" | "asking" | "reveal" | "final";

const STYLE_TAG = (
  <style>{`
    @keyframes rlWordPop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}
    .rl-btn:hover:not(:disabled){filter:brightness(1.1)}
    .rl-btn:active:not(:disabled){transform:translate(4px,4px) !important;box-shadow:0 0 0 #1A1A2E !important}
  `}</style>
);

const shuffle = <T,>(items: T[]) => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// What "Save & Exit" snapshots and "Resume" restores — the turn cursor and each team's running word
// total. Resuming lands on the "ready" screen for whoever's turn it was, with fresh words for every
// team rather than trying to restore the exact hidden words that were live when saved.
type RelaySnapshot = {
  roundIndex: number;
  teamIndex: number;
  wordsByTeam: Record<string | number, number>;
};

function validateRelaySnapshot(raw: unknown, teamCount: number): RelaySnapshot | undefined {
  const s = raw as Partial<RelaySnapshot> | null | undefined;
  if (!s || typeof s.roundIndex !== "number" || s.roundIndex < 0) return undefined;
  if (typeof s.teamIndex !== "number" || s.teamIndex < 0 || s.teamIndex >= teamCount) return undefined;
  if (s.roundIndex >= QUESTIONS_PER_TEAM) return undefined;
  return { roundIndex: s.roundIndex, teamIndex: s.teamIndex, wordsByTeam: s.wordsByTeam ?? {} };
}

export function RelayGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState, presetPhoneSession }: GameProps) {
  const resumed = useRef(validateRelaySnapshot(initialGameState, teams.length)).current;

  const [phase, setPhase] = useState<Phase>(resumed ? "ready" : "welcome");
  const [showHowTo, setShowHowTo] = useState(false);

  // "Play on Phones" — available whenever there's more than one team. Each phone is one PERSON:
  // several phones can join the same team, and the screen rotates which one is the asker.
  const [inputMode, setInputMode] = useState<"screen" | "phone">(presetPhoneSession ? "phone" : "screen");
  const [introStep, setIntroStep] = useState<"setup" | "qr">("setup");
  const [sessionCode, setSessionCode] = useState<string | null>(presetPhoneSession?.code ?? null);
  const [connectedTeamIds, setConnectedTeamIds] = useState<Set<string | number>>(new Set());
  // Connected phone (device) ids per team, in the order each was first seen — stable, so the asker
  // rotation doesn't reshuffle when someone reconnects. Only phones that report a deviceId appear.
  const [connectedByTeam, setConnectedByTeam] = useState<Record<string, string[]>>({});
  const deviceRosterRef = useRef<Record<string, string[]>>({});
  // Each team's current asker (a device id). Falls back to the first connected phone whenever the
  // stored one isn't connected any more.
  const [askerByTeam, setAskerByTeam] = useState<Record<string, string>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (phase === "final") { playSound("roundComplete"); stopMusic(); }
  }, [phase]);
  useEffect(() => {
    setMusicGame("relay");
    return () => setMusicGame(null);
  }, []);
  // Welcome screen rides the shared gameplay track; play switches to "tension" so a different
  // track starts when the game actually begins (same idiom as Hot Seat / Bounty Board).
  useEffect(() => {
    if (phase !== "welcome" && phase !== "final") setMusicContext("tension");
    return () => setMusicContext("gameplay");
  }, [phase === "welcome" || phase === "final"]);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => { setPhase("final"); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase]);

  const [roundIndex, setRoundIndex] = useState(() => resumed?.roundIndex ?? 0);
  const [teamIndex, setTeamIndex] = useState(() => resumed?.teamIndex ?? 0);
  const [wordsByTeam, setWordsByTeam] = useState<Record<string | number, number>>(() => resumed?.wordsByTeam ?? {});
  const [showWordList, setShowWordList] = useState(false);
  // The word a team just guessed, shown on the reveal card — teamWords already holds their NEXT word.
  const [revealWord, setRevealWord] = useState("");

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): RelaySnapshot => ({ roundIndex, teamIndex, wordsByTeam });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, roundIndex, teamIndex, wordsByTeam]);

  const words = useMemo(() => {
    const uniqueWords = new Map<string, string>();
    questions.forEach(q => {
      const word = q.word?.trim();
      if (word) uniqueWords.set(word.toLowerCase(), word);
    });
    return Array.from(uniqueWords.values());
  }, [questions]);

  // Shuffled deck with reshuffle-on-exhaustion, same pattern as Hot Seat — every word appears
  // exactly once per lap, in a fresh order each lap, and the one-item swap after reshuffling
  // stops the last word of one lap immediately reappearing as the first of the next.
  const deckRef = useRef<string[]>(shuffle(words));
  const deckPosRef = useRef(0);
  const lastWordRef = useRef<string | undefined>(undefined);
  const drawWord = useCallback(() => {
    if (deckPosRef.current >= deckRef.current.length) {
      const next = shuffle(words);
      if (next.length > 1 && next[0] === lastWordRef.current) {
        [next[0], next[1]] = [next[1], next[0]];
      }
      deckRef.current = next;
      deckPosRef.current = 0;
    }
    const word = deckRef.current[deckPosRef.current];
    deckPosRef.current += 1;
    lastWordRef.current = word;
    return word;
  }, [words]);
  // Every team has its own hidden word at all times.
  const [teamWords, setTeamWords] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (words.length > 0) teams.forEach(t => { initial[String(t.id)] = drawWord(); });
    return initial;
  });

  const currentTeam = teams[teamIndex];
  const currentKey = String(currentTeam?.id);
  const isLastTurn = roundIndex === QUESTIONS_PER_TEAM - 1 && teamIndex === teams.length - 1;

  // --- Who is asking, and who answers (phone mode) ---
  const rotatedDevices = (teamKey: string): string[] => {
    const list = connectedByTeam[teamKey] ?? [];
    const stored = askerByTeam[teamKey];
    const at = stored ? list.indexOf(stored) : 0;
    return at <= 0 ? list : [...list.slice(at), ...list.slice(0, at)];
  };
  const teamDevices = connectedByTeam[currentKey] ?? [];
  const askerDeviceId = inputMode === "phone" ? (rotatedDevices(currentKey)[0] ?? null) : null;
  const allDevices = Object.values(connectedByTeam).flat();
  const otherDevices = allDevices.filter(d => !teamDevices.includes(d));
  // Answerers hold the word and the controls: the asking team's other phones, or — if there are
  // none (a one-phone team, or every team is a single student) — everyone else's phones. During the
  // reveal the whole guessing team can move things along. With no answerer phone connected at all,
  // the teacher's screen shows the word and holds the controls instead.
  let answererDeviceIds: string[] = [];
  if (inputMode === "phone") {
    const own = phase === "reveal" ? teamDevices : teamDevices.filter(d => d !== askerDeviceId);
    answererDeviceIds = own.length > 0 ? own : otherDevices;
  }
  const screenShowsWord = inputMode !== "phone" || answererDeviceIds.length === 0;
  const phoneFlow = inputMode === "phone" && allDevices.length > 0;

  const questionsLeftFor = (teamI: number) => Math.max(0, QUESTIONS_PER_TEAM - roundIndex - (teamI < teamIndex ? 1 : 0));

  // --- Turn actions ---
  const advanceAskerFor = (teamKey: string) => {
    const list = connectedByTeam[teamKey] ?? [];
    if (list.length === 0) return;
    const current = rotatedDevices(teamKey)[0];
    const next = list[(list.indexOf(current) + 1) % list.length];
    setAskerByTeam(prev => ({ ...prev, [teamKey]: next }));
  };

  const advanceTurn = (afterReveal: boolean) => {
    if (isLastTurn) { setPhase("final"); return; }
    const nextTeamIndex = teamIndex < teams.length - 1 ? teamIndex + 1 : 0;
    const nextRoundIndex = teamIndex < teams.length - 1 ? roundIndex : roundIndex + 1;
    setTeamIndex(nextTeamIndex);
    setRoundIndex(nextRoundIndex);
    // A lone team that just missed keeps the same asker at the front, so straight back to the
    // word; any other change of team (or a swap after a guess) gets the "ready" beat first.
    setPhase(phoneFlow || (teams.length === 1 && !afterReveal) ? "asking" : "ready");
  };

  const markGuessed = () => {
    if (!currentTeam) return;
    onUpdateScore(currentTeam.id, POINTS_PER_WORD);
    setWordsByTeam(prev => ({ ...prev, [currentTeam.id]: (prev[currentTeam.id] ?? 0) + 1 }));
    playSound("relay");
    setRevealWord(teamWords[currentKey] ?? "");
    const fresh = drawWord();
    setTeamWords(prev => ({ ...prev, [currentKey]: fresh }));
    advanceAskerFor(currentKey);
    setPhase("reveal");
  };

  const markMissed = () => advanceTurn(false);
  const changeWord = () => {
    const fresh = drawWord();
    setTeamWords(prev => ({ ...prev, [currentKey]: fresh }));
  };
  const continueFromReveal = () => advanceTurn(true);

  const wordForPayload = phase === "asking" ? (teamWords[currentKey] ?? "") : phase === "reveal" ? revealWord : "";

  const buildPayload = (): RelayStatePayload => {
    const mapped: RelayPhase = phase === "welcome" ? "lobby" : phase;
    const wordsOut: Record<string, number> = {};
    const leftOut: Record<string, number> = {};
    const countOut: Record<string, number> = {};
    const queueOut: Record<string, string[]> = {};
    teams.forEach((t, i) => {
      const k = String(t.id);
      wordsOut[k] = wordsByTeam[t.id] ?? 0;
      leftOut[k] = phase === "final" ? 0 : questionsLeftFor(i);
      countOut[k] = (connectedByTeam[k] ?? []).length;
      queueOut[k] = rotatedDevices(k);
    });
    const inPlay = phase === "ready" || phase === "asking" || phase === "reveal";
    return {
      phase: mapped,
      roster: teams.map(t => ({ id: t.id, name: t.name, color: t.color, mascot: t.mascot })),
      activeTeamId: inPlay ? (currentTeam?.id ?? null) : null,
      askerDeviceId: inPlay ? askerDeviceId : null,
      askerQueueByTeam: queueOut,
      answererDeviceIds: inPlay ? answererDeviceIds : [],
      currentWord: wordForPayload,
      screenShowsWord,
      phoneCountByTeam: countOut,
      questionsLeftByTeam: leftOut,
      questionsPerTeam: QUESTIONS_PER_TEAM,
      wordsByTeam: wordsOut,
      connectedTeamIds: Array.from(connectedTeamIds),
      ts: Date.now(),
    };
  };

  // Refs the phone-mode channel reads synchronously, so opening/closing the realtime channel only
  // happens when phone mode itself toggles on/off, not on every state change — same pattern as every
  // other phone-mode game. Refreshed every render (no dependency array) so an incoming phone action
  // always calls the latest closure.
  const buildPayloadRef = useRef(buildPayload);
  const sendStateRef = useRef<(() => void) | null>(null);
  const liveRef = useRef({ phase, answererDeviceIds, markGuessed, markMissed, changeWord, continueFromReveal });
  const lastActionAtRef = useRef(0);
  useEffect(() => {
    buildPayloadRef.current = buildPayload;
    liveRef.current = { phase, answererDeviceIds, markGuessed, markMissed, changeWord, continueFromReveal };
  });

  useEffect(() => {
    if (inputMode !== "phone" || !sessionCode) return;
    const channel = openRelayChannel(sessionCode);
    channelRef.current = channel;

    const sendState = () => {
      channel.send({ type: "broadcast", event: "state", payload: buildPayloadRef.current() });
    };
    sendStateRef.current = sendState;

    channel.on("presence", { event: "sync" }, () => {
      const presenceState = channel.presenceState<{ teamId: string | number; deviceId?: string }>();
      const teamIds = new Set<string | number>();
      const live: Record<string, Set<string>> = {};
      Object.values(presenceState).forEach(entries => entries.forEach(entry => {
        teamIds.add(entry.teamId);
        if (!entry.deviceId) return;
        const key = String(entry.teamId);
        if (!live[key]) live[key] = new Set();
        live[key].add(entry.deviceId);
        if (!deviceRosterRef.current[key]) deviceRosterRef.current[key] = [];
        if (!deviceRosterRef.current[key].includes(entry.deviceId)) deviceRosterRef.current[key].push(entry.deviceId);
      }));
      const byTeam: Record<string, string[]> = {};
      Object.keys(deviceRosterRef.current).forEach(key => {
        byTeam[key] = deviceRosterRef.current[key].filter(id => live[key]?.has(id));
      });
      setConnectedTeamIds(teamIds);
      setConnectedByTeam(byTeam);
    });

    // The only place phone input touches game logic — only a current answerer's phone is allowed
    // to act, then the exact same functions a screen click would call.
    channel.on("broadcast", { event: "action" }, ({ payload }) => {
      const action = payload as RelayActionPayload;
      const live = liveRef.current;
      if (!live.answererDeviceIds.includes(action.deviceId)) return;
      const now = Date.now();
      if (now - lastActionAtRef.current < 500) return;
      if (action.action === "guessed" && live.phase === "asking") live.markGuessed();
      else if (action.action === "missed" && live.phase === "asking") live.markMissed();
      else if (action.action === "changeWord" && live.phase === "asking") live.changeWord();
      else if (action.action === "next" && live.phase === "reveal") live.continueFromReveal();
      else return;
      lastActionAtRef.current = now;
    });

    channel.subscribe(status => {
      if (status === "SUBSCRIBED") sendState();
    });

    const interval = setInterval(sendState, 4000);

    return () => {
      clearInterval(interval);
      closeChannel(channel);
      channelRef.current = null;
      sendStateRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode, sessionCode, teams]);

  useEffect(() => {
    sendStateRef.current?.();
  }, [phase, teamIndex, roundIndex, teamWords, revealWord, connectedByTeam, askerByTeam, wordsByTeam]);

  useEffect(() => {
    if (phase === "final" && channelRef.current) {
      channelRef.current.send({ type: "broadcast", event: "ended", payload: {} });
    }
  }, [phase]);

  const handlePickPhoneMode = () => {
    setInputMode("phone");
    setSessionCode(generateSessionCode());
    setIntroStep("qr");
  };

  const handlePickScreenMode = () => {
    setInputMode("screen");
    setIntroStep("setup");
    setSessionCode(null);
    setConnectedTeamIds(new Set());
    setConnectedByTeam({});
    deviceRosterRef.current = {};
  };

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% -10%,#0F766E 0%,#134E4A 55%,#042F2E 100%)",
  };

  if (!currentTeam || words.length === 0) {
    return (
      <div style={{ ...arenaStyle, textAlign: "center", padding: "24px" }}>
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontWeight: "900", fontSize: "20px", color: "white", marginBottom: "10px" }}>Word Relay needs words to play.</div>
          <button onClick={onEnd} className="rl-btn" style={{ background: "#0D9488", color: "white", border: "3px solid #1A1A2E", borderRadius: "14px", padding: "12px 28px", fontWeight: "900", cursor: "pointer", boxShadow: "4px 4px 0 #1A1A2E" }}>End Game</button>
        </div>
      </div>
    );
  }

  const wordListToggle = (
    <div style={{ marginBottom: "18px" }}>
      <button onClick={() => setShowWordList(v => !v)} className="rl-btn" style={{ background: showWordList ? "#0F766E" : "rgba(255,255,255,0.08)", color: showWordList ? "white" : "#99F6E4", border: "2px solid #14B8A688", borderRadius: "10px", padding: "8px 20px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}>
        {showWordList ? "Hide word list" : "Show all words"}
      </button>
      {showWordList && (
        <div style={{ background: "rgba(0,0,0,0.3)", border: "2px solid #14B8A655", borderRadius: "14px", padding: "16px", marginTop: "12px", textAlign: "left", display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {[...words].sort().map((word, index) => (
            <span key={`${word}-${index}`} style={{ background: "rgba(20,184,166,0.18)", color: "#99F6E4", border: "1px solid #14B8A655", borderRadius: "6px", padding: "4px 10px", fontSize: "13px", fontWeight: "700" }}>{word}</span>
          ))}
        </div>
      )}
    </div>
  );

  // Tutorial mockup: src/data/tutorials/relay.tsx — update if this welcome screen's rules text changes.
  if (phase === "welcome") {
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ background: "linear-gradient(160deg,#0F766E,#022C22)", border: "2px solid #2DD4BF55", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "540px", margin: "0 auto 10px", boxShadow: "0 0 50px rgba(13,148,136,0.45)" }}>
            <div style={{ marginBottom: "10px" }}><Icon name="megaphone" size={36} /></div>
            <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#5EEAD4" }}>Word Relay</div>
            <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
              {teams.length === 1 ? "Your team has a hidden word. " : "Every team has its own hidden word. "}
              <strong style={{ color: "#5EEAD4" }}>One person at a time comes to the front and asks yes/no questions</strong> to work out what it is — no peeking!
              <br />
              {inputMode === "phone"
                ? "Everyone joins on their own phone. Teammates' phones show the word and answer; the asker's phone never does."
                : "The teacher sees the word and answers each question, then taps whether they guessed it."}
              <br />
              Guess it and that person sits down — <strong style={{ color: "#5EEAD4" }}>a teammate swaps in</strong> with a brand new word. Each word is worth <strong style={{ color: "#5EEAD4" }}>{POINTS_PER_WORD} points</strong>, and every team gets <strong style={{ color: "#5EEAD4" }}>{QUESTIONS_PER_TEAM} questions</strong> in total — most words wins.
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
            {teams.map((t, i) => (
              <div key={t.id} style={{ background: t.color.dark, border: "2px solid #1A1A2E", boxShadow: "3px 3px 0 #1A1A2E", borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: "white", display: "flex", alignItems: "center", gap: "6px" }}>
                {i + 1}. <TeamIcon team={t} color="white" /> {t.name}
              </div>
            ))}
          </div>

          {/* Skipped entirely for a Class Check-In sitting — presetPhoneSession already picked
              phone mode and its code, and the class-level QR already covered joining. */}
          {teams.length > 1 && !presetPhoneSession && (
            <>
              {introStep === "setup" && (
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "13px", color: "#99F6E4", fontWeight: "700", marginBottom: "10px" }}>How will you play?</div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button onClick={handlePickScreenMode} className="rl-btn" style={{
                      padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                      border: `2px solid ${inputMode === "screen" ? "#2DD4BF" : "rgba(255,255,255,0.2)"}`,
                      background: inputMode === "screen" ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.05)",
                      color: inputMode === "screen" ? "#5EEAD4" : "#94A3B8",
                      display: "inline-flex", alignItems: "center", gap: "6px",
                    }}><Icon name="screen" size={14} /> Play on Screen</button>
                    <button onClick={handlePickPhoneMode} className="rl-btn" style={{
                      padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                      border: `2px solid ${inputMode === "phone" ? "#2DD4BF" : "rgba(255,255,255,0.2)"}`,
                      background: inputMode === "phone" ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.05)",
                      color: inputMode === "phone" ? "#5EEAD4" : "#94A3B8",
                      display: "inline-flex", alignItems: "center", gap: "6px",
                    }}><Icon name="phone" size={14} /> Play on Phones</button>
                  </div>
                </div>
              )}

              {introStep === "qr" && sessionCode && (() => {
                const joinUrl = `${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=relay`;
                const phoneCountByTeam: Record<string, number> = {};
                teams.forEach(t => { phoneCountByTeam[String(t.id)] = (connectedByTeam[String(t.id)] ?? []).length; });
                return (
                  <PhoneJoinPanel
                    sessionCode={sessionCode} joinUrl={joinUrl} teams={teams} connectedTeamIds={connectedTeamIds}
                    phoneCountByTeam={phoneCountByTeam}
                    accent="#5EEAD4" panelBg="linear-gradient(160deg,#0F766E,#022C22)" borderColor="#2DD4BF66"
                    footer={
                      <>
                        <div style={{ fontSize: "12px", color: "#99F6E4", marginBottom: "8px", lineHeight: 1.5 }}>
                          Every student can join on their own phone — pick the same team to share it.
                        </div>
                        <button onClick={handlePickScreenMode} style={{ background: "none", border: "none", color: "#99F6E499", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
                          Switch back to Play on Screen
                        </button>
                      </>
                    }
                  />
                );
              })()}
            </>
          )}

          {wordListToggle}
          <button onClick={() => setShowHowTo(true)} className="rl-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
            <Icon name="help" size={15} /> How to Play
          </button>
          {showHowTo && (
            <HowToPlayModal
              gameName={GM.name} gameIcon={GAME_ICONS[GM.id]} accentColor={GM.color}
              steps={RELAY_TUTORIAL_STEPS}
              onClose={() => setShowHowTo(false)}
            />
          )}
          <button onClick={() => setPhase(phoneFlow ? "asking" : "ready")} className="rl-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#0D9488", color: "white", border: "3px solid #1A1A2E", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "6px 6px 0 #1A1A2E" }}>
            <Icon name="megaphone" size={20} /> Let's Play!
          </button>
        </div>
      </div>
    );
  }

  if (phase === "final") {
    const ranking = denseRank(teams, t => (wordsByTeam[t.id] ?? 0) * POINTS_PER_WORD).sort((a, b) => b.value - a.value);
    const winners = ranking.filter(r => r.rank === 0);
    const isTie = winners.length > 1;
    const headline = isTie
      ? `${winners.map(w => w.item.name).join(" & ")} tied for the most words guessed!`
      : `${winners[0]?.item.name} guessed the most words!`;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "6px" }}><Icon name="megaphone" size={44} color="#5EEAD4" /></div>
          <div style={{ fontWeight: "900", fontSize: "22px", color: "#5EEAD4", marginBottom: "16px" }}>{headline}</div>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "760px" }}>
            {ranking.map(({ item: t, rank, value }) => (
              <div key={t.id} style={{ background: t.color.dark, border: "2px solid #1A1A2E", boxShadow: "4px 4px 0 #1A1A2E", borderRadius: "14px", padding: "12px" }}>
                <div><RankBadge rank={rank} size={22} /></div>
                <div style={{ fontWeight: "800", color: "white", fontSize: "14px", marginTop: "4px" }}><TeamIcon team={t} /> {t.name}</div>
                <div style={{ color: "#5EEAD4", fontWeight: "900", fontSize: "16px", marginTop: "4px" }}>{value} pts</div>
                <div style={{ fontSize: "11px", color: "#99F6E4", fontWeight: "700", marginTop: "4px" }}>{wordsByTeam[t.id] ?? 0} words guessed</div>
              </div>
            ))}
          </div>
          <button onClick={onEnd} className="rl-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#0D9488", color: "white", border: "3px solid #1A1A2E", borderRadius: "14px", padding: "13px 34px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "5px 5px 0 #1A1A2E" }}><Icon name="checkeredFlag" size={18} /> End Game</button>
        </div>
      </div>
    );
  }

  const bigBtn = (bg: string, color = "white"): React.CSSProperties => ({
    background: bg, color, border: "3px solid #1A1A2E", borderRadius: "14px", padding: "16px", fontSize: "18px",
    fontWeight: "900", cursor: "pointer", boxShadow: "4px 4px 0 #1A1A2E",
  });

  const scoreStrip = (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
      {teams.map((t, i) => (
        <div key={t.id} style={{ background: t.color.dark, border: `2px solid ${t.id === currentTeam.id ? "#5EEAD4" : "#1A1A2E"}`, borderRadius: "12px", padding: "8px 14px", color: "white", fontSize: "12px", fontWeight: "800", textAlign: "center" }}>
          <div><TeamIcon team={t} color="white" /> {t.name}</div>
          <div style={{ color: "#5EEAD4", fontSize: "14px" }}>{wordsByTeam[t.id] ?? 0} words</div>
          <div style={{ opacity: 0.8, fontWeight: "700" }}>{questionsLeftFor(i)} questions left</div>
        </div>
      ))}
    </div>
  );

  const askerLabel = inputMode === "phone" && askerDeviceId
    ? `Asker: phone ${teamDevices.indexOf(askerDeviceId) + 1} of ${teamDevices.length}`
    : null;

  return (
    <div style={arenaStyle}>
      {STYLE_TAG}
      {/* Suppressed for a Class Check-In sitting — the class-level badge (LessonGamesGenerator.tsx's
          renderClassCheckInBadge) is the only floating reconnect button shown then, and it's the
          only one pointing at the right (class, not per-game) join URL. */}
      {inputMode === "phone" && sessionCode && !presetPhoneSession && (
        <PhoneReconnectBadge
          sessionCode={sessionCode} joinUrl={`${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=relay`}
          teams={teams} connectedTeamIds={connectedTeamIds}
          phoneCountByTeam={Object.fromEntries(teams.map(t => [String(t.id), (connectedByTeam[String(t.id)] ?? []).length]))}
          accent="#5EEAD4" panelBg="linear-gradient(160deg,#0F766E,#022C22)" borderColor="#2DD4BF66"
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "#134E4A", border: "3px solid #1A1A2E", borderRadius: "14px", padding: "14px 16px", marginBottom: "16px", textAlign: "center", color: "white", boxShadow: "4px 4px 0 #1A1A2E" }}>
          <div style={{ fontWeight: "900", fontSize: "18px" }}><TeamIcon team={currentTeam} /> {currentTeam.name}'s turn</div>
          <div style={{ fontWeight: "800", fontSize: "13px", opacity: 0.9, marginTop: "4px" }}>
            Question {roundIndex + 1} of {QUESTIONS_PER_TEAM}{askerLabel ? ` · ${askerLabel}` : ""}
          </div>
        </div>

        {phase === "ready" && (
          <div style={{ background: "#022C22", border: "4px solid #1A1A2E", borderRadius: "22px", padding: "32px 18px", textAlign: "center", boxShadow: "6px 6px 0 #1A1A2E" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>🙋</div>
            <div style={{ fontWeight: "900", fontSize: "22px", color: "#5EEAD4", marginBottom: "8px" }}>{currentTeam.name}: send someone up!</div>
            <div style={{ color: "#CCFBF1", fontSize: "15px", fontWeight: "600", lineHeight: 1.6, maxWidth: "460px", margin: "0 auto 20px" }}>
              Whoever is asking steps to the front and <strong>faces away from the screen</strong>. When they're ready, show the word to the teacher and the class.
            </div>
            <button onClick={() => setPhase("asking")} className="rl-btn" style={bigBtn("#0D9488")}>Show the word</button>
          </div>
        )}

        {phase === "asking" && (screenShowsWord ? (
          <>
            <div style={{ position: "relative", background: "#022C22", border: "4px solid #1A1A2E", borderRadius: "22px", padding: "26px 18px", textAlign: "center", marginBottom: "16px", boxShadow: "6px 6px 0 #1A1A2E" }}>
              <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                <FlagPromptButton gameId="relay" questionData={{ raw: teamWords[currentKey] }} />
              </div>
              <div style={{ color: "#5EEAD4", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", marginBottom: "10px" }}>The hidden word — asker faces away!</div>
              <div key={teamWords[currentKey]} style={{ background: "rgba(0,0,0,0.35)", borderRadius: "18px", border: "3px solid #14B8A655", padding: "24px 12px", color: "#F0FDFA", fontWeight: "900", fontSize: "clamp(36px,9vw,72px)", lineHeight: 1.05, minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center", overflowWrap: "anywhere", textShadow: "0 0 18px rgba(45,212,191,0.6)", animation: "rlWordPop 0.25s ease-out" }}>
                {teamWords[currentKey]}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
              <button onClick={markGuessed} className="rl-btn" style={bigBtn("#22C55E")}>Guessed it! +{POINTS_PER_WORD}</button>
              <button onClick={markMissed} className="rl-btn" style={bigBtn("rgba(0,0,0,0.3)", "#5EEAD4")}>Not yet →</button>
            </div>
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <button onClick={changeWord} style={{ background: "none", border: "none", color: "#99F6E499", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>Change this word</button>
            </div>
          </>
        ) : (
          <div style={{ background: "#022C22", border: "3px dashed #0D9488", borderRadius: "22px", padding: "34px 18px", textAlign: "center" }}>
            <div style={{ marginBottom: "10px" }}><Icon name="phone" size={34} /></div>
            <div style={{ fontWeight: "900", fontSize: "18px", color: "#5EEAD4", marginBottom: "6px" }}>Asking time!</div>
            <div style={{ color: "#99F6E4", fontSize: "14px", fontWeight: "600", lineHeight: 1.5 }}>
              The asker is at the front asking yes/no questions. The word is on the answering phones — it isn't shown here.
            </div>
          </div>
        ))}

        {phase === "reveal" && (
          <div style={{ background: "#022C22", border: "4px solid #22C55E", borderRadius: "22px", padding: "28px 18px", textAlign: "center", boxShadow: "6px 6px 0 #1A1A2E" }}>
            <div style={{ fontSize: "40px", marginBottom: "6px" }}>🎉</div>
            <div style={{ color: "#5EEAD4", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", marginBottom: "8px" }}>{currentTeam.name} guessed it! +{POINTS_PER_WORD}</div>
            {screenShowsWord && (
              <div style={{ fontWeight: "900", fontSize: "clamp(32px,8vw,60px)", color: "#F0FDFA", lineHeight: 1.1, marginBottom: "10px", overflowWrap: "anywhere" }}>{revealWord}</div>
            )}
            <div style={{ color: "#CCFBF1", fontSize: "16px", fontWeight: "800", marginBottom: "18px" }}>
              {inputMode === "phone" && askerDeviceId
                ? "Time to swap — the next phone in line takes over next turn!"
                : `Time to swap — someone new from ${currentTeam.name} takes over next turn!`}
            </div>
            {screenShowsWord ? (
              <button onClick={continueFromReveal} className="rl-btn" style={bigBtn("#0D9488")}>{isLastTurn ? "See final results" : "Next team →"}</button>
            ) : (
              <div style={{ color: "#99F6E4", fontSize: "13px", fontWeight: "600" }}>A teammate taps "Next team" on their phone to keep going.</div>
            )}
          </div>
        )}

        {scoreStrip}
      </div>
    </div>
  );
}
