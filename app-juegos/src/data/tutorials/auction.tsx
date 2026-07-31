// Tutorial mockup for AuctionGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const AUCTION_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "A sentence goes up for auction. Is it correct... or incorrect? Each team decides in secret.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F5F3FF", border: "2px solid #8B5CF6", borderRadius: "12px", padding: "14px 18px", fontWeight: 700, color: "#3B0764", fontSize: "15px" }}>
          "She have three cats."
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "12px" }}>
          <span style={{ background: "#DCFCE7", color: "#14532D", borderRadius: "999px", padding: "6px 14px", fontWeight: 800, fontSize: "13px" }}>✅ Correct?</span>
          <span style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: "999px", padding: "6px 14px", fontWeight: 800, fontSize: "13px" }}>❌ Incorrect?</span>
        </div>
      </div>
    ),
  },
  {
    narration: "Each team secretly bets points on their verdict — at least 25, or go All In for a bigger risk.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
        {["25", "50", "100", "All In"].map(v => (
          <div key={v} style={{
            background: v === "All In" ? "#FEF3C7" : "#EEF2FF",
            color: v === "All In" ? "#92400E" : "#3730A3",
            border: `2px solid ${v === "All In" ? "#F59E0B" : "#6366F1"}`,
            borderRadius: "10px", padding: "8px 14px", fontWeight: 800, fontSize: "13px",
          }}>{v}</div>
        ))}
      </div>
    ),
  },
  {
    narration: "Reveal! Guessed right? Keep your bet. Guessed wrong? It's gone. Your 200pt bank folds into your score at the end.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "30px", marginBottom: "6px" }}>✅</div>
        <div style={{ fontWeight: 900, color: "#14532D", fontSize: "16px" }}>Team Red guessed right!</div>
        <div style={{ color: "#166534", fontWeight: 700, fontSize: "14px", marginTop: "4px" }}>+50 pts kept</div>
      </div>
    ),
  },
];
