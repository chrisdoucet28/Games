import { useState, useRef, useCallback } from "react";
import type { GameProps } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { QuestionCard } from "../shared/QuestionCard";
import { teamsGridCols } from "../../data/constants";

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
  { id: "focus",  type: "finish the sentence",       label: "Focus",        emoji: "🔮", character: "🧘", color: "#D97706", glow: "#FCD34D", verb: "focus" },
];

type TeamRpg = { hp: number; xp: number; level: number; mp: number; maxMp: number; shieldTurnsLeft: number };
type Phase = "intro" | "select-action" | "answer" | "pick-target" | "rolling" | "result";
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

export function CastleGame({ questions, teams, onUpdateScore, onEnd }: GameProps) {
  const TURN_SECONDS = 25;

  const [rpg, setRpg] = useState<Record<string | number, TeamRpg>>(() => Object.fromEntries(
    teams.map(t => [t.id, { hp: MAX_HP, xp: 0, level: 1, mp: START_MP, maxMp: MAX_MP, shieldTurnsLeft: 0 }])
  ));
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [selectedAction, setSelectedAction] = useState<ActionId | null>(null);
  const [showAns, setShowAns] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [lastEvent, setLastEvent] = useState<LastEvent | null>(null);
  const [typeIdx, setTypeIdx] = useState<Record<string, number>>(() => Object.fromEntries(ACTION_DEFS.map(a => [a.type, 0])));
  const [impacts, setImpacts] = useState<Impact[]>([]);
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);
  const fxId = useRef(0);

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

  const advanceTurn = useCallback(() => {
    setRpg(prev => {
      const next = { ...prev };
      teams.forEach(t => {
        if (next[t.id].hp <= 0) return;
        next[t.id] = {
          ...next[t.id],
          mp: Math.min(next[t.id].maxMp, next[t.id].mp + MP_REGEN_PER_TURN),
          shieldTurnsLeft: Math.max(0, next[t.id].shieldTurnsLeft - 1),
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

  const { timeLeft } = useTurnTimer(TURN_SECONDS, phase === "pick-target" || phase === "select-action", () => advanceTurn(), activeTeamIdx);

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
      .castle-action-btn:hover:not(:disabled){transform:translateY(-3px) scale(1.03);filter:brightness(1.15)}
      .castle-action-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
      .castle-target-btn:hover{transform:translateY(-2px) scale(1.03);filter:brightness(1.1)}
      .castle-next-btn:hover{transform:scale(1.04);filter:brightness(1.1)}
    `}</style>
  );

  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      {ambientLayer}
      {styleTag}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(135deg,#064E3B,#059669)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", position: "relative", color: "white", maxWidth: "520px", margin: "0 auto 10px", boxShadow: "0 0 40px #05966955" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏰</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>Castle Defense</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
            Choose your action each turn:<br />
            🗡️ <strong>Sword</strong> — quick attack, no cost.<br />
            ✨ <strong>Magic</strong> — costs MP, hits much harder.<br />
            🛡️ <strong>Defend</strong> — raise a shield that halves incoming damage.<br />
            🔮 <strong>Focus</strong> — skip attacking to recover MP.<br />
            Watch out for <strong>🍎 healing apples</strong>! The last castle standing wins!
          </div>
        </div>
        <button onClick={() => setPhase("select-action")} className="castle-next-btn" style={{ background: "linear-gradient(135deg,#064E3B,#059669)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(5,150,105,0.5)", transition: "transform 0.15s ease" }}>🏰 Prepare for Battle!</button>
      </div>
    </div>
  );

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
    setRpg(prev => ({ ...prev, [activeTeam.id]: { ...prev[activeTeam.id], shieldTurnsLeft: SHIELD_DURATION_TURNS } }));
    onUpdateScore(activeTeam.id, DEFEND_SCORE);
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
      setPhase("pick-target");
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

    onUpdateScore(activeTeam.id, roll * 15);
    setLastEvent({ action: selectedAction as ActionId, damage: finalDamage, xpGained, apple: gotApple, targetId, leveledUp, roll, shieldConsumed: targetShielded });
    setPhase("result");

    spawnImpact(targetId, "hit", ACTION_DEFS.find(a => a.id === selectedAction)!.character);
    spawnFloat(targetId, `-${finalDamage}`, "#FCA5A5");
    if (gotApple) {
      spawnImpact(activeTeam.id, "heal");
      spawnFloat(activeTeam.id, `+${healAmount}`, "#86EFAC");
    }

    const aliveAfter = teams.filter(t => {
      if (t.id === targetId) return newTargetHp > 0;
      return rpg[t.id].hp > 0;
    });
    if (aliveAfter.length <= 1) { setTimeout(() => onEnd(), 2200); }
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
            <QuestionCard question={q} showAnswer={showAns} onReveal={handleReveal} />
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
                {actionDef.character}
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
