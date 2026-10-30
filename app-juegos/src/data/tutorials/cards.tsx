// Tutorial mockup for CardShuffleGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// A small, consistent "this part is made up" flag — sits on its own line below the example
// content (never inline beside it, which would throw off the content's own centering), since the
// #1 confusion this tutorial exists to prevent is a student locking onto a specific demo task as
// if it's literally what they'll be asked, when it's really whatever topic the teacher picked.
function ExampleTag() {
  return (
    <div style={{ marginTop: "8px" }}>
      <span style={{ display: "inline-block", background: "#FDE68A", color: "#78350F", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
        Just an example
      </span>
    </div>
  );
}

export const CARDS_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Card Shuffle is a speaking game built on one secret: of four face-down cards, one secretly hides a star — and once the ringmaster shuffles them fast, nobody's sure anymore which one it is.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: "36px", height: "50px", borderRadius: "6px",
              background: i === 2 ? "linear-gradient(160deg,#B91C1C,#FCD34D)" : "linear-gradient(160deg,#991B1B,#450A0A)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
            }}>{i === 2 ? "⭐" : "🂠"}</div>
          ))}
        </div>
        <div style={{ fontSize: "12px", color: "#991B1B", fontWeight: 700 }}>🔀 Shuffling — now who can say which one's the star?</div>
      </div>
    ),
  },
  {
    narration: "Here's what you actually do: on your turn, pick ONE card. It flips over and reveals a speaking task for you to do out loud.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "56px", borderRadius: "6px", background: "linear-gradient(160deg,#FFFBEB,#FEF3C7)", border: "3px solid #D97706", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 800, color: "#78350F", padding: "4px", textAlign: "center" }}>
          Talk about your last holiday
        </div>
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "Perform the task out loud. Your teacher listens and decides whether it counts as a good attempt — nothing here is auto-graded.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🗣️👂</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#78350F", marginTop: "4px" }}>Teacher judges: good attempt?</div>
      </div>
    ),
  },
  {
    narration: "Get a teacher's approval and you score — land it on the STAR card for the big prize, or on any other card for a smaller one. No approval? Nothing happens, and it's straight to the next team with a fresh shuffle.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px" }}>⭐</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#B45309" }}>+120 pts</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px" }}>🂠</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#7F1D1D" }}>+30 pts</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px" }}>0️⃣</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#6B7280" }}>no approval</div>
        </div>
      </div>
    ),
  },
];
