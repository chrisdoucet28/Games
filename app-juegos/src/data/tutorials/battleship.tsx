// Tutorial mockup for BattleshipGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// Mirrors BattleshipGame.tsx's real 5x5 grid (columns A-E, rows 1-5, used for 2-team games) —
// ships are single hidden squares, not multi-square boats, and stay hidden until fired on.
const OceanGrid = ({ target, hit, miss }: { target?: string; hit?: string; miss?: string }) => {
  const cols = ["A", "B", "C", "D", "E"];
  const cellFor = (coord: string) => {
    if (hit === coord) return { bg: "linear-gradient(135deg,#EF4444,#7F1D1D)", text: "💥" };
    if (miss === coord) return { bg: "linear-gradient(135deg,#334155,#1E293B)", text: "·" };
    if (target === coord) return { bg: "linear-gradient(135deg,#FCD34D,#F59E0B)", text: "🎯" };
    return { bg: "linear-gradient(135deg,#1E3A5F,#0F2440)", text: "🌊" };
  };
  return (
    <div style={{ display: "inline-block" }}>
      <div style={{ display: "grid", gridTemplateColumns: "18px repeat(5, 26px)", gap: "3px", marginBottom: "3px" }}>
        <div />
        {cols.map(c => <div key={c} style={{ fontSize: "9px", fontWeight: 800, color: "#1E3A8A", textAlign: "center" }}>{c}</div>)}
      </div>
      {[1, 2, 3, 4, 5].map(r => (
        <div key={r} style={{ display: "grid", gridTemplateColumns: "18px repeat(5, 26px)", gap: "3px", marginBottom: "3px" }}>
          <div style={{ fontSize: "9px", fontWeight: 800, color: "#1E3A8A", display: "flex", alignItems: "center" }}>{r}</div>
          {cols.map(c => {
            const coord = c + r;
            const { bg, text } = cellFor(coord);
            return (
              <div key={coord} style={{ width: "26px", height: "26px", borderRadius: "5px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
                {text}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const BATTLESHIP_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "The goal: every team hides ships somewhere on their own ocean grid. You try to find and sink the OTHER teams' hidden ships before they sink yours.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🚢🌊🔍</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#1E3A8A", marginTop: "4px" }}>Find the hidden ships!</div>
      </div>
    ),
  },
  {
    narration: "This is a team's ocean grid. Every square is labeled, like C3 (column C, row 3). Ships are hidden somewhere on this grid — you cannot see them.",
    visual: <OceanGrid />,
  },
  {
    narration: "On your turn: first, pick which enemy team to attack. Then, pick ONE square on their ocean to fire at.",
    visual: <OceanGrid target="C3" />,
  },
  {
    narration: "Every square has its own 'find and fix the mistake' question. You must answer it to fire — but read the next step carefully, because your answer does NOT decide hit or miss!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FEF2F2", border: "2px solid #EF4444", borderRadius: "10px", padding: "10px 16px", fontWeight: 700, color: "#7F1D1D", fontSize: "12px" }}>
          Find the mistake: "She go to school every day."
        </div>
      </div>
    ),
  },
  {
    narration: "If a real ship IS on that square: it is always a HIT, even if your answer was wrong. Correct answer = +60 pts. Wrong answer = still a hit, but only +30 pts.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <OceanGrid hit="C3" />
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#DC2626", marginTop: "4px" }}>💥 Hit! (a ship was really there)</div>
      </div>
    ),
  },
  {
    narration: "If there is NO ship on that square: it is always a MISS, even if your answer was correct. Correct answer = +15 pts for trying. Wrong answer = +0 pts.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <OceanGrid miss="D4" />
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#0891B2", marginTop: "4px" }}>🌊 Miss — just water there.</div>
      </div>
    ),
  },
  {
    narration: "Keep firing at a team until every one of their hidden ships is hit — that eliminates them! The last team with ships still afloat wins the battle.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🏆⚓</div>
        <div style={{ fontWeight: 900, color: "#1E3A8A", fontSize: "13px", marginTop: "4px" }}>Team Red's fleet wins the battle!</div>
      </div>
    ),
  },
];
