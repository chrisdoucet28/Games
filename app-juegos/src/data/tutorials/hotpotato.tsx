// Tutorial mockup for HotPotatoGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const HOTPOTATO_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Hot Potato is like the classic party game: one team holds a pretend 'hot' potato and races to pass it on before it 'explodes'. Nobody wants to be holding it when a clock runs out.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "13px" }}>🔴🥔 ➡️ 🔵 ➡️ 🟢 ➡️ 🟡</div>
        <div style={{ fontSize: "10px", fontWeight: 700, color: "#7C2D12", marginTop: "4px" }}>The potato passes around the teams</div>
      </div>
    ),
  },
  {
    narration: "Here's what you do: whoever's holding the potato has to answer a question before a short clock runs out.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "30px" }}>🥔</div>
        <div style={{ background: "#FFF7ED", border: "2px solid #F97316", borderRadius: "10px", padding: "6px 14px", display: "inline-block", fontWeight: 800, color: "#7C2D12", fontSize: "13px", marginTop: "6px" }}>⏱️ 12s left</div>
      </div>
    ),
  },
  {
    narration: "Get it right in time and you pass the potato straight to the next team — now it's their turn. Get it wrong, or run out of time, and you're stuck holding it: a new question comes up and you try again.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "18px", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>✅ 🥔 ➡️</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#166534", marginTop: "4px" }}>Right → pass it on</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>❌ 🥔</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#991B1B", marginTop: "4px" }}>Wrong → still holding</div>
        </div>
      </div>
    ),
  },
  {
    narration: "But every round also runs on its own longer clock. Whoever's STILL holding the potato when that one hits zero, their team takes a hit.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "34px" }}>🥔💥</div>
        <div style={{ fontWeight: 800, color: "#991B1B", fontSize: "13px", marginTop: "4px" }}>Team Blue was holding it</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#9D174D", marginTop: "2px" }}>-45 pts</div>
      </div>
    ),
  },
  {
    narration: "This repeats for 5 rounds total — a new round, a new starting holder, same race each time.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: 800, color: "#7C2D12" }}>Round 3/5 — new round, new holder!</div>
      </div>
    ),
  },
  {
    narration: "Before you start, you can preview every question and answer for this game — handy for pre-teaching anything unfamiliar to your class.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "white", border: "2px solid #FED7AA", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#7C2D12", fontWeight: 700 }}>
          👁️ Preview all questions &amp; answers
        </div>
      </div>
    ),
  },
];
