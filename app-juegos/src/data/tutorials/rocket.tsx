// Tutorial mockup for RocketFuelGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const ROCKET_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "The goal: build up fuel for your team's rocket by making correct sentences. The team with the most fuel launches the highest at the end!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🚀⛽</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#312E81", marginTop: "4px" }}>More fuel = higher launch</div>
      </div>
    ),
  },
  {
    narration: "At mission control, a word appears (this is just an example — every prompt is different). Use the word correctly in your OWN original sentence, spoken out loud.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#EEF2FF", border: "2px solid #6366F1", borderRadius: "10px", padding: "10px 16px", display: "inline-block", fontWeight: 800, color: "#312E81", fontSize: "14px" }}>
          "already" <span style={{ fontWeight: 600, fontSize: "10px" }}>(example word)</span>
        </div>
        <div style={{ fontSize: "12px", color: "#4338CA", fontWeight: 700, marginTop: "6px" }}>"I have already finished my homework."</div>
      </div>
    ),
  },
  {
    narration: "Every correct sentence adds 1 fuel to your rocket, worth 20 points. You have 90 seconds on your turn to make as many correct sentences as you can.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>⛽ +1 fuel</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#4338CA", marginTop: "2px" }}>= +20 pts</div>
      </div>
    ),
  },
  {
    narration: "Can't think of anything for a prompt? Skip it and a new word appears — no penalty for skipping.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>⏭️</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#4338CA" }}>Skip — no penalty, try a new word</div>
      </div>
    ),
  },
  {
    narration: "Your fuel count stays secret the whole time — not even the scoreboard shows it. No one knows who is ahead until the very end!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>⛽ ???</div>
        <div style={{ fontSize: "11px", color: "#6366F1", fontWeight: 700 }}>Fuel stays secret until launch</div>
      </div>
    ),
  },
  {
    narration: "Once every team has had their turn, all rockets launch together! Points = fuel × 20, PLUS a bonus for how high you flew: 1st place +50, 2nd +30, 3rd +15, 4th +5.",
    visual: (
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "center", fontSize: "11px", fontWeight: 800, color: "#312E81" }}>
        <div>🥇 1st — fuel×20 + 50 bonus</div>
        <div>🥈 2nd — fuel×20 + 30 bonus</div>
      </div>
    ),
  },
  {
    narration: "The team that made the most correct sentences built the most fuel — and their rocket flies the highest!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "28px" }}>🚀✨</div>
        <div style={{ fontWeight: 900, color: "#312E81", fontSize: "14px", marginTop: "4px" }}>Team Red's rocket flew the highest!</div>
      </div>
    ),
  },
];
