// Tutorial mockup for OrderUpGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const ORDERUP_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Customers line up outside the diner — each dish above their head is one English requirement: a sentence form, a grammar point, or a vocab word.",
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
    narration: "Any team can claim any customer. Write ONE sentence that satisfies every dish at once — the teacher judges. Wait too long and the customer leaves unhappy for everyone!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F0FDF4", border: "2px solid #22C55E", borderRadius: "10px", padding: "10px 14px", fontWeight: 700, color: "#14532D", fontSize: "13px" }}>
          "I haven't already finished my homework." ✅
        </div>
      </div>
    ),
  },
  {
    narration: "Every served order hands out dishes matching its badges. Collect a full set of the same dish for an instant combo bonus — and it keeps paying out.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "4px" }}>
        {["🍕", "🍕", "🍕"].map((d, i) => <span key={i} style={{ fontSize: "20px" }}>{d}</span>)}
        <span style={{ fontWeight: 900, color: "#BE185D", fontSize: "13px", alignSelf: "center", marginLeft: "6px" }}>+combo!</span>
      </div>
    ),
  },
];
