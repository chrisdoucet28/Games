import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { GameProps } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { QuestionCard } from "../shared/QuestionCard";
import { teamsGridCols, GAME_MODES } from "../../data/constants";
import { denseRank, medalForRank } from "../../utils/ranking";
import { makeSoloCpuTeam } from "../../lib/soloOpponent";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { CASTLE_TUTORIAL_STEPS } from "../../data/tutorials/castle";

const GM = GAME_MODES.find(g => g.id === "castle")!;

// How long the CPU "thinks" before picking an action, and before its action resolves —
// standing in for the fact it can't actually answer a real question.
const CPU_THINK_MS = 900;
const CPU_ANSWER_MS = 900;
const CPU_SUCCESS_CHANCE = 0.75;

// Levels are uncapped: each level needs more XP than the last (gap grows by XP_STEP per level),
// and damage multiplier keeps climbing forever — there is no "max level".
const XP_BASE = 100;
const XP_STEP = 50;
const MULT_PER_LEVEL = 0.5;
const LEVEL_COLORS = ["#6B7280", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444", "#EC4899", "#10B981", "#F97316"];

function xpThreshold(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 1; l < level; l++) total += XP_BASE + XP_STEP * (l - 1);
  return total;
}

function levelForXp(xp: number): number {
  let level = 1;
  while (xpThreshold(level + 1) <= xp) level++;
  return level;
}

function levelInfoFor(level: number) {
  return {
    level,
    label: `Lvl ${level}`,
    xpNeeded: xpThreshold(level),
    nextXp: xpThreshold(level + 1),
    mult: 1 + MULT_PER_LEVEL * (level - 1),
    color: LEVEL_COLORS[(level - 1) % LEVEL_COLORS.length],
  };
}
const BASE_DAMAGE = 5;
const XP_PER_ROLL = 15;
const APPLE_CHANCE = 0.12;
const APPLE_HEAL = 20;
const MAX_HP = 150;

const MAX_MP = 100;
const START_MP = 20;
const MP_REGEN_PER_TURN = 8;
const MAGIC_MP_COST = 50;
const FOCUS_MP_REWARD = 30;
const MAGIC_DMG_MULT = 1.75;
const SHIELD_REDUCTION = 0.5;
const SHIELD_DURATION_TURNS = 3;
const DEFEND_SCORE = 20;

type ActionId = "sword" | "magic" | "defend" | "focus";

type ActionDef = { id: ActionId; type: string; label: string; emoji: string; character: string; color: string; glow: string; verb: string; cost?: number };

const ACTION_DEFS: ActionDef[] = [
  { id: "sword",  type: "choose correct grammar",   label: "Sword Attack", emoji: "🗡️", character: "🤺", color: "#DC2626", glow: "#F87171", verb: "attack" },
  { id: "magic",  type: "speaking task",             label: "Magic Attack", emoji: "✨", character: "🧙", color: "#7C3AED", glow: "#C4B5FD", verb: "cast magic", cost: MAGIC_MP_COST },
  { id: "defend", type: "correct grammar mistakes",  label: "Defend",       emoji: "🛡️", character: "💂", color: "#0891B2", glow: "#67E8F9", verb: "defend" },
  { id: "focus",  type: "fill in the blank",         label: "Focus",        emoji: "🔮", character: "🧘", color: "#D97706", glow: "#FCD34D", verb: "focus" },
];

type TeamRpg = { hp: number; xp: number; level: number; mp: number; maxMp: number; shieldTurnsLeft: number; shieldFresh: boolean };
type Phase = "intro" | "select-action" | "answer" | "pick-target" | "rolling" | "result" | "gameover";
type EliminationBanner = { teamName: string; color: string; key: number };
type LastEvent = {
  action: ActionId;
  targetId?: string | number;
  damage?: number;
  roll?: number;
  xpGained?: number;
  apple?: boolean;
  leveledUp?: boolean;
  shieldConsumed?: boolean;
  mpGained?: number;
};
type ImpactKind = "hit" | "heal" | "shield" | "focus";
type Impact = { id: number; teamId: string | number; kind: ImpactKind; character?: string };
type FloatText = { id: number; teamId: string | number; text: string; color: string };

// What "Save & Exit" snapshots and "Resume" restores — the RPG stats board plus whose turn it is
// and who's already been knocked out. Deliberately excludes the in-flight action/question choice:
// resuming drops the active team straight into a fresh "choose your action" screen rather than
// replaying whatever question happened to be on screen.
type CastleSnapshot = {
  rpg: Record<string | number, TeamRpg>;
  activeTeamIdx: number;
  eliminationOrder: (string | number)[];
};

function validateCastleSnapshot(raw: unknown, teamCount: number): CastleSnapshot | undefined {
  const s = raw as Partial<CastleSnapshot> | null | undefined;
  if (!s || typeof s.rpg !== "object" || s.rpg === null) return undefined;
  if (typeof s.activeTeamIdx !== "number" || s.activeTeamIdx < 0 || s.activeTeamIdx >= teamCount) return undefined;
  return { rpg: s.rpg, activeTeamIdx: s.activeTeamIdx, eliminationOrder: s.eliminationOrder ?? [] };
}

const AMBIENT_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 2 + (i % 3),
  delay: (i % 7) * 0.4,
  dur: 2.4 + (i % 5) * 0.5,
}));

function StatBar({ value, max, color, label, icon }: { value: number, max: number, color: string, label: string, icon: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ marginBottom: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#D1D5DB" }}>{icon} {label}</span>
        <span style={{ fontSize: "11px", fontWeight: "800", color: "#F3F4F6" }}>{Math.round(value)}/{Math.round(max)}</span>
      </div>
      <div style={{ height: "9px", background: "rgba(255,255,255,0.12)", borderRadius: "5px", overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "5px", transition: "width 0.5s ease", boxShadow: `0 0 6px ${color}AA` }} />
      </div>
    </div>
  );
}

