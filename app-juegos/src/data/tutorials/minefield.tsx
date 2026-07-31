// Tutorial mockup for MinefieldGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const MINEFIELD_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Pick a tile — it pairs a column label with a row label. Combine both into one full sentence, spoken out loud.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "8px" }}>
          <div style={{ background: "#7C3AED", color: "white", borderRadius: "8px", padding: "6px 10px", fontWeight: 800, fontSize: "12px" }}>She...</div>
          <div style={{ background: "#0891B2", color: "white", borderRadius: "8px", padding: "6px 10px", fontWeight: 800, fontSize: "12px" }}>...yesterday</div>
        </div>
        <div style={{ fontSize: "12px", color: "#6D28D9", fontWeight: 700 }}>"She went to the park yesterday."</div>
      </div>
    ),
  },
  {
    narration: "7 of the 25 tiles are hidden mines — you won't know which until you pick one. Correct = +50 pts. Hit a mine = -75 pts.",
    visual: (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 26px)", gap: "3px", justifyContent: "center" }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{ width: "26px", height: "26px", borderRadius: "5px", background: i === 8 ? "linear-gradient(135deg,#EF4444,#B91C1C)" : "linear-gradient(135deg,#6366F1,#4338CA)" }} />
        ))}
      </div>
    ),
  },
  {
    narration: "A wrong answer on a safe tile costs nothing — it just stays open for next time. Clear every safe tile, and whoever has the most points wins.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>💣</div>
        <div style={{ fontWeight: 900, color: "#4C1D95", fontSize: "14px", marginTop: "4px" }}>18/18 safe tiles found!</div>
      </div>
    ),
  },
];
