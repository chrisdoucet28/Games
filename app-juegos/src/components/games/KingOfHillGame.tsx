import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { GameProps } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { QuestionCard } from "../shared/QuestionCard";
import { teamsGridCols, GAME_MODES } from "../../data/constants";
import { denseRank, medalForRank } from "../../utils/ranking";
import { makeSoloCpuTeam } from "../../lib/soloOpponent";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { HILL_TOPIC_STEPS, HILL_GRAMMAR_STEPS } from "../../data/tutorials/hill";

const GM = GAME_MODES.find(g => g.id === "hill")!;

// How long the CPU "thinks" before picking a zone, and before its uncontested claim resolves.
const CPU_THINK_MS = 1400;
const CPU_ANSWER_MS = 1000;
const CPU_CLAIM_SUCCESS_PROB = 0.8;
// Countdown the student gets to defend/attack a contested zone against the CPU, replacing the
// teacher's Attacker/Defender/Neither judgment in solo — same idea as Race Track's timer.
const CONTEST_SECONDS = 20;

type ZoneDef = { id: string; icon: string; pts: number; label?: string; prefix?: string };

// Grammar-focus mode: King of the Hill's dominant flavor is "finish the sentence" — zones are
// plain territory, the linguistic identity comes entirely from the shared, simultaneous-answer
// duel mechanic (both teams face the exact same blank when contesting a claimed zone).
const HILL_ZONES_GRAMMAR: ZoneDef[] = [
  { id: "North", icon: "🚩", pts: 3 },
  { id: "South", icon: "🚩", pts: 3 },
  { id: "East", icon: "🚩", pts: 2 },
  { id: "West", icon: "🚩", pts: 2 },
  { id: "Center", icon: "👑", pts: 5 },
];

// Topic-focus mode: zones are reflavored as discourse moves. Claiming zones across a round
// literally assembles a class conversation about the topic — opinion, question, example,
// pushback, alternative — instead of five disconnected one-liners. Each zone wraps whatever
// speaking prompt comes up with a move-specific prefix, so no new content is needed.
const HILL_ZONES_TOPIC: ZoneDef[] = [
  { id: "North", icon: "❓", pts: 3, label: "Question", prefix: "Ask a follow-up question about: " },
  { id: "South", icon: "💭", pts: 3, label: "Example", prefix: "Give a personal example about: " },
  { id: "East", icon: "🤝", pts: 2, label: "Agree/Disagree", prefix: "Agree or disagree, and say why: " },
  { id: "West", icon: "💡", pts: 2, label: "Alternative", prefix: "Suggest an alternative or solution about: " },
  { id: "Center", icon: "👑", pts: 5, label: "Opinion", prefix: "Give your opinion: " },
];

const TOTAL_ROUNDS = 4;
const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const AMBIENT_BITS = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 29) % 100,
  size: 10 + (i % 3) * 5,
  dur: 5 + (i % 5),
  delay: (i % 6) * 0.5,
  emoji: ["👑", "✨", "🚩"][i % 3],
}));

const STYLE_TAG = (
  <style>{`
    @keyframes koDrift{0%{transform:translateY(0) rotate(0deg);opacity:0.14}50%{opacity:0.35}100%{transform:translateY(-40px) rotate(18deg);opacity:0.14}}
    @keyframes koFlagPlant{0%{transform:scale(0.4) rotate(-18deg);opacity:0}60%{transform:scale(1.18) rotate(6deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
    @keyframes koZoneGlow{0%,100%{box-shadow:0 0 0 3px rgba(219,39,119,0.45)}50%{box-shadow:0 0 0 7px rgba(219,39,119,0.8)}}
    @keyframes koDuelPulse{0%,100%{opacity:0.65;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}
    @keyframes koDiceSpin{0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(200deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}
    @keyframes koCoinShine{0%,100%{filter:brightness(1)}50%{filter:brightness(1.35)}}
    @keyframes koCrownPop{0%{transform:scale(0) rotate(-20deg);opacity:0}70%{transform:scale(1.2) rotate(8deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
    .ko-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.08)}
    .ko-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
    .ko-zone:hover{filter:brightness(1.15)}
  `}</style>
);

function AmbientBackdrop() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {AMBIENT_BITS.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: `${b.left}%`, top: `${b.top}%`, fontSize: `${b.size}px`, animation: `koDrift ${b.dur}s ease-in-out infinite ${b.delay}s` }}>{b.emoji}</div>
      ))}
    </div>
  );
}

// What "Save & Exit" snapshots and "Resume" restores — which team owns which zone, accumulated
// control points, the current round number, and whose turn it is within this round's rolled
// order. Resuming skips straight back to "pick" for the active team rather than re-rolling turn
// order or replaying whatever question/contest was on screen.
type HillSnapshot = {
  owners: Record<string, string | number>;
  roundPoints: Record<string | number, number>;
  round: number;
  turnOrder: number[];
  activeTeamIdx: number;
};

