import { useState, useRef, useCallback, useEffect } from "react";
import type { GameProps, QuestionData } from "../../types";
import { teamsGridCols } from "../../data/constants";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { QuestionCard } from "../shared/QuestionCard";
import { denseRank, medalForRank } from "../../utils/ranking";

type ColDef = { letter: string; label: string; emoji: string };

// Battleship's whole identity is error-hunting — every square on every board is a
// "correct grammar mistakes" question. No other task type appears here; that variety
// belongs to other games now (Word Whack = choose the correct answer, King of the Hill =
// finish the sentence). Column letters just name board coordinates, they're not categories.
const BATTLESHIP_COLS_5: ColDef[] = ["A", "B", "C", "D", "E"].map(letter => (
  { letter, label: "Fix the mistake", emoji: "✏️" }
));
const BATTLESHIP_COLS_4: ColDef[] = ["A", "B", "C", "D"].map(letter => (
  { letter, label: "Fix the mistake", emoji: "✏️" }
));

function generateShipsNxN(cols: ColDef[]) {
  const all: string[] = [];
  [1, 2, 3, 4, 5].slice(0, cols.length).forEach(r => cols.forEach(c => all.push(c.letter + r)));
  const count = cols.length === 5 ? 7 : 5;
  return new Set(all.sort(() => Math.random() - 0.5).slice(0, count));
}

// Builds one independent question grid PER TEAM (rather than one grid shared by every
// board), pulling round-robin through a single shuffled "correct grammar mistakes" pool so
// the same coordinate on different teams' boards doesn't show the identical question, and
// each team's own board never repeats a question it's already used as long as the pool has
// enough supply. Every column shares this one pool now (Battleship is 100% mistake-
// correction) — when a board's demand exceeds the pool size, it wraps and repeats a mistake
// question rather than ever pulling in a different task type, so a column never silently
// shows the wrong kind of question just because the pool ran low.
function buildCoordMap(questions: QuestionData[], cols: ColDef[], teamIds: (string | number)[]) {
  const cgm = questions.filter(q => q.type === "correct grammar mistakes");
  const pool = (cgm.length ? cgm : questions).slice().sort(() => Math.random() - 0.5);

  const rows = cols.length;
  const qText = (q: any) => q.question || q.task || String(q);
  let cursor = 0;

  const perTeamMaps: Record<string | number, Record<string, QuestionData>> = {};
  teamIds.forEach(teamId => {
    const map: Record<string, QuestionData> = {};
    const usedOnThisBoard = new Set<string>();
    cols.forEach(col => {
      for (let r = 1; r <= rows; r++) {
        const coord = col.letter + r;
        let chosen: QuestionData | null = null;
        for (let attempt = 0; attempt < pool.length; attempt++) {
          const idx = cursor % pool.length;
          cursor++;
          const candidate = pool[idx];
          if (!usedOnThisBoard.has(qText(candidate))) { chosen = candidate; break; }
        }
        if (!chosen) { chosen = pool[cursor % pool.length]; cursor++; }
        map[coord] = chosen;
        usedOnThisBoard.add(qText(chosen));
      }
    });
    perTeamMaps[teamId] = map;
  });

  return perTeamMaps;
}

const AMBIENT_BITS = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 37) % 100,
  top: 35 + ((i * 23) % 60),
  size: 8 + (i % 4) * 3,
  dur: 4 + (i % 5),
  delay: (i % 6) * 0.5,
  emoji: i % 3 === 0 ? "✦" : "🫧",
}));

