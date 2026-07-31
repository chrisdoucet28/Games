// Tutorial mockup for HotSeatGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const HOTSEAT_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "One player turns away from the screen — everyone else on the team gives clues to help them guess the word. No spelling, and no saying the word itself!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#7C2D12", color: "#FDBA74", borderRadius: "12px", padding: "12px 20px", display: "inline-block", fontWeight: 900, fontSize: "16px" }}>
          🍌 banana
        </div>
        <div style={{ fontSize: "12px", color: "#B45309", fontWeight: 700, marginTop: "6px" }}>"It's yellow and monkeys love it!"</div>
      </div>
    ),
  },
  {
    narration: "Guess as many words as you can in 90 seconds — each correct word is worth 10 points.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>✅</div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>+10 pts</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>⏱️</div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309" }}>90s per turn</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Every team takes a turn each round, over 3 rounds — whoever has the most points when it's all done wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🏆</div>
        <div style={{ fontWeight: 900, color: "#7C2D12", fontSize: "13px", marginTop: "4px" }}>Round 3 of 3 — final scores!</div>
      </div>
    ),
  },
];
