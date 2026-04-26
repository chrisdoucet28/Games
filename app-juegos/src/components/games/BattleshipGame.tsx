import { useState, useRef, useCallback } from "react";
import type { GameProps, QuestionData } from "../../types";
import { teamsGridCols } from "../../data/constants";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { QuestionCard } from "../shared/QuestionCard";

const BATTLESHIP_COLS_5 = [
  { letter: "A", label: "Correct the mistake", emoji: "✏️", type: "correct grammar mistakes" },
  { letter: "B", label: "Choose correct grammar", emoji: "🔤", type: "choose correct grammar" },
  { letter: "C", label: "Use in a sentence", emoji: "💬", type: "use vocabulary in a sentence" },
  { letter: "D", label: "Finish the sentence", emoji: "✍️", type: "finish the sentence" },
  { letter: "E", label: "Speaking challenge", emoji: "🗣️", type: "speaking task" },
];
const BATTLESHIP_COLS_4 = BATTLESHIP_COLS_5.slice(0, 4);

function generateShipsNxN(cols: any[]) {
  const all: string[] = [];
  [1, 2, 3, 4, 5].slice(0, cols.length).forEach(r => cols.forEach(c => all.push(c.letter + r)));
  const count = cols.length === 5 ? 7 : 5;
  return new Set(all.sort(() => Math.random() - 0.5).slice(0, count));
}

function buildCoordMap(questions: QuestionData[], cols: any[]) {
  const byType: Record<string, QuestionData[]> = {};
  questions.forEach(q => {
    const t = q.type || "unknown";
    if (!byType[t]) byType[t] = [];
    byType[t].push(q);
  });

  if (!byType["speaking task"] || byType["speaking task"].length === 0) {
    byType["speaking task"] = questions.map(q => ({
      ...q, type: "speaking task", question: q.task || q.question || q.word || String(q), answer: "Open — teacher judges", hint: "Speak a full sentence using the target language",
    }));
  }

  if (!byType["use vocabulary in a sentence"] || byType["use vocabulary in a sentence"].length === 0) {
    const fallbackPool = byType["rewrite sentences"]?.length ? byType["rewrite sentences"] : byType["finish the sentence"]?.length ? byType["finish the sentence"] : questions;
    byType["use vocabulary in a sentence"] = fallbackPool.map(q => ({
      ...q, type: "use vocabulary in a sentence", question: q.question || q.task || String(q), answer: q.answer || "Open — teacher judges", hint: q.hint || "Use the target word or structure in your own sentence",
    }));
  }

  ["correct grammar mistakes", "choose correct grammar", "finish the sentence"].forEach(t => {
    if (!byType[t] || byType[t].length === 0) {
      const any = questions.filter(q => q.type !== t);
      byType[t] = any.length ? any : questions;
    }
  });

  const rows = cols.length;
  const coords: { coord: string, type: string }[] = [];
  cols.forEach(col => { for (let r = 1; r <= rows; r++) coords.push({ coord: col.letter + r, type: col.type }); });

  const usedTexts = new Set<string>();
  const map: Record<string, QuestionData> = {};
  const qText = (q: any) => q.question || q.task || String(q);

  coords.forEach(({ coord, type }) => {
    const pool = [...(byType[type] || questions)].sort(() => Math.random() - 0.5);
    const chosen = pool.find(q => !usedTexts.has(qText(q)));
    if (chosen) { map[coord] = chosen; usedTexts.add(qText(chosen)); }
  });

  const allShuffled = [...questions].sort(() => Math.random() - 0.5);
  coords.forEach(({ coord }) => {
    if (!map[coord]) {
      const fallback = allShuffled.find(q => !usedTexts.has(qText(q)));
      if (fallback) { map[coord] = fallback; usedTexts.add(qText(fallback)); } 
      else { map[coord] = allShuffled[Object.keys(map).length % allShuffled.length]; }
    }
  });

  return map;
}

