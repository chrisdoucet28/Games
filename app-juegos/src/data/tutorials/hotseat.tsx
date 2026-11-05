// Tutorial mockup for HotSeatGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// A small, consistent "this part is made up" flag — sits on its own line below the example
// content (never inline beside it, which would throw off the content's own centering), since a
// student shouldn't mistake "banana" for a literal word they'll actually get.
function ExampleTag() {
  return (
    <div style={{ marginTop: "8px" }}>
      <span style={{ display: "inline-block", background: "#FDE68A", color: "#78350F", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
        Just an example
      </span>
    </div>
  );
}

// Shared by all three variants below — describing, Correct, Skip, and the round/scoring structure
// never change by mode, only who's picked to guess and whose phone (if any) shows the word does.
const SHARED_STEPS: TutorialStep[] = [
  {
    narration: "Here's what you do: describe the word using OTHER words. Two rules — you can't spell it out loud, and you can't say the word itself.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#7C2D12", color: "#FDBA74", borderRadius: "12px", padding: "12px 20px", display: "inline-block", fontWeight: 900, fontSize: "16px" }}>
          🍌 banana
        </div>
        <div style={{ fontSize: "12px", color: "#B45309", fontWeight: 700, marginTop: "6px" }}>"It's yellow and monkeys love it!"</div>
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "The moment the guesser says it right, tap Correct — you earn points and a brand new word appears right away, so keep going fast.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>✅</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>Next word appears!</div>
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
    narration: "Every team takes a turn each round, over 3 rounds total. Whoever has the most points when it's all done wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🏆</div>
        <div style={{ fontWeight: 900, color: "#7C2D12", fontSize: "13px", marginTop: "4px" }}>Round 3 of 3 — final scores!</div>
      </div>
    ),
  },
];

// Screen mode: unchanged, classic "pass the room's attention" version — no phones involved.
export const HOTSEAT_SCREEN_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Hot Seat is a guessing game, racing the clock. One player — the guesser — turns away from the screen so they can't see it. Everyone else on the team CAN see the word, and has 90 seconds to get them to say it.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🙈 ← 🙂🙂</div>
        <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 700, marginTop: "4px" }}>Guesser turns away, teammates see the word</div>
      </div>
    ),
  },
  ...SHARED_STEPS,
];

// Phones, groups mode: real teams, each with several members all joined on their own phone.
export const HOTSEAT_PHONE_GROUPS_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Hot Seat is a guessing game, racing the clock. Everyone joins on their own phone. Each turn, one person on the team up is randomly picked to guess — their phone tells them so. Everyone else on the team sees the word on their own phone and has 90 seconds to describe it.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <div style={{ fontSize: "20px" }}>📱🎲</div>
          <div style={{ fontSize: "20px" }}>📱🍌</div>
          <div style={{ fontSize: "20px" }}>📱🍌</div>
        </div>
        <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 700, marginTop: "4px" }}>One phone picked to guess, the rest see the word</div>
      </div>
    ),
  },
  ...SHARED_STEPS,
];

// Phones, solo mode: every "team" is one person, so the whole connected class describes together.
export const HOTSEAT_PHONE_SOLO_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Hot Seat is a guessing game, racing the clock. Everyone joins on their own phone. Each turn, one student is randomly picked to guess — their phone tells them so, and doesn't show the word. Everyone else's phone shows it, and the whole class has 90 seconds to describe it together.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <div style={{ fontSize: "20px" }}>📱🎲</div>
          <div style={{ fontSize: "20px" }}>📱🍌</div>
          <div style={{ fontSize: "20px" }}>📱🍌</div>
        </div>
        <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 700, marginTop: "4px" }}>One student picked to guess, the rest of the class describes</div>
      </div>
    ),
  },
  ...SHARED_STEPS,
];
