// Tutorial mockup for BountyBoardGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// A small, consistent "this part is made up" flag — sits on its own line below the example
// content (never inline beside it, which would throw off the content's own centering), since the
// #1 confusion this tutorial exists to prevent is a student locking onto this one prompt as if
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

export const BOUNTYBOARD_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Bounty Board is a whole-class writing game. Every team answers the exact same prompt at the exact same time — then the teacher reveals what everyone wrote for the class to check together.",
    visual: (
      <div style={{ fontSize: "22px", textAlign: "center" }}>✍️📋</div>
    ),
  },
  {
    narration: "Here's what you actually do: one prompt goes up on the board. Write your own sentence for it, right then — every team at once.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FEF3C7", border: "2px solid #D97706", borderRadius: "10px", padding: "8px 14px", display: "inline-block", fontSize: "13px", fontWeight: 700, color: "#78350F" }}>
          past simple of "go" — about yesterday
        </div>
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "Get it right and your team scores instantly, no waiting. Get it wrong and your sentence gets posted for the rest of the class to see.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ background: "#F0FDF4", border: "2px solid #22C55E", borderRadius: "10px", padding: "8px 12px", fontWeight: 700, color: "#14532D", fontSize: "12px" }}>
            "I went to the park yesterday." ✅
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ background: "#FEE2E2", border: "3px double #7F1D1D", borderRadius: "10px", padding: "8px 12px", fontWeight: 700, color: "#7F1D1D", fontSize: "12px" }}>
            "I goed to the park." 💰
          </div>
        </div>
      </div>
    ),
  },
  {
    narration: "That posted sentence is now a bounty — only a DIFFERENT team can claim it, and they have to fix your exact sentence, not write a new one. Miss the fix too, and the bounty climbs even higher and reopens for someone else.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
        <span style={{ fontWeight: 800, color: "#B91C1C", fontSize: "13px" }}>💰 40 → 60 → 80 pts…</span>
      </div>
    ),
  },
  {
    narration: "A round can't move on until every bounty from it is cleared. Once the board's clean, the teacher moves everyone to the next prompt.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>⭐</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>Board cleared — next round!</div>
      </div>
    ),
  },
];
