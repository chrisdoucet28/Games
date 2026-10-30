// Tutorial mockup for RocketFuelGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// A small, consistent "this part is made up" flag — sits on its own line below the example
// content (never inline beside it, which would throw off the content's own centering). A student
// shouldn't mistake this sample sentence for the one answer that counts — any grammatically
// correct sentence using the word works, and the word itself changes every prompt.
function ExampleTag() {
  return (
    <div style={{ marginTop: "8px" }}>
      <span style={{ display: "inline-block", background: "#FDE68A", color: "#78350F", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
        Just an example
      </span>
    </div>
  );
}

export const ROCKET_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Rocket Fuel is a speaking game where your team secretly builds up fuel by making correct sentences — the more fuel you build, the higher your rocket launches at the end.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🚀⛽</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#312E81", marginTop: "4px" }}>More fuel = higher launch</div>
      </div>
    ),
  },
  {
    narration: "Here's what you do: a word appears at mission control. Use it correctly in your OWN sentence, said out loud — it doesn't need to match any sample shown, any grammatically correct sentence using the word counts.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#EEF2FF", border: "2px solid #6366F1", borderRadius: "10px", padding: "10px 16px", display: "inline-block", fontWeight: 800, color: "#312E81", fontSize: "14px" }}>
          "already"
        </div>
        <div style={{ fontSize: "12px", color: "#4338CA", fontWeight: 700, marginTop: "6px" }}>"I have already finished my homework."</div>
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "Get it right and your rocket gains fuel — you'll get 2 rounds of 90 seconds each to build up as much as you can.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>⛽ +1 fuel</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#4338CA", marginTop: "2px" }}>= +20 pts</div>
      </div>
    ),
  },
  {
    narration: "Can't think of anything for a prompt? Skip it — a new word appears, no penalty.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>⏭️</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#4338CA" }}>Skip — no penalty, try a new word</div>
      </div>
    ),
  },
  {
    narration: "Your fuel count stays secret the whole time — not even the scoreboard shows it. No one knows who's ahead until the very end!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>⛽ ???</div>
        <div style={{ fontSize: "11px", color: "#6366F1", fontWeight: 700 }}>Fuel stays secret until launch</div>
      </div>
    ),
  },
  {
    narration: "Playing solo? After your launch, hit \"One More Launch!\" for a bonus round — your own rocket from before shows up as a faint 'shadow' you're racing to beat.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px" }}>🚀 <span style={{ opacity: 0.4 }}>👻🚀</span></div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#4338CA", marginTop: "4px" }}>Beat your own shadow rocket!</div>
      </div>
    ),
  },
  {
    narration: "Once every team finishes both rounds, all rockets launch together — the team with the most fuel flies highest and wins. Points are fuel × 20, plus a placement bonus: 1st +50, 2nd +30, 3rd +15, 4th +5.",
    visual: (
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "center", fontSize: "11px", fontWeight: 800, color: "#312E81" }}>
        <div>🥇 1st — fuel×20 + 50 bonus</div>
        <div>🥈 2nd — fuel×20 + 30 bonus</div>
      </div>
    ),
  },
];
