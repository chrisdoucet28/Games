// Tutorial mockup for AuctionGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// A small, consistent "this part is made up" flag — sits on its own line below the example
// content (never inline beside it, which would throw off the content's own centering), since the
// #1 confusion this tutorial exists to prevent is a student locking onto this one sentence as if
// it's literally what they'll be asked, when it's really whatever topic the teacher picked today.
function ExampleTag() {
  return (
    <div style={{ marginTop: "8px" }}>
      <span style={{ display: "inline-block", background: "#FDE68A", color: "#78350F", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
        Just an example
      </span>
    </div>
  );
}

export const AUCTION_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Sentence Auction is a betting game about English grammar — not a solo quiz. Every team gets a bank of points to bet with, kept separate from your real score until the very end.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>💰</div>
        <div style={{ fontWeight: 900, color: "#92400E", fontSize: "14px", marginTop: "4px" }}>Starting bank: 200 pts</div>
      </div>
    ),
  },
  {
    narration: "Here's what you actually do: one sentence appears. Decide — is it correct, or does it have a mistake?",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F5F3FF", border: "2px solid #8B5CF6", borderRadius: "12px", padding: "14px 18px", fontWeight: 700, color: "#3B0764", fontSize: "15px" }}>
          "She have three cats."
        </div>
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "Then back your answer: every team secretly picks Correct or Incorrect and bets some of their bank on it, all at the same time. Once everyone's locked in, every bet and vote reveals together.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ background: "#DCFCE7", color: "#14532D", borderRadius: "999px", padding: "4px 10px", fontWeight: 800, fontSize: "11px" }}>🔴 Red: Incorrect, bet 50</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <span style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: "999px", padding: "4px 10px", fontWeight: 800, fontSize: "11px" }}>🔵 Blue: Correct, bet 50</span>
        </div>
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "Guess right and you keep your bet. Guess wrong and you lose it. Here, Red said Incorrect (right!) and Blue said Correct (wrong!).",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>✅</div>
          <div style={{ fontWeight: 800, color: "#166534", fontSize: "12px" }}>🔴 Red: keep +50</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>❌</div>
          <div style={{ fontWeight: 800, color: "#991B1B", fontSize: "12px" }}>🔵 Blue: lose -50</div>
        </div>
      </div>
    ),
  },
  {
    narration: "This repeats for many sentences. If your bank ever hits 0, you sit out the next one and get a small boost to restart. At the very end, whatever's left in your bank becomes real score.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "18px" }}>💰 Final bank: 175 pts</div>
        <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534", marginTop: "2px" }}>→ +175 added to your score</div>
      </div>
    ),
  },
];
