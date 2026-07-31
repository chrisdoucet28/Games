// Tutorial mockup for CardShuffleGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const CARDS_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "4 cards are shown face up for a moment. One of them is secretly a Star card ⭐ — try to remember which one, if you can!",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: "36px", height: "50px", borderRadius: "6px",
            background: i === 2 ? "linear-gradient(160deg,#B91C1C,#FCD34D)" : "linear-gradient(160deg,#991B1B,#450A0A)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
          }}>{i === 2 ? "⭐" : "🂠"}</div>
        ))}
      </div>
    ),
  },
  {
    narration: "The ringmaster shuffles the cards face down, fast! Now no one can be sure anymore which card is the Star.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px" }}>🔀</div>
        <div style={{ fontSize: "12px", color: "#991B1B", fontWeight: 700, marginTop: "4px" }}>Cards shuffling...</div>
      </div>
    ),
  },
  {
    narration: "On your turn, pick ONE card. It flips over and reveals a speaking task for you to do out loud.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "56px", borderRadius: "6px", background: "linear-gradient(160deg,#FFFBEB,#FEF3C7)", border: "3px solid #D97706", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 800, color: "#78350F", padding: "4px", textAlign: "center" }}>
          Talk about your last holiday
        </div>
      </div>
    ),
  },
  {
    narration: "Perform the task revealed on your card, speaking out loud. The teacher listens and judges whether you did it well.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🗣️👂</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#78350F", marginTop: "4px" }}>Teacher judges: good attempt?</div>
      </div>
    ),
  },
  {
    narration: "If your card was the Star AND the teacher approved your answer: that's the big prize — +120 points!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>⭐</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309" }}>+120 pts</div>
      </div>
    ),
  },
  {
    narration: "If it was a normal card but the teacher still approved: you still earn points for a good attempt — +30 points.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>🂠</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#7F1D1D" }}>+30 pts</div>
      </div>
    ),
  },
  {
    narration: "If the teacher says it wasn't good enough — no matter which card — that's 0 points. Then it's the next team's turn, and the cards shuffle again!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>0️⃣</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280" }}>No approval = 0 pts, next team's turn</div>
      </div>
    ),
  },
];
