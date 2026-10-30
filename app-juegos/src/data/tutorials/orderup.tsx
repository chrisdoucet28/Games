// Tutorial mockup for OrderUpGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// A small, consistent "this part is made up" flag — sits on its own line below the example
// content (never inline beside it, which would throw off the content's own centering), since a
// student shouldn't mistake "Negative form + word already" for a literal ticket they'll get —
// that depends entirely on whatever topic(s) the teacher picked for today's class.
function ExampleTag() {
  return (
    <div style={{ marginTop: "8px" }}>
      <span style={{ display: "inline-block", background: "#FDE68A", color: "#78350F", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
        Just an example
      </span>
    </div>
  );
}

export const ORDERUP_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Order Up is a sentence-writing game. Customers line up outside a diner, and each dish icon above their head is one English requirement — a sentence form, a grammar point, or a word — you need to satisfy to serve them.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "6px" }}>
          <span style={{ fontSize: "18px" }}>🍕</span>
          <span style={{ fontSize: "18px" }}>🍔</span>
        </div>
      </div>
    ),
  },
  {
    narration: "Here's what you do: claim ANY customer on the board — first come, first served — then write ONE sentence that satisfies every requirement on their ticket at once.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FFE4E6", border: "2px solid #FBCFE8", borderRadius: "10px", padding: "6px 12px", display: "inline-block", fontSize: "11px", fontWeight: 700, color: "#BE185D", marginBottom: "6px" }}>
          Ticket: Negative form + word "already"
        </div>
        <div style={{ background: "#F0FDF4", border: "2px solid #22C55E", borderRadius: "10px", padding: "10px 14px", fontWeight: 700, color: "#14532D", fontSize: "13px" }}>
          "I haven't already finished my homework." ✅
        </div>
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "Your teacher reads your sentence and judges whether it satisfies everything on the ticket. Get it right and the customer's served.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>👩‍🏫✅</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#14532D" }}>Teacher approves — served!</div>
      </div>
    ),
  },
  {
    narration: "Once claimed, a ticket has a patience timer — but it freezes the instant your teacher opens judging on it, so you're never racing the clock while they're actually reading your answer. Don't finish before that, and your team takes a hit. Not ready? Release the claim any time, no penalty, for someone else to try.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>😠🚪</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#991B1B" }}>Customer left! Claiming team takes a hit</div>
      </div>
    ),
  },
  {
    narration: "Before you start, pick how patient customers are — Easy, Medium, or Hard — which sets how long that timer runs.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
        {["Easy", "Medium", "Hard"].map(d => (
          <span key={d} style={{ background: d === "Medium" ? "#BE185D" : "white", color: d === "Medium" ? "white" : "#9D174D", border: "2px solid #FBCFE8", borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: 800 }}>{d}</span>
        ))}
      </div>
    ),
  },
  {
    narration: "A ticket stacking 2 or 3 requirements into one sentence is harder, but worth more points — and every 3 matching dishes you serve earns an extra combo bonus on top.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "16px" }}>🍕</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#166534" }}>1 item</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "16px" }}>🍕🍔🌮</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#BE185D" }}>3 items — worth more!</div>
        </div>
      </div>
    ),
  },
  {
    narration: "The whole game runs on one shared clock (8, 12, or 18 minutes, also picked at the start). Serve as many customers as you can before time runs out — most points wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>⏱️</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>Shared session clock — race the whole game!</div>
      </div>
    ),
  },
];