const STYLE_TAG = (
  <style>{`
    @keyframes bubbleDrift{0%{transform:translateY(0) scale(0.8);opacity:0}20%{opacity:0.5}100%{transform:translateY(-46px) scale(1.15);opacity:0}}
    @keyframes radarSweep{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    @keyframes sonarPing{0%{opacity:0.9;stroke-width:3}100%{opacity:0;stroke-width:0.5}}
    @keyframes explodeBurst{0%{transform:scale(0.3);opacity:1}55%{transform:scale(1.5);opacity:0.9}100%{transform:scale(1.9);opacity:0}}
    @keyframes explodeShake{0%,100%{transform:translate(0,0) scale(1)}20%{transform:translate(-2px,1px) scale(1.05)}40%{transform:translate(2px,-1px) scale(1.05)}60%{transform:translate(-1px,2px) scale(1.02)}80%{transform:translate(1px,-1px) scale(1.02)}}
    @keyframes splashRipple{0%{transform:scale(0.4);opacity:0.8}100%{transform:scale(2);opacity:0}}
    @keyframes targetGlow{0%,100%{box-shadow:0 0 0 3px rgba(96,165,250,0.45)}50%{box-shadow:0 0 0 7px rgba(96,165,250,0.75)}}
    @keyframes missileDrop{0%{transform:translateY(-64px) rotate(-25deg) scale(0.7);opacity:0}55%{transform:translateY(6px) rotate(10deg) scale(1.05);opacity:1}75%{transform:translateY(-4px) rotate(-4deg) scale(1)}100%{transform:translateY(0) rotate(0deg) scale(1);opacity:1}}
    @keyframes missileTrail{0%{opacity:0.6;transform:translateY(0) scaleY(1)}100%{opacity:0;transform:translateY(-18px) scaleY(0.4)}}
    @keyframes bshipToastIn{0%{opacity:0;transform:translate(-50%,10px)}12%{opacity:1;transform:translate(-50%,0)}88%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-6px)}}
    @keyframes bshipBannerIn{0%{opacity:0;transform:translate(-50%,-16px) scale(0.9)}15%{opacity:1;transform:translate(-50%,0) scale(1.03)}25%{transform:translate(-50%,0) scale(1)}85%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-10px) scale(0.96)}}
    .bship-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.1)}
    .bship-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
    .bship-cell:hover{filter:brightness(1.25)}
  `}</style>
);

function RadarBackdrop() {
  return (
    <div style={{ position: "absolute", top: "-70px", right: "-70px", width: "260px", height: "260px", opacity: 0.12, pointerEvents: "none" }}>
      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
        <circle cx="100" cy="100" r="90" fill="none" stroke="#60A5FA" strokeWidth="1" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="#60A5FA" strokeWidth="1" />
        <circle cx="100" cy="100" r="30" fill="none" stroke="#60A5FA" strokeWidth="1" />
        <line x1="100" y1="10" x2="100" y2="190" stroke="#60A5FA" strokeWidth="1" />
        <line x1="10" y1="100" x2="190" y2="100" stroke="#60A5FA" strokeWidth="1" />
        <g style={{ transformOrigin: "100px 100px", animation: "radarSweep 4s linear infinite" }}>
          <path d="M100,100 L100,10 A90,90 0 0,1 154,29 Z" fill="#60A5FA" opacity="0.55" />
        </g>
      </svg>
    </div>
  );
}

function AmbientBackdrop() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {AMBIENT_BITS.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: `${b.left}%`, top: `${b.top}%`, fontSize: `${b.size}px`, animation: `bubbleDrift ${b.dur}s ease-in-out infinite ${b.delay}s` }}>{b.emoji}</div>
      ))}
    </div>
  );
}

type CellFx = { teamId: string | number; coord: string; kind: "hit" | "miss"; key: number };
type Toast = { text: string; kind: "hit" | "water" | "wrong"; key: number };
type EliminationBanner = { teamName: string; color: string; key: number };

// What "Save & Exit" snapshots and "Resume" restores. Fleet layout MUST be included — hits/misses
// are just coordinate lists, meaningless without the exact same ship placement they were recorded
// against, so a snapshot missing fleets is treated as unusable rather than partially restored.
type BattleshipSnapshot = {
  hits: Record<string | number, string[]>;
  misses: Record<string | number, string[]>;
  activeTeamIdx: number;
  eliminationOrder: (string | number)[];
  fleets: Record<string | number, string[]>;
};

function validateBattleshipSnapshot(raw: unknown, teamIds: (string | number)[]): BattleshipSnapshot | undefined {
  const s = raw as Partial<BattleshipSnapshot> | null | undefined;
  if (!s || typeof s.fleets !== "object" || s.fleets === null) return undefined;
  if (typeof s.activeTeamIdx !== "number" || s.activeTeamIdx < 0 || s.activeTeamIdx >= teamIds.length) return undefined;
  if (!teamIds.every(id => Array.isArray(s.fleets![id]))) return undefined;
  return {
    fleets: s.fleets,
    hits: s.hits ?? {},
    misses: s.misses ?? {},
    activeTeamIdx: s.activeTeamIdx,
    eliminationOrder: s.eliminationOrder ?? [],
  };
}

