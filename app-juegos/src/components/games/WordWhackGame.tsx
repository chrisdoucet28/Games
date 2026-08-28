import { useState, useRef, useEffect } from "react";
import { TeamIcon, MascotSprite } from "../shared/TeamIcon";
import { Icon } from "../shared/Icon";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { GameProps } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import {
  useMoleGame, parseChoices, mergeUniqueRounds, DIFFICULTY_OPTIONS, TOTAL_HOLES,
  BASE_HIT_PTS, COMBO_STEP, MAX_COMBO_BONUS,
  type Difficulty, type ParsedMCQ,
} from "../../hooks/useMoleGame";
import { teamsGridCols, GAME_MODES, GAME_ICONS } from "../../data/constants";
import { denseRank, medalForRank } from "../../utils/ranking";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { FlagPromptButton } from "../shared/FlagPromptButton";
import { PhoneJoinPanel } from "../shared/PhoneJoinPanel";
import { PhoneReconnectBadge } from "../shared/PhoneReconnectBadge";
import { WHACK_TUTORIAL_STEPS } from "../../data/tutorials/whack";
import {
  generateSessionCode, openWhackChannel, closeChannel,
  type WhackPhase, type WhackStatePayload, type WhackTurnReportPayload,
} from "../../lib/liveSession";

const GM = GAME_MODES.find(g => g.id === "whack")!;

const TURN_SECONDS = 90;
// Every team gets this many 90s turns before final results — a single turn per team felt too
// short on its own, per teacher feedback; 2 gives the full experience without dragging it out.
const TOTAL_ROUNDS = 2;
// How long a phone-driven turn's team can be missing from `connectedTeamIds` before the teacher
// gets a manual "Skip Their Turn" option — comfortably longer than a normal reconnect (a wifi
// blip or a quick tab reopen), short enough the class isn't stuck waiting on a genuinely-gone
// phone. See the "stop the silent takeover" fix below.
const DISCONNECT_GRACE_MS = 8000;

const AMBIENT_BITS = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 41) % 100,
  top: (i * 23) % 100,
  size: 10 + (i % 3) * 4,
  dur: 4 + (i % 5),
  delay: (i % 6) * 0.4,
  iconName: (["sparkle", "star", "sparkle"] as const)[i % 3],
}));

const STYLE_TAG = (
  <style>{`
    @keyframes wwDrift{0%{transform:translateY(0) rotate(0deg);opacity:0.15}50%{opacity:0.4}100%{transform:translateY(-36px) rotate(20deg);opacity:0.15}}
    @keyframes wwPopUp{0%{transform:translateY(30px) scale(0.5);opacity:0}60%{transform:translateY(-4px) scale(1.08);opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}
    @keyframes wwDuckDown{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(30px) scale(0.6);opacity:0}}
    @keyframes wwHitBurst{0%{transform:scale(0.3);opacity:1}60%{transform:scale(1.6);opacity:0.9}100%{transform:scale(2);opacity:0}}
    @keyframes wwBonk{0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(-3px,1px) rotate(-8deg)}50%{transform:translate(3px,-1px) rotate(8deg)}75%{transform:translate(-2px,1px) rotate(-4deg)}}
    @keyframes wwCountPulse{0%{transform:scale(0.5);opacity:0}50%{transform:scale(1.2);opacity:1}100%{transform:scale(1);opacity:1}}
    @keyframes wwComboGlow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.4)}}
    @keyframes wwShine{0%,100%{opacity:0.5}50%{opacity:0.9}}
    .ww-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.08)}
    .ww-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
    .ww-mole:hover{filter:brightness(1.15)}
    .ww-mole:active{filter:brightness(0.85)}
  `}</style>
);

function AmbientBackdrop() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {AMBIENT_BITS.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: `${b.left}%`, top: `${b.top}%`, color: "#BEF264", opacity: 0.7, animation: `wwDrift ${b.dur}s ease-in-out infinite ${b.delay}s` }}><Icon name={b.iconName} size={b.size} /></div>
      ))}
    </div>
  );
}

// What "Save & Exit" snapshots and "Resume" restores — the round/team turn cursor, chosen
// difficulty, and each team's running final score. Resuming skips straight to the countdown for
// the team whose turn it was, rather than replaying the difficulty-picker intro or the exact
// mole/combo state that was on screen when it was saved. The pool cursor and review list aren't
// snapshotted (same pre-existing gap as before this feature — a resumed game already couldn't
// guarantee "never repeats" across a save/resume boundary; not introducing that, just not fixing
// it here either) — a resumed game's review list simply starts fresh from the resume point.
type WordWhackSnapshot = {
  teamIdx: number;
  round: number;
  difficulty: Difficulty;
  finalScores: Record<string | number, number>;
};

