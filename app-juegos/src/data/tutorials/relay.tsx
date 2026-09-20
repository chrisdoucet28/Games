// Tutorial mockup for RelayGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const RELAY_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Every team has its own hidden word. One person from the team comes to the front and turns AWAY from the word — they have to work it out by asking questions.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "28px", marginBottom: "6px" }}>🙋</div>
        <div style={{ background: "#022C22", border: "2px solid #14B8A6", borderRadius: "10px", padding: "8px 14px", display: "inline-block", fontSize: "13px", fontWeight: 700, color: "#5EEAD4" }}>
          "???"
        </div>
      </div>
    ),
  },
  {
    narration: "They ask a yes/no question — or take a guess. The teacher (or, on phones, their teammates) knows the word and answers. Then it's the next team's turn.",
    visual: (
      <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#5EEAD4" }}>
        🙋 "Is it something you wear?" · 🧑‍🏫 "Yes!"
      </div>
    ),
  },
  {
    narration: "Guessed it? The team scores 10 points, the word is REVEALED, and the asker sits down — a teammate swaps in with a brand new word.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F0FDF4", border: "2px solid #22C55E", borderRadius: "10px", padding: "10px 14px", fontWeight: 700, color: "#14532D", fontSize: "13px" }}>
          Team Red guessed "jacket"! ✅ +10 — time to swap!
        </div>
      </div>
    ),
  },
  {
    narration: "On phones, everyone joins on their own phone. Teammates' phones show the word and hold the buttons; the asker's phone never shows it, and the turns rotate through everyone automatically.",
    visual: (
      <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#94A3B8" }}>
        📱 asker: "You're up!" · 📱 teammate: the word + buttons
      </div>
    ),
  },
  {
    narration: "Every team gets 10 questions in total. The team that works out the most words before they run out wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>🏁</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>10 questions per team — most words wins</div>
      </div>
    ),
  },
];
