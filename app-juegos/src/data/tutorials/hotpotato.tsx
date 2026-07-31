// Tutorial mockup for HotPotatoGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const HOTPOTATO_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "This game is like the classic party game Hot Potato: one team holds a pretend 'hot' potato, and passes it to the next team as fast as they can — nobody wants to be holding it when time runs out!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "13px" }}>🔴🥔 ➡️ 🔵 ➡️ 🟢 ➡️ 🟡</div>
        <div style={{ fontSize: "10px", fontWeight: 700, color: "#7C2D12", marginTop: "4px" }}>The potato passes around the teams</div>
      </div>
    ),
  },
  {
    narration: "Each team starts with 100 points. The game has 5 rounds. In every round, one team holds the hot potato 🥔 first.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "30px" }}>🥔</div>
        <div style={{ fontWeight: 800, color: "#7C2D12", fontSize: "12px", marginTop: "4px" }}>Round 1/5 — Team Red is holding it!</div>
      </div>
    ),
  },
  {
    narration: "The team holding the potato gets a short time to answer a question. If time runs out, the correct answer is shown automatically.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FFF7ED", border: "2px solid #F97316", borderRadius: "10px", padding: "6px 14px", display: "inline-block", fontWeight: 800, color: "#7C2D12", fontSize: "13px" }}>⏱️ 12s left</div>
      </div>
    ),
  },
  {
    narration: "Answered correctly in time? Pass the potato to the NEXT team in order! Now it's their turn to answer.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>✅ 🥔 ➡️</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534", marginTop: "4px" }}>Pass it to Team Blue!</div>
      </div>
    ),
  },
  {
    narration: "Answered wrong, or ran out of time? You keep holding the potato — a new question comes up, and you try again.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>❌ 🥔</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#991B1B", marginTop: "4px" }}>Still holding — try again!</div>
      </div>
    ),
  },
  {
    narration: "Every round also has its own longer clock. Whoever is STILL holding the potato when that clock hits 0 loses 30 points!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "34px" }}>🥔💥</div>
        <div style={{ fontWeight: 900, color: "#991B1B", fontSize: "14px", marginTop: "4px" }}>Team Blue was holding it — -30 pts!</div>
      </div>
    ),
  },
  {
    narration: "This repeats for all 5 rounds — the potato keeps passing around. Losing 30 points can happen again and again, so answer fast and pass it on!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: 800, color: "#7C2D12" }}>Round 3/5 — new round, new holder!</div>
      </div>
    ),
  },
  {
    narration: "Before you start, you can preview every question and answer for this game — great for pre-teaching anything unfamiliar to your class.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "white", border: "2px solid #FED7AA", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#7C2D12", fontWeight: 700 }}>
          👁️ Preview all questions &amp; answers
        </div>
      </div>
    ),
  },
];
