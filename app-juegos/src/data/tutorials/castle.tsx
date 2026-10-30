// Tutorial mockup for CastleGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const CASTLE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Castle Siege is a battle game. Every team has their own castle, and the goal is simple: knock the other castles down while keeping yours standing — all by answering English questions.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🏰</div>
        <div style={{ fontWeight: 800, color: "#064E3B", fontSize: "12px", marginTop: "4px" }}>HP: 150/150</div>
      </div>
    ),
  },
  {
    narration: "Here's what you actually do: every turn, pick ONE of four actions. Sword and Magic attack another team; Defend protects yours; Focus powers you up for Magic later.",
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
    narration: "Choosing Sword or Magic means picking WHICH team's castle to hit first — worth thinking about once there are 3 or more teams in play.",
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
    narration: "Then answer the question that action gives you. Get it right and the action actually happens — an attack lands, a defense goes up. Get it wrong and nothing does; your turn just ends.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>⚔️</div>
        <div style={{ fontWeight: 900, color: "#064E3B", fontSize: "14px", marginTop: "4px" }}>Team Red's Sword landed!</div>
      </div>
    ),
  },
  {
    narration: "Magic hits much harder than Sword, but it costs MP you have to build up first — use Focus (no attack) to earn it before you can cast Magic.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#7C3AED" }}>🔮 Focus builds MP</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#7C3AED", marginTop: "2px" }}>✨ Magic needs enough MP saved up to cast</div>
      </div>
    ),
  },
  {
    narration: "Defend doesn't attack anyone — it puts up a shield that cuts the damage you take for the next few turns.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px" }}>🛡️</div>
        <div style={{ fontWeight: 800, color: "#0891B2", fontSize: "12px", marginTop: "4px" }}>Shield up — damage reduced for a few turns!</div>
      </div>
    ),
  },
  {
    narration: "Landing a hit sometimes drops a healing apple for bonus HP. Keep attacking and defending — the last castle still standing wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🍎</div>
        <div style={{ fontWeight: 900, color: "#166534", fontSize: "13px", marginTop: "4px" }}>+20 HP bonus!</div>
      </div>
    ),
  },
];