export function BattleshipGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState }: GameProps) {
  const TURN_SECONDS = 25;
  const gameTitle = "Battleship";

  const COLS = teams.length === 2 ? BATTLESHIP_COLS_5 : BATTLESHIP_COLS_4;
  const ROWS = COLS.map((_, i) => i + 1);

  const resumed = useRef(validateBattleshipSnapshot(initialGameState, teams.map(t => t.id))).current;

  const coordMap = useRef(buildCoordMap(questions, COLS, teams.map(t => t.id))).current;
  const fleets = useRef(resumed?.fleets ?? Object.fromEntries(teams.map(t => [t.id, [...generateShipsNxN(COLS)]]))).current;

  const [hits, setHits] = useState<Record<string | number, string[]>>(() => resumed?.hits ?? Object.fromEntries(teams.map(t => [t.id, []])));
  const [misses, setMisses] = useState<Record<string | number, string[]>>(() => resumed?.misses ?? Object.fromEntries(teams.map(t => [t.id, []])));

  const [activeTeamIdx, setActiveTeamIdx] = useState(() => resumed?.activeTeamIdx ?? 0);
  // A resumed battle skips the intro screen and drops straight into target/coordinate selection
  // for whichever team was up, same as a fresh turn handoff would.
  const [phase, setPhase] = useState<"intro" | "pick-target" | "pick-coord" | "answer" | "gameover">(() => {
    if (!resumed) return "intro";
    return teams.length === 2 ? "pick-coord" : "pick-target";
  });
  const [targetTeamId, setTargetTeamId] = useState<string | number | null>(() => {
    if (!resumed || teams.length !== 2) return null;
    const activeId = teams[resumed.activeTeamIdx].id;
    return teams.find(t => t.id !== activeId)?.id ?? null;
  });
  const [pendingCoord, setPendingCoord] = useState<string | null>(null);
  const [showAns, setShowAns] = useState(false);
  const [cellFx, setCellFx] = useState<CellFx | null>(null);
  const [missile, setMissile] = useState<{ teamId: string | number; coord: string } | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [elimBanner, setElimBanner] = useState<EliminationBanner | null>(null);
  const fxIdRef = useRef(0);
  const eliminationOrderRef = useRef<(string | number)[]>(resumed?.eliminationOrder ?? []);
  // Whether the gameover screen was reached by a genuine full elimination (one fleet left) or
  // by the top-bar End Game button cutting the battle short with several fleets still afloat —
  // the two cases need different framing, since "last fleet standing" only makes sense for the
  // first one.
  const [interrupted, setInterrupted] = useState(false);

  const activeTeam = teams[activeTeamIdx];
  const currentQ = (pendingCoord && targetTeamId !== null) ? coordMap[targetTeamId]?.[pendingCoord] : null;

  const spawnCellFx = (teamId: string | number, coord: string, kind: "hit" | "miss") => {
    const key = fxIdRef.current++;
    setCellFx({ teamId, coord, kind, key });
    setTimeout(() => setCellFx(prev => (prev?.key === key ? null : prev)), 700);
  };

  const showToast = (text: string, kind: Toast["kind"]) => {
    const key = fxIdRef.current++;
    setToast({ text, kind, key });
    setTimeout(() => setToast(prev => (prev?.key === key ? null : prev)), 2400);
  };

  const showElimination = (teamName: string, color: string) => {
    const key = fxIdRef.current++;
    setElimBanner({ teamName, color, key });
    setTimeout(() => setElimBanner(prev => (prev?.key === key ? null : prev)), 3200);
  };

  const isEliminated = useCallback((teamId: string | number, hitsOverride?: Record<string | number, string[]>) => {
    const h = hitsOverride || hits;
    return fleets[teamId].every((s: string) => (h[teamId] || []).includes(s));
  }, [hits, fleets]);

  useEffect(() => {
    if (!forceFinalRef) return;
    if (phase === "gameover") { forceFinalRef.current = null; return; }
    forceFinalRef.current = () => {
      // Always show Battleship's own end screen, same as every other game — "last fleet
      // standing" narrative if the battle actually finished, otherwise a ranked-by-ships-
      // remaining summary if the top-bar button cut it short with several fleets still afloat.
      const survivors = teams.filter(t => !isEliminated(t.id));
      setInterrupted(survivors.length !== 1);
      setPhase("gameover");
      return true;
    };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase, teams, isEliminated]);

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): BattleshipSnapshot => ({
      hits, misses, activeTeamIdx, eliminationOrder: eliminationOrderRef.current, fleets,
    });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, hits, misses, activeTeamIdx, fleets]);

  const advanceTurn = useCallback((hitsOverride?: Record<string | number, string[]>) => {
    setShowAns(false);
    setPendingCoord(null);
    let next = (activeTeamIdx + 1) % teams.length;
    let tries = 0;
    while (isEliminated(teams[next].id, hitsOverride) && tries < teams.length) {
      next = (next + 1) % teams.length;
      tries++;
    }
    setActiveTeamIdx(next);
    if (teams.length === 2) {
      // Only one possible opponent in a 1v1 — skip the pointless "choose a team" step.
      const opponent = teams.find(t => t.id !== teams[next].id)!;
      setTargetTeamId(opponent.id);
      setPhase("pick-coord");
    } else {
      setTargetTeamId(null);
      setPhase("pick-target");
    }
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
    const targetTeam = teams.find(t => t.id === targetTeamId)!;
    const isShip = fleets[targetTeamId].includes(pendingCoord);
    let newHits = hits;

    if (correct && isShip) {
      newHits = { ...hits, [targetTeamId]: [...(hits[targetTeamId] || []), pendingCoord] };
      setHits(newHits);
      spawnCellFx(targetTeamId, pendingCoord, "hit");
      onUpdateScore(activeTeam.id, 60);
      showToast(`💥 ${activeTeam.name} HIT ${targetTeam.name}'s ship at ${pendingCoord}!`, "hit");

      const wasEliminated = isEliminated(targetTeamId);
      const justEliminated = !wasEliminated && isEliminated(targetTeamId, newHits);
      if (justEliminated) {
        eliminationOrderRef.current.push(targetTeamId);
        showElimination(targetTeam.name, targetTeam.color.bg);
        const remaining = teams.filter(t => !isEliminated(t.id, newHits));
        if (remaining.length <= 1) {
          // Let the elimination banner actually be seen on the board before cutting to the
          // game-over summary screen — otherwise the banner and the summary would both try to
          // render in the same instant and only the summary (a separate early-return) would show.
          setTimeout(() => setPhase("gameover"), 1700);
          return;
        }
      }
    } else if (correct && !isShip) {
      setMisses(m => ({ ...m, [targetTeamId]: [...(m[targetTeamId] || []), pendingCoord] }));
      spawnCellFx(targetTeamId, pendingCoord, "miss");
      onUpdateScore(activeTeam.id, 15);
      showToast(`🌊 ${activeTeam.name} fired at ${pendingCoord} — splash, no ship there!`, "water");
    } else {
      setMisses(m => ({ ...m, [targetTeamId]: [...(m[targetTeamId] || []), pendingCoord] }));
      spawnCellFx(targetTeamId, pendingCoord, "miss");
      showToast(`❌ ${activeTeam.name} got the question wrong — shot goes wide!`, "wrong");
    }
    advanceTurn(newHits);
  };

  const launchMissile = (correct: boolean) => {
    if (targetTeamId === null || pendingCoord === null) return;
    setMissile({ teamId: targetTeamId, coord: pendingCoord });
    setTimeout(() => { resolve(correct); setMissile(null); }, 550);
  };

  const isSpeakingTask = currentQ?.type === "speaking task";
  const colColor = (letter: string) => {
    const idx = COLS.findIndex(c => c.letter === letter);
    const palette = ["#7C3AED", "#0891B2", "#059669", "#D97706", "#DC2626"];
    return palette[idx] ?? "#6366F1";
  };

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% -10%,#1E40AF 0%,#0C1B3A 45%,#020617 100%)",
  };

  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      <AmbientBackdrop />
      <RadarBackdrop />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(160deg,#1E3A8A,#0C1B3A)", border: "2px solid #60A5FA55", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "520px", margin: "0 auto 10px", boxShadow: "0 0 50px rgba(37,99,235,0.4)" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>⚓</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#93C5FD" }}>{gameTitle}</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
            Each team has a hidden fleet of ships on their ocean grid.<br />
            On your turn: <strong style={{ color: "#93C5FD" }}>pick an enemy team</strong>, then <strong style={{ color: "#93C5FD" }}>fire at a square</strong>.<br />
            Every square is <strong style={{ color: "#93C5FD" }}>find-and-fix-the-mistake</strong> — answer correctly to fire!<br />
            Hit a ship = <strong style={{ color: "#FCA5A5" }}>+60 pts</strong>. Hit water and answer = <strong style={{ color: "#FCD34D" }}>+15 pts</strong>.<br />
            Sink all of a team's ships to eliminate them. Last fleet wins!
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          {teams.map(t => (<div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#0C1B3A)`, border: "3px solid " + t.color.bg, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: "white" }}>{t.color.emoji} {t.name}</div>))}
        </div>
        <button onClick={() => {
          if (teams.length === 2) {
            // Only one possible opponent in a 1v1 — skip the pointless "choose a team" step.
            const opponent = teams.find(t => t.id !== activeTeam.id)!;
            setTargetTeamId(opponent.id);
            setPhase("pick-coord");
          } else {
            setPhase("pick-target");
          }
        }} className="bship-btn" style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(37,99,235,0.5)", transition: "transform 0.15s ease" }}>
          ⚓ Battle Stations!
        </button>
      </div>
    </div>
  );

  if (phase === "gameover") {
    if (interrupted) {
      // The battle was cut short with several fleets still afloat (the top-bar End Game button,
      // usually because the class ran out of time) — there's no fair "last fleet standing" to
      // declare, so rank everyone by how much of their fleet survived instead.
      const shipsRemaining = (t: typeof teams[number]) => fleets[t.id].length - (hits[t.id] || []).length;
      const ranking = denseRank(teams, shipsRemaining).sort((a, b) => b.value - a.value);
      return (
        <div style={{ ...arenaStyle, textAlign: "center" }}>
          <AmbientBackdrop />
          {STYLE_TAG}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "48px", marginBottom: "6px" }}>⚓</div>
            <div style={{ fontWeight: "900", fontSize: "24px", color: "#93C5FD", marginBottom: "4px", textShadow: "0 0 24px rgba(96,165,250,0.6)" }}>
              Battle cut short — final standings
            </div>
            <div style={{ color: "#94A3B8", fontSize: "14px", marginBottom: "20px" }}>Ranked by how much of each fleet is still afloat.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "420px", margin: "0 auto 24px" }}>
              {ranking.map(({ item: t, rank, value }) => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: rank === 0 ? `linear-gradient(160deg,${t.color.dark}66,#0C1B3A)` : "linear-gradient(160deg,#1F2937,#0B0F17)",
                  border: `2px solid ${rank === 0 ? t.color.bg : "#4B5563"}`, borderRadius: "14px", padding: rank === 0 ? "12px 16px" : "10px 16px",
                  opacity: rank === 0 ? 1 : 0.85,
                }}>
                  <span style={{ fontSize: rank === 0 ? "24px" : "20px" }}>{medalForRank(rank)}</span>
                  <span style={{ flex: 1, textAlign: "left", fontWeight: rank === 0 ? "900" : "800", color: rank === 0 ? "white" : "#D1D5DB", fontSize: rank === 0 ? "16px" : "15px" }}>{t.mascot ?? t.color.emoji} {t.name}</span>
                  <span style={{ fontWeight: "800", color: rank === 0 ? "#93C5FD" : "#6B7280", fontSize: "13px" }}>{value}/{fleets[t.id].length} ships left</span>
                </div>
              ))}
            </div>
            <button onClick={onEnd} className="bship-btn" style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)", color: "white", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(37,99,235,0.5)", transition: "transform 0.15s ease" }}>🏁 End Game</button>
          </div>
        </div>
      );
    }
    // The winner is whichever team was never eliminated — not whoever currently has the most
    // accumulated score, which may belong to a team that dominated an earlier game entirely.
    const winnerTeam = teams.find(t => !eliminationOrderRef.current.includes(t.id))!;
    const rankedLosers = [...eliminationOrderRef.current].reverse().map(id => teams.find(t => t.id === id)!);
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <AmbientBackdrop />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "48px", marginBottom: "6px" }}>🏆</div>
          <div style={{ fontWeight: "900", fontSize: "24px", color: "#93C5FD", marginBottom: "4px", textShadow: "0 0 24px rgba(96,165,250,0.6)" }}>
            {winnerTeam.mascot ?? winnerTeam.color.emoji} {winnerTeam.name}'s fleet wins the battle!
          </div>
          <div style={{ color: "#94A3B8", fontSize: "14px", marginBottom: "20px" }}>Last fleet still afloat — every other team was sunk.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "420px", margin: "0 auto 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: `linear-gradient(160deg,${winnerTeam.color.dark}66,#0C1B3A)`, border: `2px solid ${winnerTeam.color.bg}`, borderRadius: "14px", padding: "12px 16px" }}>
              <span style={{ fontSize: "24px" }}>🥇</span>
              <span style={{ flex: 1, textAlign: "left", fontWeight: "900", color: "white", fontSize: "16px" }}>{winnerTeam.mascot ?? winnerTeam.color.emoji} {winnerTeam.name}</span>
              <span style={{ fontWeight: "800", color: "#93C5FD", fontSize: "13px" }}>SURVIVED</span>
            </div>
            {rankedLosers.map((t, i) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "linear-gradient(160deg,#1F2937,#0B0F17)", border: "2px solid #4B5563", borderRadius: "14px", padding: "10px 16px", opacity: 0.85 }}>
                <span style={{ fontSize: "20px" }}>{i === 0 ? "💀" : "☠️"}</span>
                <span style={{ flex: 1, textAlign: "left", fontWeight: "800", color: "#D1D5DB", fontSize: "15px" }}>{t.mascot ?? t.color.emoji} {t.name}</span>
                <span style={{ fontWeight: "700", color: "#6B7280", fontSize: "12px" }}>SUNK</span>
              </div>
            ))}
          </div>
          <button onClick={onEnd} className="bship-btn" style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)", color: "white", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(37,99,235,0.5)", transition: "transform 0.15s ease" }}>🏁 End Game</button>
        </div>
      </div>
    );
  }

  return (
    <div style={arenaStyle}>
      <AmbientBackdrop />
      <RadarBackdrop />
      {STYLE_TAG}
      {elimBanner && (
        <div key={elimBanner.key} style={{
          position: "absolute", top: "14px", left: "50%", zIndex: 20, whiteSpace: "nowrap",
          background: `linear-gradient(135deg,${elimBanner.color},#7F1D1D)`, border: "2px solid #FCA5A5",
          borderRadius: "14px", padding: "12px 24px", boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
          animation: "bshipBannerIn 3.2s ease-in-out forwards",
        }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
            ☠️ {elimBanner.teamName}'s fleet is SUNK — eliminated!
          </span>
        </div>
      )}
      {toast && (
        <div key={toast.key} style={{
          position: "absolute", bottom: "10px", left: "50%", zIndex: 20, whiteSpace: "nowrap",
          background: "#0C1B3A", border: `2px solid ${toast.kind === "hit" ? "#EF4444" : toast.kind === "water" ? "#60A5FA" : "#94A3B8"}`,
          borderRadius: "10px", padding: "8px 18px", boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
          animation: "bshipToastIn 2.4s ease-in-out forwards",
        }}>
          <span style={{ color: "white", fontWeight: "800", fontSize: "13px" }}>{toast.text}</span>
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid #EF444488", boxShadow: "0 0 10px #EF444433", color: "white", borderRadius: "10px", padding: "6px 16px", fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>✏️</span>
            <span style={{ opacity: 0.9 }}>Every square hides a mistake to correct</span>
          </div>
        </div>

        <div style={{ background: `linear-gradient(90deg,${activeTeam.color.dark},${activeTeam.color.bg})`, borderRadius: "14px", padding: "10px 16px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", boxShadow: `0 4px 18px ${activeTeam.color.bg}55` }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "17px", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
            ⚓ {activeTeam.mascot ?? activeTeam.color.emoji} {activeTeam.name} —{" "}
            {phase === "pick-target" && "Choose a team to attack!"}
            {phase === "pick-coord" && `Targeting ${teams.find(t => t.id === targetTeamId)?.name} — pick a square!`}
            {phase === "answer" && `Firing at ${teams.find(t => t.id === targetTeamId)?.name} — ${pendingCoord}!`}
          </span>
          {(phase === "pick-target" || phase === "pick-coord") && <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS} />}
        </div>

        {phase === "pick-target" && (
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "14px" }}>
            {teams.filter(t => t.id !== activeTeam.id).map(t => (
              <button key={t.id} onClick={() => pickTarget(t.id)} disabled={isEliminated(t.id)} className="bship-btn" style={{
                background: isEliminated(t.id) ? "#1F2937" : `linear-gradient(160deg,${t.color.bg},${t.color.dark})`,
                color: isEliminated(t.id) ? "#6B7280" : "white",
                border: "none", borderRadius: "12px", padding: "10px 20px", transition: "transform 0.15s ease",
                fontWeight: "800", fontSize: "15px", cursor: isEliminated(t.id) ? "not-allowed" : "pointer",
                boxShadow: isEliminated(t.id) ? "none" : `0 0 14px ${t.color.bg}66`,
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
                position: "relative", overflow: "hidden",
                background: eliminated ? "linear-gradient(160deg,#1F2937,#0B0F17)" : `linear-gradient(160deg,${team.color.dark}44,#050B1A)`,
                border: `2px solid ${isTarget ? "#60A5FA" : eliminated ? "#4B5563" : team.color.bg}`,
                borderRadius: "18px", padding: "14px", opacity: eliminated ? 0.65 : 1,
                boxShadow: isTarget ? "0 0 0 3px rgba(96,165,250,0.45)" : `0 0 10px ${team.color.bg}33`,
                animation: isTarget ? "targetGlow 1.4s ease-in-out infinite" : "none",
                transition: "all 0.25s"
              }}>
                <div style={{ background: eliminated ? "#4B5563" : isActive ? team.color.bg : isTarget ? "#2563EB" : `${team.color.bg}CC`, borderRadius: "10px", padding: "8px 12px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "900", fontSize: "13px", color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
                    {eliminated ? "💀 SUNK" : isActive ? `🚢 ${team.name}` : isTarget ? `🎯 ${team.name}` : `🛡️ ${team.name}`}
                  </span>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", display: "flex", gap: "2px", alignItems: "center" }}>
                    {Array.from({ length: totalShips }).map((_, i) => (
                      <span key={i} style={{
                        fontSize: "12px", display: "inline-block",
                        transition: "transform 0.4s ease, opacity 0.4s ease",
                        transform: i < shipsLeft ? "rotate(0deg)" : "rotate(35deg)",
                        opacity: i < shipsLeft ? 1 : 0.3,
                      }}>🚢</span>
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
                        <div style={{ width: "18px", textAlign: "center", fontWeight: "800", fontSize: "11px", color: "#93C5FD", flexShrink: 0 }}>{r}</div>
                        {COLS.map(col => {
                          const coord = col.letter + r;
                          const isHit = teamHits.includes(coord);
                          const isMiss = teamMisses.includes(coord);
                          const isPending = pendingCoord === coord && isTarget;
                          const isMissileHere = missile !== null && missile.teamId === team.id && missile.coord === coord;
                          const canFire = phase === "pick-coord" && isTarget && !isHit && !isMiss && !eliminated && !isActive;
                          const fx = cellFx && cellFx.teamId === team.id && cellFx.coord === coord ? cellFx : null;
                          return (
                            <button key={coord} onClick={() => canFire && pickCoord(coord)} className="bship-cell" style={{
                              position: "relative", width: "34px", height: "34px", border: "none", borderRadius: "6px", fontSize: "14px", cursor: canFire ? "pointer" : "default", transition: "all 0.15s",
                              transform: isPending ? "scale(1.18)" : canFire ? "scale(1.02)" : "scale(1)",
                              background: isHit ? "linear-gradient(135deg,#EF4444,#7F1D1D)" : isMiss ? "linear-gradient(135deg,#334155,#1E293B)" : isPending ? "linear-gradient(135deg,#FCD34D,#F59E0B)" : canFire ? `linear-gradient(135deg,${colColor(col.letter)}55,${colColor(col.letter)}22)` : "linear-gradient(135deg,#1E3A5F,#0F2440)",
                              boxShadow: isPending ? "0 0 12px #FCD34D" : isHit ? "0 2px 8px #EF444470" : "none", outline: canFire ? `2px solid ${colColor(col.letter)}99` : "none",
                              animation: fx?.kind === "hit" ? "explodeShake 0.45s ease-in-out" : "none",
                              overflow: "visible",
                            }}>
                              {isHit ? "💥" : isMiss ? "·" : (isPending && !isMissileHere) ? "🎯" : "🌊"}
                              {isMissileHere && (
                                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                                  <span style={{ position: "absolute", top: "-6px", fontSize: "9px", animation: "missileTrail 0.4s ease-out infinite" }}>💨</span>
                                  <span style={{ fontSize: "18px", display: "inline-block", animation: "missileDrop 0.55s cubic-bezier(.3,.6,.4,1)" }}>{activeTeam.mascot ?? "🚀"}</span>
                                </span>
                              )}
                              {fx?.kind === "hit" && (
                                <span style={{ position: "absolute", inset: "-8px", pointerEvents: "none" }}>
                                  <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle,#FCA5A5AA,transparent 70%)", animation: "explodeBurst 0.6s ease-out forwards" }} />
                                </span>
                              )}
                              {fx?.kind === "miss" && (
                                <span style={{ position: "absolute", inset: "-6px", borderRadius: "50%", border: "2px solid #94A3B8", pointerEvents: "none", animation: "splashRipple 0.6s ease-out forwards" }} />
                              )}
                              {isPending && !isMissileHere && (
                                <svg style={{ position: "absolute", inset: "-10px", pointerEvents: "none" }} viewBox="0 0 54 54">
                                  <circle cx="27" cy="27" r="22" fill="none" stroke="#FCD34D" strokeWidth="2" style={{ animation: "sonarPing 1.1s ease-out infinite" }} />
                                </svg>
                              )}
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
              <span style={{ fontWeight: "700", color: "#DBEAFE", fontSize: "14px" }}>
                Answer correctly to fire at <strong>{teams.find(t => t.id === targetTeamId)?.name}</strong>!
              </span>
            </div>

            {missile ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "40px", animation: "explodeShake 0.3s ease-in-out infinite" }}>{activeTeam.mascot ?? "🚀"}</div>
                <div style={{ fontWeight: "900", color: "#FCD34D", fontSize: "16px", marginTop: "6px" }}>Incoming!</div>
              </div>
            ) : isSpeakingTask ? (
              <div style={{ background: "#0F2440", border: "3px solid #60A5FA", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#93C5FD", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>🗣️ Speaking Challenge</div>
                <div style={{ fontSize: "clamp(15px,2.5vw,19px)", fontWeight: "800", color: "white", lineHeight: 1.5, marginBottom: "16px" }}>{currentQ.question}</div>
                <p style={{ color: "#93C5FD", fontSize: "13px", marginBottom: "14px" }}>Team speaks their answer — teacher judges.</p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button onClick={() => launchMissile(true)} className="bship-btn" style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>✅ Good! FIRE!</button>
                  <button onClick={() => launchMissile(false)} className="bship-btn" style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>❌ Not quite — Miss</button>
                </div>
              </div>
            ) : (
              <>
                <QuestionCard question={currentQ} showAnswer={showAns} onReveal={() => setShowAns(true)} />
                {showAns && (
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" }}>
                    <button onClick={() => launchMissile(true)} className="bship-btn" style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>✅ Correct! FIRE!</button>
                    <button onClick={() => launchMissile(false)} className="bship-btn" style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>❌ Wrong — Miss</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
