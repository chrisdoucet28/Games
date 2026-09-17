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
import { setMusicGame, stopMusic } from "../../lib/music";
import {
  generateSessionCode, openRelayChannel, closeChannel,
  type RelayPhase, type RelayStatePayload, type RelayActionPayload,
} from "../../lib/liveSession";

const GM = GAME_MODES.find(g => g.id === "relay")!;

const WORDS_PER_TEAM = 5;
const POINTS_PER_WORD = 10;

const STYLE_TAG = (
  <style>{`
    @keyframes rlBannerIn{0%{opacity:0;transform:translate(-50%,-16px) scale(0.9)}15%{opacity:1;transform:translate(-50%,0) scale(1.03)}25%{transform:translate(-50%,0) scale(1)}85%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-10px) scale(0.96)}}
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

// What "Save & Exit" snapshots and "Resume" restores — the round/team turn cursor and each team's
// running word total. Resuming skips straight back into live play for whoever's turn it was,
// drawing a fresh word rather than trying to restore the exact one that was live when saved.
type RelaySnapshot = {
  roundIndex: number;
  teamIndex: number;
  wordsByTeam: Record<string | number, number>;
};

function validateRelaySnapshot(raw: unknown, teamCount: number): RelaySnapshot | undefined {
  const s = raw as Partial<RelaySnapshot> | null | undefined;
  if (!s || typeof s.roundIndex !== "number" || s.roundIndex < 0) return undefined;
  if (typeof s.teamIndex !== "number" || s.teamIndex < 0 || s.teamIndex >= teamCount) return undefined;
  if (s.roundIndex >= WORDS_PER_TEAM) return undefined;
  return { roundIndex: s.roundIndex, teamIndex: s.teamIndex, wordsByTeam: s.wordsByTeam ?? {} };
}

type PassBanner = { fromName: string; toName: string; key: number } | null;

export function RelayGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState }: GameProps) {
  const resumed = useRef(validateRelaySnapshot(initialGameState, teams.length)).current;

  const [phase, setPhase] = useState<"welcome" | "playing" | "final">(resumed ? "playing" : "welcome");
  const [showHowTo, setShowHowTo] = useState(false);

  // "Play on Phones" — available whenever there's more than one team; true 1-team solo play has
  // the teacher personally giving clues, so there's no within-team secrecy problem phones solve.
  const [inputMode, setInputMode] = useState<"screen" | "phone">("screen");
  const [introStep, setIntroStep] = useState<"setup" | "qr">("setup");
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [connectedTeamIds, setConnectedTeamIds] = useState<Set<string | number>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (phase === "final") { playSound("roundComplete"); stopMusic(); }
  }, [phase]);
  useEffect(() => {
    setMusicGame("relay");
    return () => setMusicGame(null);
  }, []);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => { setPhase("final"); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase]);

  const [roundIndex, setRoundIndex] = useState(() => resumed?.roundIndex ?? 0);
  const [teamIndex, setTeamIndex] = useState(() => resumed?.teamIndex ?? 0);
  const [wordsByTeam, setWordsByTeam] = useState<Record<string | number, number>>(() => resumed?.wordsByTeam ?? {});
  const [showWordList, setShowWordList] = useState(false);
  const [passBanner, setPassBanner] = useState<PassBanner>(null);
  const bannerIdRef = useRef(0);

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
  const [currentWord, setCurrentWord] = useState<string>(() => (words.length > 0 ? drawWord() : ""));

  const currentTeam = teams[teamIndex];
  const turnNumber = roundIndex * teams.length + teamIndex + 1;
  const totalTurns = WORDS_PER_TEAM * teams.length;
  const isLastTurn = roundIndex === WORDS_PER_TEAM - 1 && teamIndex === teams.length - 1;

  // The shared/screen arena hides the word whenever the active team's own phone is connected —
  // no teamStructure branch needed (unlike Hot Seat), since the rule is always the same one: the
  // active team's own device shows it, everyone else nearby reads it off that same screen.
  const wordHiddenOnScreen = inputMode === "phone" && !!currentTeam && connectedTeamIds.has(currentTeam.id);

  const pushPassBanner = useCallback((fromName: string, toName: string) => {
    const key = bannerIdRef.current++;
    setPassBanner({ fromName, toName, key });
    setTimeout(() => setPassBanner(prev => (prev?.key === key ? null : prev)), 1600);
  }, []);

  const markGotIt = () => {
    if (!currentTeam) return;
    onUpdateScore(currentTeam.id, POINTS_PER_WORD);
    setWordsByTeam(prev => ({ ...prev, [currentTeam.id]: (prev[currentTeam.id] ?? 0) + 1 }));
    playSound("relay");
    if (isLastTurn) {
      setPhase("final");
      return;
    }
    const nextTeamIndex = teamIndex < teams.length - 1 ? teamIndex + 1 : 0;
    const nextRoundIndex = teamIndex < teams.length - 1 ? roundIndex : roundIndex + 1;
    const nextTeam = teams[nextTeamIndex];
    setTeamIndex(nextTeamIndex);
    setRoundIndex(nextRoundIndex);
    setCurrentWord(drawWord());
    pushPassBanner(currentTeam.name, nextTeam.name);
  };

  const skipWord = () => {
    setCurrentWord(drawWord());
  };

  // Refs the phone-mode broadcaster reads synchronously, so opening/closing the realtime channel
  // only happens when phone mode itself toggles on/off, not on every word/turn change — same
  // pattern as every other phone-mode game. markGotIt/skipWord refreshed every render (no
  // dependency array) so an incoming phone action always calls the latest closure.
  const phaseRef = useRef(phase);
  const currentWordRef = useRef(currentWord);
  const teamIndexRef = useRef(teamIndex);
  const wordsByTeamRef = useRef(wordsByTeam);
  const connectedTeamIdsRef = useRef<Set<string | number>>(new Set());
  const sendStateRef = useRef<(() => void) | null>(null);
  const markGotItRef = useRef(markGotIt);
  const skipWordRef = useRef(skipWord);
  // A fast double-tap (or a screen click racing a phone tap) landing within the same instant is
  // the one real risk here — unlike Hot Seat's solo mode, only the active team's own phone can
  // ever act, so there's no cross-team race to guard against, just this simple same-source case.
  const lastActionAtRef = useRef(0);
  useEffect(() => {
    phaseRef.current = phase;
    currentWordRef.current = currentWord;
    teamIndexRef.current = teamIndex;
    wordsByTeamRef.current = wordsByTeam;
    markGotItRef.current = markGotIt;
    skipWordRef.current = skipWord;
  });

  useEffect(() => {
    if (inputMode !== "phone" || !sessionCode) return;
    const channel = openRelayChannel(sessionCode);
    channelRef.current = channel;

    const sendState = () => {
      const rawPhase = phaseRef.current;
      const mappedPhase: RelayPhase = rawPhase === "welcome" ? "lobby" : rawPhase === "final" ? "final" : "playing";
      const activeTeam = teams[teamIndexRef.current];
      const wordsByTeamOut: Record<string, number> = {};
      teams.forEach(t => { wordsByTeamOut[String(t.id)] = wordsByTeamRef.current[t.id] ?? 0; });
      const payload: RelayStatePayload = {
        phase: mappedPhase,
        roster: teams.map(t => ({ id: t.id, name: t.name, color: t.color, mascot: t.mascot })),
        activeTeamId: rawPhase === "playing" ? (activeTeam?.id ?? null) : null,
        currentWord: currentWordRef.current,
        wordsPerTeam: WORDS_PER_TEAM,
        wordsByTeam: wordsByTeamOut,
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
      sendState();
    });

    // The only place phone input actually touches game logic — only the currently active team's
    // own phone is allowed to act, then the exact same functions a screen-mode click would call.
    channel.on("broadcast", { event: "action" }, ({ payload }) => {
      const action = payload as RelayActionPayload;
      if (phaseRef.current !== "playing") return;
      const activeTeamId = teams[teamIndexRef.current]?.id;
      if (action.teamId !== activeTeamId) return;
      const now = Date.now();
      if (now - lastActionAtRef.current < 500) return;
      lastActionAtRef.current = now;
      if (action.action === "correct") markGotItRef.current();
      else if (action.action === "skip") skipWordRef.current();
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
  }, [phase, currentWord, teamIndex, roundIndex]);

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
              {teams.length === 1
                ? "The teacher holds the word — your team shouts guesses."
                : inputMode === "phone"
                ? "The active team's own phone shows the word — held facing away from them, so everyone nearby can read it and shout clues."
                : "One player on the active team turns away from the screen — everyone else gives clues."}
              <br />
              Guess it and the turn passes <strong style={{ color: "#5EEAD4" }}>instantly</strong> to the next team — no clock, no waiting.
              <br />
              Each correct word is worth <strong style={{ color: "#5EEAD4" }}>{POINTS_PER_WORD} points</strong>, and every team gets <strong style={{ color: "#5EEAD4" }}>{WORDS_PER_TEAM} turns</strong> — most points wins.
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
            {teams.map((t, i) => (
              <div key={t.id} style={{ background: t.color.dark, border: "2px solid #1A1A2E", boxShadow: "3px 3px 0 #1A1A2E", borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: "white", display: "flex", alignItems: "center", gap: "6px" }}>
                {i + 1}. <TeamIcon team={t} color="white" /> {t.name}
              </div>
            ))}
          </div>

          {teams.length > 1 && (
            <>
              {introStep === "setup" && (
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "13px", color: "#99F6E4", fontWeight: "700", marginBottom: "10px" }}>How will the word be shown?</div>
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
                return (
                  <PhoneJoinPanel
                    sessionCode={sessionCode} joinUrl={joinUrl} teams={teams} connectedTeamIds={connectedTeamIds}
                    accent="#5EEAD4" panelBg="linear-gradient(160deg,#0F766E,#022C22)" borderColor="#2DD4BF66"
                    footer={
                      <button onClick={handlePickScreenMode} style={{ background: "none", border: "none", color: "#99F6E499", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
                        Switch back to Play on Screen
                      </button>
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
          <button onClick={() => setPhase("playing")} className="rl-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#0D9488", color: "white", border: "3px solid #1A1A2E", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "6px 6px 0 #1A1A2E" }}>
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

  return (
    <div style={arenaStyle}>
      {STYLE_TAG}
      {inputMode === "phone" && sessionCode && (
        <PhoneReconnectBadge
          sessionCode={sessionCode} joinUrl={`${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=relay`}
          teams={teams} connectedTeamIds={connectedTeamIds}
          accent="#5EEAD4" panelBg="linear-gradient(160deg,#0F766E,#022C22)" borderColor="#2DD4BF66"
        />
      )}
      {passBanner && (
        <div key={passBanner.key} style={{
          position: "absolute", top: "14px", left: "50%", zIndex: 20, whiteSpace: "nowrap",
          background: "#22C55E", border: "3px solid #1A1A2E",
          borderRadius: "14px", padding: "10px 22px", boxShadow: "4px 4px 0 #1A1A2E",
          animation: "rlBannerIn 1.6s ease-in-out forwards",
        }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "15px", textShadow: "0 1px 3px rgba(0,0,0,0.3)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Icon name="check" size={14} /> +{POINTS_PER_WORD} — Now up: {passBanner.toName}!
          </span>
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "#134E4A", border: "3px solid #1A1A2E", borderRadius: "14px", padding: "14px 16px", marginBottom: "16px", textAlign: "center", color: "white", boxShadow: "4px 4px 0 #1A1A2E" }}>
          <div style={{ fontWeight: "900", fontSize: "18px" }}><TeamIcon team={currentTeam} /> {currentTeam.name}'s turn</div>
          <div style={{ fontWeight: "800", fontSize: "13px", opacity: 0.9, marginTop: "4px" }}>Turn {turnNumber} of {totalTurns}</div>
        </div>

        {wordHiddenOnScreen ? (
          <div style={{ background: "#022C22", border: "3px dashed #0D9488", borderRadius: "22px", padding: "34px 18px", textAlign: "center" }}>
            <div style={{ marginBottom: "10px" }}><Icon name="phone" size={34} /></div>
            <div style={{ fontWeight: "900", fontSize: "17px", color: "#5EEAD4", marginBottom: "6px" }}>{currentTeam.name}'s phone has the word!</div>
            <div style={{ color: "#99F6E4", fontSize: "13px", fontWeight: "600" }}>Held facing away — everyone nearby can see it and shout clues.</div>
          </div>
        ) : (
          <>
            <div style={{ position: "relative", background: "#022C22", border: "4px solid #1A1A2E", borderRadius: "22px", padding: "26px 18px", textAlign: "center", marginBottom: "16px", boxShadow: "6px 6px 0 #1A1A2E" }}>
              <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                <FlagPromptButton gameId="relay" questionData={{ raw: currentWord }} />
              </div>
              <div style={{ color: "#5EEAD4", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", marginBottom: "10px" }}>Shout clues for this word</div>
              <div key={currentWord} style={{ background: "rgba(0,0,0,0.35)", borderRadius: "18px", border: "3px solid #14B8A655", padding: "24px 12px", color: "#F0FDFA", fontWeight: "900", fontSize: "clamp(36px,9vw,72px)", lineHeight: 1.05, minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center", overflowWrap: "anywhere", textShadow: "0 0 18px rgba(45,212,191,0.6)", animation: "rlWordPop 0.25s ease-out" }}>
                {currentWord}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
              <button onClick={markGotIt} className="rl-btn" style={{ background: "#22C55E", color: "white", border: "3px solid #1A1A2E", borderRadius: "14px", padding: "16px", fontSize: "18px", fontWeight: "900", cursor: "pointer", boxShadow: "4px 4px 0 #1A1A2E" }}>Got it! +{POINTS_PER_WORD}</button>
              <button onClick={skipWord} className="rl-btn" style={{ background: "rgba(0,0,0,0.3)", color: "#5EEAD4", border: "3px solid #1A1A2E", borderRadius: "14px", padding: "16px", fontSize: "18px", fontWeight: "900", cursor: "pointer", boxShadow: "4px 4px 0 #1A1A2E" }}>Skip</button>
            </div>
          </>
        )}

        {wordListToggle}
      </div>
    </div>
  );
}
