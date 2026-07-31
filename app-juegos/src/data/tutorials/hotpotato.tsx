// Tutorial mockup for HotPotatoGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const HOTPOTATO_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "One team holds the potato while the clock ticks. Answer within your time — the timer auto-reveals the answer when it runs out.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "36px", animation: "none" }}>🥔</div>
        <div style={{ background: "#FFF7ED", border: "2px solid #F97316", borderRadius: "10px", padding: "6px 14px", display: "inline-block", fontWeight: 800, color: "#7C2D12", fontSize: "13px", marginTop: "6px" }}>⏱️ 12s left</div>
      </div>
    ),
  },
  {
    narration: "Teacher judges: answered in time? Pass it on! Too slow or wrong? You keep holding it.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>✅</div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>Pass it on!</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>❌</div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#991B1B" }}>Keep holding!</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Whoever's holding the potato when the round timer hits 0 loses points — pass fast!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "34px" }}>🥔💥</div>
        <div style={{ fontWeight: 900, color: "#991B1B", fontSize: "14px", marginTop: "4px" }}>Team Blue was holding it — -30 pts!</div>
      </div>
    ),
  },
  {
    narration: "Each team starts with a bank of points for this game — you can preview every question up front to pre-teach anything unfamiliar.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "white", border: "2px solid #FED7AA", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#7C2D12", fontWeight: 700 }}>
          👁️ Preview all questions &amp; answers
        </div>
      </div>
    ),
  },
];
