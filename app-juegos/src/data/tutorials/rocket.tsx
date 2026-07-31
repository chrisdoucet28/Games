// Tutorial mockup for RocketFuelGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const ROCKET_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "At mission control, a word appears — use it correctly in your own original sentence. Every correct one adds fuel!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#EEF2FF", border: "2px solid #6366F1", borderRadius: "10px", padding: "10px 16px", display: "inline-block", fontWeight: 800, color: "#312E81", fontSize: "14px" }}>
          "already"
        </div>
        <div style={{ fontSize: "12px", color: "#4338CA", fontWeight: 700, marginTop: "6px" }}>"I have already finished my homework."</div>
      </div>
    ),
  },
  {
    narration: "Can't think of anything for a prompt? Skip it for a new one — no penalty. Nobody's fuel level is revealed until launch day, not even the scoreboard!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>⛽ ???</div>
        <div style={{ fontSize: "11px", color: "#6366F1", fontWeight: 700 }}>Fuel stays secret until launch</div>
      </div>
    ),
  },
  {
    narration: "Once every team has fuelled up, all rockets launch together — whoever fuelled the most flies highest and scores the most!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "28px" }}>🚀✨</div>
        <div style={{ fontWeight: 900, color: "#312E81", fontSize: "14px", marginTop: "4px" }}>Team Red's rocket flew the highest!</div>
      </div>
    ),
  },
];
