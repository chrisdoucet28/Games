// Tutorial mockup for RelayGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const RELAY_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "One team's phone (or the shared screen) shows a word — held facing AWAY from that team, so they can't see it themselves.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "28px", marginBottom: "6px" }}>📱</div>
        <div style={{ background: "#022C22", border: "2px solid #14B8A6", borderRadius: "10px", padding: "8px 14px", display: "inline-block", fontSize: "13px", fontWeight: 700, color: "#5EEAD4" }}>
          "bicycle"
        </div>
      </div>
    ),
  },
  {
    narration: "Everyone else nearby CAN see it — teammates, or if it's a solo player, anyone from another team — and shouts clues, no spelling and no saying the word itself.",
    visual: (
      <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#5EEAD4" }}>
        📣 "You ride it!" · "It has two wheels!"
      </div>
    ),
  },
  {
    narration: "Guessed it? Tap \"Got it!\" — the team scores 10 points and the turn passes INSTANTLY to the next team, who get a brand new word right away.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F0FDF4", border: "2px solid #22C55E", borderRadius: "10px", padding: "10px 14px", fontWeight: 700, color: "#14532D", fontSize: "13px" }}>
          Got it! ✅ +10 pts — Now up: Team Blue!
        </div>
      </div>
    ),
  },
  {
    narration: "Too hard? Tap \"Skip\" — a new word appears for the SAME team, no penalty, no turn change. Keep trying until it clicks.",
    visual: (
      <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#94A3B8" }}>
        Skip → new word, same team's turn continues
      </div>
    ),
  },
  {
    narration: "Every team gets 5 turns total. Once everyone's had their last word, most points wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>🏁</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>5 turns per team — most points wins</div>
      </div>
    ),
  },
];