function validateWordWhackSnapshot(raw: unknown, teamCount: number): WordWhackSnapshot | undefined {
  const s = raw as Partial<WordWhackSnapshot> | null | undefined;
  if (!s || typeof s.teamIdx !== "number" || s.teamIdx < 0 || s.teamIdx >= teamCount) return undefined;
  if (typeof s.round !== "number" || s.round < 1 || s.round > TOTAL_ROUNDS) return undefined;
  if (s.difficulty !== "easy" && s.difficulty !== "medium" && s.difficulty !== "hard") return undefined;
  return { teamIdx: s.teamIdx, round: s.round, difficulty: s.difficulty, finalScores: s.finalScores ?? {} };
}

// Shown on the shared screen in place of the mole grid while the active team is playing on their
// own phone — a live, tappable mirror isn't worth the sync/latency complexity for a game where a
// mole is only up for 2-5 seconds (see the plan's reasoning), so this is deliberately just a
// status card, not a spectacle. Everyone finds out the score the moment that team's phone reports
// it — but the countdown itself is worth showing big, so the rest of the class watching from
// across the room can still see how much of that team's turn is left.
function PhoneTurnSpectator({ activeTeam, timeLeft, totalSeconds }: {
  activeTeam: { name: string; mascot?: string | null; color: { emoji: string; bg: string; dark: string } };
  timeLeft: number; totalSeconds: number;
}) {
  const timeColor = timeLeft > totalSeconds * 0.5 ? "#BEF264" : timeLeft > totalSeconds * 0.25 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", background: `linear-gradient(160deg,${activeTeam.color.dark}55,#1A2E05)`, border: `3px solid ${activeTeam.color.bg}`, borderRadius: "16px" }}>
      <div style={{ fontSize: "40px", marginBottom: "10px" }}><TeamIcon team={activeTeam} size={40} /></div>
      <div style={{ fontWeight: "900", fontSize: "18px", color: "white", marginBottom: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="hammer" size={16} /> {activeTeam.name} is playing on their phone!</div>
      <div style={{ fontWeight: "900", fontSize: "56px", color: timeColor, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{timeLeft}s</div>
      <div style={{ fontSize: "13px", color: "#D9F99D", marginTop: "14px" }}>Their score will show up here the moment their turn ends.</div>
    </div>
  );
}

// Replaces PhoneTurnSpectator once a phone-driven turn's team has been missing past the grace
// period (see DISCONNECT_GRACE_MS) — the teacher's manual "give up waiting" override, rather than
// silently handing the turn to the shared screen the moment a connection drops.
function DisconnectedTurnOverride({ activeTeam, onSkip }: {
  activeTeam: { name: string; mascot?: string | null; color: { emoji: string; bg: string; dark: string } };
  onSkip: () => void;
}) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", background: "linear-gradient(160deg,#7C2D1255,#1A2E05)", border: "3px solid #F59E0B", borderRadius: "16px" }}>
      <div style={{ fontSize: "40px", marginBottom: "10px" }}><TeamIcon team={activeTeam} size={40} /></div>
      <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D", marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="warning" size={16} /> {activeTeam.name} lost connection</div>
      <div style={{ fontSize: "13px", color: "#FDE68A", marginBottom: "18px" }}>Waiting to see if they reconnect — use "<Icon name="phone" size={11} /> Reconnect a phone" below if they need the code again.</div>
      <button onClick={onSkip} className="ww-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg,#B45309,#F59E0B)", color: "#1F1300", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "900", cursor: "pointer" }}>
        Skip Their Turn <Icon name="next" size={15} />
      </button>
    </div>
  );
}

