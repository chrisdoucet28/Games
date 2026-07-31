// Tutorial mockup for WordWhackGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const WHACK_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "A question pops up with a few possible answers, mole-style. Whack the correct one before it ducks back down!",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        {["went", "goes", "gone"].map((w, i) => (
          <div key={w} style={{
            width: "62px", height: "62px", borderRadius: "50%",
            background: i === 0 ? "linear-gradient(135deg,#3F6212,#84CC16)" : "#EFEFEF",
            color: i === 0 ? "#0F1A05" : "#4B5563",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "13px", border: i === 0 ? "3px solid #84CC16" : "2px solid #D1D5DB",
          }}>{w}</div>
        ))}
      </div>
    ),
  },
  {
    narration: "Right whack = points, and the next one pops up instantly. Wrong whack = that mole's gone, but the correct one is still up there somewhere.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "28px" }}>🔨💥</div>
        <div style={{ fontWeight: 900, color: "#3F6212", fontSize: "15px", marginTop: "4px" }}>+20 pts</div>
        <div style={{ color: "#84CC16", fontWeight: 700, fontSize: "12px" }}>🔥 3 combo — bonus growing!</div>
      </div>
    ),
  },
  {
    narration: "You've got 90 seconds — moles duck faster as the clock runs down, so stay sharp all the way to the end.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F3F4F6", borderRadius: "999px", height: "10px", width: "100%", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(90deg,#84CC16,#EF4444)", height: "100%", width: "70%" }} />
        </div>
        <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 700, marginTop: "6px" }}>Time's running out — moles are quicker now!</div>
      </div>
    ),
  },
];
