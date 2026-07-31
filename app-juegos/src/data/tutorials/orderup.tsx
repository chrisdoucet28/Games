// Tutorial mockup for OrderUpGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const ORDERUP_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Customers line up outside the diner. Each dish icon above their head is one English requirement — a sentence form, a grammar point, or a word you must use.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "6px" }}>
          <span style={{ fontSize: "18px" }}>🍕</span>
          <span style={{ fontSize: "18px" }}>🍔</span>
        </div>
        <div style={{ background: "#FFE4E6", border: "2px solid #FBCFE8", borderRadius: "10px", padding: "8px 14px", display: "inline-block", fontSize: "12px", fontWeight: 700, color: "#BE185D" }}>
          Negative form + word "already"
        </div>
      </div>
    ),
  },
  {
    narration: "Some tickets have just 1 requirement, worth 10 points. Others stack 2 or 3 requirements into ONE sentence — much harder, but worth much more: 25 or 45 points!",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "16px" }}>🍕</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#166534" }}>1 item = 10 pts</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "16px" }}>🍕🍔🌮</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#BE185D" }}>3 items = 45 pts</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Any team can claim ANY customer on the board — first come, first served. Write ONE sentence that satisfies EVERY requirement on that ticket at once.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F0FDF4", border: "2px solid #22C55E", borderRadius: "10px", padding: "10px 14px", fontWeight: 700, color: "#14532D", fontSize: "13px" }}>
          "I haven't already finished my homework." ✅
        </div>
      </div>
    ),
  },
  {
    narration: "The teacher reads your sentence and judges whether it satisfies everything on the ticket. Get it right to serve the customer and score the points!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>👩‍🏫✅</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#14532D" }}>Teacher approves — served!</div>
      </div>
    ),
  },
  {
    narration: "Each ticket has a patience timer. If NO team serves it in time, the customer leaves unhappy — and EVERY team loses 5 points, not just whoever was trying!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>😠🚪</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#991B1B" }}>Customer left! All teams -5 pts</div>
      </div>
    ),
  },
  {
    narration: "Every time you serve a ticket, you collect that food's dish icon. Collect 3 matching dishes for an instant bonus of +30 points — and it keeps paying out every 3 more!",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "4px" }}>
        {["🍕", "🍕", "🍕"].map((d, i) => <span key={i} style={{ fontSize: "20px" }}>{d}</span>)}
        <span style={{ fontWeight: 900, color: "#BE185D", fontSize: "13px", alignSelf: "center", marginLeft: "6px" }}>+30 pts!</span>
      </div>
    ),
  },
  {
    narration: "The whole game runs on one shared clock (5, 8, or 12 minutes, picked at the start). Serve as many customers as you can before time runs out — most points wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>⏱️</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>Shared session clock — race the whole game!</div>
      </div>
    ),
  },
];