export function WordWhackGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState }: GameProps) {
  const resumed = useRef(validateWordWhackSnapshot(initialGameState, teams.length)).current;

  const pool = useRef((() => {
    const mcqOnly = questions.filter(q => q.type === "choose correct grammar");
    const parsedMcq = mcqOnly.map(parseChoices).filter((p): p is ParsedMCQ => p !== null);
    const finalPool = parsedMcq.length >= 4
      ? parsedMcq
      : questions.map(parseChoices).filter((p): p is ParsedMCQ => p !== null);
    return [...finalPool].sort(() => Math.random() - 0.5);
  })()).current;

  const [phase, setPhase] = useState<"intro" | "countdown" | "playing" | "turn-end" | "final">(resumed ? "countdown" : "intro");
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => { setPhase("final"); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase]);
  const [difficulty, setDifficulty] = useState<Difficulty>(resumed?.difficulty ?? "medium");
  const [teamIdx, setTeamIdx] = useState(() => resumed?.teamIdx ?? 0);
  const [round, setRound] = useState(() => resumed?.round ?? 1);
  const [countdown, setCountdown] = useState(3);
  const [finalScores, setFinalScores] = useState<Record<string | number, number>>(() => resumed?.finalScores ?? {});
  // What the turn-end screen shows — set from the hook's own values (screen-mode turns) or from a
  // phone's turnReport (phone-mode turns), since the hook itself isn't running during the latter.
  const [lastTurnScore, setLastTurnScore] = useState(0);
  const [lastTurnBestCombo, setLastTurnBestCombo] = useState(0);
  // Every question that's come up this whole game, across every team's every turn — the post-game
  // review list. Never resets mid-game; only the pool's own "never repeats" cursor determines what
  // shows up next.
  const [playedRounds, setPlayedRounds] = useState<ParsedMCQ[]>([]);

  // "Play on Phones" — available at any team count, no structural restriction (unlike Spy Among
  // Us's 1v1 fork, Word Whack has one mechanic regardless of team count). Always defaults to
  // screen, even on Resume, same intentional limitation as every other phone-mode game.
  const [inputMode, setInputMode] = useState<"screen" | "phone">("screen");
  const [introStep, setIntroStep] = useState<"setup" | "qr">("setup");
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [connectedTeamIds, setConnectedTeamIds] = useState<Set<string | number>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): WordWhackSnapshot => ({ teamIdx, round, difficulty, finalScores });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, teamIdx, round, difficulty, finalScores]);

  const turnTimeLeftRef = useRef(TURN_SECONDS);
  // The pool cursor that actually persists across every turn, screen- or phone-driven alike —
  // useMoleGame's own internal cursor resets every turn, this is what feeds it a fresh
  // startRoundIdx each time and is what phone turnReports advance too.
  const globalRoundIdxRef = useRef(0);

  const activeTeam = teams[teamIdx];
  const activeTeamHasPhone = inputMode === "phone" && connectedTeamIds.has(activeTeam.id);

  // Snapshot once, at the moment a turn starts — deliberately NOT recomputed live off
  // connectedTeamIds every render. Once a turn is handed to a phone, it stays that phone's turn,
  // even if it drops, until the teacher explicitly skips it below (see phoneMissingMidTurn /
  // skipDisconnectedTurn) — without this, a mid-turn disconnect would silently hand the mole grid
  // to the whole shared screen the instant connectedTeamIds updates, since useTurnTimer/useMoleGame
  // both restart fresh whenever their `active` flag flips false->true.
  const turnOwnedByPhoneRef = useRef(false);
  useEffect(() => {
    if (phase === "playing") turnOwnedByPhoneRef.current = activeTeamHasPhone;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, teamIdx]);

  // True once the team a phone-driven turn belongs to has actually dropped off the channel mid-turn
  // — feeds the disconnect-grace timer below, which is what decides when to offer the teacher a
  // manual skip.
  const phoneMissingMidTurn = turnOwnedByPhoneRef.current && phase === "playing" && !connectedTeamIds.has(activeTeam.id);

  // Gives a normal reconnect (wifi blip, or the student just reopening the join link — see
  // PhoneReconnectBadge) a real chance to resolve silently before surfacing anything to the
  // teacher. Resets the moment the team is connected again, from either side of the timeout.
  const [pastDisconnectGrace, setPastDisconnectGrace] = useState(false);
  useEffect(() => {
    if (!phoneMissingMidTurn) { setPastDisconnectGrace(false); return; }
    const t = setTimeout(() => setPastDisconnectGrace(true), DISCONNECT_GRACE_MS);
    return () => clearTimeout(t);
  }, [phoneMissingMidTurn]);

  // The screen only runs the mole loop itself when this turn was never handed to a phone in the
  // first place — a mid-turn disconnect no longer flips this (see turnOwnedByPhoneRef above).
  const screenRunsThisTurn = phase === "playing" && !turnOwnedByPhoneRef.current;

  const endTurn = () => {
    const finalTurnScore = game.turnScore;
    if (finalTurnScore > 0) onUpdateScore(activeTeam.id, finalTurnScore);
    // Accumulates across both of a team's rounds — this is "points scored in this Word Whack
    // playthrough" for the game's own final ranking, separate from the team's cross-game score.
    setFinalScores(prev => ({ ...prev, [activeTeam.id]: (prev[activeTeam.id] ?? 0) + finalTurnScore }));
    globalRoundIdxRef.current = game.roundIdxRef.current;
    setPlayedRounds(prev => mergeUniqueRounds(prev, game.playedRounds));
    setLastTurnScore(finalTurnScore);
    setLastTurnBestCombo(game.bestCombo);
    setPhase("turn-end");
  };

  // Teacher's manual override once a phone-driven turn's team has been gone past the grace period.
  // 0 points, since Word Whack never streams live in-progress score from a phone mid-turn — same
  // "0 is the only honest number" reasoning as a team that never connects at all. No
  // globalRoundIdxRef advance: no questions were actually consumed this stalled turn.
  const skipDisconnectedTurn = () => {
    setLastTurnScore(0);
    setLastTurnBestCombo(0);
    setPhase("turn-end");
  };

  const { timeLeft: turnTimeLeft } = useTurnTimer(TURN_SECONDS, screenRunsThisTurn, endTurn, `${round}-${teamIdx}`);
  useEffect(() => { turnTimeLeftRef.current = turnTimeLeft; }, [turnTimeLeft]);

  // A second, purely cosmetic countdown for when the active team is playing on their own phone —
  // the phone is what actually ends the turn (via its turnReport), this one's onExpire is a no-op.
  // Starts at the same moment the phone's own local timer does (both keyed off the same
  // phase === "playing" transition), so the two stay close enough in sync for a shared-screen
  // display with nobody's actual gameplay depending on it down to the second.
  const { timeLeft: spectatorTimeLeft } = useTurnTimer(TURN_SECONDS, phase === "playing" && turnOwnedByPhoneRef.current, () => {}, `${round}-${teamIdx}`);

  const game = useMoleGame({
    pool, difficulty, startRoundIdx: globalRoundIdxRef.current,
    active: screenRunsThisTurn, resetKey: `${round}-${teamIdx}`, turnTimeLeftRef,
  });

  // Refs the phone-mode broadcaster (below) reads from, so opening/closing the realtime channel
  // only happens when phone mode itself toggles on/off, not on every round/phase/score change —
  // same pattern as every other phone-mode game.
  const phaseRef = useRef(phase);
  const teamIdxRef = useRef(teamIdx);
  const finalScoresRef = useRef(finalScores);
  const playedRoundsRef = useRef(playedRounds);
  const connectedTeamIdsRef = useRef<Set<string | number>>(new Set());
  const sendStateRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    phaseRef.current = phase;
    teamIdxRef.current = teamIdx;
    finalScoresRef.current = finalScores;
    playedRoundsRef.current = playedRounds;
  }, [phase, teamIdx, finalScores, playedRounds]);

  // Opens/closes the realtime channel only when phone mode itself is toggled on/off. Bidirectional
  // — unlike Spy Among Us, phones here talk back, but only once per turn (a `turnReport` when
  // their local 90s timer runs out), never a stream of per-hit events.
  useEffect(() => {
    if (inputMode !== "phone" || !sessionCode) return;
    const channel = openWhackChannel(sessionCode);
    channelRef.current = channel;

    const sendState = () => {
      const rawPhase = phaseRef.current;
      const mappedPhase: WhackPhase = rawPhase === "intro" ? "lobby" : rawPhase === "final" ? "final" : "turn";
      // Only set once the countdown has actually finished — a phone stays on "waiting for your
      // turn" through the 3-2-1 beat, same as the screen's own mole grid doesn't appear until then.
      const activeTeamId = rawPhase === "playing" ? teams[teamIdxRef.current]?.id ?? null : null;
      const payload: WhackStatePayload = {
        phase: mappedPhase,
        pool, difficulty, turnSeconds: TURN_SECONDS,
        roster: teams.map(t => ({ id: t.id, name: t.name, color: t.color, mascot: t.mascot })),
        activeTeamId,
        startRoundIdx: globalRoundIdxRef.current,
        scores: Object.fromEntries(teams.map(t => [String(t.id), finalScoresRef.current[t.id] ?? 0])),
        connectedTeamIds: Array.from(connectedTeamIdsRef.current),
        playedRounds: rawPhase === "final" ? playedRoundsRef.current : [],
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

    channel.on("broadcast", { event: "turnReport" }, ({ payload }) => {
      const report = payload as WhackTurnReportPayload;
      if (report.finalScore > 0) onUpdateScore(report.teamId, report.finalScore);
      setFinalScores(prev => ({ ...prev, [report.teamId]: (prev[report.teamId] ?? 0) + report.finalScore }));
      globalRoundIdxRef.current = report.endRoundIdx;
      setPlayedRounds(prev => mergeUniqueRounds(prev, report.playedRounds));
      setLastTurnScore(report.finalScore);
      setLastTurnBestCombo(report.bestCombo);
      setPhase("turn-end");
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

  // Pushes an immediate state update on round/turn transitions rather than waiting for the
  // interval, so a phone doesn't sit on stale content for up to ~4s.
  useEffect(() => {
    sendStateRef.current?.();
  }, [phase, teamIdx]);

  // Tells every connected phone the warm-up is over the moment it actually ends.
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

  const startTeamTurn = () => {
    setCountdown(3);
    setPhase("countdown");
  };

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) { setPhase("playing"); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 650);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const nextTeam = () => {
    const next = teamIdx + 1;
    if (next >= teams.length) {
      if (round >= TOTAL_ROUNDS) { setPhase("final"); return; }
      setRound(r => r + 1);
      setTeamIdx(0);
      startTeamTurn();
      return;
    }
    setTeamIdx(next);
    startTeamTurn();
  };

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% -10%,#65A30D 0%,#365314 45%,#0F1A05 100%)",
  };

  if (pool.length === 0) {
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <AmbientBackdrop />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "10px" }}><Icon name="hammer" size={40} /></div>
          <div style={{ fontWeight: "800", fontSize: "18px", color: "white" }}>No multiple-choice content found for this topic selection.</div>
          <button onClick={onEnd} className="ww-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "16px", background: "linear-gradient(135deg,#3F6212,#84CC16)", color: "#0F1A05", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "16px", fontWeight: "900", cursor: "pointer" }}><Icon name="checkeredFlag" size={18} /> End Game</button>
        </div>
      </div>
    );
  }

  // Tutorial mockup: src/data/tutorials/whack.tsx — update if this intro's rules text changes.
  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      <AmbientBackdrop />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(160deg,#3F6212,#1A2E05)", border: "2px solid #BEF26455", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "540px", margin: "0 auto 10px", boxShadow: "0 0 50px rgba(132,204,22,0.4)" }}>
          <div style={{ marginBottom: "10px" }}><Icon name="hammer" size={36} /></div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#BEF264" }}>Word Whack</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7 }}>
            One team plays at a time, <strong style={{ color: "#BEF264" }}>90 seconds</strong> each, for <strong style={{ color: "#BEF264" }}>{TOTAL_ROUNDS} rounds</strong> — moles pop up with possible answers, whack the <strong style={{ color: "#BEF264" }}>correct one</strong> before it ducks!<br />
            Hit right for points and a growing <strong style={{ color: "#BEF264" }}>combo bonus</strong>; hit wrong and that mole's gone, but the correct one's still up. Moles duck faster as your clock runs down!
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
          {teams.map((t, i) => (
            <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#1A2E05)`, border: `3px solid ${t.color.bg}`, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: "white", display: "flex", alignItems: "center", gap: "6px" }}>
              {i + 1}. <TeamIcon team={t} color="white" /> {t.name}
            </div>
          ))}
        </div>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#BEF264", marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="hammer" size={13} /> Whack speed (turn is always 90s):</div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            {DIFFICULTY_OPTIONS.map(d => (
              <button key={d} onClick={() => setDifficulty(d)} className="ww-btn" style={{
                background: difficulty === d ? "linear-gradient(135deg,#3F6212,#84CC16)" : "rgba(255,255,255,0.08)",
                color: difficulty === d ? "#0F1A05" : "#D9F99D",
                border: `2px solid ${difficulty === d ? "#84CC16" : "#BEF26455"}`,
                borderRadius: "12px", padding: "10px 20px", cursor: "pointer",
                fontWeight: "800", fontSize: "14px", minWidth: "84px", textTransform: "capitalize", transition: "all 0.15s",
              }}>
                {d}
              </button>
            ))}
          </div>
        </div>
        {introStep === "setup" && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", color: "#D9F99D", fontWeight: "700", marginBottom: "10px" }}>How will teams whack their moles?</div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={handlePickScreenMode} style={{
                padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                border: `2px solid ${inputMode === "screen" ? "#BEF264" : "rgba(255,255,255,0.2)"}`,
                background: inputMode === "screen" ? "rgba(190,242,100,0.15)" : "rgba(255,255,255,0.05)",
                color: inputMode === "screen" ? "#BEF264" : "#D9F99D",
                display: "inline-flex", alignItems: "center", gap: "6px",
              }}><Icon name="screen" size={14} /> Play on Screen</button>
              <button onClick={handlePickPhoneMode} style={{
                padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                border: `2px solid ${inputMode === "phone" ? "#BEF264" : "rgba(255,255,255,0.2)"}`,
                background: inputMode === "phone" ? "rgba(190,242,100,0.15)" : "rgba(255,255,255,0.05)",
                color: inputMode === "phone" ? "#BEF264" : "#D9F99D",
                display: "inline-flex", alignItems: "center", gap: "6px",
              }}><Icon name="phone" size={14} /> Play on Phones</button>
            </div>
          </div>
        )}

        {introStep === "qr" && sessionCode && (() => {
          const joinUrl = `${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=whack`;
          return (
            <PhoneJoinPanel
              sessionCode={sessionCode} joinUrl={joinUrl} teams={teams} connectedTeamIds={connectedTeamIds}
              accent="#BEF264" panelBg="linear-gradient(160deg,#3F6212,#1A2E05)" borderColor="#BEF26466"
              footer={
                <button onClick={handlePickScreenMode} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
                  Switch back to Play on Screen
                </button>
              }
            />
          );
        })()}
        <button onClick={() => setShowHowTo(true)} className="ww-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
          <Icon name="help" size={15} /> How to Play
        </button>
        {showHowTo && (
          <HowToPlayModal
            gameName={GM.name} gameIcon={GAME_ICONS[GM.id]} accentColor={GM.color}
            steps={WHACK_TUTORIAL_STEPS}
            onClose={() => setShowHowTo(false)}
          />
        )}
        <button onClick={() => { setTeamIdx(0); startTeamTurn(); }} className="ww-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#3F6212,#84CC16)", color: "#0F1A05", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(132,204,22,0.5)", transition: "transform 0.15s ease" }}>
          <Icon name="hammer" size={20} /> Start Whacking!
        </button>
      </div>
    </div>
  );

  if (phase === "final") {
    // Dense rank on final score — two teams tied for first both get gold instead of an
    // arbitrary array-order winner/runner-up split.
    const ranking = denseRank(teams, t => finalScores[t.id] ?? 0).sort((a, b) => b.value - a.value);
    const winners = ranking.filter(r => r.rank === 0);
    const isTie = winners.length > 1;
    const headline = isTie
      ? `${winners.map(w => w.item.name).join(" & ")} tied for the most whacks!`
      : `${winners[0]?.item.name} whacked the most!`;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <AmbientBackdrop />
        {STYLE_TAG}
        <div style={{ marginBottom: "6px" }}><Icon name="trophy" size={48} color="#FCD34D" /></div>
        <div style={{ fontWeight: "900", fontSize: "24px", color: "#BEF264", marginBottom: "16px" }}>{headline}</div>
        <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "700px" }}>
          {ranking.map(({ item: t, rank, value }) => (
            <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#1A2E05)`, border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "12px" }}>
              <div style={{ fontSize: "22px" }}>{medalForRank(rank)}</div>
              <div style={{ fontWeight: "800", color: "white", fontSize: "14px", marginTop: "4px" }}><TeamIcon team={t} /> {t.name}</div>
              <div style={{ color: "#BEF264", fontWeight: "800", fontSize: "15px", marginTop: "4px" }}>{value} pts</div>
            </div>
          ))}
        </div>

        {playedRounds.length > 0 && (
          <div style={{ maxWidth: "700px", margin: "0 auto 20px", textAlign: "left" }}>
            <div style={{ textAlign: "center", fontWeight: "900", fontSize: "16px", color: "#BEF264", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><Icon name="clipboard" size={15} /> Review the Questions</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "8px" }}>
              {playedRounds.map((r, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid #BEF26440", borderRadius: "10px", padding: "10px 12px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "white", marginBottom: "6px" }}>{r.prompt}</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {r.choices.map((c, ci) => (
                      <span key={ci} style={{
                        padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "800",
                        background: ci === r.correctIdx ? "rgba(190,242,100,0.18)" : "rgba(255,255,255,0.05)",
                        border: `1.5px solid ${ci === r.correctIdx ? "#BEF264" : "rgba(255,255,255,0.18)"}`,
                        color: ci === r.correctIdx ? "#BEF264" : "#9CA3AF",
                        display: "inline-flex", alignItems: "center", gap: "4px",
                      }}>
                        {ci === r.correctIdx && <Icon name="check" size={11} />}{c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onEnd} className="ww-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#3F6212,#84CC16)", color: "#0F1A05", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}><Icon name="checkeredFlag" size={16} /> End Game</button>
      </div>
    );
  }

  return (
    <div style={arenaStyle}>
      <AmbientBackdrop />
      {STYLE_TAG}
      {inputMode === "phone" && sessionCode && (
        <PhoneReconnectBadge
          sessionCode={sessionCode} joinUrl={`${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=whack`}
          teams={teams} connectedTeamIds={connectedTeamIds}
          accent="#BEF264" panelBg="linear-gradient(160deg,#3F6212,#1A2E05)" borderColor="#BEF26466"
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: `linear-gradient(90deg,${activeTeam.color.dark},${activeTeam.color.bg})`, borderRadius: "14px", padding: "10px 16px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", boxShadow: `0 4px 18px ${activeTeam.color.bg}55` }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.4)", display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="hammer" size={15} /> <TeamIcon team={activeTeam} color="white" /> {activeTeam.name}'s turn — Round {round}/{TOTAL_ROUNDS}, Team {teamIdx + 1} of {teams.length}</span>
          {phase === "playing" && <TurnTimerBar timeLeft={turnOwnedByPhoneRef.current ? spectatorTimeLeft : turnTimeLeft} totalSeconds={TURN_SECONDS} />}
        </div>

        {(phase === "playing" || phase === "countdown") && (
          // During "countdown" turnOwnedByPhoneRef hasn't been set for the upcoming team yet (it
          // only updates once "playing" actually starts), so fall back to the live value there —
          // purely cosmetic pre-turn UI, no real game hook depends on it during countdown.
          (phase === "countdown" ? activeTeamHasPhone : turnOwnedByPhoneRef.current) ? (
            pastDisconnectGrace && phoneMissingMidTurn ? (
              <DisconnectedTurnOverride activeTeam={activeTeam} onSkip={skipDisconnectedTurn} />
            ) : (
              <PhoneTurnSpectator activeTeam={activeTeam} timeLeft={spectatorTimeLeft} totalSeconds={TURN_SECONDS} />
            )
          ) : (
          <>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "12px", flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid #BEF26466", borderRadius: "10px", padding: "6px 14px", fontSize: "13px", fontWeight: "800", color: "#BEF264", display: "inline-flex", alignItems: "center", gap: "5px" }}><Icon name="coin" size={13} /> {game.turnScore} pts</div>
              <div style={{ background: game.combo > 0 ? "linear-gradient(135deg,#CA8A04,#F59E0B)" : "rgba(255,255,255,0.1)", border: "1.5px solid #FCD34D66", borderRadius: "10px", padding: "6px 14px", fontSize: "13px", fontWeight: "800", color: game.combo > 0 ? "#1F1300" : "#FCD34D88", animation: game.combo > 2 ? "wwComboGlow 0.8s ease-in-out infinite" : "none", display: "inline-flex", alignItems: "center", gap: "5px" }}><Icon name="flame" size={13} /> Combo x{game.combo}</div>
            </div>

            <div style={{ position: "relative", background: "rgba(255,255,255,0.08)", border: "2px solid #BEF26455", borderRadius: "14px", padding: "14px 18px", marginBottom: "14px", textAlign: "center" }}>
              <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                <FlagPromptButton gameId="whack" questionData={{ raw: game.prompt }} />
              </div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#BEF264", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Whack the correct answer</div>
              <div style={{ fontWeight: "800", fontSize: "clamp(15px,2.5vw,19px)", color: "white" }}>{game.prompt || "…"}</div>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", maxWidth: "420px", margin: "0 auto" }}>
                {Array.from({ length: TOTAL_HOLES }).map((_, holeIdx) => {
                  const mole = game.moles.find(m => m.holeIdx === holeIdx);
                  const holeFx = game.fx && game.fx.holeIdx === holeIdx ? game.fx : null;
                  return (
                    <div key={holeIdx} style={{ position: "relative", height: "88px" }}>
                      <div style={{ position: "absolute", left: "50%", bottom: "6px", transform: "translateX(-50%)", width: "70px", height: "26px", borderRadius: "50%", background: "radial-gradient(ellipse,#1A2E05,#0F1A05)", boxShadow: "inset 0 4px 8px rgba(0,0,0,0.6)" }} />
                      {mole && (
                        <button
                          key={mole.key}
                          onClick={() => game.hitMole(mole)}
                          className="ww-mole"
                          style={{
                            // Centered via left/right/margin (not transform) so that no animation or
                            // pseudo-class state can ever knock the button off-center by clobbering a
                            // transform-based centering trick — transform is free for pure motion/scale.
                            position: "absolute", left: 0, right: 0, margin: "0 auto", bottom: "10px",
                            width: "92px", minHeight: "56px", border: "none", borderRadius: "14px", cursor: "pointer",
                            background: "linear-gradient(160deg,#A16207,#78350F)", color: "#FEF3C7",
                            fontWeight: "800", fontSize: mole.text.length > 14 ? "9.5px" : mole.text.length > 9 ? "10.5px" : "12px",
                            lineHeight: 1.15, padding: "8px 5px", boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                            // Long single words (e.g. "cosmopolitan", "extracurricular") have no space to wrap
                            // on — without this they overflow past the button's own edge, so the tail of the
                            // word renders outside the actual clickable hitbox and clicking it does nothing.
                            overflowWrap: "break-word", wordBreak: "break-word", hyphens: "auto",
                            display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
                            animation: holeFx?.kind === "miss" ? "wwBonk 0.35s ease-in-out" : "wwPopUp 0.3s ease-out",
                          }}
                        >
                          <MascotSprite mascot={activeTeam.mascot} fallback="🦫" size={15} /> {mole.text}
                        </button>
                      )}
                      {holeFx?.kind === "hit" && (
                        <div style={{ position: "absolute", left: "50%", bottom: "30px", transform: "translateX(-50%)", pointerEvents: "none" }}>
                          <div style={{ position: "absolute", width: "70px", height: "70px", left: "-35px", top: "-35px", borderRadius: "50%", background: "radial-gradient(circle,#BEF264AA,transparent 70%)", animation: "wwHitBurst 0.5s ease-out forwards" }} />
                          <div style={{ fontWeight: "900", fontSize: "16px", color: "#BEF264", textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>+{BASE_HIT_PTS + Math.min(MAX_COMBO_BONUS, (game.combo - 1) * COMBO_STEP)}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {phase === "countdown" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,26,5,0.7)", borderRadius: "14px" }}>
                  <div key={countdown} style={{ fontSize: "64px", fontWeight: "900", color: "#BEF264", animation: "wwCountPulse 0.6s ease-out", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
                    {countdown > 0 ? countdown : "GO!"}
                  </div>
                </div>
              )}
            </div>
          </>
          )
        )}

        {phase === "turn-end" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ background: "linear-gradient(160deg,#3F6212,#1A2E05)", border: "2px solid #BEF26466", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
              <div style={{ marginBottom: "6px" }}><Icon name="hammer" size={34} /></div>
              <div style={{ fontWeight: "900", fontSize: "20px", color: "white", marginBottom: "8px" }}>{activeTeam.name}'s turn is over!</div>
              <div style={{ fontWeight: "800", fontSize: "26px", color: "#BEF264" }}>+{lastTurnScore} pts</div>
              <div style={{ fontSize: "13px", color: "#D9F99D", marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>Best combo this turn: <Icon name="flame" size={12} /> x{lastTurnBestCombo}</div>
            </div>
            <button onClick={nextTeam} className="ww-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#3F6212,#84CC16)", color: "#0F1A05", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}>
              {teamIdx + 1 >= teams.length
                ? (round >= TOTAL_ROUNDS ? <><Icon name="trophy" size={18} /> See Final Results</> : <><Icon name="next" size={18} /> Start Round {round + 1}</>)
                : <><Icon name="next" size={18} /> Next Team's Turn</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
