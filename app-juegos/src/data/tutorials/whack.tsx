// Tutorial mockup for WordWhackGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// A small, consistent "this part is made up" flag — sits on its own line below the example
// content (never inline beside it, which would throw off the content's own centering), since a
// student shouldn't mistake this sample question/answers for literally what they'll get.
function ExampleTag() {
  return (
    <div style={{ marginTop: "8px" }}>
      <span style={{ display: "inline-block", background: "#FDE68A", color: "#78350F", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
        Just an example
      </span>
    </div>
  );
}

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
    narration: "Word Whack is a quickfire multiple-choice game. A question appears, a few possible answers pop up as moles on a 6-hole board, and only one of them is correct.",
    visual: <HoleBoard moles={[null, null, null, null, null, null]} />,
  },
  {
    narration: "Here's what you do: whack (tap) the mole holding the correct answer before it ducks back down.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FEF3C7", border: "2px solid #D97706", borderRadius: "10px", padding: "8px 14px", fontWeight: 700, color: "#78350F", fontSize: "12px", marginBottom: "10px" }}>
          "___ you ever tried sushi?"
        </div>
        <HoleBoard moles={["Did", "Have", null, "Do", null, null]} />
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "Get it right and a new question appears right away, plus you earn points. Get it wrong and only that one mole disappears — the others, including the correct one, are still up for you to try.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "18px", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>🔨💥</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#3F6212", marginTop: "4px" }}>Right → +20 pts, next question</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <HoleBoard moles={["Have", null, null, "Do", null, null]} />
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#B45309", marginTop: "4px" }}>Wrong → that mole's gone, keep trying</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Chain correct hits without missing and you build a combo — each one in a row is worth more points. But one wrong whack, or a mole ducking away untouched, resets it back to zero.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "18px", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px" }}>🔥🔥🔥</div>
          <div style={{ color: "#84CC16", fontWeight: 800, fontSize: "12px", marginTop: "4px" }}>Combo x3 — next hit worth more</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px" }}>💨</div>
          <div style={{ fontWeight: 800, color: "#9CA3AF", fontSize: "11px", marginTop: "4px" }}>Miss → combo resets</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Each team gets 2 rounds of 90 seconds — moles duck faster as the clock runs down. Most points when time's up wins.",
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
