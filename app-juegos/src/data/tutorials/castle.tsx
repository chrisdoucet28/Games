// Tutorial mockup for CastleGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const CASTLE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Every team has their own castle with HP (health points). Answer questions to attack other castles, defend your own, or recover — protect your castle and knock the others down!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🏰</div>
        <div style={{ fontWeight: 800, color: "#064E3B", fontSize: "12px", marginTop: "4px" }}>HP: 100/100</div>
      </div>
    ),
  },
  {
    narration: "Every turn, pick ONE of four actions. Each action uses a different kind of question: Sword = multiple choice, Magic = speaking, Defend = fix the mistake, Focus = finish the sentence.",
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
    narration: "If you chose Sword or Magic (an attack), pick WHICH team's castle to hit — this matters most when there are 3 or more teams.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>🏰</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#0891B2" }}>Blue</div>
        </div>
        <div style={{ textAlign: "center", background: "#FEF3C7", borderRadius: "8px", padding: "2px 6px" }}>
          <div style={{ fontSize: "20px" }}>🏰</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#92400E" }}>Green (target)</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Answer your question correctly to make the action work. Answer wrong, and your turn ends — nothing happens.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>⚔️</div>
        <div style={{ fontWeight: 900, color: "#064E3B", fontSize: "14px", marginTop: "4px" }}>Team Red dealt 30 damage!</div>
      </div>
    ),
  },
  {
    narration: "Magic hits much harder than Sword, but costs 50 MP — and you only start with 20 MP. Use Focus (no attack) to build your MP up before you can cast Magic.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#7C3AED" }}>🔮 Focus: +38 MP this turn</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#7C3AED", marginTop: "2px" }}>✨ Magic needs 50 MP to cast</div>
      </div>
    ),
  },
  {
    narration: "Defend doesn't attack anyone. It puts up a shield that HALVES the damage you take for your next 3 turns, plus a few points for you.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px" }}>🛡️</div>
        <div style={{ fontWeight: 800, color: "#0891B2", fontSize: "12px", marginTop: "4px" }}>Shield up — damage halved for 3 turns!</div>
      </div>
    ),
  },
  {
    narration: "Landing a hit sometimes drops a healing apple for bonus HP. Keep attacking and defending — the last castle still standing wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🍎</div>
        <div style={{ fontWeight: 900, color: "#166534", fontSize: "13px", marginTop: "4px" }}>+15 HP bonus!</div>
      </div>
    ),
  },
];
