import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { GameProps } from "../../types";
import { teamsGridCols, GAME_MODES } from "../../data/constants";
import { denseRank, medalForRank } from "../../utils/ranking";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { FlagPromptButton } from "../shared/FlagPromptButton";
import { PhoneJoinPanel } from "../shared/PhoneJoinPanel";
import { PhoneReconnectBadge } from "../shared/PhoneReconnectBadge";
import { HOTSEAT_TUTORIAL_STEPS } from "../../data/tutorials/hotseat";
import {
  generateSessionCode, openHotSeatChannel, closeChannel,
  type HotSeatPhase, type HotSeatStatePayload, type HotSeatActionPayload,
} from "../../lib/liveSession";

const GM = GAME_MODES.find(g => g.id === "hotseat")!;

const TOTAL_ROUNDS = 3;
const TURN_SECONDS = 90;
const POINTS_PER_WORD = 10;

const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 41) % 100,
  size: 4 + (i % 4) * 3,
  dur: 3 + (i % 5),
  delay: (i % 8) * 0.4,
}));

const STYLE_TAG = (
  <style>{`
    @keyframes hsEmberRise{0%{transform:translateY(0) scale(1);opacity:0}15%{opacity:0.9}100%{transform:translateY(-280px) scale(0.4);opacity:0}}
    @keyframes hsLavaGlow{0%,100%{opacity:0.5}50%{opacity:0.85}}
    @keyframes hsPulseDanger{0%,100%{box-shadow:0 0 0px rgba(239,68,68,0)}50%{box-shadow:0 0 24px rgba(239,68,68,0.85)}}
    .hs-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.12)}
    .hs-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
  `}</style>
);

function EmberField() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {EMBERS.map((e, i) => (
        <div key={i} style={{
          position: "absolute", left: `${e.left}%`, bottom: "-10px", width: `${e.size}px`, height: `${e.size}px`,
          borderRadius: "50%", background: "radial-gradient(circle,#FDE68A,#F97316 60%,transparent 100%)",
          animation: `hsEmberRise ${e.dur}s ease-in infinite ${e.delay}s`,
        }} />
      ))}
    </div>
  );
}

function LavaGlow() {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "150px", pointerEvents: "none", background: "radial-gradient(ellipse at 50% 100%,rgba(249,115,22,0.55),transparent 70%)", animation: "hsLavaGlow 3.2s ease-in-out infinite" }} />
  );
}

const shuffle = <T,>(items: T[]) => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

// What "Save & Exit" snapshots and "Resume" restores — the round/team turn cursor and each team's
// running word total. Resuming skips straight to the per-turn "pass the device" intro for the
// team whose turn it was, rather than replaying the one-time welcome screen or the exact word/
// timer that was on screen when it was saved.
type HotSeatSnapshot = {
  roundIndex: number;
  teamIndex: number;
  totalWordsByTeam: Record<string | number, number>;
};

function validateHotSeatSnapshot(raw: unknown, teamCount: number): HotSeatSnapshot | undefined {
  const s = raw as Partial<HotSeatSnapshot> | null | undefined;
  if (!s || typeof s.roundIndex !== "number" || s.roundIndex < 0) return undefined;
  if (typeof s.teamIndex !== "number" || s.teamIndex < 0 || s.teamIndex >= teamCount) return undefined;
  if (s.roundIndex >= TOTAL_ROUNDS) return undefined;
  return { roundIndex: s.roundIndex, teamIndex: s.teamIndex, totalWordsByTeam: s.totalWordsByTeam ?? {} };
}

