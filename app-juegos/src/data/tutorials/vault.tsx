// Tutorial mockup for VaultHeistGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const VAULT_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Before every question, a card reveals which transformation your lock needs — then you rewrite the sentence to match it.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg,#7A5C1E,#D4AF37)", color: "#1F1608", borderRadius: "10px", padding: "8px 16px", display: "inline-block", fontWeight: 900, fontSize: "13px", letterSpacing: "0.04em" }}>
          NEGATIVE
        </div>
        <div style={{ marginTop: "8px", fontSize: "13px", color: "#7A5C1E", fontWeight: 700 }}>"She has finished." → rewrite it negative</div>
      </div>
    ),
  },
  {
    narration: "Correct? The lock cracks open and you keep going — same team, next lock. No partial credit, so accuracy is everything.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
        {["🔓", "🔓", "🔒", "🔒", "🔒"].map((l, i) => (
          <div key={i} style={{ fontSize: "22px" }}>{l}</div>
        ))}
      </div>
    ),
  },
  {
    narration: "Wrong? Your most recently cracked lock re-locks, and the turn passes to the next team.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
        {["🔓", "🔒", "🔒", "🔒", "🔒"].map((l, i) => (
          <div key={i} style={{ fontSize: "22px" }}>{l}</div>
        ))}
      </div>
    ),
  },
  {
    narration: "Dice decide who cracks first. Finish all 5 locks for a bonus — 1st place gets the most, 2nd gets half that, and so on — but the vault stays open until everyone finishes.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🎲</div>
        <div style={{ fontWeight: 900, color: "#7A5C1E", fontSize: "14px", marginTop: "4px" }}>🥇 Team Red finished 1st! +100 pts</div>
      </div>
    ),
  },
];