function CastleVisual({ hpPct, teamColor, dead, shielded }: { hpPct: number; teamColor: string; dead: boolean; shielded: boolean }) {
  const tier: "full" | "damaged" | "critical" | "destroyed" = dead ? "destroyed" : hpPct > 60 ? "full" : hpPct > 25 ? "damaged" : "critical";
  const stone = tier === "destroyed" ? "#4B5563" : tier === "critical" ? "#8D8579" : tier === "damaged" ? "#A9A9B4" : "#E2E4EA";
  const stoneDark = tier === "destroyed" ? "#374151" : tier === "critical" ? "#615A50" : tier === "damaged" ? "#6E7180" : "#9AA0AE";
  const windowColor = tier === "destroyed" ? "none" : tier === "critical" ? "#F87171" : tier === "damaged" ? "#FBBF24" : "#FDE68A";

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "150px", margin: "0 auto 4px" }}>
      <svg viewBox="0 0 120 90" style={{ width: "100%", display: "block" }}>
        {tier === "critical" && (
          <ellipse cx="60" cy="35" rx="45" ry="28" fill="#F97316" opacity="0.22">
            <animate attributeName="opacity" values="0.12;0.32;0.12" dur="1.2s" repeatCount="indefinite" />
          </ellipse>
        )}
        {shielded && !dead && (
          <ellipse cx="60" cy="50" rx="53" ry="38" fill="none" stroke="#22D3EE" strokeWidth="2.5" opacity="0.7">
            <animate attributeName="opacity" values="0.35;0.85;0.35" dur="1.4s" repeatCount="indefinite" />
          </ellipse>
        )}
        <ellipse cx="60" cy="83" rx="48" ry="5" fill="#00000030" />

        {tier !== "destroyed" ? (
          <g>
            <rect x="14" y="42" width="20" height="38" fill={stone} />
            <polygon points="14,42 24,30 34,42" fill={stoneDark} />
            <rect x="86" y="42" width="20" height="38" fill={stone} />
            <polygon points="86,42 96,30 106,42" fill={stoneDark} />
            <rect x="38" y="26" width="44" height="54" fill={stone} />
            {[0, 1, 2, 3, 4].map(i => <rect key={i} x={38 + i * 9} y="20" width="6" height="8" fill={stone} />)}
            <path d="M52,80 L52,64 A8,8 0 0,1 68,64 L68,80 Z" fill="#2C1D14" />
            {windowColor !== "none" && (
              <>
                <rect x="46" y="38" width="7" height="9" fill={windowColor} opacity="0.95" />
                <rect x="67" y="38" width="7" height="9" fill={windowColor} opacity="0.95" />
                <rect x="20" y="52" width="6" height="8" fill={windowColor} opacity="0.8" />
                <rect x="92" y="52" width="6" height="8" fill={windowColor} opacity="0.8" />
              </>
            )}
            <line x1="60" y1="20" x2="60" y2="6" stroke={stoneDark} strokeWidth="1.5" />
            <polygon points="60,6 76,10 60,14" fill={teamColor} style={{ transformOrigin: "60px 10px", animation: "flagWave 1.6s ease-in-out infinite" }} />
            {(tier === "damaged" || tier === "critical") && (
              <path d="M45,30 L52,45 L47,58" stroke="#00000055" strokeWidth="1.5" fill="none" />
            )}
            {tier === "critical" && (
              <>
                <path d="M75,26 L70,40 L78,55" stroke="#00000066" strokeWidth="1.5" fill="none" />
                <circle cx="45" cy="22" r="4" fill="#6B7280" opacity="0.55" style={{ animation: "smokeRise 2.4s ease-out infinite" }} />
                <circle cx="75" cy="20" r="5" fill="#4B5563" opacity="0.55" style={{ animation: "smokeRise 2.8s ease-out infinite 0.6s" }} />
              </>
            )}
          </g>
        ) : (
          <g>
            <polygon points="20,80 30,55 45,80" fill={stone} />
            <polygon points="55,80 66,50 85,80" fill={stoneDark} />
            <polygon points="80,80 92,60 106,80" fill={stone} />
            <rect x="47" y="68" width="11" height="11" fill={stoneDark} transform="rotate(14 52 73)" />
            <text x="60" y="48" textAnchor="middle" fontSize="20">💀</text>
          </g>
        )}
      </svg>
    </div>
  );
}