function validateHillSnapshot(raw: unknown, teamCount: number): HillSnapshot | undefined {
  const s = raw as Partial<HillSnapshot> | null | undefined;
  if (!s || !Array.isArray(s.turnOrder) || s.turnOrder.length !== teamCount) return undefined;
  if (typeof s.activeTeamIdx !== "number" || s.activeTeamIdx < 0 || s.activeTeamIdx >= teamCount) return undefined;
  if (typeof s.round !== "number" || s.round < 1) return undefined;
  return { owners: s.owners ?? {}, roundPoints: s.roundPoints ?? {}, round: s.round, turnOrder: s.turnOrder, activeTeamIdx: s.activeTeamIdx };
}

export function KingOfHillGame({ questions, teams: propTeams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState }: GameProps) {
  const TURN_SECONDS = 20;

  // Solo play makes the CPU a real dice-rolled turn participant — "just another team, but it's
  // a CPU" — gets a real turn slot, claims/attacks zones on its own turn. The one thing it can't
  // do is answer a real question, so its own turn auto-resolves via a random roll, and a
  // contested duel against it uses a timer instead of teacher judgment (see below).
  const isSolo = propTeams.length === 1;
  const cpuRef = useRef(isSolo ? makeSoloCpuTeam() : null);
  const [cpuScore, setCpuScore] = useState(0);
  // Memoized so `teams` is referentially stable across renders when nothing has actually
  // changed — several existing effects/callbacks in this file depend on `teams` by reference,
  // and a fresh array literal every render would make them re-fire (and re-setState) forever.
  const teams = useMemo(
    () => (isSolo ? [propTeams[0], { ...cpuRef.current!, score: cpuScore }] : propTeams),
    [isSolo, propTeams, cpuScore]
  );
  const updateScore = (id: string | number, delta: number) => {
    if (isSolo && id === cpuRef.current?.id) { setCpuScore(s => s + delta); }
    else { onUpdateScore(id, delta); }
  };

  const isTopicMode = questions.length > 0 && questions.every(q => q.type === "speaking task");
  const ZONES = isTopicMode ? HILL_ZONES_TOPIC : HILL_ZONES_GRAMMAR;
  const resumed = useRef(validateHillSnapshot(initialGameState, teams.length)).current;

  const pool = useRef((() => {
    // Grammar mode is "finish the sentence" only — never "correct grammar mistakes", even as a
    // fallback. Every topic's content pool is kept deep enough (see topics.ts) that this never
    // needs a top-up.
    const base = isTopicMode
      ? questions
      : (() => {
          const finish = questions.filter(q => q.type === "finish the sentence");
          return finish.length ? finish : questions;
        })();
    return [...base].sort(() => Math.random() - 0.5);
  })()).current;

  const [owners, setOwners] = useState<Record<string, string | number>>(() => resumed?.owners ?? {});
  const [roundPoints, setRoundPoints] = useState(() => resumed?.roundPoints ?? Object.fromEntries(teams.map(t => [t.id, 0])));
  const [round, setRound] = useState(() => resumed?.round ?? 1);
  const [turnOrder, setTurnOrder] = useState(() => resumed?.turnOrder ?? teams.map((_, i) => i));
  const [activeTeamIdx, setActiveTeamIdx] = useState(() => resumed?.activeTeamIdx ?? 0);
  const [qi, setQi] = useState(0);

  // A resumed match skips the intro and this round's dice roll — turn order is already known —
  // and drops straight into "pick" for whichever team was up.
  const [phase, setPhase] = useState<"intro" | "rolling" | "pick" | "answer" | "contested" | "round-end" | "final">(() => resumed ? "pick" : "intro");
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => { setPhase("final"); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase]);

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): HillSnapshot => ({ owners, roundPoints, round, turnOrder, activeTeamIdx });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, owners, roundPoints, round, turnOrder, activeTeamIdx]);
  const [chosenZone, setChosenZone] = useState<string | null>(null);
  const [showAns, setShowAns] = useState(false);
  const [contest, setContest] = useState<any>(null);
  const [roundSummary, setRoundSummary] = useState<any[] | null>(null);
  // Solo contest duels don't start their countdown the instant the duel begins — the student
  // has to click "I'm Ready!" first, so they get a moment to see what's happening before the
  // clock starts. Reset to false every time a fresh contest begins (see pickZone).
  const [contestReady, setContestReady] = useState(false);

  const [diceValues, setDiceValues] = useState<(number | null)[]>(() => teams.map(() => null));
  const [rollDone, setRollDone] = useState(false);
  const [finalOrder, setFinalOrder] = useState<any[] | null>(null);

  const runRoundRoll = useCallback((teamIndicesToRoll: number[], existingRolls: Record<number, number>) => {
    const rolls = { ...existingRolls };
    setDiceValues(prev => {
      const next = [...prev];
      teamIndicesToRoll.forEach(i => { next[i] = null; });
      return next;
    });
    setRollDone(false);

    const TICKS = 8;
    let tick = 0;
    const intervals = teamIndicesToRoll.map(teamIdx => {
      return setInterval(() => {
        setDiceValues(prev => {
          const next = [...prev];
          next[teamIdx] = Math.floor(Math.random() * 6) + 1;
          return next;
        });
        tick++;
      }, 80);
    });

    setTimeout(() => {
      intervals.forEach(iv => clearInterval(iv));
      const finalVals: Record<number, number> = {};
      teamIndicesToRoll.forEach(i => {
        finalVals[i] = Math.floor(Math.random() * 6) + 1;
        rolls[i] = finalVals[i];
      });
      setDiceValues(prev => {
        const next = [...prev];
        Object.entries(finalVals).forEach(([i, v]) => { next[Number(i)] = v; });
        return next;
      });

      const valueGroups: Record<number, number[]> = {};
      teamIndicesToRoll.forEach(i => {
        const v = rolls[i];
        if (!valueGroups[v]) valueGroups[v] = [];
        valueGroups[v].push(i);
      });
      const tiedGroups = Object.values(valueGroups).filter(g => g.length > 1);

      if (tiedGroups.length > 0) {
        setTimeout(() => { tiedGroups.forEach(group => runRoundRoll(group, rolls)); }, 900);
      } else {
        const allTeamIndices = teams.map((_, i) => i);
        const allRolls = { ...existingRolls, ...rolls };
        const ordered = [...allTeamIndices].sort((a, b) => (allRolls[b] || 0) - (allRolls[a] || 0));
        setTurnOrder(ordered);
        setFinalOrder(ordered.map(i => ({ teamIdx: i, roll: allRolls[i] })));
        setRollDone(true);
      }
    }, TICKS * 80 + 100);
  }, [teams]);

  useEffect(() => {
    if (phase === "rolling") {
      const allIdx = teams.map((_, i) => i);
      setDiceValues(teams.map(() => null));
      setRollDone(false);
      setFinalOrder(null);
      setTimeout(() => runRoundRoll(allIdx, {}), 300);
    }
  }, [round, phase, runRoundRoll, teams]);

  const activeTeamRealIdx = turnOrder[activeTeamIdx];
  const activeTeam = teams[activeTeamRealIdx];

  const activeZoneId = phase === "contested" ? contest?.zoneId : chosenZone;
  const activeZoneDef = ZONES.find(z => z.id === activeZoneId);
  const baseQ = pool[qi % Math.max(pool.length, 1)];
  const q = isTopicMode && activeZoneDef?.prefix
    ? { ...baseQ, question: activeZoneDef.prefix + (baseQ.question || (baseQ as any).task || "") }
    : baseQ;

  const doRoundPayout = useCallback((ownersOverride?: Record<string, string | number>) => {
    const effectiveOwners = ownersOverride || owners;
    const summary = teams.map(t => {
      const owned = ZONES.filter(z => effectiveOwners[z.id] === t.id);
      const pts = owned.reduce((sum, z) => sum + z.pts, 0);
      return { teamId: t.id, zonesOwned: owned, ptsEarned: pts };
    });
    summary.forEach(s => {
      if (s.ptsEarned > 0) updateScore(s.teamId, s.ptsEarned * 10);
    });
    setRoundPoints(prev => {
      const next = { ...prev };
      summary.forEach(s => { next[s.teamId] = (next[s.teamId] || 0) + s.ptsEarned; });
      return next;
    });
    setRoundSummary(summary);
    setPhase("round-end");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owners, teams, ZONES, cpuScore]);

  const nextTeamTurn = useCallback((_scored: boolean, ownersOverride?: Record<string, string | number>) => {
    const nextIdx = (activeTeamIdx + 1) % teams.length;
    if (nextIdx === 0) {
      doRoundPayout(ownersOverride);
    } else {
      setActiveTeamIdx(nextIdx);
      setPhase("pick");
      setChosenZone(null);
      setShowAns(false);
      setContest(null);
      setQi(i => i + 1);
    }
  }, [activeTeamIdx, teams.length, owners, doRoundPayout]);

  // A team that lets the zone-picking timer run out gets exactly one free retry per game — same
  // team, fresh full-length timer, no turn lost — before a second miss actually costs them the
  // turn. Deliberately does NOT call nextTeamTurn() on a retry (that can also trigger the whole
  // round's payout if it happened to be the last team's turn) — a retry means the team hasn't
  // actually finished their turn yet, they just get to pick again.
  const retryUsedRef = useRef<Set<string | number>>(new Set());
  const [retryTick, setRetryTick] = useState(0);
  const [timeoutNotice, setTimeoutNotice] = useState<{ teamId: string | number; retried: boolean } | null>(null);

  const handlePickTimeout = useCallback(() => {
    const team = teams[activeTeamIdx];
    const alreadyUsed = retryUsedRef.current.has(team.id);
    if (!alreadyUsed) retryUsedRef.current.add(team.id);
    setTimeoutNotice({ teamId: team.id, retried: !alreadyUsed });
  }, [teams, activeTeamIdx]);

  const dismissTimeoutNotice = () => {
    const retried = timeoutNotice?.retried;
    setTimeoutNotice(null);
    if (retried) {
      setChosenZone(null);
      setPhase("pick");
      setRetryTick(t => t + 1);
    } else {
      nextTeamTurn(false, owners);
    }
  };

  const { timeLeft, stop } = useTurnTimer(
    TURN_SECONDS,
    phase === "pick" && !timeoutNotice,
    handlePickTimeout,
    `${activeTeamIdx}-${retryTick}`
  );

  const startNextRound = () => {
    if (round >= TOTAL_ROUNDS) { setPhase("final"); return; }
    setRound(r => r + 1);
    setActiveTeamIdx(0);
    setChosenZone(null);
    setShowAns(false);
    setContest(null);
    setRoundSummary(null);
    setQi(i => i + 1);
    setPhase("rolling");
  };

  const pickZone = (zoneId: string) => {
    if (phase !== "pick") return;
    stop();
    setChosenZone(zoneId);
    const currentOwner = owners[zoneId];
    if (currentOwner !== undefined && currentOwner !== activeTeam.id) {
      setContest({ attackerId: activeTeam.id, defenderId: currentOwner, zoneId, step: "simultaneous" });
      setShowAns(false);
      setContestReady(false);
      setPhase("contested");
    } else {
      setPhase("answer");
    }
  };

  const resolveUncontested = (correct: boolean) => {
    let newOwners = owners;
    if (correct && chosenZone) {
      newOwners = { ...owners, [chosenZone]: activeTeam.id };
      setOwners(newOwners);
    }
    nextTeamTurn(correct, newOwners);
  };

  const resolveContest = (winnerId: string | number | null) => {
    let newOwners = { ...owners };
    let reason;
    if (winnerId === contest.attackerId) {
      newOwners[contest.zoneId] = contest.attackerId;
      updateScore(contest.attackerId, 30);
      reason = "attacker";
    } else if (winnerId === contest.defenderId) {
      updateScore(contest.defenderId, 20);
      reason = "defender";
    } else {
      reason = "neither";
    }
    setOwners(newOwners);
    setContest((c: any) => ({ ...c, step: "result", winner: winnerId, reason }));
  };

  // CPU auto-picks a zone on its own turn: unclaimed if any exist, otherwise attacks a
  // player-owned zone. Reuses pickZone's existing branch logic unchanged — must stay above the
  // intro/final early returns below (Rules of Hooks).
  useEffect(() => {
    if (!isSolo || phase !== "pick" || activeTeam.id !== cpuRef.current?.id) return;
    const cpuId = cpuRef.current!.id;
    const zoneIds = ZONES.map(z => z.id);
    const unclaimed = zoneIds.filter(id => owners[id] === undefined);
    const attackable = zoneIds.filter(id => owners[id] !== undefined && owners[id] !== cpuId);
    const pool = unclaimed.length > 0 ? unclaimed : attackable;
    if (pool.length === 0) return;
    const timer = setTimeout(() => {
      pickZone(pool[Math.floor(Math.random() * pool.length)]);
    }, CPU_THINK_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolo, phase, activeTeam.id, owners]);

  // CPU can't actually answer a real question — auto-resolve its own uncontested zone claim via
  // a tunable random success roll, driving the exact same resolveUncontested path a teacher's
  // Correct/Wrong click would.
  useEffect(() => {
    if (!isSolo || phase !== "answer" || activeTeam.id !== cpuRef.current?.id) return;
    const timer = setTimeout(() => {
      resolveUncontested(Math.random() < CPU_CLAIM_SUCCESS_PROB);
    }, CPU_ANSWER_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolo, phase, activeTeam.id]);

  // Contested (head-to-head) duels against the CPU use a countdown instead of teacher judgment —
  // the one spot the base game already frames as "whoever answers correctly first/better wins,"
  // which doesn't work with a CPU that can't actually answer. The student defends/attacks by
  // clicking "Got it!" before time runs out; letting it expire hands the zone to the CPU.
  const contestIsSoloDuel = isSolo && phase === "contested" && contest?.step === "simultaneous";
  const { timeLeft: contestTimeLeft, stop: stopContestTimer } = useTurnTimer(
    CONTEST_SECONDS,
    contestIsSoloDuel && contestReady,
    () => { if (contest) resolveContest(cpuRef.current!.id); },
    contest?.zoneId ?? "none"
  );

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% -10%,#DB2777 0%,#831843 45%,#1F0A1F 100%)",
  };

  // Tutorial mockup: src/data/tutorials/hill.tsx — update if this intro's rules text changes.
  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      <AmbientBackdrop />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(160deg,#831843,#4C0519)", border: "2px solid #F9A8D455", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "540px", margin: "0 auto 10px", boxShadow: "0 0 50px rgba(219,39,119,0.4)" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>👑</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#F9A8D4" }}>King of the Hill</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7 }}>
            A map of <strong style={{ color: "#F9A8D4" }}>5 zones</strong> is up for grabs — answer to <strong style={{ color: "#F9A8D4" }}>claim one</strong>.{" "}
            {isTopicMode
              ? "Each zone is a different conversation move — claiming zones builds a full class discussion."
              : "Every zone is a quick grammar challenge."}<br />
            Attack a zone someone already owns and it's <strong style={{ color: "#F9A8D4" }}>head-to-head</strong> —{" "}
            {isTopicMode
              ? <>the teacher picks the stronger answer</>
              : <>the fastest correct answer wins</>
            }.<br />
            Score for every zone you own each round — most points after <strong style={{ color: "#F9A8D4" }}>{TOTAL_ROUNDS} rounds</strong> wins!
          </div>
        </div>
        <div style={{ marginTop: "18px", marginBottom: "20px", fontSize: "14px", color: "#F9A8D4", fontWeight: "600" }}>
          The {isTopicMode ? "👑 Opinion" : "👑 Center"} zone scores the most — expect fierce competition for it every round!
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          {teams.map(t => (
            <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#4C0519)`, border: `3px solid ${t.color.bg}`, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: "white" }}>
              {t.color.emoji} {t.name}
            </div>
          ))}
        </div>
        <button onClick={() => setShowHowTo(true)} className="ko-btn" style={{ display: "block", margin: "0 auto 14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
          ❓ How to Play
        </button>
        {showHowTo && (
          <HowToPlayModal
            gameName={GM.name} gameIcon={GM.icon} accentColor={GM.color}
            steps={isTopicMode ? HILL_TOPIC_STEPS : HILL_GRAMMAR_STEPS}
            onClose={() => setShowHowTo(false)}
          />
        )}
        <button onClick={() => setPhase("rolling")} className="ko-btn" style={{ background: "linear-gradient(135deg,#831843,#DB2777)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(219,39,119,0.5)", transition: "transform 0.15s ease" }}>👑 Roll for Turn Order!</button>
      </div>
    </div>
  );

  if (timeoutNotice) {
    const noticeTeam = teams.find(t => t.id === timeoutNotice.teamId)!;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <AmbientBackdrop />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ background: "linear-gradient(160deg,#831843,#4C0519)", border: "2px solid #F9A8D455", borderRadius: "20px", padding: "28px 24px", marginBottom: "20px", color: "white", maxWidth: "480px", margin: "0 auto 20px", boxShadow: "0 0 50px rgba(219,39,119,0.4)" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>⏰</div>
            <div style={{ fontWeight: "900", fontSize: "19px", marginBottom: "10px", color: "#F9A8D4" }}>{noticeTeam.mascot ?? noticeTeam.color.emoji} {noticeTeam.name} ran out of time!</div>
            <div style={{ fontSize: "15px", lineHeight: 1.6, opacity: 0.95 }}>
              {timeoutNotice.retried ? "That's your one free retry for this game — watch the clock this time!" : "You've already used your free retry this game — the turn moves on."}
            </div>
          </div>
          <button onClick={dismissTimeoutNotice} className="ko-btn" style={{ background: "linear-gradient(135deg,#831843,#DB2777)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(219,39,119,0.5)", transition: "transform 0.15s ease" }}>
            {timeoutNotice.retried ? "🔄 Try Again!" : "➡️ Next Team"}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "final") {
    // Dense rank on final score — two teams tied for the throne both wear the crown instead of
    // an arbitrary array-order winner.
    const ranking = denseRank(teams, t => t.score).sort((a, b) => b.value - a.value);
    const winners = ranking.filter(r => r.rank === 0);
    const isTie = winners.length > 1;
    const headline = isTie
      ? `${winners.map(w => w.item.name).join(" & ")} share the crown!`
      : `${winners[0]?.item.name} is King of the Hill!`;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <AmbientBackdrop />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "44px", marginBottom: "6px" }}>👑</div>
          <div style={{ fontWeight: "900", fontSize: "22px", color: "#F9A8D4", marginBottom: "16px" }}>{headline}</div>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "760px" }}>
            {ranking.map(({ item: t, rank, value }) => (
              <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#1F0A1F)`, border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "12px" }}>
                <div style={{ fontSize: "22px" }}>{medalForRank(rank)}</div>
                <div style={{ fontWeight: "800", color: "white", fontSize: "14px", marginTop: "4px" }}>{t.mascot ?? t.color.emoji} {t.name}</div>
                <div style={{ color: "#FCD34D", fontWeight: "900", fontSize: "16px", marginTop: "4px" }}>{value} pts</div>
                <div style={{ fontSize: "11px", color: "#F9A8D4", fontWeight: "700", marginTop: "4px" }}>{roundPoints[t.id] ?? 0} total control pts</div>
              </div>
            ))}
          </div>
          <button onClick={onEnd} className="ko-btn" style={{ background: "linear-gradient(135deg,#831843,#DB2777)", color: "white", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}>🏁 End Game</button>
        </div>
      </div>
    );
  }

  const renderZone = (zId: string) => {
    const z = ZONES.find(z => z.id === zId)!;
    const ownerId = owners[zId];
    const owner = ownerId !== undefined ? teams.find(t => t.id === ownerId) : null;
    const isChosen = chosenZone === zId;
    const isContested = contest?.zoneId === zId;
    const canPick = phase === "pick";
    return (
      <div key={zId} onClick={() => canPick && pickZone(zId)} className="ko-zone" style={{
        position: "relative", overflow: "hidden",
        background: owner ? `linear-gradient(160deg,${owner.color.dark}55,#1F0A1F)` : "rgba(255,255,255,0.06)",
        border: `2.5px solid ${isContested ? "#F87171" : isChosen ? activeTeam.color.bg : owner ? owner.color.bg : "#F9A8D455"}`,
        borderRadius: "14px", padding: "10px 6px", textAlign: "center", cursor: canPick ? "pointer" : "default",
        transform: isChosen || isContested ? "scale(1.06)" : "scale(1)", transition: "all 0.2s",
        animation: isContested ? "koZoneGlow 1.2s ease-in-out infinite" : "none",
      }}>
        <div key={owner?.id ?? "free"} style={{ fontSize: "18px", animation: owner ? "koFlagPlant 0.4s ease-out" : "none" }}>{owner ? (owner.mascot ?? z.icon) : z.icon}</div>
        <div style={{ fontWeight: "900", fontSize: "12px", color: owner ? "white" : "#F9A8D4" }}>{z.label ?? zId}</div>
        <div style={{ fontWeight: "800", fontSize: "11px", color: "#FCD34D" }}>+{z.pts}/rnd</div>
        <div style={{ fontSize: "10px", color: owner ? "#F3E8FF" : "#F9A8D488", marginTop: "2px" }}>
          {/* Zone tiles are small and clip overflow — a long custom team name would otherwise
              get silently cut off mid-character with no ellipsis, so truncate defensively. */}
          {owner ? (owner.name.length > 12 ? owner.name.slice(0, 11) + "…" : owner.name) : "Free"}
        </div>
      </div>
    );
  };

  const attacker = contest ? teams.find(t => t.id === contest.attackerId) : null;
  const defender = contest ? teams.find(t => t.id === contest.defenderId) : null;

  return (
    <div style={arenaStyle}>
      <AmbientBackdrop />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        {phase === "rolling" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontWeight: "900", fontSize: "17px", marginBottom: "16px", color: "white" }}>🎲 Rolling for turn order — Round {round}!</div>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
              {teams.map((t, i) => (
                <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#1F0A1F)`, border: `3px solid ${t.color.bg}`, borderRadius: "16px", padding: "14px 20px", textAlign: "center" }}>
                  <div style={{ fontWeight: "800", fontSize: "13px", color: "white" }}>{t.name}</div>
                  <div style={{ fontSize: "44px", lineHeight: 1, animation: diceValues[i] != null && !rollDone ? "koDiceSpin 0.3s linear infinite" : "none" }}>{diceValues[i] != null ? DICE_FACES[diceValues[i]! - 1] : "🎲"}</div>
                  {rollDone && diceValues[i] != null && (
                    <div style={{ fontWeight: "900", fontSize: "13px", color: "#FCD34D", marginTop: "4px" }}>{diceValues[i]}</div>
                  )}
                </div>
              ))}
            </div>
            {rollDone && finalOrder && (
              <div>
                <div style={{ background: "rgba(255,255,255,0.08)", border: "2px solid #F9A8D4", borderRadius: "12px", padding: "12px 20px", marginBottom: "14px", display: "inline-block" }}>
                  <div style={{ fontWeight: "700", fontSize: "13px", color: "#F9A8D4", marginBottom: "6px" }}>Turn order this round:</div>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                    {finalOrder.map((entry, pos) => {
                      const team = teams[entry.teamIdx];
                      return (
                        <span key={entry.teamIdx} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontWeight: "900", fontSize: "13px", color: "#F9A8D488" }}>{pos + 1}.</span>
                          <span style={{ background: team.color.bg, color: "white", borderRadius: "8px", padding: "3px 10px", fontWeight: "800", fontSize: "13px" }}>{team.name}</span>
                          {pos < finalOrder.length - 1 && <span style={{ color: "#F9A8D488" }}>{"->"}</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <button onClick={() => setPhase("pick")} className="ko-btn" style={{ background: "linear-gradient(135deg,#831843,#DB2777)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}>▶️ Start Round {round}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {phase !== "rolling" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontWeight: "900", fontSize: "15px", color: "white" }}>Round {round}/{TOTAL_ROUNDS}</span>
                <span style={{ fontSize: "12px", color: "#F9A8D4", fontWeight: "600" }}>
                  {ZONES.map(z => `${z.icon} ${z.label ?? z.id}=${z.pts}pts`).join(" · ")}
                </span>
              </div>
              {phase === "pick" && <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS} />}
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px", justifyContent: "center" }}>
              {teams.map(team => {
                const ownedZones = ZONES.filter(zone => owners[zone.id] === team.id);
                const income = ownedZones.reduce((sum, zone) => sum + zone.pts, 0);
                return (
                  <div key={team.id} style={{ background: `linear-gradient(160deg,${team.color.dark}44,#1F0A1F)`, border: `2px solid ${team.color.bg}`, borderRadius: "12px", padding: "8px 12px", fontSize: "12px", color: "white", fontWeight: "700" }}>
                    {team.color.emoji} {team.name}: {income} pts/rnd
                  </div>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", maxWidth: "380px", margin: "0 auto 14px" }}>
              <div />{renderZone("North")}<div />{renderZone("West")}{renderZone("Center")}{renderZone("East")}<div />{renderZone("South")}<div />
            </div>

            {phase !== "round-end" && (
              <div style={{ background: `linear-gradient(90deg,${activeTeam.color.dark},${activeTeam.color.bg})`, borderRadius: "14px", padding: "10px 16px", marginBottom: "12px", boxShadow: `0 4px 18px ${activeTeam.color.bg}55` }}>
                <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>👑 {activeTeam.name}'s turn</span>
              </div>
            )}

            {phase === "answer" && (
              <>
                <QuestionCard question={q} showAnswer={showAns} onReveal={() => { stop(); setShowAns(true); }} gameId="hill" />
                {(showAns || q?.type === "speaking task") && (
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" }}>
                    <button onClick={() => resolveUncontested(true)} className="ko-btn" style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>✅ Correct! Claim!</button>
                    <button onClick={() => resolveUncontested(false)} className="ko-btn" style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>❌ Wrong</button>
                  </div>
                )}
              </>
            )}

            {phase === "contested" && contest?.step === "simultaneous" && (
              <div>
                <div style={{ background: "linear-gradient(90deg,rgba(255,255,255,0) 0%, rgba(248,113,113,0.18) 50%, rgba(255,255,255,0) 100%)", border: "2px solid #FCA5A5", borderRadius: "16px", padding: "14px", marginBottom: "12px", textAlign: "center", animation: "koDuelPulse 1.6s ease-in-out infinite" }}>
                  <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCA5A5" }}>⚔️ Battle for {contest.zoneId}!</div>
                  <div style={{ fontSize: "13px", color: "#F3E8FF", fontWeight: "700", lineHeight: 1.5 }}>
                    {attacker?.name} is attacking a claimed zone. Both teams face the same question, and only one can control it.
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                  <div style={{ background: `linear-gradient(160deg,${attacker?.color.dark}55,#1F0A1F)`, border: `3px solid ${attacker?.color.bg}`, borderRadius: "12px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", marginBottom: "2px" }}>⚔️</div>
                    <div style={{ fontWeight: "900", fontSize: "13px", color: "white" }}>{attacker?.name}</div>
                    <div style={{ fontSize: "11px", color: "#F3E8FF", opacity: 0.8 }}>Attacker</div>
                  </div>
                  <div style={{ background: `linear-gradient(160deg,${defender?.color.dark}55,#1F0A1F)`, border: `3px solid ${defender?.color.bg}`, borderRadius: "12px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", marginBottom: "2px" }}>🛡️</div>
                    <div style={{ fontWeight: "900", fontSize: "13px", color: "white" }}>{defender?.name}</div>
                    <div style={{ fontSize: "11px", color: "#F3E8FF", opacity: 0.8 }}>Defender of {contest.zoneId}</div>
                  </div>
                </div>
                {contestIsSoloDuel && !contestReady ? (
                  <div style={{ textAlign: "center", marginTop: "4px" }}>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: "#F9A8D4", marginBottom: "14px" }}>
                      Take a second to look at the board — the {CONTEST_SECONDS}s clock only starts once you're ready.
                    </div>
                    <button onClick={() => setContestReady(true)} className="ko-btn" style={{ background: "linear-gradient(135deg,#831843,#DB2777)", color: "white", border: "none", borderRadius: "12px", padding: "14px 28px", cursor: "pointer", fontWeight: "800", fontSize: "16px", transition: "transform 0.15s ease" }}>🚦 I'm Ready!</button>
                  </div>
                ) : (
                  <QuestionCard question={q} showAnswer={showAns} onReveal={() => { stop(); if (contestIsSoloDuel) stopContestTimer(); setShowAns(true); }} gameId="hill" />
                )}
                {contestIsSoloDuel ? (
                  contestReady && (
                    <div style={{ textAlign: "center", marginTop: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                        <TurnTimerBar timeLeft={contestTimeLeft} totalSeconds={CONTEST_SECONDS} />
                      </div>
                      <div style={{ fontWeight: "700", fontSize: "13px", color: "#F9A8D4", marginBottom: "10px" }}>
                        Answer correctly before time runs out to {contest.attackerId === propTeams[0].id ? "capture" : "defend"} the zone!
                      </div>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        <button onClick={() => { stopContestTimer(); resolveContest(propTeams[0].id); }} className="ko-btn" style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "12px", padding: "14px 28px", cursor: "pointer", fontWeight: "800", fontSize: "16px", transition: "transform 0.15s ease" }}>✅ Got it!</button>
                        {/* Lets the student concede the instant they know they missed it, instead of
                            being forced to sit out the rest of the countdown for the same CPU-wins
                            outcome a timeout would give anyway. */}
                        <button onClick={() => { stopContestTimer(); resolveContest(cpuRef.current!.id); }} className="ko-btn" style={{ background: "rgba(255,255,255,0.1)", color: "#F9A8D4", border: "1px solid #F9A8D455", borderRadius: "12px", padding: "14px 28px", cursor: "pointer", fontWeight: "800", fontSize: "16px", transition: "transform 0.15s ease" }}>❌ Wrong</button>
                      </div>
                    </div>
                  )
                ) : (
                  <>
                    <div style={{ textAlign: "center", fontWeight: "700", fontSize: "13px", color: "#F9A8D4", marginTop: "10px" }}>
                      {isTopicMode || q?.type === "speaking task"
                        ? "Teacher judges which team gave the better answer."
                        : "Judge which team answered correctly first."}
                    </div>
                    {(showAns || q?.type === "speaking task") && (
                      <div style={{ marginTop: "14px" }}>
                        <div style={{ textAlign: "center", fontWeight: "700", fontSize: "13px", color: "#F9A8D4", marginBottom: "10px" }}>
                          {isTopicMode || q?.type === "speaking task"
                            ? "Teacher judges - whose answer was better?"
                            : "Who answered correctly first?"}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
                          <button onClick={() => resolveContest(contest.attackerId)} className="ko-btn" style={{ background: attacker?.color.bg, color: "white", border: "none", borderRadius: "12px", padding: "14px 10px", cursor: "pointer", fontWeight: "800", transition: "transform 0.15s ease" }}>⚔️ {attacker?.name}</button>
                          <button onClick={() => resolveContest(contest.defenderId)} className="ko-btn" style={{ background: defender?.color.bg, color: "white", border: "none", borderRadius: "12px", padding: "14px 10px", cursor: "pointer", fontWeight: "800", transition: "transform 0.15s ease" }}>🛡️ {defender?.name}</button>
                        </div>
                        <button onClick={() => resolveContest(null)} className="ko-btn" style={{ marginTop: "10px", background: "rgba(255,255,255,0.1)", color: "#F9A8D4", cursor: "pointer", border: "1px solid #F9A8D455", padding: "8px 16px", borderRadius: "10px", transition: "transform 0.15s ease" }}>🤝 Neither</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {phase === "contested" && contest?.step === "result" && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  background: contest.winner ? `linear-gradient(160deg,${teams.find(t => t.id === contest.winner)?.color.dark}55,#1F0A1F)` : "rgba(255,255,255,0.06)",
                  border: `3px solid ${contest.winner ? teams.find(t => t.id === contest.winner)?.color.bg : "#F9A8D455"}`,
                  borderRadius: "14px", padding: "16px", marginBottom: "14px",
                }}>
                  <div style={{ fontSize: "34px", animation: "koCrownPop 0.5s ease-out" }}>{contest.reason === "neither" ? "🤝" : "👑"}</div>
                  {contest.reason === "attacker" && <div style={{ fontWeight: "900", fontSize: "16px", color: "white" }}>{attacker?.name} captured {contest.zoneId}! +30 pts</div>}
                  {contest.reason === "defender" && <div style={{ fontWeight: "900", fontSize: "16px", color: "white" }}>{defender?.name} defended {contest.zoneId}! +20 bonus pts</div>}
                  {contest.reason === "neither" && <div style={{ fontWeight: "900", fontSize: "16px", color: "white" }}>Neither wins — {contest.zoneId} stays with {defender?.name}!</div>}
                </div>
                <button onClick={() => nextTeamTurn(false, owners)} className="ko-btn" style={{ background: "linear-gradient(135deg,#831843,#DB2777)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", cursor: "pointer", fontWeight: "800", transition: "transform 0.15s ease" }}>➡️ Next Turn</button>
              </div>
            )}

            {phase === "round-end" && roundSummary && (
              <div style={{ textAlign: "center" }}>
                <div style={{ background: "linear-gradient(160deg,#78350F,#451A03)", border: "2px solid #FCD34D66", borderRadius: "16px", padding: "16px", marginBottom: "14px" }}>
                  <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D", animation: "koCoinShine 2s ease-in-out infinite" }}>💰 End of Round {round}</div>
                </div>
                <div style={{ display: "grid", gap: "10px", marginBottom: "16px" }}>
                  {roundSummary.map(summary => {
                    const team = teams.find(t => t.id === summary.teamId);
                    if (!team) return null;
                    const totalRoundControl = roundPoints[summary.teamId] ?? 0;
                    return (
                      <div key={summary.teamId} style={{ background: `linear-gradient(160deg,${team.color.dark}44,#1F0A1F)`, border: `3px solid ${team.color.bg}`, borderRadius: "16px", padding: "12px 16px", textAlign: "left" }}>
                        <div style={{ fontWeight: "900", fontSize: "16px", color: "white", marginBottom: "6px" }}>
                          {team.color.emoji} {team.name}
                        </div>
                        <div style={{ fontSize: "13px", color: "#F3E8FF", marginBottom: "4px" }}>
                          Zones: {summary.zonesOwned.length > 0 ? summary.zonesOwned.map((zone: ZoneDef) => `${zone.icon} ${zone.label ?? zone.id}`).join(", ") : "None"}
                        </div>
                        <div style={{ fontWeight: "800", color: "#FCD34D" }}>
                          +{summary.ptsEarned * 10} score this round ({summary.ptsEarned} control pts)
                        </div>
                        <div style={{ fontSize: "12px", color: "#F9A8D4", marginTop: "4px" }}>
                          Total control points earned so far: {totalRoundControl}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={startNextRound} className="ko-btn" style={{ background: "linear-gradient(135deg,#831843,#DB2777)", color: "white", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}>{round >= TOTAL_ROUNDS ? "🏆 See Final Results" : `▶️ Start Round ${round + 1}`}</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