export function HotSeatGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState }: GameProps) {
  const resumed = useRef(validateHotSeatSnapshot(initialGameState, teams.length)).current;

  const [phase, setPhase] = useState<"welcome" | "intro" | "play" | "turnend" | "final">(resumed ? "intro" : "welcome");
  const [showHowTo, setShowHowTo] = useState(false);

  // "Play on Phones" mode — available whenever there's more than one team (gated below); true
  // 1-team solo play has the teacher personally describing for the one real team, so there's no
  // within-team secrecy problem phones would solve there. Always defaults to screen, even on
  // Resume: a resumed game skips the welcome screen entirely, same as the other phone-mode games.
  const [inputMode, setInputMode] = useState<"screen" | "phone">("screen");
  const [introStep, setIntroStep] = useState<"setup" | "qr">("setup");
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [connectedTeamIds, setConnectedTeamIds] = useState<Set<string | number>>(new Set());
  // "groups": the active team's own phone shows the word (teammates describe, matching the
  // in-person rule). "solo": every *other* connected team's phone shows it instead, since a
  // 1-person "team" has no teammate of its own to describe for it — see PhoneHotSeatView.tsx.
  const [teamStructure, setTeamStructure] = useState<"groups" | "solo">("groups");
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => { setPhase("final"); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase]);
  const [roundIndex, setRoundIndex] = useState(() => resumed?.roundIndex ?? 0);
  const [teamIndex, setTeamIndex] = useState(() => resumed?.teamIndex ?? 0);
  const [turnCorrect, setTurnCorrect] = useState(0);
  const [lastTurnCorrect, setLastTurnCorrect] = useState(0);
  // Words guessed correctly per team, summed across every turn/round — turnCorrect itself resets
  // each turn, so this is the one thing that needs to survive to the final results screen.
  const [totalWordsByTeam, setTotalWordsByTeam] = useState<Record<string | number, number>>(() => resumed?.totalWordsByTeam ?? {});

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): HotSeatSnapshot => ({ roundIndex, teamIndex, totalWordsByTeam });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, roundIndex, teamIndex, totalWordsByTeam]);
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);
  const [showWordList, setShowWordList] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const turnCorrectRef = useRef(0);

  const words = useMemo(() => {
    const uniqueWords = new Map<string, string>();

    questions.forEach(q => {
      const word = q.word?.trim();
      if (word) uniqueWords.set(word.toLowerCase(), word);
    });

    return Array.from(uniqueWords.values());
  }, [questions]);

  // A shuffled deck rather than a fixed shuffled list drawn via a plain modulo cursor — a small
  // word pool gets cycled through more than once in a single game, and a modulo cursor would
  // repeat the exact same order every lap. Reshuffling only once the deck is exhausted (not on
  // every draw) keeps every word appearing exactly once per lap, same as before, just in a fresh
  // order each time — and the one-item swap after reshuffling stops the last word of one lap from
  // immediately reappearing as the first word of the next.
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
  const [currentWord, setCurrentWord] = useState<string>(() => (words.length > 0 ? drawWord() : ""));

  const currentTeam = teams[teamIndex];
  const turnNumber = roundIndex * teams.length + teamIndex + 1;
  const totalTurns = TOTAL_ROUNDS * teams.length;
  const isLastTurn = roundIndex === TOTAL_ROUNDS - 1 && teamIndex === teams.length - 1;
  const timerPct = (timeLeft / TURN_SECONDS) * 100;
  const timerColor = timeLeft > 45 ? "#22C55E" : timeLeft > 20 ? "#F59E0B" : "#EF4444";

  // Whether anyone is actually covering the describing role on their phone this turn — depends on
  // team structure, since who "describes on their phone" flips between the two (see the plan).
  const describersOnPhone = inputMode !== "phone" || !currentTeam ? false
    : teamStructure === "groups" ? connectedTeamIds.has(currentTeam.id)
    : teams.some(t => t.id !== currentTeam.id && connectedTeamIds.has(t.id));

  const endTurn = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLastTurnCorrect(turnCorrectRef.current);
    setPhase("turnend");
  };

  useEffect(() => {
    turnCorrectRef.current = turnCorrect;
  }, [turnCorrect]);

  useEffect(() => {
    if (phase !== "play") return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setLastTurnCorrect(turnCorrectRef.current);
          setPhase("turnend");
          return 0;
        }

        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, roundIndex, teamIndex]);

  const startTurn = () => {
    turnCorrectRef.current = 0;
    setTurnCorrect(0);
    setTimeLeft(TURN_SECONDS);
    setPhase("play");
  };

  const markCorrect = () => {
    if (!currentTeam) return;
    onUpdateScore(currentTeam.id, POINTS_PER_WORD);
    setTurnCorrect(score => score + 1);
    setTotalWordsByTeam(prev => ({ ...prev, [currentTeam.id]: (prev[currentTeam.id] ?? 0) + 1 }));
    setCurrentWord(drawWord());
  };

  const skipWord = () => {
    setCurrentWord(drawWord());
  };

  const goToNextTurn = () => {
    if (isLastTurn) {
      setPhase("final");
      return;
    }

    if (teamIndex < teams.length - 1) {
      setTeamIndex(index => index + 1);
    } else {
      setTeamIndex(0);
      setRoundIndex(index => index + 1);
    }

    setTurnCorrect(0);
    turnCorrectRef.current = 0;
    setLastTurnCorrect(0);
    setTimeLeft(TURN_SECONDS);
    setPhase("intro");
  };

  // Refs the phone-mode broadcaster (below) reads from, so opening/closing the realtime channel
  // only happens when phone mode itself toggles on/off, not on every tick/turn/round change — same
  // pattern as AuctionGame.tsx/SpyAmongUsGame.tsx. markCorrect/skipWord/endTurn are refreshed every
  // render (no dependency array) so an incoming phone action always calls the latest closure,
  // never a stale one captured back when the channel effect itself last ran.
  const phaseRef = useRef(phase);
  const currentWordRef = useRef(currentWord);
  const timeLeftRef = useRef(timeLeft);
  const teamIndexRef = useRef(teamIndex);
  const totalWordsByTeamRef = useRef(totalWordsByTeam);
  const teamStructureRef = useRef(teamStructure);
  const connectedTeamIdsRef = useRef<Set<string | number>>(new Set());
  const sendStateRef = useRef<(() => void) | null>(null);
  const markCorrectRef = useRef(markCorrect);
  const skipWordRef = useRef(skipWord);
  const endTurnRef = useRef(endTurn);
  const lastActionAtRef = useRef(0);
  useEffect(() => {
    phaseRef.current = phase;
    currentWordRef.current = currentWord;
    timeLeftRef.current = timeLeft;
    teamIndexRef.current = teamIndex;
    totalWordsByTeamRef.current = totalWordsByTeam;
    teamStructureRef.current = teamStructure;
    markCorrectRef.current = markCorrect;
    skipWordRef.current = skipWord;
    endTurnRef.current = endTurn;
  });

  // Opens/closes the realtime channel only when phone mode itself is toggled on/off. Screen-
  // authoritative like Auction's bets, not Word Whack's relocated game loop — markCorrect/
  // skipWord/endTurn stay exactly as they are, unchanged, just also reachable from an incoming
  // phone broadcast below.
  useEffect(() => {
    if (inputMode !== "phone" || !sessionCode) return;
    const channel = openHotSeatChannel(sessionCode);
    channelRef.current = channel;

    const sendState = () => {
      const rawPhase = phaseRef.current;
      const mappedPhase: HotSeatPhase = rawPhase === "welcome" || rawPhase === "intro" ? "lobby" : rawPhase === "final" ? "final" : "turn";
      const activeTeam = teams[teamIndexRef.current];
      const scores: Record<string, number> = {};
      teams.forEach(t => { scores[String(t.id)] = totalWordsByTeamRef.current[t.id] ?? 0; });
      const payload: HotSeatStatePayload = {
        phase: mappedPhase,
        teamStructure: teamStructureRef.current,
        roster: teams.map(t => ({ id: t.id, name: t.name, color: t.color, mascot: t.mascot })),
        // Only populated while a word is actually live (phase "play") — during the brief
        // "turnend" transition and before the game starts, no team is "on the hot seat" yet.
        activeTeamId: rawPhase === "play" ? (activeTeam?.id ?? null) : null,
        currentWord: currentWordRef.current,
        timeLeft: timeLeftRef.current,
        turnSeconds: TURN_SECONDS,
        turnCorrect: turnCorrectRef.current,
        scores,
        connectedTeamIds: Array.from(connectedTeamIdsRef.current),
        ts: Date.now(),
      };
      channel.send({ type: "broadcast", event: "state", payload });
    };
    sendStateRef.current = sendState;

    channel.on("presence", { event: "sync" }, () => {
      const presenceState = channel.presenceState<{ teamId: string | number }>();
      const ids = new Set<string | number>();
      Object.values(presenceState).forEach(entries => entries.forEach(entry => ids.add(entry.teamId)));
      connectedTeamIdsRef.current = ids;
      setConnectedTeamIds(ids);
      sendState(); // roster/connected list changed — push a fresh state right away, don't wait for the interval
    });

    // The only place phone input actually touches game logic — validates who's allowed to act
    // right now (differs by teamStructure), debounces near-simultaneous double-taps (matters most
    // in solo mode, where several phones can act on the same word), then calls the exact same
    // functions a screen-mode button click would.
    channel.on("broadcast", { event: "action" }, ({ payload }) => {
      const action = payload as HotSeatActionPayload;
      if (phaseRef.current !== "play") return;
      const activeTeamId = teams[teamIndexRef.current]?.id;
      const isActiveTeam = action.teamId === activeTeamId;
      const allowed = teamStructureRef.current === "groups"
        ? isActiveTeam
        : !isActiveTeam && connectedTeamIdsRef.current.has(action.teamId);
      if (!allowed) return;
      const now = Date.now();
      if (now - lastActionAtRef.current < 500) return;
      lastActionAtRef.current = now;
      if (action.action === "correct") markCorrectRef.current();
      else if (action.action === "skip") skipWordRef.current();
      else if (action.action === "endTurn") endTurnRef.current();
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
  }, [inputMode, sessionCode, teams]);

  // Pushes an immediate state update on turn/phase transitions rather than waiting for the
  // interval, and piggybacks on the existing per-second timer tick while a turn is live — timeLeft
  // changing every second is what keeps a describing phone's countdown in sync with the screen's,
  // with no second parallel timer needed (unlike Word Whack).
  useEffect(() => {
    sendStateRef.current?.();
  }, [phase, timeLeft, teamIndex, roundIndex]);

  // Tells every connected phone the game is over the moment it actually ends, same reasoning as
  // Auction/Spy Among Us's identical effect — without this, a closed channel looks identical to a
  // dropped connection from the phone's side.
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
  };

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% 105%,#9A3412 0%,#431407 45%,#0A0300 100%)",
  };

  if (!currentTeam || words.length === 0) {
    return (
      <div style={{ ...arenaStyle, textAlign: "center", padding: "24px" }}>
        <EmberField />
        <LavaGlow />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontWeight: "900", fontSize: "20px", color: "white", marginBottom: "10px" }}>Hot Seat needs words to play.</div>
          <button onClick={onEnd} className="hs-btn" style={{ background: "linear-gradient(135deg,#B91C1C,#F97316)", color: "white", border: "none", borderRadius: "14px", padding: "12px 28px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}>End Game</button>
        </div>
      </div>
    );
  }

  const wordListToggle = (
    <div style={{ marginBottom: "18px" }}>
      <button onClick={() => setShowWordList(v => !v)} className="hs-btn" style={{ background: showWordList ? "#7C2D12" : "rgba(255,255,255,0.08)", color: showWordList ? "white" : "#FED7AA", border: "2px solid #F9731688", borderRadius: "10px", padding: "8px 20px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}>
        {showWordList ? "Hide word list" : "Show all words"}
      </button>
      {showWordList && (
        <div style={{ background: "rgba(0,0,0,0.35)", border: "2px solid #F9731655", borderRadius: "14px", padding: "16px", marginTop: "12px", textAlign: "left", display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {[...words].sort().map((word, index) => (
            <span key={`${word}-${index}`} style={{ background: "rgba(249,115,22,0.18)", color: "#FED7AA", border: "1px solid #F9731655", borderRadius: "6px", padding: "4px 10px", fontSize: "13px", fontWeight: "700" }}>{word}</span>
          ))}
        </div>
      )}
    </div>
  );

  // One-time explainer shown before the very first turn — every other game has an equivalent
  // "here's the whole picture" screen with a team roster. The old version skipped straight to
  // a per-turn "get ready" card and re-explained the full rules before every single turn instead.
  // Tutorial mockup: src/data/tutorials/hotseat.tsx — update if this welcome screen's rules text changes.
  if (phase === "welcome") {
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <EmberField />
        <LavaGlow />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ background: "linear-gradient(160deg,#7C2D12,#1C0701)", border: "2px solid #FDBA7455", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "520px", margin: "0 auto 10px", boxShadow: "0 0 50px rgba(234,88,12,0.45)" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🌋</div>
            <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#FDBA74" }}>Hot Seat</div>
            <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
              {teams.length === 1
                ? "The teacher will describe each word out loud for your team to guess."
                : "One player on the team turns away from the screen — everyone else on their team gives clues."}
              <br />
              Guess as many words as you can in <strong style={{ color: "#FDBA74" }}>{TURN_SECONDS} seconds</strong> — no spelling, and no saying the word itself!
              <br />
              Each correct word is worth <strong style={{ color: "#FDBA74" }}>{POINTS_PER_WORD} points</strong>, over <strong style={{ color: "#FDBA74" }}>{TOTAL_ROUNDS} rounds</strong> — most points wins.
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
            {teams.map((t, i) => (
              <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#1C0701)`, border: `3px solid ${t.color.bg}`, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: "white" }}>
                {i + 1}. {t.color.emoji} {t.name}
              </div>
            ))}
          </div>

          {teams.length > 1 && (
            <>
              {introStep === "setup" && (
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "13px", color: "#FED7AA", fontWeight: "700", marginBottom: "10px" }}>How will the hot seat word be shown?</div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button onClick={handlePickScreenMode} className="hs-btn" style={{
                      padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                      border: `2px solid ${inputMode === "screen" ? "#F97316" : "rgba(255,255,255,0.2)"}`,
                      background: inputMode === "screen" ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.05)",
                      color: inputMode === "screen" ? "#FDBA74" : "#94A3B8",
                    }}>🖥️ Play on Screen</button>
                    <button onClick={handlePickPhoneMode} className="hs-btn" style={{
                      padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                      border: `2px solid ${inputMode === "phone" ? "#F97316" : "rgba(255,255,255,0.2)"}`,
                      background: inputMode === "phone" ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.05)",
                      color: inputMode === "phone" ? "#FDBA74" : "#94A3B8",
                    }}>📱 Play on Phones</button>
                  </div>
                </div>
              )}

              {introStep === "qr" && sessionCode && (() => {
                const joinUrl = `${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=hotseat`;
                return (
                  <PhoneJoinPanel
                    sessionCode={sessionCode} joinUrl={joinUrl} teams={teams} connectedTeamIds={connectedTeamIds}
                    accent="#FDBA74" panelBg="linear-gradient(160deg,#7C2D12,#1C0701)" borderColor="#F9731666"
                    footer={
                      <button onClick={handlePickScreenMode} style={{ background: "none", border: "none", color: "#FED7AA99", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
                        Switch back to Play on Screen
                      </button>
                    }
                  >
                    <div style={{ marginBottom: "14px" }}>
                      <div style={{ fontSize: "12px", color: "#FED7AA", fontWeight: "700", marginBottom: "8px" }}>Are your teams groups or solo players?</div>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button onClick={() => setTeamStructure("groups")} className="hs-btn" style={{
                          padding: "6px 14px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer",
                          border: `2px solid ${teamStructure === "groups" ? "#F97316" : "rgba(255,255,255,0.2)"}`,
                          background: teamStructure === "groups" ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.05)",
                          color: teamStructure === "groups" ? "#FDBA74" : "#94A3B8",
                        }}>👥 Groups</button>
                        <button onClick={() => setTeamStructure("solo")} className="hs-btn" style={{
                          padding: "6px 14px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer",
                          border: `2px solid ${teamStructure === "solo" ? "#F97316" : "rgba(255,255,255,0.2)"}`,
                          background: teamStructure === "solo" ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.05)",
                          color: teamStructure === "solo" ? "#FDBA74" : "#94A3B8",
                        }}>🧑 Solo</button>
                      </div>
                      <div style={{ fontSize: "11px", color: "#FED7AA99", marginTop: "6px" }}>
                        {teamStructure === "groups" ? "Each team's own phone shows the word to their describers." : "Every other team's phone shows the word — they describe for whoever's up."}
                      </div>
                    </div>
                  </PhoneJoinPanel>
                );
              })()}
            </>
          )}

          {wordListToggle}
          <button onClick={() => setShowHowTo(true)} className="hs-btn" style={{ display: "block", margin: "0 auto 14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
            ❓ How to Play
          </button>
          {showHowTo && (
            <HowToPlayModal
              gameName={GM.name} gameIcon={GM.icon} accentColor={GM.color}
              steps={HOTSEAT_TUTORIAL_STEPS}
              onClose={() => setShowHowTo(false)}
            />
          )}
          <button onClick={() => setPhase("intro")} className="hs-btn" style={{ background: "linear-gradient(135deg,#B91C1C,#F97316)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(249,115,22,0.5)", transition: "transform 0.15s ease" }}>
            🔥 Let's Play!
          </button>
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <EmberField />
        <LavaGlow />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ background: "linear-gradient(160deg,#7C2D12,#1C0701)", border: "2px solid #FDBA7455", borderRadius: "20px", padding: "28px 24px", marginBottom: "16px", color: "white" }}>
            <div style={{ fontWeight: "900", fontSize: "clamp(22px,4vw,32px)", marginBottom: "8px", color: "#FDBA74" }}>Hot Seat</div>
            <div style={{ fontWeight: "900", fontSize: "18px", marginBottom: "14px" }}>
              Round {roundIndex + 1} of {TOTAL_ROUNDS} - Turn {turnNumber} of {totalTurns}
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1.5px solid #F9731655", borderRadius: "16px", padding: "16px", display: "inline-block", minWidth: "min(100%, 320px)" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", opacity: 0.85, marginBottom: "6px", color: "#FDBA74" }}>Up now</div>
              <div style={{ fontWeight: "900", fontSize: "clamp(24px,5vw,38px)" }}>{currentTeam.mascot ?? currentTeam.color.emoji} {currentTeam.name}</div>
            </div>
            <div style={{ fontSize: "14px", lineHeight: 1.6, marginTop: "16px", opacity: 0.9 }}>
              {teams.length === 1
                ? "The teacher describes the words — no spelling, no saying the word itself!"
                : "One player faces away, teammates give clues — no spelling, no saying the word!"}
            </div>
          </div>

          {wordListToggle}

          <button onClick={startTurn} className="hs-btn" style={{ background: "linear-gradient(135deg,#B91C1C,#F97316)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(249,115,22,0.5)", transition: "transform 0.15s ease" }}>
            Start {currentTeam.name}'s Turn
          </button>
        </div>
      </div>
    );
  }

  if (phase === "final") {
    // Dense rank on final score — two teams tied for the top both get gold instead of an
    // arbitrary array-order winner.
    const ranking = denseRank(teams, t => t.score).sort((a, b) => b.value - a.value);
    const winners = ranking.filter(r => r.rank === 0);
    const isTie = winners.length > 1;
    const headline = isTie
      ? `${winners.map(w => w.item.name).join(" & ")} tied for the most words guessed!`
      : `${winners[0]?.item.name} guessed the most words!`;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <EmberField />
        <LavaGlow />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "44px", marginBottom: "6px" }}>🌋</div>
          <div style={{ fontWeight: "900", fontSize: "22px", color: "#FDBA74", marginBottom: "16px" }}>{headline}</div>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "760px" }}>
            {ranking.map(({ item: t, rank, value }) => (
              <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#1C0701)`, border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "12px" }}>
                <div style={{ fontSize: "22px" }}>{medalForRank(rank)}</div>
                <div style={{ fontWeight: "800", color: "white", fontSize: "14px", marginTop: "4px" }}>{t.mascot ?? t.color.emoji} {t.name}</div>
                <div style={{ color: "#FDBA74", fontWeight: "900", fontSize: "16px", marginTop: "4px" }}>{value} pts</div>
                <div style={{ fontSize: "11px", color: "#FED7AA", fontWeight: "700", marginTop: "4px" }}>{totalWordsByTeam[t.id] ?? 0} words guessed</div>
              </div>
            ))}
          </div>
          <button onClick={onEnd} className="hs-btn" style={{ background: "linear-gradient(135deg,#B91C1C,#F97316)", color: "white", border: "none", borderRadius: "14px", padding: "13px 34px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 20px rgba(249,115,22,0.4)", transition: "transform 0.15s ease" }}>🏁 End Game</button>
        </div>
      </div>
    );
  }

  const timeCritical = phase === "play" && timeLeft <= 10;

  return (
    <div style={arenaStyle}>
      <EmberField />
      <LavaGlow />
      {STYLE_TAG}
      {inputMode === "phone" && sessionCode && (
        <PhoneReconnectBadge
          sessionCode={sessionCode} joinUrl={`${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=hotseat`}
          teams={teams} connectedTeamIds={connectedTeamIds}
          accent="#FDBA74" panelBg="linear-gradient(160deg,#7C2D12,#1C0701)" borderColor="#F9731666"
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(90deg,#7C2D12,#9A3412)", border: "1.5px solid #FDBA7455", borderRadius: "14px", padding: "14px 16px", marginBottom: "16px", textAlign: "center", color: "white", boxShadow: "0 4px 18px rgba(154,52,18,0.5)" }}>
          <div style={{ fontWeight: "900", fontSize: "18px" }}>Round {roundIndex + 1} of {TOTAL_ROUNDS} - {currentTeam.name}</div>
          <div style={{ fontWeight: "800", fontSize: "13px", opacity: 0.9, marginTop: "4px" }}>Turn {turnNumber} of {totalTurns}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", background: "rgba(0,0,0,0.3)", border: "2px solid #F9731655", borderRadius: "14px", padding: "12px 16px" }}>
          <div style={{ position: "relative", width: "78px", height: "78px", flexShrink: 0, borderRadius: "50%", animation: timeCritical ? "hsPulseDanger 0.8s ease-in-out infinite" : "none" }}>
            <svg width="78" height="78" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="39" cy="39" r="32" fill="none" stroke="#1C0701" strokeWidth="7" />
              <circle cx="39" cy="39" r="32" fill="none" stroke={timerColor} strokeWidth="7" strokeDasharray={`${2 * Math.PI * 32}`} strokeDashoffset={`${2 * Math.PI * 32 * (1 - timerPct / 100)}`} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "20px", color: timerColor }}>{timeLeft}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
              <div style={{ fontWeight: "900", color: "white", fontSize: "16px" }}>{currentTeam.mascot ?? currentTeam.color.emoji} {currentTeam.name}</div>
              <div style={{ fontWeight: "900", color: "#FED7AA", fontSize: "16px" }}>This turn: {turnCorrect} words / {turnCorrect * POINTS_PER_WORD} pts</div>
            </div>
            <div style={{ height: "10px", background: "#1C0701", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: "999px", transition: "width 1s linear, background 0.3s" }} />
            </div>
          </div>
        </div>

        {phase === "play" && describersOnPhone && (
          <div style={{ background: "linear-gradient(160deg,#1C0701,#2D0A00)", border: "3px dashed #F9731688", borderRadius: "22px", padding: "34px 18px", textAlign: "center" }}>
            <div style={{ fontSize: "34px", marginBottom: "10px" }}>📱</div>
            <div style={{ fontWeight: "900", fontSize: "17px", color: "#FDBA74", marginBottom: "6px" }}>
              {teamStructure === "groups"
                ? `${currentTeam.name} is describing on their phone!`
                : "Everyone else is describing on their phones!"}
            </div>
            <div style={{ color: "#FED7AA", fontSize: "13px", fontWeight: "600" }}>The word is hidden here so {currentTeam.name} can't see it.</div>
          </div>
        )}

        {phase === "play" && !describersOnPhone && (
          <>
            <div style={{ position: "relative", background: "linear-gradient(160deg,#1C0701,#2D0A00)", border: "4px solid #F97316", borderRadius: "22px", padding: "26px 18px", textAlign: "center", marginBottom: "16px", boxShadow: "0 0 30px rgba(249,115,22,0.35)" }}>
              <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                <FlagPromptButton gameId="hotseat" questionData={{ raw: currentWord }} />
              </div>
              <div style={{ color: "#FDBA74", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", marginBottom: "10px" }}>Describe this word</div>
              <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: "18px", border: "3px solid #F9731655", padding: "24px 12px", color: "#FFF7ED", fontWeight: "900", fontSize: "clamp(36px,9vw,72px)", lineHeight: 1.05, minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center", overflowWrap: "anywhere", textShadow: "0 0 18px rgba(249,115,22,0.6)" }}>
                {currentWord}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
              <button onClick={markCorrect} className="hs-btn" style={{ background: "linear-gradient(135deg,#15803D,#22C55E)", color: "white", border: "none", borderRadius: "14px", padding: "16px", fontSize: "18px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}>Correct +{POINTS_PER_WORD}</button>
              <button onClick={skipWord} className="hs-btn" style={{ background: "rgba(0,0,0,0.3)", color: "#FDBA74", border: "3px solid #F59E0B", borderRadius: "14px", padding: "16px", fontSize: "18px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}>Skip</button>
              <button onClick={endTurn} className="hs-btn" style={{ background: "rgba(0,0,0,0.3)", color: "#FCA5A5", border: "3px solid #EF4444", borderRadius: "14px", padding: "16px", fontSize: "18px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}>End Turn</button>
            </div>
          </>
        )}

        {phase === "turnend" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ background: "linear-gradient(160deg,#1C0701,#2D0A00)", border: "2px solid #22C55E", borderRadius: "16px", padding: "18px", marginBottom: "16px" }}>
              <div style={{ fontWeight: "900", fontSize: "22px", color: "white", marginBottom: "6px" }}>{currentTeam.name} guessed {lastTurnCorrect} word{lastTurnCorrect === 1 ? "" : "s"}.</div>
              <div style={{ color: "#86EFAC", fontWeight: "900", fontSize: "18px", marginBottom: "4px" }}>+{lastTurnCorrect * POINTS_PER_WORD} pts</div>
              <div style={{ color: "#FED7AA", fontWeight: "700" }}>Those points have been added to the scoreboard.</div>
            </div>
            <button onClick={goToNextTurn} className="hs-btn" style={{ background: "linear-gradient(135deg,#B91C1C,#F97316)", color: "white", border: "none", borderRadius: "14px", padding: "13px 34px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 20px rgba(249,115,22,0.4)", transition: "transform 0.15s ease" }}>
              {isLastTurn ? "🏆 See Final Results" : teamIndex < teams.length - 1 ? "Next Team" : "Start Next Round"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
