// Tutorial mockup for RaceTrackGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const RACETRACK_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Every team sees the same task at once — tap whichever team answers first and correctly, and they roll the dice and race around the track!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FEF2F2", border: "2px solid #EF4444", borderRadius: "10px", padding: "10px 16px", fontWeight: 700, color: "#7F1D1D", fontSize: "13px" }}>
          "She ___ (go) to school every day."
        </div>
        <div style={{ fontSize: "22px", marginTop: "8px" }}>🎲</div>
      </div>
    ),
  },
  {
    narration: "The task ramps up as the leader advances: Error Fix → Multiple Choice → Fill Blank → Speaking — so everyone faces the same challenge as the frontrunner.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
        {["🔍", "🔤", "✏️", "🗣️"].map((e, i) => (
          <span key={i} style={{ fontSize: "18px" }}>{e}{i < 3 ? " →" : ""}</span>
        ))}
      </div>
    ),
  },
  {
    narration: "Land on special spaces for boosts, traps, coins, and shields — spend coins in the Shop on powerups. First to the finish line wins!",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        <span style={{ background: "#FBBF24", color: "#150F00", borderRadius: "8px", padding: "5px 10px", fontSize: "12px", fontWeight: 800 }}>⭐ boost</span>
        <span style={{ background: "#F87171", color: "#150F00", borderRadius: "8px", padding: "5px 10px", fontSize: "12px", fontWeight: 800 }}>⚠️ trap</span>
        <span style={{ background: "#FDE68A", color: "#150F00", borderRadius: "8px", padding: "5px 10px", fontSize: "12px", fontWeight: 800 }}>🪙 coin</span>
      </div>
    ),
  },
];
