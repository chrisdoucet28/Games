// Tutorial mockup for MinefieldGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// Mirrors MinefieldGame.tsx's real 5x5 grid: column headers are subjects, row headers are verb
// prompts, and picking a tile combines that column + row into one sentence to complete and speak.
const COLS = ["I", "She", "They", "We", "He"];
const ROWS = ["go", "eat", "see", "buy", "write"];

const MineGrid = ({ pick, boom, safe }: { pick?: [number, number]; boom?: [number, number]; safe?: [number, number] }) => (
  <div style={{ display: "inline-block" }}>
    <div style={{ display: "grid", gridTemplateColumns: "34px repeat(5, 24px)", gap: "3px", marginBottom: "3px" }}>
      <div />
      {COLS.map(c => <div key={c} style={{ fontSize: "8px", fontWeight: 800, color: "#4C1D95", textAlign: "center" }}>{c}</div>)}
    </div>
    {ROWS.map((r, ri) => (
      <div key={r} style={{ display: "grid", gridTemplateColumns: "34px repeat(5, 24px)", gap: "3px", marginBottom: "3px" }}>
        <div style={{ fontSize: "8px", fontWeight: 800, color: "#4C1D95", display: "flex", alignItems: "center" }}>{r}</div>
        {COLS.map((_, ci) => {
          const isPick = pick && pick[0] === ci && pick[1] === ri;
          const isBoom = boom && boom[0] === ci && boom[1] === ri;
          const isSafe = safe && safe[0] === ci && safe[1] === ri;
          const bg = isBoom ? "linear-gradient(135deg,#EF4444,#B91C1C)" : isSafe ? "linear-gradient(135deg,#22C55E,#15803D)" : isPick ? "linear-gradient(135deg,#FCD34D,#F59E0B)" : "linear-gradient(135deg,#6366F1,#4338CA)";
          return (
            <div key={ci} style={{ width: "24px", height: "24px", borderRadius: "5px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>
              {isBoom ? "💥" : isSafe ? "✅" : isPick ? "❓" : ""}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

export const MINEFIELD_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "This is the minefield. Each column at the top is a subject, like 'She' or 'They'. Each row on the side is a verb prompt, like 'go' or 'eat'. 7 of the 25 tiles are hidden mines — you don't know which ones yet!",
    visual: <MineGrid />,
  },
  {
    narration: "On your turn, pick ONE hidden tile. That tile combines its column subject with its row prompt into one sentence you must complete.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <MineGrid pick={[1, 0]} />
        <div style={{ fontSize: "11px", color: "#4C1D95", fontWeight: 800, marginTop: "4px" }}>She + go = "She ___ (go) to..."</div>
      </div>
    ),
  },
  {
    narration: "Say the complete sentence out loud, using the correct verb form. The teacher listens and judges whether it's right.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F5F3FF", border: "2px solid #7C3AED", borderRadius: "10px", padding: "8px 14px", fontWeight: 700, color: "#4C1D95", fontSize: "12px" }}>
          "She went to the park yesterday."
        </div>
      </div>
    ),
  },
  {
    narration: "Correct, and it's NOT a mine: you earn +50 points, and that tile turns green and stays safe — it can't hurt anyone now.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <MineGrid safe={[1, 0]} />
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534", marginTop: "4px" }}>✅ +50 pts — tile is now safe!</div>
      </div>
    ),
  },
  {
    narration: "Wrong answer: you get 0 points, but nothing explodes. The tile just stays hidden, ready for another team to try later.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#9D174D" }}>❌ 0 pts — the tile stays hidden.</div>
      </div>
    ),
  },
  {
    narration: "If the tile you picked IS a hidden mine: BOOM! You lose 75 points, no matter what you said. Be careful which tiles you choose!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <MineGrid boom={[3, 2]} />
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#B91C1C", marginTop: "4px" }}>💥 -75 pts — that was a mine!</div>
      </div>
    ),
  },
  {
    narration: "Keep going until every safe tile has been found. The team with the most points when the field is clear wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>💣</div>
        <div style={{ fontWeight: 900, color: "#4C1D95", fontSize: "13px", marginTop: "4px" }}>18/18 safe tiles found!</div>
      </div>
    ),
  },
];
