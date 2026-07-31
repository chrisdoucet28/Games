// Tutorial mockup for VaultHeistGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const VAULT_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Each team has their OWN vault with 5 locks. You are not attacking anyone — every team works on their own vault, side by side.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
        {["🔒", "🔒", "🔒", "🔒", "🔒"].map((l, i) => (
          <div key={i} style={{ fontSize: "22px" }}>{l}</div>
        ))}
      </div>
    ),
  },
  {
    narration: "Dice decide which team goes first. Then teams take turns cracking their own locks, one at a time.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px" }}>🎲</div>
        <div style={{ fontSize: "12px", color: "#7A5C1E", fontWeight: 700, marginTop: "4px" }}>Team Red rolls 5 — Team Red goes first!</div>
      </div>
    ),
  },
  {
    narration: "Before every question, a card shows the transform your lock needs, like NEGATIVE or QUESTION. This tells you exactly what kind of sentence to build.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg,#7A5C1E,#D4AF37)", color: "#1F1608", borderRadius: "10px", padding: "8px 16px", display: "inline-block", fontWeight: 900, fontSize: "13px", letterSpacing: "0.04em" }}>
          NEGATIVE
        </div>
      </div>
    ),
  },
  {
    narration: "Now build the sentence to match that card. NEGATIVE example: 'he / work / on Saturday' becomes 'He didn't work on Saturday.'",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "12px", color: "#7A5C1E", fontWeight: 700 }}>'he / work / on Saturday'</div>
        <div style={{ fontSize: "13px", color: "#3B0764", fontWeight: 800, marginTop: "4px" }}>→ "He didn't work on Saturday."</div>
      </div>
    ),
  },
  {
    narration: "Correct? The lock cracks open! Same team keeps going — right away, on the next lock.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
        {["🔓", "🔓", "🔒", "🔒", "🔒"].map((l, i) => (
          <div key={i} style={{ fontSize: "22px" }}>{l}</div>
        ))}
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#166534", marginLeft: "6px", alignSelf: "center" }}>2/5 cracked!</span>
      </div>
    ),
  },
  {
    narration: "Wrong? There is no partial credit. Your most recently cracked lock re-locks, and the turn passes to the next team.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
        {["🔓", "🔒", "🔒", "🔒", "🔒"].map((l, i) => (
          <div key={i} style={{ fontSize: "22px" }}>{l}</div>
        ))}
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#991B1B", marginLeft: "6px", alignSelf: "center" }}>Back to 1/5!</span>
      </div>
    ),
  },
  {
    narration: "Crack all 5 locks to finish your vault! The vault stays open until every team finishes, and finishing earns a bonus: 1st place gets +100, 2nd gets +50, 3rd gets +33, and so on.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🥇</div>
        <div style={{ fontWeight: 900, color: "#7A5C1E", fontSize: "14px", marginTop: "4px" }}>Team Red finished 1st! +100 bonus pts</div>
      </div>
    ),
  },
];