export function BattleshipGame({ questions, teams, onUpdateScore, onEnd, isTopic }: GameProps) {
  const TURN_SECONDS = 25;
  const gameTitle = isTopic ? "Battleship" : "Grammar Battleship";

  const COLS = teams.length === 2 ? BATTLESHIP_COLS_5 : BATTLESHIP_COLS_4;
  const ROWS = COLS.map((_, i) => i + 1);

  const coordMap = useRef(buildCoordMap(questions, COLS)).current;
  const fleets = useRef(Object.fromEntries(teams.map(t => [t.id, [...generateShipsNxN(COLS)]]))).current;

  const [hits, setHits] = useState<Record<string | number, string[]>>(() => Object.fromEntries(teams.map(t => [t.id, []])));
  const [misses, setMisses] = useState<Record<string | number, string[]>>(() => Object.fromEntries(teams.map(t => [t.id, []])));

  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [phase, setPhase] = useState<"intro" | "pick-target" | "pick-coord" | "answer">("intro");
  const [targetTeamId, setTargetTeamId] = useState<string | number | null>(null);
  const [pendingCoord, setPendingCoord] = useState<string | null>(null);
  const [showAns, setShowAns] = useState(false);

  const activeTeam = teams[activeTeamIdx];
  const currentQ = pendingCoord ? coordMap[pendingCoord] : null;

  const isEliminated = useCallback((teamId: string | number, hitsOverride?: Record<string | number, string[]>) => {
    const h = hitsOverride || hits;
    return fleets[teamId].every((s: string) => (h[teamId] || []).includes(s));
  }, [hits, fleets]);

  const advanceTurn = useCallback((hitsOverride?: Record<string | number, string[]>) => {
    setPhase("pick-target");
    setShowAns(false);
    setTargetTeamId(null);
    setPendingCoord(null);
    let next = (activeTeamIdx + 1) % teams.length;
    let tries = 0;
    while (isEliminated(teams[next].id, hitsOverride) && tries < teams.length) {
      next = (next + 1) % teams.length;
      tries++;
    }
    setActiveTeamIdx(next);
  }, [activeTeamIdx, teams, isEliminated]);

  const { timeLeft, stop } = useTurnTimer(
    TURN_SECONDS,
    phase === "pick-target" || phase === "pick-coord",
    () => advanceTurn(),
    activeTeamIdx
  );

  const pickTarget = (teamId: string | number) => {
    if (phase !== "pick-target" || isEliminated(teamId)) return;
    setTargetTeamId(teamId);
    setPhase("pick-coord");
  };

  const pickCoord = (coord: string) => {
    if (phase !== "pick-coord" || targetTeamId === null) return;
    if ((hits[targetTeamId] || []).includes(coord)) return;
    if ((misses[targetTeamId] || []).includes(coord)) return;
    stop();
    setPendingCoord(coord);
    setPhase("answer");
  };

  const resolve = (correct: boolean) => {
    if (targetTeamId === null || pendingCoord === null) return;
    const isShip = fleets[targetTeamId].includes(pendingCoord);
    let newHits = hits;

    if (correct && isShip) {
      newHits = { ...hits, [targetTeamId]: [...(hits[targetTeamId] || []), pendingCoord] };
      setHits(newHits);
      onUpdateScore(activeTeam.id, 60);
      if (isEliminated(targetTeamId, newHits)) {
        if (teams.filter(t => !isEliminated(t.id, newHits)).length <= 1) { onEnd(); return; }
      }
    } else if (correct && !isShip) {
      setMisses(m => ({ ...m, [targetTeamId]: [...(m[targetTeamId] || []), pendingCoord] }));
      onUpdateScore(activeTeam.id, 15);
    } else {
      setMisses(m => ({ ...m, [targetTeamId]: [...(m[targetTeamId] || []), pendingCoord] }));
    }
    advanceTurn(newHits);
  };

  const isSpeakingTask = currentQ?.type === "speaking task";
  const colColor = (letter: string) => {
    const idx = COLS.findIndex(c => c.letter === letter);
    const palette = ["#7C3AED", "#0891B2", "#059669", "#D97706", "#DC2626"];
    return palette[idx] ?? "#6366F1";
  };

  if (phase === "intro") return (
    <div style={{ textAlign: "center" }}>
      <div style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", position: "relative", color: "white", maxWidth: "520px", margin: "0 auto 10px" }}>
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>⚓</div>
        <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>{gameTitle}</div>
        <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
          Each team has a hidden fleet of ships on their ocean grid.<br />
          On your turn: <strong>pick an enemy team</strong>, then <strong>fire at a square</strong>.<br />
          {isTopic ? <>Each <strong>square is a unique speaking prompt</strong> — answer to fire!</> : <>Each <strong>column is a different task type</strong> — answer correctly to fire!</>}<br />
          Hit a ship = <strong>+60 pts</strong>. Hit water and answer = <strong>+15 pts</strong>.<br />
          Sink all of a team's ships to eliminate them. Last fleet wins!
        </div>
        <div style={{ position: "absolute", bottom: "-14px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "14px solid #2563EB" }} />
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
        {teams.map(t => (<div key={t.id} style={{ background: t.color.light, border: "3px solid " + t.color.bg, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: t.color.dark }}>{t.color.emoji} {t.name}</div>))}
      </div>
      <button onClick={() => setPhase("pick-target")} style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(37,99,235,0.4)" }}>
        ⚓ Battle Stations!
      </button>
    </div>
  );

  return (
    <div>
      {!isTopic && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center", marginBottom: "12px" }}>
          {COLS.map(col => (
            <div key={col.letter} style={{ background: colColor(col.letter), color: "white", borderRadius: "10px", padding: "5px 12px", fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontWeight: "900" }}>{col.letter}</span>
              <span style={{ opacity: 0.85 }}>{col.emoji} {col.label}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: activeTeam.color.bg, borderRadius: "14px", padding: "10px 16px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ color: "white", fontWeight: "900", fontSize: "17px" }}>
          ⚓ {activeTeam.name} —{" "}
          {phase === "pick-target" && "Choose a team to attack!"}
          {phase === "pick-coord" && `Targeting ${teams.find(t => t.id === targetTeamId)?.name} — pick a square!`}
          {phase === "answer" && `Firing at ${teams.find(t => t.id === targetTeamId)?.name} — ${pendingCoord}!`}
        </span>
        {(phase === "pick-target" || phase === "pick-coord") && <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS} />}
      </div>

      {phase === "pick-target" && (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "14px" }}>
          {teams.filter(t => t.id !== activeTeam.id).map(t => (
            <button key={t.id} onClick={() => pickTarget(t.id)} disabled={isEliminated(t.id)} style={{
              background: isEliminated(t.id) ? "#E5E7EB" : t.color.bg,
              color: isEliminated(t.id) ? "#9CA3AF" : "white",
              border: "none", borderRadius: "12px", padding: "10px 20px",
              fontWeight: "800", fontSize: "15px", cursor: isEliminated(t.id) ? "not-allowed" : "pointer"
            }}>
              {isEliminated(t.id) ? "💀" : "🎯"} {t.name}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "12px", marginBottom: "14px" }}>
        {teams.map(team => {
          const teamHits = hits[team.id] || [];
          const teamMisses = misses[team.id] || [];
          const eliminated = isEliminated(team.id);
          const isTarget = targetTeamId === team.id;
          const isActive = team.id === activeTeam.id;
          const shipsLeft = fleets[team.id].filter(s => !teamHits.includes(s)).length;
          const totalShips = fleets[team.id].length;

          return (
            <div key={team.id} style={{
              background: eliminated ? "linear-gradient(135deg,#F3F4F6,#E5E7EB)" : `linear-gradient(135deg,${team.color.light},white)`,
              border: `3px solid ${isTarget ? activeTeam.color.bg : eliminated ? "#D1D5DB" : team.color.bg}`,
              borderRadius: "18px", padding: "14px", opacity: eliminated ? 0.55 : 1,
              boxShadow: isTarget ? `0 0 0 3px ${activeTeam.color.bg}40, 0 8px 24px ${activeTeam.color.bg}30` : "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.25s"
            }}>
              <div style={{ background: eliminated ? "#9CA3AF" : isActive ? team.color.bg : isTarget ? activeTeam.color.bg : team.color.bg, borderRadius: "10px", padding: "8px 12px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "900", fontSize: "13px", color: "white" }}>
                  {eliminated ? "💀 SUNK" : isActive ? `🚢 ${team.name}` : isTarget ? `🎯 ${team.name}` : `🛡️ ${team.name}`}
                </span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", display: "flex", gap: "2px", alignItems: "center" }}>
                  {Array.from({ length: totalShips }).map((_, i) => (
                    <span key={i} style={{ fontSize: "12px", opacity: i < shipsLeft ? 1 : 0.25 }}>🚢</span>
                  ))}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div>
                  <div style={{ display: "flex", marginLeft: "22px", marginBottom: "3px", gap: "2px" }}>
                    {COLS.map(col => (
                      <div key={col.letter} style={{ width: "34px", textAlign: "center", fontWeight: "900", fontSize: "11px", color: "white", background: colColor(col.letter), borderRadius: "4px", padding: "2px 0" }}>{col.letter}</div>
                    ))}
                  </div>
                  {ROWS.map(r => (
                    <div key={r} style={{ display: "flex", alignItems: "center", gap: "2px", marginBottom: "2px" }}>
                      <div style={{ width: "18px", textAlign: "center", fontWeight: "800", fontSize: "11px", color: team.color.dark, flexShrink: 0 }}>{r}</div>
                      {COLS.map(col => {
                        const coord = col.letter + r;
                        const isHit = teamHits.includes(coord);
                        const isMiss = teamMisses.includes(coord);
                        const isPending = pendingCoord === coord && isTarget;
                        const canFire = phase === "pick-coord" && isTarget && !isHit && !isMiss && !eliminated && !isActive;
                        return (
                          <button key={coord} onClick={() => canFire && pickCoord(coord)} style={{
                            width: "34px", height: "34px", border: "none", borderRadius: "6px", fontSize: "14px", cursor: canFire ? "pointer" : "default", transition: "all 0.15s",
                            transform: isPending ? "scale(1.18)" : canFire ? "scale(1.02)" : "scale(1)",
                            background: isHit ? "linear-gradient(135deg,#EF4444,#B91C1C)" : isMiss ? "#CBD5E1" : isPending ? "linear-gradient(135deg,#FCD34D,#F59E0B)" : canFire ? `linear-gradient(135deg,${colColor(col.letter)}44,${colColor(col.letter)}22)` : "linear-gradient(135deg,#DBEAFE,#E0E7FF)",
                            boxShadow: isPending ? `0 0 12px #FCD34D` : isHit ? "0 2px 6px #EF444460" : "none", outline: canFire ? `2px solid ${colColor(col.letter)}80` : "none"
                          }}>
                            {isHit ? "💥" : isMiss ? "·" : isPending ? "🎯" : canFire ? "🌊" : "🌊"}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {phase === "answer" && currentQ && pendingCoord && (
        <div style={{ marginTop: "4px" }}>
          <div style={{ textAlign: "center", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ background: colColor(pendingCoord[0]), color: "white", borderRadius: "10px", padding: "5px 14px", fontWeight: "900", fontSize: "14px" }}>
              {pendingCoord} — {COLS.find(c => c.letter === pendingCoord[0])?.emoji} {COLS.find(c => c.letter === pendingCoord[0])?.label}
            </div>
            <span style={{ fontWeight: "700", color: "#374151", fontSize: "14px" }}>
              Answer correctly to fire at <strong>{teams.find(t => t.id === targetTeamId)?.name}</strong>!
            </span>
          </div>

          {isSpeakingTask ? (
            <div style={{ background: "#EEF2FF", border: "3px solid #6366F1", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#4338CA", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>🗣️ Speaking Challenge</div>
              <div style={{ fontSize: "clamp(15px,2.5vw,19px)", fontWeight: "800", color: "#1E1B4B", lineHeight: 1.5, marginBottom: "16px" }}>{currentQ.question}</div>
              <p style={{ color: "#6B7280", fontSize: "13px", marginBottom: "14px" }}>Team speaks their answer — teacher judges.</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={() => resolve(true)} style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>✅ Good! FIRE!</button>
                <button onClick={() => resolve(false)} style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>❌ Not quite — Miss</button>
              </div>
            </div>
          ) : (
            <>
              <QuestionCard question={currentQ} showAnswer={showAns} onReveal={() => setShowAns(true)} />
              {showAns && (
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" }}>
                  <button onClick={() => resolve(true)} style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>✅ Correct! FIRE!</button>
                  <button onClick={() => resolve(false)} style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>❌ Wrong — Miss</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}