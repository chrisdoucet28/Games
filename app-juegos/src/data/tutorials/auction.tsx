// Tutorial mockup for AuctionGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const AUCTION_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Every team starts with a 200 point bank. This bank is NOT your score yet — it is separate, and you use it to bet.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>💰</div>
        <div style={{ fontWeight: 900, color: "#92400E", fontSize: "14px", marginTop: "4px" }}>Starting bank: 200 pts</div>
      </div>
    ),
  },
  {
    narration: "One sentence appears. Read it carefully. Is it grammatically correct, or is something wrong with it?",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F5F3FF", border: "2px solid #8B5CF6", borderRadius: "12px", padding: "14px 18px", fontWeight: 700, color: "#3B0764", fontSize: "15px" }}>
          "She have three cats."
        </div>
      </div>
    ),
  },
  {
    narration: "Each team secretly picks Correct or Incorrect, and secretly bets points from their bank on it. Bet at least 25 points, or go All In for a bigger risk.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
          <span style={{ background: "#DCFCE7", color: "#14532D", borderRadius: "999px", padding: "6px 14px", fontWeight: 800, fontSize: "13px" }}>✅ Correct?</span>
          <span style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: "999px", padding: "6px 14px", fontWeight: 800, fontSize: "13px" }}>❌ Incorrect?</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
          {["25", "50", "100", "All In"].map(v => (
            <div key={v} style={{
              background: v === "All In" ? "#FEF3C7" : "#EEF2FF",
              color: v === "All In" ? "#92400E" : "#3730A3",
              border: `2px solid ${v === "All In" ? "#F59E0B" : "#6366F1"}`,
              borderRadius: "10px", padding: "6px 12px", fontWeight: 800, fontSize: "12px",
            }}>{v}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    narration: "Once every team has bet, all bets and votes are revealed at the same time — no one can change their bet after seeing another team's choice.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🔔</div>
        <div style={{ fontWeight: 800, color: "#3B0764", fontSize: "13px", marginTop: "4px" }}>Reveal! Everyone shows their bet.</div>
      </div>
    ),
  },
  {
    narration: "Guessed right? You KEEP your bet — it stays in your bank. Guessed wrong? You LOSE your bet — it comes out of your bank.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>✅</div>
          <div style={{ fontWeight: 800, color: "#166534", fontSize: "12px" }}>Right — keep +50</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>❌</div>
          <div style={{ fontWeight: 800, color: "#991B1B", fontSize: "12px" }}>Wrong — lose -50</div>
        </div>
      </div>
    ),
  },
  {
    narration: "If your bank ever reaches 0, you sit out the next sentence — then you get 25 points so you can keep playing.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "18px" }}>🪙 0 pts</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400E", marginTop: "2px" }}>Sits out one round → gets +25 pts to restart</div>
      </div>
    ),
  },
  {
    narration: "This repeats for many sentences. At the very end of the game, whatever is left in your bank is added straight to your real score!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "18px" }}>💰 Final bank: 175 pts</div>
        <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534", marginTop: "2px" }}>→ +175 added to your score</div>
      </div>
    ),
  },
];
