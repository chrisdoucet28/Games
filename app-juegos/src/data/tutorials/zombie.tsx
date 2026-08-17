// Tutorial mockup for ZombieSiegeGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const ZOMBIE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "The goal: zombies are attacking your house! Work together with every team to defend the doors and survive as many waves as you can.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🏠🧟🧟</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#365314", marginTop: "4px" }}>Defend the house!</div>
      </div>
    ),
  },
  {
    narration: "All teams share ONE house and ONE score. Zombies attack the doors — everyone defends together, not separately.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🏠</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#365314", marginTop: "4px" }}>One shared house, one shared score</div>
      </div>
    ),
  },
  {
    narration: "A sentence prompt appears. ANY team can add to it, as many times as they want — there is no turn order.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F0FDF4", border: "2px solid #65A30D", borderRadius: "12px", padding: "12px 16px", fontWeight: 700, color: "#365314", fontSize: "14px" }}>
          "The zombies were slow, but there were..."
        </div>
      </div>
    ),
  },
  {
    narration: "Most correct sentences (about 3 out of 4) earn a chair to barricade a door. The rest give a random power-up instead — you can't choose which, it's random.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>🪑</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#4D7C0F" }}>~75% of the time</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>⚡</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#4D7C0F" }}>~25% of the time</div>
        </div>
      </div>
    ),
  },
  {
    narration: "How zombies get killed, part 1: your character has a gun that automatically shoots zombies for you. It recharges on its own over time — you don't aim, it just happens.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "18px", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "26px" }}>🔫</div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#4D7C0F" }}>Bullet ready</div>
        </div>
        <div style={{ fontSize: "20px" }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "26px" }}>🧟💥</div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#4D7C0F" }}>Zombie down, automatically</div>
        </div>
      </div>
    ),
  },
  {
    narration: "How zombies get killed, part 2: if no bullet is ready, a zombie breaks a chair instead. About half the time, that chair explodes and takes the zombie down with it too!",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>🪑💥🧟</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#4D7C0F" }}>~50% — chair explodes, zombie destroyed</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px" }}>🪑💥</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#991B1B" }}>~50% — chair just breaks, zombie keeps coming</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Each team also has 2 axes — these are fixed and never come back once used. Save them for when a zombie actually breaks all the way through!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🪓🪓</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#365314", marginTop: "4px" }}>Last resort — use wisely, they don't come back</div>
      </div>
    ),
  },
  {
    narration: "One power-up is a ☢️ NUKE — it instantly destroys every zombie on screen. Save the moment it drops for when things look really bad!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>☢️🧟🧟🧟 → 💨</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#991B1B", marginTop: "4px" }}>All zombies on screen destroyed at once</div>
      </div>
    ),
  },
  {
    narration: "From wave 3 onward, two tougher zombie types can show up: a fast 🏃 runner that reaches the door quicker, and a big 🧌 brute that hits chairs harder. Watch for their look — they're easy to spot!",
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
    narration: "Clear every zombie in the wave to move on. The next wave is always tougher — how many waves can your class survive?",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 900, color: "#365314", fontSize: "14px" }}>Wave 1 cleared!</div>
        <div style={{ color: "#4D7C0F", fontWeight: 700, fontSize: "12px" }}>Wave 2 incoming — tougher!</div>
      </div>
    ),
  },
];
