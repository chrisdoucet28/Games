// Tutorial mockup for CardShuffleGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const CARDS_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Four cards take the stage — one hides a lucky star. Remember which one, if you can!",
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
    narration: "The ringmaster shuffles fast! Once they stop, each team picks a card and performs the speaking task revealed on it.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px" }}>🔀</div>
        <div style={{ fontSize: "12px", color: "#991B1B", fontWeight: 700, marginTop: "4px" }}>Cards shuffling...</div>
      </div>
    ),
  },
  {
    narration: "Land on the star card for 120 pts. Any other card still earns 30 pts for a good attempt.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>⭐</div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309" }}>120 pts</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>🂠</div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#7F1D1D" }}>30 pts</div>
        </div>
      </div>
    ),
  },
];
