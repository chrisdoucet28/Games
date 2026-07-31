// Tutorial mockup for CastleGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const CASTLE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Each turn, answer a question to power one of four actions — Sword for a quick free attack, Magic for a costly but powerful hit, Defend to raise a shield, or Focus to recover MP.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
        {[["🗡️", "Sword"], ["✨", "Magic"], ["🛡️", "Defend"], ["🔮", "Focus"]].map(([icon, label]) => (
          <div key={label} style={{ background: "#ECFDF5", border: "2px solid #059669", borderRadius: "10px", padding: "6px 10px", textAlign: "center" }}>
            <div style={{ fontSize: "16px" }}>{icon}</div>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#064E3B" }}>{label}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    narration: "Answer right and you pull it off. Get it wrong and your turn ends with nothing — so pick the action that matches what you're confident about.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>⚔️</div>
        <div style={{ fontWeight: 900, color: "#064E3B", fontSize: "14px", marginTop: "4px" }}>Team Red dealt 30 damage!</div>
      </div>
    ),
  },
  {
    narration: "Land a hit and you might turn up a healing apple for bonus HP. The last castle still standing wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🍎</div>
        <div style={{ fontWeight: 900, color: "#166534", fontSize: "13px", marginTop: "4px" }}>+15 HP bonus!</div>
      </div>
    ),
  },
];
