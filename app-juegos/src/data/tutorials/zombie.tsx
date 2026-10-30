// Tutorial mockup for ZombieSiegeGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// A small, consistent "this part is made up" flag — sits on its own line below the example
// content (never inline beside it, which would throw off the content's own centering), since a
// student shouldn't mistake this sample sentence for literally what they'll get.
function ExampleTag() {
  return (
    <div style={{ marginTop: "8px" }}>
      <span style={{ display: "inline-block", background: "#FDE68A", color: "#78350F", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
        Just an example
      </span>
    </div>
  );
}

export const ZOMBIE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Zombie Siege is a survival game your whole class plays together — one shared house, one shared score. Zombies attack in waves; your job as a class is to defend the doors and survive as long as you can.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🏠🧟🧟</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#365314", marginTop: "4px" }}>Defend the house — together!</div>
      </div>
    ),
  },
  {
    narration: "Here's what you do: a sentence prompt appears, and ANY team can jump in and complete it, as many times as they want — there's no turn order, just go.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F0FDF4", border: "2px solid #65A30D", borderRadius: "12px", padding: "12px 16px", fontWeight: 700, color: "#365314", fontSize: "14px" }}>
          "The zombies were slow, but there were..."
        </div>
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "Most correct sentences earn a chair to barricade a door. The rest hand you a random power-up instead — things like extra ammo, more chairs, or a faster reload. You can't choose which, it's random.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>🪑</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#4D7C0F" }}>Usually — a chair</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>⚡</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#4D7C0F" }}>Sometimes — a power-up</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Zombies mostly get stopped automatically: your character has a gun that recharges and fires on its own over time — nothing to aim. If no bullet's ready, a zombie breaks a chair instead, and about half the time that chair explodes and takes the zombie with it.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px" }}>🔫 → 🧟💥</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#4D7C0F" }}>Automatic, over time</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>🪑💥🧟</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#4D7C0F" }}>Chairs sometimes explode too</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Each team also has 2 axes — fixed, and they never come back once used. Save them for when a zombie actually breaks all the way through, as your true last resort.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🪓🪓</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#365314", marginTop: "4px" }}>Last resort — they don't come back</div>
      </div>
    ),
  },
  {
    narration: "From wave 3 onward, two tougher zombie types can show up: a fast runner that reaches the door quicker, and a big brute that hits harder. They're easy to spot by look, so watch for them.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "18px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>🏃</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#0E7490" }}>Runner — arrives fast</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "26px" }}>🧌</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#991B1B" }}>Brute — hits harder</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Clear every zombie in the wave to move on. The next wave is always tougher — how many can your class survive?",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 900, color: "#365314", fontSize: "14px" }}>Wave 1 cleared!</div>
        <div style={{ color: "#4D7C0F", fontWeight: 700, fontSize: "12px" }}>Wave 2 incoming — tougher!</div>
      </div>
    ),
  },
];
