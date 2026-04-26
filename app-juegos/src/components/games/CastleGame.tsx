import { useState, useRef, useCallback } from "react";
import type { GameProps } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { QuestionCard } from "../shared/QuestionCard";
import { teamsGridCols } from "../../data/constants";

const LEVELS = [
  { level:1, label:"Lvl 1", xpNeeded:0,   nextXp:100, mult:1.0, color:"#6B7280" },
  { level:2, label:"Lvl 2", xpNeeded:100, nextXp:250, mult:1.5, color:"#3B82F6" },
  { level:3, label:"Lvl 3", xpNeeded:250, nextXp:Infinity, mult:2.5, color:"#F59E0B" },
];
const BASE_DAMAGE = 5;
const XP_PER_ROLL = 15;
const APPLE_CHANCE = 0.12;
const APPLE_HEAL = 20;
const MAX_HP = 150;

function StatBar({ value, max, color, bg, label, icon }: { value: number, max: number, color: string, bg: string, label: string, icon: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ marginBottom: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#374151" }}>{icon} {label}</span>
        <span style={{ fontSize: "11px", fontWeight: "800", color: "#374151" }}>{Math.round(value)}/{max}</span>
      </div>
      <div style={{ height: "10px", background: bg, borderRadius: "5px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "5px", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function DiceRoller({ rolling, result }: { rolling: boolean, result: number | null }) {
  const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ fontSize: "72px", display: "inline-block", animation: rolling ? "spin 0.15s linear infinite" : "none", transition: "font-size 0.2s" }}>
        {result ? faces[result - 1] : "🎲"}
      </div>
      {result && !rolling && (
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#1E1B4B", marginTop: "4px" }}>Rolled a {result}!</div>
      )}
      <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function CastleGame({ questions, teams, onUpdateScore, onEnd }: GameProps) {
  const TURN_SECONDS = 25;
  const shuffledQs = useRef([...questions].sort(() => Math.random() - 0.5)).current;

  const [rpg, setRpg] = useState<Record<string | number, { hp: number, xp: number, level: number }>>(() => Object.fromEntries(
    teams.map(t => [t.id, { hp: MAX_HP, xp: 0, level: 1 }])
  ));
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [qi, setQi] = useState(0);
  const [showAns, setShowAns] = useState(false);
  const [phase, setPhase] = useState<"intro" | "answer" | "pick-target" | "rolling" | "result">("intro");
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ damage: number, xpGained: number, apple: boolean, targetId: string | number, leveledUp: boolean, roll: number } | null>(null);

  const activeTeam = teams[activeTeamIdx];
  const q = shuffledQs[qi % Math.max(shuffledQs.length, 1)];

  const getLevelInfo = (xp: number) => [...LEVELS].reverse().find(l => xp >= l.xpNeeded) || LEVELS[0];
  const getNextLevelInfo = (xp: number) => {
    const cur = getLevelInfo(xp);
    return LEVELS.find(l => l.level === cur.level + 1) || null;
  };

  const isEliminated = (teamId: string | number) => rpg[teamId]?.hp <= 0;

  const advanceTurn = useCallback(() => {
    setPhase("answer"); setShowAns(false); setDiceRoll(null); setLastEvent(null);
    setQi(i => i + 1);
    let next = (activeTeamIdx + 1) % teams.length;
    let tries = 0;
    while (isEliminated(teams[next].id) && tries < teams.length) { next = (next + 1) % teams.length; tries++; }
    setActiveTeamIdx(next);
  }, [activeTeamIdx, teams, rpg]);

  const { timeLeft } = useTurnTimer(TURN_SECONDS, phase === "pick-target", () => advanceTurn(), activeTeamIdx);

  if (phase === "intro") return (
    <div style={{ textAlign: "center" }}>
      <div style={{ background: "linear-gradient(135deg,#064E3B,#059669)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", position: "relative", color: "white", maxWidth: "520px", margin: "0 auto 10px" }}>
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏰</div>
        <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>Castle Defense</div>
        <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
          Answer a question correctly to <strong>attack an enemy castle</strong>!<br />
          Roll the dice — the higher you roll, the more <strong>damage</strong> you deal.<br />
          Gain <strong>XP</strong> to level up and <strong>multiply your damage</strong>.<br />
          Watch out for <strong>🍎 healing apples</strong>!<br />
          The last castle standing wins!
        </div>
      </div>
      <button onClick={() => setPhase("answer")} style={{ background: "linear-gradient(135deg,#064E3B,#059669)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer" }}>🏰 Prepare for Battle!</button>
    </div>
  );

  const handleReveal = () => setShowAns(true);
  const handleCorrect = () => { setShowAns(false); setPhase("pick-target"); };

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
        applyRoll(finalRoll, targetId);
      }
    };
    setTimeout(tick, 80);
  };

  const applyRoll = (roll: number, targetId: string | number) => {
    const attackerRpg = rpg[activeTeam.id];
    const lvlInfo = getLevelInfo(attackerRpg.xp);
    const damage = Math.round(roll * BASE_DAMAGE * lvlInfo.mult);
    const xpGained = roll * XP_PER_ROLL;
    const gotApple = Math.random() < APPLE_CHANCE;
    const healAmount = gotApple ? APPLE_HEAL : 0;

    setRpg(prev => {
      const next = { ...prev };
      const newTargetHp = Math.max(0, next[targetId].hp - damage);
      next[targetId] = { ...next[targetId], hp: newTargetHp };
      const newXp = next[activeTeam.id].xp + xpGained;
      const newLevel = getLevelInfo(newXp).level;
      const newHp = Math.min(MAX_HP, next[activeTeam.id].hp + healAmount);
      next[activeTeam.id] = { ...next[activeTeam.id], xp: newXp, level: newLevel, hp: newHp };
      return next;
    });

    const oldLevel = getLevelInfo(rpg[activeTeam.id].xp).level;
    const newLevel = getLevelInfo(rpg[activeTeam.id].xp + xpGained).level;
    const leveledUp = newLevel > oldLevel;

    onUpdateScore(activeTeam.id, roll * 15);
    setLastEvent({ damage, xpGained, apple: gotApple, targetId, leveledUp, roll });
    setPhase("result");

    const newTargetHp = Math.max(0, rpg[targetId].hp - damage);
    const aliveAfter = teams.filter(t => {
      if (t.id === targetId) return newTargetHp > 0;
      return rpg[t.id].hp > 0;
    });
    if (aliveAfter.length <= 1) { setTimeout(() => onEnd(), 2200); }
  };

  const aliveEnemies = teams.filter(t => t.id !== activeTeam.id && !isEliminated(t.id));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", marginBottom: "16px" }}>
        {teams.map(tm => {
          const r = rpg[tm.id];
          const lvl = getLevelInfo(r.xp);
          const nextLvl = getNextLevelInfo(r.xp);
          const xpInLevel = r.xp - lvl.xpNeeded;
          const xpForNext = nextLvl ? (nextLvl.xpNeeded - lvl.xpNeeded) : 1;
          const dead = r.hp <= 0;
          return (
            <div key={tm.id} style={{ background: dead ? "#F3F4F6" : tm.color.light, border: `3px solid ${dead ? "#D1D5DB" : tm.color.bg}`, borderRadius: "16px", padding: "12px", opacity: dead ? 0.5 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontWeight: "900", fontSize: "14px", color: dead ? "#9CA3AF" : tm.color.dark }}>{dead ? "💀" : "🏰"} {tm.name}</span>
                <span style={{ fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "20px", background: lvl.color, color: "white" }}>{lvl.label} {lvl.level === 3 ? "★" : ""}</span>
              </div>
              <StatBar value={r.hp} max={MAX_HP} color="#EF4444" bg="#FEE2E2" label="HP" icon="❤️" />
              {!dead && nextLvl && <StatBar value={xpInLevel} max={xpForNext} color={lvl.color} bg="#E5E7EB" label="XP" icon="⚡" />}
              {!dead && !nextLvl && <div style={{ fontSize: "11px", fontWeight: "800", color: "#F59E0B", textAlign: "center", marginTop: "4px" }}>⚡ MAX LEVEL ★</div>}
            </div>
          );
        })}
      </div>

      <div style={{ background: activeTeam.color.bg, borderRadius: "14px", padding: "10px 16px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ color: "white", fontWeight: "900", fontSize: "16px" }}>
          🏰 {activeTeam.name} — {phase === "answer" && "Answer to attack!"}{phase === "pick-target" && "Choose who to attack!"}{phase === "rolling" && "Rolling the dice..."}{phase === "result" && "Attack resolved!"}
        </span>
        {phase === "pick-target" && <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS} />}
      </div>

      {phase === "answer" && (
        <>
          <QuestionCard question={q} showAnswer={showAns} onReveal={handleReveal} />
          {(showAns || q?.type === "speaking task") && (
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" }}>
              <button onClick={handleCorrect} style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>✅ Correct — Attack!</button>
              <button onClick={advanceTurn} style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>❌ Wrong</button>
            </div>
          )}
        </>
      )}

      {phase === "pick-target" && (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: "700", color: "#374151", marginBottom: "12px" }}>Pick a castle to attack:</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            {aliveEnemies.map(tm => (
              <button key={tm.id} onClick={() => rollDice(tm.id)} style={{ background: tm.color.bg, color: "white", border: "none", borderRadius: "12px", padding: "12px 22px", fontWeight: "800", fontSize: "15px", cursor: "pointer" }}>
                ⚔️ {tm.name} ({Math.round(rpg[tm.id].hp)} HP)
              </button>
            ))}
          </div>
        </div>
      )}

      {(phase === "rolling" || phase === "result") && <DiceRoller rolling={rolling} result={diceRoll} />}

      {phase === "result" && lastEvent && !rolling && (
        <div style={{ marginTop: "4px", textAlign: "center" }}>
          <div style={{ background: "#FEF2F2", border: "2px solid #EF4444", borderRadius: "14px", padding: "14px", marginBottom: "10px" }}>
            <div style={{ fontWeight: "900", fontSize: "17px", color: "#991B1B" }}>⚔️ {activeTeam.name} dealt <span style={{ fontSize: "22px" }}>{lastEvent.damage}</span> damage to {teams.find(t => t.id === lastEvent.targetId)?.name}!</div>
          </div>
          {lastEvent.leveledUp && <div style={{ background: "#FEF9C3", border: "2px solid #F59E0B", borderRadius: "12px", padding: "10px", marginBottom: "10px", fontWeight: "900", color: "#92400E" }}>🎉 LEVEL UP!</div>}
          <button onClick={advanceTurn} style={{ background: "#6366F1", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer" }}>➡️ Next Turn</button>
        </div>
      )}
    </div>
  );
}