// Tutorial mockup for HotSeatGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const HOTSEAT_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "One player on the team turns away from the screen — they cannot see it. Everyone else on the team CAN see the word, and gives clues to help them guess.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🙈 ← 🙂🙂</div>
        <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 700, marginTop: "4px" }}>Guesser turns away, teammates see the word</div>
      </div>
    ),
  },
  {
    narration: "Teammates describe the word using OTHER words. Two rules: you cannot spell it out loud, and you cannot say the word itself!",
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
    narration: "As soon as the guesser says the correct word, tap Correct! You earn +10 points, and a brand new word appears right away.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>✅</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>+10 pts — next word appears!</div>
      </div>
    ),
  },
  {
    narration: "Can't think of a good clue for this word? Tap Skip. There's no penalty — a new word appears and you keep going.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>⏭️</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#B45309" }}>Skip — no penalty, try the next word</div>
      </div>
    ),
  },
  {
    narration: "Guess as many words as you can before the clock runs out. Each team's turn lasts 90 seconds.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>⏱️</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309" }}>90s per turn</div>
      </div>
    ),
  },
  {
    narration: "Every team takes a turn each round, over 3 rounds total. Whoever has the most points when it's all done wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🏆</div>
        <div style={{ fontWeight: 900, color: "#7C2D12", fontSize: "13px", marginTop: "4px" }}>Round 3 of 3 — final scores!</div>
      </div>
    ),
  },
];
