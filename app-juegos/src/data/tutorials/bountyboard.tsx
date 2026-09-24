// Tutorial mockup for BountyBoardGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const BOUNTYBOARD_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Every round, ONE word goes up on the board. Every team WRITES their own sentence using it, all at the same time — then the teacher posts what each team wrote for the whole class to check.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FEF3C7", border: "2px solid #D97706", borderRadius: "10px", padding: "8px 14px", display: "inline-block", fontSize: "13px", fontWeight: 700, color: "#78350F" }}>
          past simple of "go" — about yesterday
        </div>
      </div>
    ),
  },
  {
    narration: "Get it right and your team scores instantly — 10 points, no waiting.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F0FDF4", border: "2px solid #22C55E", borderRadius: "10px", padding: "10px 14px", fontWeight: 700, color: "#14532D", fontSize: "13px" }}>
          "I went to the park yesterday." ✅ +10 pts
        </div>
      </div>
    ),
  },
  {
    narration: "Get it wrong and your sentence becomes a BOUNTY, posted for everyone to see — worth double the points for whoever fixes it.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FEE2E2", border: "3px double #7F1D1D", borderRadius: "10px", padding: "10px 14px", fontWeight: 700, color: "#7F1D1D", fontSize: "13px" }}>
          "I goed to the park." — 💰 20 pts
        </div>
      </div>
    ),
  },
  {
    narration: "Only a DIFFERENT team can claim a bounty — and they have to fix that exact wrong sentence, not write a new one.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "18px" }}>🤠</span>
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#78350F" }}>"I went to the park." ✅</span>
      </div>
    ),
  },
  {
    narration: "Miss the fix too? The bounty climbs even higher and reopens for another team — this can keep going until someone finally gets it right.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <span style={{ fontWeight: 800, color: "#B91C1C", fontSize: "13px" }}>💰 20 → 30 → 40 pts…</span>
      </div>
    ),
  },
  {
    narration: "A round can't move on until every bounty from it is cleared. Once the board is clean, the teacher moves everyone to the next round.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>⭐</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>Board cleared — next round!</div>
      </div>
    ),
  },
];
