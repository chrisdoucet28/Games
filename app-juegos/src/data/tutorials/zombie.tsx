// Tutorial mockup for ZombieSiegeGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const ZOMBIE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Everyone shares one house and one score. Each wave, a prompt appears — add a sentence to earn a barricade or a power-up, as many times as you like.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F0FDF4", border: "2px solid #65A30D", borderRadius: "12px", padding: "12px 16px", fontWeight: 700, color: "#365314", fontSize: "14px" }}>
          "The zombies were slow, but there were..."
        </div>
        <div style={{ fontSize: "12px", color: "#4D7C0F", fontWeight: 700, marginTop: "8px" }}>Add your sentence → 🧱 barricade earned!</div>
      </div>
    ),
  },
  {
    narration: "Bullets recharge on their own and auto-shoot zombies at the door. No bullet ready? It breaks a barricade instead.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "18px", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "26px" }}>🔫</div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#4D7C0F" }}>Bullet ready</div>
        </div>
        <div style={{ fontSize: "20px" }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "26px" }}>🧟💥</div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#4D7C0F" }}>Zombie down</div>
        </div>
      </div>
    ),
  },
  {
    narration: "2 axes per team are the last resort if a zombie breaks through. Clear the whole wave, and a bigger one begins.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🪓 🪓</div>
        <div style={{ fontWeight: 900, color: "#365314", fontSize: "14px", marginTop: "6px" }}>Wave 1 cleared!</div>
        <div style={{ color: "#4D7C0F", fontWeight: 700, fontSize: "12px" }}>Wave 2 incoming — tougher!</div>
      </div>
    ),
  },
];
