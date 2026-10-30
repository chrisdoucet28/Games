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

// A small, consistent "this part is made up" flag — sits on its own line below the example
// content (never inline beside it, which would throw off the content's own centering). The grid
// and its coordinates are real (every game uses A-E / 1-5) — this only ever flags the SENTENCE,
// since that's the part that depends on whatever topic the teacher picked for today's class.
function ExampleTag() {
  return (
    <div style={{ marginTop: "8px" }}>
      <span style={{ display: "inline-block", background: "#FDE68A", color: "#78350F", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
        Just an example
      </span>
    </div>
  );
}

export const BATTLESHIP_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Battleship is a hide-and-seek grammar game. Every team secretly has ships hidden somewhere on their own grid — you're trying to find and sink everyone else's before they sink yours.",
    visual: <OceanGrid />,
  },
  {
    narration: "Here's what you actually do: on your turn, pick which team to attack, then pick ONE square on their grid to fire at.",
    visual: <OceanGrid target="C3" />,
  },
  {
    narration: "Firing takes an answer first — a 'find and fix the mistake' question. But here's the twist: your answer decides your POINTS, not whether you hit anything. The ships are in fixed spots regardless of what you answer.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FEF2F2", border: "2px solid #EF4444", borderRadius: "10px", padding: "10px 16px", fontWeight: 700, color: "#7F1D1D", fontSize: "12px" }}>
          Find the mistake: "She go to school every day."
        </div>
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "If a ship is really on that square: it's always a hit, whether you got the grammar right or not — right answers just earn more.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <OceanGrid hit="C3" />
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#DC2626", marginTop: "4px" }}>💥 Hit! (a ship was really there)</div>
      </div>
    ),
  },
  {
    narration: "If there's no ship there: it's always a miss, even with a correct answer — though a correct answer still earns a little for trying.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <OceanGrid miss="D4" />
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#0891B2", marginTop: "4px" }}>🌊 Miss — just water there.</div>
      </div>
    ),
  },
  {
    narration: "The exact numbers, if you want them: a hit with a correct answer is worth the most, a hit on a wrong answer is worth half that, a correct answer on a miss earns a little for trying, and a wrong answer on a miss earns nothing.",
    visual: (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center", fontSize: "11px", fontWeight: 700, color: "#1E3A8A" }}>
        <div>💥 Hit + correct = <strong>60 pts</strong></div>
        <div>💥 Hit + wrong = <strong>30 pts</strong></div>
        <div>🌊 Miss + correct = <strong>15 pts</strong></div>
        <div>🌊 Miss + wrong = <strong>0 pts</strong></div>
      </div>
    ),
  },
  {
    narration: "Keep firing at a team until every one of their hidden ships is hit — that eliminates them. Last team with ships still afloat wins the battle.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🏆⚓</div>
        <div style={{ fontWeight: 900, color: "#1E3A8A", fontSize: "13px", marginTop: "4px" }}>Team Red's fleet wins the battle!</div>
      </div>
    ),
  },
];