function DiceRoller({ rolling, result }: { rolling: boolean, result: number | null }) {
  const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  return (
    <div style={{ textAlign: "center", padding: "14px 0", position: "relative" }}>
      {result && !rolling && (
        <div style={{ position: "absolute", left: "50%", top: "50%", width: "90px", height: "90px", transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle,#FCD34D66,transparent 70%)", animation: "diceGlow 0.8s ease-out" }} />
      )}
      <div style={{ fontSize: "72px", display: "inline-block", position: "relative", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))", animation: rolling ? "spin 0.15s linear infinite" : "none", transition: "font-size 0.2s" }}>
        {result ? faces[result - 1] : "🎲"}
      </div>
      {result && !rolling && (
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FDE68A", textShadow: "0 2px 6px rgba(0,0,0,0.6)", marginTop: "4px" }}>Rolled a {result}!</div>
      )}
    </div>
  );
}

export function CastleGame({ questions, teams: propTeams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState }: GameProps) {
  const TURN_SECONDS = 25;

  // Solo play makes the CPU a real second castle — a genuine alternating-turn participant that
  // attacks back on its own turn, not a passive target. This reuses the existing 2-team fast
  // path (skip target-picking) unchanged, since `teams` is now genuinely length 2.
  const isSolo = propTeams.length === 1;
  const cpuRef = useRef(isSolo ? makeSoloCpuTeam() : null);
  const [cpuScore, setCpuScore] = useState(0);
  // Memoized so `teams` is referentially stable across renders when nothing has actually
  // changed — effects/callbacks in this file depend on `teams` by reference, and a fresh array
  // literal every render would make them re-fire (and re-setState) forever.
  const teams = useMemo(
    () => (isSolo ? [propTeams[0], { ...cpuRef.current!, score: cpuScore }] : propTeams),
    [isSolo, propTeams, cpuScore]
  );
  const updateScore = (id: string | number, delta: number) => {
    if (isSolo && id === cpuRef.current?.id) { setCpuScore(s => s + delta); }
    else { onUpdateScore(id, delta); }
  };

  const resumed = useRef(validateCastleSnapshot(initialGameState, teams.length)).current;

  const [rpg, setRpg] = useState<Record<string | number, TeamRpg>>(() => resumed?.rpg ?? Object.fromEntries(
    teams.map(t => [t.id, { hp: MAX_HP, xp: 0, level: 1, mp: START_MP, maxMp: MAX_MP, shieldTurnsLeft: 0, shieldFresh: false }])
  ));
  const [activeTeamIdx, setActiveTeamIdx] = useState(() => resumed?.activeTeamIdx ?? 0);
  const [selectedAction, setSelectedAction] = useState<ActionId | null>(null);
  const [showAns, setShowAns] = useState(false);
  // A resumed battle skips the intro screen and drops straight into a fresh action choice for
  // whichever team was up.
  const [phase, setPhase] = useState<Phase>(() => resumed ? "select-action" : "intro");
  const [showHowTo, setShowHowTo] = useState(false);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [lastEvent, setLastEvent] = useState<LastEvent | null>(null);
  const [typeIdx, setTypeIdx] = useState<Record<string, number>>(() => Object.fromEntries(ACTION_DEFS.map(a => [a.type, 0])));
  const [impacts, setImpacts] = useState<Impact[]>([]);
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);
  const [elimBanner, setElimBanner] = useState<EliminationBanner | null>(null);
  const fxId = useRef(0);
  const eliminationOrderRef = useRef<(string | number)[]>(resumed?.eliminationOrder ?? []);
  // Whether the gameover screen was reached by a genuine full elimination (one castle left) or
  // by the top-bar End Game button cutting the battle short with several castles still standing —
  // the two cases need different framing, since "last castle standing" only makes sense for the
  // first one.
  const [interrupted, setInterrupted] = useState(false);

  const spawnImpact = (teamId: string | number, kind: ImpactKind, character?: string, duration = 650) => {
    const id = fxId.current++;
    setImpacts(prev => [...prev, { id, teamId, kind, character }]);
    setTimeout(() => setImpacts(prev => prev.filter(i => i.id !== id)), duration);
  };
  const spawnFloat = (teamId: string | number, text: string, color: string) => {
    const id = fxId.current++;
    setFloatTexts(prev => [...prev, { id, teamId, text, color }]);
    setTimeout(() => setFloatTexts(prev => prev.filter(f => f.id !== id)), 1300);
  };
  const showElimination = (teamName: string, color: string) => {
    const id = fxId.current++;
    setElimBanner({ teamName, color, key: id });
    setTimeout(() => setElimBanner(prev => (prev?.key === id ? null : prev)), 3200);
  };

  const qByType = useRef<Record<string, any[]> | null>(null);
  if (!qByType.current) {
    const map: Record<string, any[]> = {};
    ACTION_DEFS.forEach(a => { if (!map[a.type]) map[a.type] = []; });
    questions.forEach(q => {
      const t = q.type || "unknown";
      if (map[t] !== undefined) map[t].push(q);
      if (t === "speaking task" || (q as any).task) {
        map["speaking task"].push({
          ...q, type: "speaking task", question: (q as any).task || q.question, answer: "Open — teacher judges", hint: undefined
        });
      }
    });
    Object.keys(map).forEach(t => {
      if (map[t].length === 0) map[t] = questions.map(q => ({ ...q, type: t }));
      map[t] = [...map[t]].sort(() => Math.random() - 0.5);
    });
    qByType.current = map;
  }

  const activeTeam = teams[activeTeamIdx];
  const actionDef = selectedAction ? ACTION_DEFS.find(a => a.id === selectedAction) ?? null : null;
  const pool = actionDef ? (qByType.current?.[actionDef.type] ?? []) : [];
  const q = pool.length && actionDef ? pool[(typeIdx[actionDef.type] ?? 0) % pool.length] : null;

  const getLevelInfo = (xp: number) => levelInfoFor(levelForXp(xp));
  const getNextLevelInfo = (xp: number) => levelInfoFor(levelForXp(xp) + 1);

  const isEliminated = (teamId: string | number) => rpg[teamId]?.hp <= 0;

  useEffect(() => {
    if (!forceFinalRef) return;
    if (phase === "gameover") { forceFinalRef.current = null; return; }
    forceFinalRef.current = () => {
      // Always show Castle Defense's own end screen, same as every other game — "last castle
      // standing" narrative if the battle actually finished, otherwise a ranked-by-HP-remaining
      // summary if the top-bar button cut it short with several castles still standing.
      const survivors = teams.filter(t => !isEliminated(t.id));
      setInterrupted(survivors.length !== 1);
      setPhase("gameover");
      return true;
    };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceFinalRef, phase, teams, rpg]);

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): CastleSnapshot => ({
      rpg, activeTeamIdx, eliminationOrder: eliminationOrderRef.current,
    });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, rpg, activeTeamIdx]);

  const advanceTurn = useCallback(() => {
    setRpg(prev => {
      const next = { ...prev };
      teams.forEach(t => {
        if (next[t.id].hp <= 0) return;
        // A freshly-raised shield skips its first tick so "3 turns" means 3 turns of
        // actual protection, not 2 — otherwise it decrements the instant you hand off
        // the turn, before any opponent has had a chance to attack.
        const skipTick = next[t.id].shieldFresh;
        next[t.id] = {
          ...next[t.id],
          mp: Math.min(next[t.id].maxMp, next[t.id].mp + MP_REGEN_PER_TURN),
          shieldTurnsLeft: skipTick ? next[t.id].shieldTurnsLeft : Math.max(0, next[t.id].shieldTurnsLeft - 1),
          shieldFresh: false,
        };
      });
      return next;
    });
    setPhase("select-action"); setSelectedAction(null); setShowAns(false); setDiceRoll(null); setLastEvent(null);
    let next = (activeTeamIdx + 1) % teams.length;
    let tries = 0;
    while (isEliminated(teams[next].id) && tries < teams.length) { next = (next + 1) % teams.length; tries++; }
    setActiveTeamIdx(next);
  }, [activeTeamIdx, teams, rpg]);

  // A team that lets the pick-target/select-action timer run out gets exactly one free retry per
  // game — same team, fresh full-length timer, no turn lost — before a second miss actually costs
  // them the turn. Deliberately does NOT call advanceTurn() on a retry (that also applies this
  // turn's MP regen/shield tick to every team) — a retry means the team hasn't actually finished
  // their turn yet, they just get to decide again.
  const retryUsedRef = useRef<Set<string | number>>(new Set());
  const [retryTick, setRetryTick] = useState(0);
  const [timeoutNotice, setTimeoutNotice] = useState<{ teamId: string | number; retried: boolean } | null>(null);

  const handleDecisionTimeout = useCallback(() => {
    const team = teams[activeTeamIdx];
    const alreadyUsed = retryUsedRef.current.has(team.id);
    if (!alreadyUsed) retryUsedRef.current.add(team.id);
    setTimeoutNotice({ teamId: team.id, retried: !alreadyUsed });
  }, [teams, activeTeamIdx]);

  const dismissTimeoutNotice = () => {
    const retried = timeoutNotice?.retried;
    setTimeoutNotice(null);
    if (retried) {
      setSelectedAction(null);
      setPhase("select-action");
      setRetryTick(t => t + 1);
    } else {
      advanceTurn();
    }
  };

  const { timeLeft } = useTurnTimer(
    TURN_SECONDS,
    (phase === "pick-target" || phase === "select-action") && !timeoutNotice,
    handleDecisionTimeout,
    `${activeTeamIdx}-${retryTick}`
  );

  // CPU's own turn: picks an action after a short "thinking" delay, weighted toward attacking
  // and skipping magic if it can't afford the MP — reuses the exact same pickAction path a
  // human's click would take. Must stay above the intro/gameover early returns below (Rules of
  // Hooks — a hook can't be skipped on some renders and not others).
  useEffect(() => {
    if (!isSolo || phase !== "select-action" || activeTeam.id !== cpuRef.current?.id) return;
    const timer = setTimeout(() => {
      const mp = rpg[activeTeam.id]?.mp ?? 0;
      const weights: Record<ActionId, number> = { sword: 45, magic: 20, defend: 20, focus: 15 };
      const pool = ACTION_DEFS.filter(a => !a.cost || mp >= a.cost).flatMap(a => Array(weights[a.id]).fill(a.id));
      pickAction(pool[Math.floor(Math.random() * pool.length)] as ActionId);
    }, CPU_THINK_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolo, phase, activeTeam.id]);

  // Once the CPU has "picked" an action, resolve it via a tunable random success roll instead
  // of showing it a real question — drives the exact same handleCorrect/handleWrong path a
  // teacher's judgment would.
  useEffect(() => {
    if (!isSolo || phase !== "answer" || activeTeam.id !== cpuRef.current?.id) return;
    const timer = setTimeout(() => {
      if (Math.random() < CPU_SUCCESS_CHANCE) handleCorrect(); else handleWrong();
    }, CPU_ANSWER_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolo, phase, activeTeam.id]);

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(circle at 30% 0%, #1E3A2F 0%, #0B0B1F 55%, #050510 100%)",
  };

  const ambientLayer = (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {AMBIENT_PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: `${p.left}%`, top: `${p.top}%`, width: `${p.size}px`, height: `${p.size}px`,
          borderRadius: "50%", background: "#FDE68A", opacity: 0.5,
          animation: `twinkle ${p.dur}s ease-in-out infinite ${p.delay}s`,
        }} />
      ))}
    </div>
  );

  const styleTag = (
    <style>{`
      @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      @keyframes diceGlow{0%{opacity:0;transform:translate(-50%,-50%) scale(0.6)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.3)}}
      @keyframes flagWave{0%,100%{transform:scaleX(1) skewY(0deg)}50%{transform:scaleX(0.85) skewY(-6deg)}}
      @keyframes smokeRise{0%{transform:translateY(0) scale(1);opacity:0.5}100%{transform:translateY(-18px) scale(1.7);opacity:0}}
      @keyframes twinkle{0%,100%{opacity:0.12;transform:scale(0.8)}50%{opacity:0.75;transform:scale(1.3)}}
      @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
      @keyframes impactFlash{0%{opacity:0.9}100%{opacity:0}}
      @keyframes floatUp{0%{opacity:0;transform:translate(-50%,0) scale(0.8)}15%{opacity:1;transform:translate(-50%,-6px) scale(1.15)}100%{opacity:0;transform:translate(-50%,-48px) scale(1)}}
      @keyframes burstOut{0%{opacity:1;transform:translate(-50%,-50%) rotate(var(--a)) translateY(0) scale(0.6)}100%{opacity:0;transform:translate(-50%,-50%) rotate(var(--a)) translateY(-34px) scale(1.1)}}
      @keyframes celebrate{0%{transform:scale(0.7);opacity:0}30%{transform:scale(1.12);opacity:1}60%{transform:scale(0.98)}100%{transform:scale(1);opacity:1}}
      @keyframes characterStrike{0%{opacity:0;transform:translate(-50%,-50%) scale(0.4) rotate(-15deg)}35%{opacity:1;transform:translate(-50%,-50%) scale(1.3) rotate(8deg)}60%{opacity:1;transform:translate(-50%,-50%) scale(1.05) rotate(-4deg)}100%{opacity:0;transform:translate(-50%,-50%) scale(0.9) rotate(0deg)}}
      @keyframes attackerWindup{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-6px) rotate(4deg)}}
      @keyframes castleBannerIn{0%{opacity:0;transform:translate(-50%,-16px) scale(0.9)}15%{opacity:1;transform:translate(-50%,0) scale(1.03)}25%{transform:translate(-50%,0) scale(1)}85%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-10px) scale(0.96)}}
      .castle-action-btn:hover:not(:disabled){transform:translateY(-3px) scale(1.03);filter:brightness(1.15)}
      .castle-action-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
      .castle-target-btn:hover{transform:translateY(-2px) scale(1.03);filter:brightness(1.1)}
      .castle-next-btn:hover{transform:scale(1.04);filter:brightness(1.1)}
    `}</style>
  );

  // Tutorial mockup: src/data/tutorials/castle.tsx — update if this intro's rules text changes.
  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      {ambientLayer}
      {styleTag}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(135deg,#064E3B,#059669)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", position: "relative", color: "white", maxWidth: "520px", margin: "0 auto 10px", boxShadow: "0 0 40px #05966955" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏰</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>Castle Defense</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
            Each turn, choose to attack, cast a spell, raise a shield, or recover — then answer a question to pull it off. Get it right and it lands; get it wrong and your turn ends with nothing.<br />
            Land a hit and you might turn up a <strong>🍎 healing apple</strong> for bonus HP! The last castle standing wins!
          </div>
        </div>
        <button onClick={() => setShowHowTo(true)} className="castle-next-btn" style={{ display: "block", margin: "0 auto 14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
          ❓ How to Play
        </button>
        {showHowTo && (
          <HowToPlayModal
            gameName={GM.name} gameIcon={GM.icon} accentColor={GM.color}
            steps={CASTLE_TUTORIAL_STEPS}
            onClose={() => setShowHowTo(false)}
          />
        )}
        <button onClick={() => setPhase("select-action")} className="castle-next-btn" style={{ background: "linear-gradient(135deg,#064E3B,#059669)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(5,150,105,0.5)", transition: "transform 0.15s ease" }}>🏰 Prepare for Battle!</button>
      </div>
    </div>
  );

  if (phase === "gameover") {
    if (interrupted) {
      // The battle was cut short with several castles still standing (the top-bar End Game
      // button, usually because the class ran out of time) — there's no fair "last castle
      // standing" to declare, so rank everyone by remaining HP instead.
      const ranking = denseRank(teams, t => Math.round(rpg[t.id]?.hp ?? 0)).sort((a, b) => b.value - a.value);
      return (
        <div style={{ ...arenaStyle, textAlign: "center" }}>
          {ambientLayer}
          {styleTag}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "48px", marginBottom: "6px" }}>🏰</div>
            <div style={{ fontWeight: "900", fontSize: "24px", color: "#6EE7B7", marginBottom: "4px", textShadow: "0 0 24px rgba(16,185,129,0.6)" }}>
              Battle cut short — final standings
            </div>
            <div style={{ color: "#94A3B8", fontSize: "14px", marginBottom: "20px" }}>Ranked by how much HP each castle has left.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "420px", margin: "0 auto 24px" }}>
              {ranking.map(({ item: t, rank, value }) => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: rank === 0 ? `linear-gradient(160deg,${t.color.dark}66,#0B0B1F)` : "linear-gradient(160deg,#1F2937,#0B0F17)",
                  border: `2px solid ${rank === 0 ? t.color.bg : "#4B5563"}`, borderRadius: "14px", padding: rank === 0 ? "12px 16px" : "10px 16px",
                  opacity: rank === 0 ? 1 : 0.85,
                }}>
                  <span style={{ fontSize: rank === 0 ? "24px" : "20px" }}>{medalForRank(rank)}</span>
                  <span style={{ flex: 1, textAlign: "left", fontWeight: rank === 0 ? "900" : "800", color: rank === 0 ? "white" : "#D1D5DB", fontSize: rank === 0 ? "16px" : "15px" }}>{t.mascot ?? t.color.emoji} {t.name}</span>
                  <span style={{ fontWeight: "800", color: rank === 0 ? "#6EE7B7" : "#6B7280", fontSize: "13px" }}>{value}/{MAX_HP} HP left</span>
                </div>
              ))}
            </div>
            <button onClick={onEnd} className="castle-next-btn" style={{ background: "linear-gradient(135deg,#064E3B,#059669)", color: "white", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(5,150,105,0.5)", transition: "transform 0.15s ease" }}>🏁 End Game</button>
          </div>
        </div>
      );
    }
    // The winner is whichever castle was never knocked out — not whoever currently has the most
    // accumulated score, which may belong to a team that dominated an earlier game entirely.
    const winnerTeam = teams.find(t => !eliminationOrderRef.current.includes(t.id))!;
    const rankedLosers = [...eliminationOrderRef.current].reverse().map(id => teams.find(t => t.id === id)!);
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        {ambientLayer}
        {styleTag}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "48px", marginBottom: "6px" }}>🏆</div>
          <div style={{ fontWeight: "900", fontSize: "24px", color: "#6EE7B7", marginBottom: "4px", textShadow: "0 0 24px rgba(16,185,129,0.6)" }}>
            🏰 {winnerTeam.name}'s castle stood strong — they win the battle!
          </div>
          <div style={{ color: "#94A3B8", fontSize: "14px", marginBottom: "20px" }}>Last castle standing — every other castle fell.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "420px", margin: "0 auto 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: `linear-gradient(160deg,${winnerTeam.color.dark}66,#0B0B1F)`, border: `2px solid ${winnerTeam.color.bg}`, borderRadius: "14px", padding: "12px 16px" }}>
              <span style={{ fontSize: "24px" }}>🥇</span>
              <span style={{ flex: 1, textAlign: "left", fontWeight: "900", color: "white", fontSize: "16px" }}>{winnerTeam.mascot ?? winnerTeam.color.emoji} {winnerTeam.name}</span>
              <span style={{ fontWeight: "800", color: "#6EE7B7", fontSize: "13px" }}>STOOD STRONG</span>
            </div>
            {rankedLosers.map((t, i) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "linear-gradient(160deg,#1F2937,#0B0F17)", border: "2px solid #4B5563", borderRadius: "14px", padding: "10px 16px", opacity: 0.85 }}>
                <span style={{ fontSize: "20px" }}>{i === 0 ? "💀" : "🏚️"}</span>
                <span style={{ flex: 1, textAlign: "left", fontWeight: "800", color: "#D1D5DB", fontSize: "15px" }}>{t.mascot ?? t.color.emoji} {t.name}</span>
                <span style={{ fontWeight: "700", color: "#6B7280", fontSize: "12px" }}>FELL</span>
              </div>
            ))}
          </div>
          <button onClick={onEnd} className="castle-next-btn" style={{ background: "linear-gradient(135deg,#064E3B,#059669)", color: "white", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(5,150,105,0.5)", transition: "transform 0.15s ease" }}>🏁 End Game</button>
        </div>
      </div>
    );
  }

  if (timeoutNotice) {
    const noticeTeam = teams.find(t => t.id === timeoutNotice.teamId)!;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        {ambientLayer}
        {styleTag}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ background: "linear-gradient(135deg,#064E3B,#059669)", borderRadius: "20px", padding: "28px 24px", marginBottom: "20px", color: "white", maxWidth: "480px", margin: "0 auto 20px", boxShadow: "0 0 40px #05966955" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>⏰</div>
            <div style={{ fontWeight: "900", fontSize: "19px", marginBottom: "10px" }}>{noticeTeam.mascot ?? noticeTeam.color.emoji} {noticeTeam.name} ran out of time!</div>
            <div style={{ fontSize: "15px", lineHeight: 1.6, opacity: 0.95 }}>
              {timeoutNotice.retried ? "That's your one free retry for this game — watch the clock this time!" : "You've already used your free retry this game — the turn moves on."}
            </div>
          </div>
          <button onClick={dismissTimeoutNotice} className="castle-next-btn" style={{ background: "linear-gradient(135deg,#064E3B,#059669)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(5,150,105,0.5)", transition: "transform 0.15s ease" }}>
            {timeoutNotice.retried ? "🔄 Try Again!" : "➡️ Next Team"}
          </button>
        </div>
      </div>
    );
  }

  const bumpType = (type: string) => setTypeIdx(prev => ({ ...prev, [type]: (prev[type] ?? 0) + 1 }));

  const pickAction = (id: ActionId) => {
    const def = ACTION_DEFS.find(a => a.id === id)!;
    if (def.cost && rpg[activeTeam.id].mp < def.cost) return;
    setSelectedAction(id);
    setShowAns(false);
    setPhase("answer");
  };

  const handleReveal = () => setShowAns(true);

  const resolveDefend = () => {
    setRpg(prev => ({ ...prev, [activeTeam.id]: { ...prev[activeTeam.id], shieldTurnsLeft: SHIELD_DURATION_TURNS, shieldFresh: true } }));
    updateScore(activeTeam.id, DEFEND_SCORE);
    setLastEvent({ action: "defend" });
    setPhase("result");
    spawnImpact(activeTeam.id, "shield", ACTION_DEFS.find(a => a.id === "defend")!.character);
  };

  const resolveFocus = () => {
    setRpg(prev => {
      const cur = prev[activeTeam.id];
      return { ...prev, [activeTeam.id]: { ...cur, mp: Math.min(cur.maxMp, cur.mp + FOCUS_MP_REWARD) } };
    });
    setLastEvent({ action: "focus", mpGained: FOCUS_MP_REWARD });
    setPhase("result");
    spawnImpact(activeTeam.id, "focus", ACTION_DEFS.find(a => a.id === "focus")!.character);
    spawnFloat(activeTeam.id, `+${FOCUS_MP_REWARD} MP`, "#C4B5FD");
  };

  const handleCorrect = () => {
    if (!actionDef) return;
    bumpType(actionDef.type);
    setShowAns(false);
    if (actionDef.id === "sword" || actionDef.id === "magic") {
      if (teams.length === 2) {
        // Only one possible target in a 1v1 — skip the pointless "pick a castle" step.
        rollDice(aliveEnemies[0].id);
      } else {
        setPhase("pick-target");
      }
    } else if (actionDef.id === "defend") {
      resolveDefend();
    } else {
      resolveFocus();
    }
  };

  const handleWrong = () => {
    if (actionDef) bumpType(actionDef.type);
    advanceTurn();
  };

  const rollDice = (targetId: string | number) => {
    setPhase("rolling");
    setRolling(true);
    let ticks = 0;
    const totalTicks = 14;
    const tick = () => {
      setDiceRoll(Math.floor(Math.random() * 6) + 1);
      ticks++;
      if (ticks < totalTicks) { setTimeout(tick, 60 + ticks * 18); }
      else {
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceRoll(finalRoll);
        setRolling(false);
        resolveAttack(finalRoll, targetId);
      }
    };
    setTimeout(tick, 80);
  };

  const resolveAttack = (roll: number, targetId: string | number) => {
    const isMagic = selectedAction === "magic";
    const attackerRpg = rpg[activeTeam.id];
    const lvlInfo = getLevelInfo(attackerRpg.xp);
    const mult = isMagic ? MAGIC_DMG_MULT : 1;
    const rawDamage = Math.round(roll * BASE_DAMAGE * lvlInfo.mult * mult);
    const target = rpg[targetId];
    const targetShielded = target.shieldTurnsLeft > 0;
    const finalDamage = targetShielded ? Math.round(rawDamage * (1 - SHIELD_REDUCTION)) : rawDamage;
    const xpGained = roll * XP_PER_ROLL;
    const gotApple = Math.random() < APPLE_CHANCE;
    const healAmount = gotApple ? APPLE_HEAL : 0;
    const mpSpent = isMagic ? MAGIC_MP_COST : 0;
    const newTargetHp = Math.max(0, target.hp - finalDamage);

    setRpg(prev => {
      const next = { ...prev };
      next[targetId] = { ...next[targetId], hp: newTargetHp };
      const newXp = next[activeTeam.id].xp + xpGained;
      const newLevel = getLevelInfo(newXp).level;
      const newHp = Math.min(MAX_HP, next[activeTeam.id].hp + healAmount);
      const newMp = Math.max(0, next[activeTeam.id].mp - mpSpent);
      next[activeTeam.id] = { ...next[activeTeam.id], xp: newXp, level: newLevel, hp: newHp, mp: newMp };
      return next;
    });

    const oldLevel = getLevelInfo(attackerRpg.xp).level;
    const newLevel = getLevelInfo(attackerRpg.xp + xpGained).level;
    const leveledUp = newLevel > oldLevel;

    updateScore(activeTeam.id, roll * 15);
    setLastEvent({ action: selectedAction as ActionId, damage: finalDamage, xpGained, apple: gotApple, targetId, leveledUp, roll, shieldConsumed: targetShielded });
    setPhase("result");

    spawnImpact(targetId, "hit", activeTeam.mascot ?? ACTION_DEFS.find(a => a.id === selectedAction)!.character);
    spawnFloat(targetId, `-${finalDamage}`, "#FCA5A5");
    if (gotApple) {
      spawnImpact(activeTeam.id, "heal");
      spawnFloat(activeTeam.id, `+${healAmount}`, "#86EFAC");
    }

    const justEliminated = target.hp > 0 && newTargetHp <= 0;
    if (justEliminated) {
      eliminationOrderRef.current.push(targetId);
      const targetTeam = teams.find(t => t.id === targetId)!;
      showElimination(targetTeam.name, targetTeam.color.bg);
    }

    const aliveAfter = teams.filter(t => {
      if (t.id === targetId) return newTargetHp > 0;
      return rpg[t.id].hp > 0;
    });
    if (aliveAfter.length <= 1) {
      // Give the elimination banner a real chance to be seen (it stays up ~3.2s) before cutting
      // to the game-over summary, same fix as Battleship's "banner never had time to show" bug.
      setTimeout(() => setPhase("gameover"), 3400);
    }
  };

  const aliveEnemies = teams.filter(t => t.id !== activeTeam.id && !isEliminated(t.id));

  const phaseHeaderText = () => {
    if (phase === "select-action") return "Choose your action!";
    if (phase === "answer" && actionDef) return `Answer to ${actionDef.verb}!`;
    if (phase === "pick-target") return "Choose who to attack!";
    if (phase === "rolling") return "Rolling the dice...";
    if (phase === "result") return "Turn resolved!";
    return "";
  };

  const impactGradient: Record<ImpactKind, string> = {
    hit: "radial-gradient(circle,#EF444499,transparent 70%)",
    heal: "radial-gradient(circle,#22C55E99,transparent 70%)",
    shield: "radial-gradient(circle,#22D3EE99,transparent 70%)",
    focus: "radial-gradient(circle,#F59E0B99,transparent 70%)",
  };

  return (
    <div style={arenaStyle}>
      {ambientLayer}
      {styleTag}
      {elimBanner && (
        <div key={elimBanner.key} style={{
          position: "absolute", top: "14px", left: "50%", zIndex: 20, whiteSpace: "nowrap",
          background: `linear-gradient(135deg,${elimBanner.color},#7F1D1D)`, border: "2px solid #FCA5A5",
          borderRadius: "14px", padding: "12px 24px", boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
          animation: "castleBannerIn 3.2s ease-in-out forwards",
        }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
            💀 {elimBanner.teamName}'s castle has fallen — eliminated!
          </span>
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", marginBottom: "16px" }}>
          {teams.map(tm => {
            const r = rpg[tm.id];
            const lvl = getLevelInfo(r.xp);
            const nextLvl = getNextLevelInfo(r.xp);
            const xpInLevel = r.xp - lvl.xpNeeded;
            const xpForNext = nextLvl.xpNeeded - lvl.xpNeeded;
            const prestigeStars = "★".repeat(Math.floor((lvl.level - 1) / LEVEL_COLORS.length));
            const dead = r.hp <= 0;
            const hpPct = (r.hp / MAX_HP) * 100;
            const teamImpacts = impacts.filter(i => i.teamId === tm.id);
            const teamFloats = floatTexts.filter(f => f.teamId === tm.id);
            const isShaking = teamImpacts.some(i => i.kind === "hit");
            return (
              <div key={tm.id} style={{
                position: "relative", overflow: "hidden",
                background: dead ? "linear-gradient(160deg,#1F2937,#0B0F17)" : `linear-gradient(160deg, ${tm.color.dark}33, #0A0A18)`,
                border: `2px solid ${dead ? "#4B5563" : tm.color.bg}`, borderRadius: "18px", padding: "10px",
                opacity: dead ? 0.6 : 1,
                boxShadow: dead ? "none" : (activeTeam.id === tm.id ? `0 0 20px ${tm.color.bg}88, inset 0 0 20px ${tm.color.bg}22` : `0 0 10px ${tm.color.bg}44`),
                animation: isShaking ? "shake 0.4s ease-in-out" : "none",
                transition: "box-shadow 0.3s ease",
              }}>
                {teamImpacts.map(i => (
                  <div key={i.id} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: "18px", background: impactGradient[i.kind], animation: "impactFlash 0.65s ease-out forwards", zIndex: 2 }} />
                    {i.character && (
                      <div style={{ position: "absolute", left: "50%", top: "40%", fontSize: "46px", transform: "translate(-50%,-50%)", zIndex: 6, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))", animation: "characterStrike 0.65s ease-out forwards" }}>
                        {i.character}
                      </div>
                    )}
                  </div>
                ))}
                {teamFloats.map(f => (
                  <div key={f.id} style={{ position: "absolute", top: "36%", left: "50%", fontWeight: 900, fontSize: "20px", color: f.color, textShadow: "0 2px 6px rgba(0,0,0,0.7)", pointerEvents: "none", animation: "floatUp 1.3s ease-out forwards", zIndex: 5 }}>{f.text}</div>
                ))}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px", flexWrap: "wrap", gap: "4px" }}>
                  <span style={{ fontWeight: "900", fontSize: "13px", color: dead ? "#9CA3AF" : "#F3F4F6", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{dead ? "💀" : ""} {tm.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {!dead && r.shieldTurnsLeft > 0 && <span style={{ fontSize: "10px", fontWeight: "800", padding: "2px 7px", borderRadius: "20px", background: "#0891B2", color: "white" }}>🛡️ {r.shieldTurnsLeft}</span>}
                    <span style={{ fontSize: "10px", fontWeight: "800", padding: "2px 7px", borderRadius: "20px", background: lvl.color, color: "white" }}>{lvl.label} {prestigeStars}</span>
                  </div>
                </div>

                <CastleVisual hpPct={hpPct} teamColor={tm.color.bg} dead={dead} shielded={!dead && r.shieldTurnsLeft > 0} />

                <StatBar value={r.hp} max={MAX_HP} color="#EF4444" label="HP" icon="❤️" />
                {!dead && <StatBar value={r.mp} max={r.maxMp} color="#8B5CF6" label="MP" icon="🔵" />}
                {!dead && <StatBar value={xpInLevel} max={xpForNext} color={lvl.color} label="XP" icon="⚡" />}
              </div>
            );
          })}
        </div>

        <div style={{ background: `linear-gradient(90deg, ${activeTeam.color.bg}, ${activeTeam.color.dark})`, borderRadius: "14px", padding: "10px 16px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", boxShadow: `0 4px 18px ${activeTeam.color.bg}55` }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>🏰 {activeTeam.name} — {phaseHeaderText()}</span>
          {(phase === "pick-target" || phase === "select-action") && <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS} />}
        </div>

        {phase === "select-action" && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: "700", color: "#E5E7EB", marginBottom: "12px" }}>Choose your action:</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              {ACTION_DEFS.map(a => {
                const disabled = !!a.cost && rpg[activeTeam.id].mp < a.cost;
                return (
                  <button key={a.id} disabled={disabled} onClick={() => pickAction(a.id)} className="castle-action-btn" style={{
                    background: disabled ? "#3F3F46" : `linear-gradient(160deg, ${a.color}, ${a.color}CC)`,
                    color: "white", border: `2px solid ${disabled ? "#52525B" : a.glow}`, borderRadius: "14px",
                    padding: "14px 18px", fontWeight: "800", fontSize: "15px", cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.65 : 1, minWidth: "130px",
                    boxShadow: disabled ? "none" : `0 0 16px ${a.glow}88`,
                    transition: "transform 0.15s ease, filter 0.15s ease",
                  }}>
                    <div style={{ fontSize: "24px", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }}>{a.emoji}</div>
                    <div>{a.label}</div>
                    {a.cost !== undefined && (
                      <div style={{ fontSize: "11px", fontWeight: "700", marginTop: "4px", opacity: 0.9 }}>
                        {disabled ? `Need ${a.cost} MP (have ${Math.round(rpg[activeTeam.id].mp)})` : `${a.cost} MP`}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {phase === "answer" && (
          <>
            <QuestionCard question={q} showAnswer={showAns} onReveal={handleReveal} gameId="castle" />
            {q && (showAns || q?.type === "speaking task") && (
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" }}>
                <button onClick={handleCorrect} className="castle-next-btn" style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>✅ Correct — {actionDef?.label}!</button>
                <button onClick={handleWrong} className="castle-next-btn" style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>❌ Wrong</button>
              </div>
            )}
          </>
        )}

        {phase === "pick-target" && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: "700", color: "#E5E7EB", marginBottom: "12px" }}>Pick a castle to attack:</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              {aliveEnemies.map(tm => (
                <button key={tm.id} onClick={() => rollDice(tm.id)} className="castle-target-btn" style={{ background: `linear-gradient(160deg, ${tm.color.bg}, ${tm.color.dark})`, color: "white", border: "none", borderRadius: "12px", padding: "12px 22px", fontWeight: "800", fontSize: "15px", cursor: "pointer", boxShadow: `0 0 14px ${tm.color.bg}66`, transition: "transform 0.15s ease, filter 0.15s ease" }}>
                  ⚔️ {tm.name} ({Math.round(rpg[tm.id].hp)} HP){rpg[tm.id].shieldTurnsLeft > 0 ? " 🛡️" : ""}
                </button>
              ))}
            </div>
          </div>
        )}

        {(phase === "rolling" || (phase === "result" && lastEvent && (lastEvent.action === "sword" || lastEvent.action === "magic"))) && (
          <div style={{ textAlign: "center" }}>
            {actionDef && (
              <div style={{ fontSize: "40px", display: "inline-block", filter: `drop-shadow(0 0 12px ${actionDef.glow})`, animation: rolling ? "attackerWindup 0.5s ease-in-out infinite" : "none" }}>
                {activeTeam.mascot ?? actionDef.character}
              </div>
            )}
            <DiceRoller rolling={rolling} result={diceRoll} />
          </div>
        )}

        {phase === "result" && lastEvent && !rolling && (
          <div style={{ marginTop: "4px", textAlign: "center" }}>
            {(lastEvent.action === "sword" || lastEvent.action === "magic") && (
              <>
                <div style={{ background: "rgba(127,29,29,0.35)", border: "2px solid #EF4444", borderRadius: "14px", padding: "14px", marginBottom: "10px", backdropFilter: "blur(4px)" }}>
                  <div style={{ fontWeight: "900", fontSize: "17px", color: "#FCA5A5" }}>
                    {lastEvent.action === "magic" ? "✨" : "⚔️"} {activeTeam.name} dealt <span style={{ fontSize: "22px" }}>{lastEvent.damage}</span> damage to {teams.find(t => t.id === lastEvent.targetId)?.name}!
                  </div>
                  {lastEvent.shieldConsumed && <div style={{ color: "#FCA5A5", fontWeight: "700", fontSize: "13px", marginTop: "4px" }}>🛡️ Halved by their shield!</div>}
                </div>
                {lastEvent.apple && <div style={{ background: "rgba(20,83,45,0.35)", border: "2px solid #22C55E", borderRadius: "12px", padding: "10px", marginBottom: "10px", fontWeight: "900", color: "#86EFAC", backdropFilter: "blur(4px)" }}>🍎 Found a healing apple! +{APPLE_HEAL} HP</div>}
                {lastEvent.leveledUp && (
                  <div style={{ position: "relative", background: "rgba(120,53,15,0.4)", border: "2px solid #F59E0B", borderRadius: "12px", padding: "10px", marginBottom: "10px", fontWeight: "900", color: "#FDE68A", backdropFilter: "blur(4px)", animation: "celebrate 0.5s ease-out", overflow: "visible" }}>
                    🎉 LEVEL UP!
                    {[0, 60, 120, 180, 240, 300].map(a => (
                      <span key={a} style={{ position: "absolute", left: "50%", top: "50%", fontSize: "16px", pointerEvents: "none", ["--a" as any]: `${a}deg`, animation: "burstOut 0.8s ease-out" }}>✨</span>
                    ))}
                  </div>
                )}
              </>
            )}
            {lastEvent.action === "defend" && (
              <div style={{ background: "rgba(8,145,178,0.3)", border: "2px solid #0891B2", borderRadius: "14px", padding: "14px", marginBottom: "10px", backdropFilter: "blur(4px)" }}>
                <div style={{ fontWeight: "900", fontSize: "17px", color: "#67E8F9" }}>🛡️ {activeTeam.name} raised a shield!</div>
                <div style={{ color: "#A5F3FC", fontWeight: "700", fontSize: "13px", marginTop: "4px" }}>Halves damage taken for the next {SHIELD_DURATION_TURNS} turns. +{DEFEND_SCORE} pts.</div>
              </div>
            )}
            {lastEvent.action === "focus" && (
              <div style={{ background: "rgba(146,64,14,0.3)", border: "2px solid #D97706", borderRadius: "14px", padding: "14px", marginBottom: "10px", backdropFilter: "blur(4px)" }}>
                <div style={{ fontWeight: "900", fontSize: "17px", color: "#FCD34D" }}>🔮 {activeTeam.name} focused!</div>
                <div style={{ color: "#FDE68A", fontWeight: "700", fontSize: "13px", marginTop: "4px" }}>+{lastEvent.mpGained} MP</div>
              </div>
            )}
            <button onClick={advanceTurn} className="castle-next-btn" style={{ background: "#6366F1", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 16px rgba(99,102,241,0.5)", transition: "transform 0.15s ease" }}>➡️ Next Turn</button>
          </div>
        )}
      </div>
    </div>
  );
}
