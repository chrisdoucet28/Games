// Tutorial mockup for WordWhackGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// Mirrors WordWhackGame.tsx's real 6-hole board (2 rows of 3) with several moles up at once,
// each showing one possible answer — only one mole per round is the correct one.
const HoleBoard = ({ moles }: { moles: (string | null)[] }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 50px)", gap: "8px", justifyContent: "center" }}>
    {moles.map((text, i) => (
      <div key={i} style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#78350F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {text && (
          <div style={{
            width: "42px", height: "42px", borderRadius: "50%",
            background: text === "Have" ? "linear-gradient(135deg,#3F6212,#84CC16)" : "#EFEFEF",
            color: text === "Have" ? "#0F1A05" : "#4B5563",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "10px", border: text === "Have" ? "2px solid #84CC16" : "2px solid #D1D5DB",
          }}>
            {text}
          </div>
        )}
      </div>
    ))}
  </div>
);

export const WHACK_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "This is the board. It has 6 holes. A question appears at the top, like '___ you ever tried sushi?'",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FEF3C7", border: "2px solid #D97706", borderRadius: "10px", padding: "8px 14px", fontWeight: 700, color: "#78350F", fontSize: "12px", marginBottom: "10px" }}>
          "___ you ever tried sushi?"
        </div>
        <HoleBoard moles={[null, null, null, null, null, null]} />
      </div>
    ),
  },
  {
    narration: "Moles pop out of some of the holes. Each mole shows one possible answer, like 'Have', 'Did', or 'Do'. Only ONE mole has the correct answer!",
    visual: <HoleBoard moles={["Did", "Have", null, "Do", null, null]} />,
  },
  {
    narration: "Whack (tap) the mole with the CORRECT answer before it ducks back down. Correct = +20 points, and a brand new question appears right away.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🔨💥</div>
        <div style={{ fontWeight: 900, color: "#3F6212", fontSize: "14px", marginTop: "4px" }}>Whacked "Have" — correct! +20 pts</div>
      </div>
    ),
  },
  {
    narration: "If you whack the WRONG mole: only that one mole disappears. The others — including the correct one — are still up. Try again!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <HoleBoard moles={["Have", null, null, "Do", null, null]} />
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", marginTop: "4px" }}>❌ "Did" was wrong and is gone — "Have" is still there!</div>
      </div>
    ),
  },
  {
    narration: "Whack correct answers again and again without missing to build a COMBO. Each hit in a row is worth more: +20, then +25, then +30... up to +40 extra points per hit!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>🔥🔥🔥</div>
        <div style={{ color: "#84CC16", fontWeight: 800, fontSize: "13px", marginTop: "4px" }}>Combo x3 — next correct hit is worth +30!</div>
      </div>
    ),
  },
  {
    narration: "A wrong whack, or letting moles duck away with no hit, resets your combo back to 0. Start building it again from the next correct hit.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>💨</div>
        <div style={{ fontWeight: 800, color: "#9CA3AF", fontSize: "12px", marginTop: "4px" }}>Combo reset to 0</div>
      </div>
    ),
  },
  {
    narration: "Each team gets 2 rounds of 90 seconds. Moles duck faster as time runs out! Whack as many correct answers as you can before the clock hits 0. Most points wins.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F3F4F6", borderRadius: "999px", height: "10px", width: "100%", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(90deg,#84CC16,#EF4444)", height: "100%", width: "70%" }} />
        </div>
        <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 700, marginTop: "6px" }}>Time's running out — moles are quicker now!</div>
      </div>
    ),
  },
];
