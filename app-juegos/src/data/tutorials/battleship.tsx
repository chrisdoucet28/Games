// Tutorial mockup for BattleshipGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

export const BATTLESHIP_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Each team has a hidden fleet on their own ocean grid. On your turn, pick an enemy team, then pick a square to fire at.",
    visual: (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 30px)", gap: "4px", justifyContent: "center" }}>
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} style={{ width: "30px", height: "30px", borderRadius: "6px", background: i === 6 ? "#FCD34D" : "linear-gradient(135deg,#1E3A5F,#0F2440)" }} />
        ))}
      </div>
    ),
  },
  {
    narration: "Every square is find-and-fix-the-mistake — answer correctly to fire! Hit a real ship for +60 pts, hit water and still answer right for +15.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px" }}>💥</div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#DC2626" }}>Hit! +60</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px" }}>🌊</div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#0891B2" }}>Splash +15</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Sink all of a team's ships to eliminate them completely. The last fleet still afloat wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🏆⚓</div>
        <div style={{ fontWeight: 900, color: "#1E3A8A", fontSize: "14px", marginTop: "4px" }}>Team Red's fleet wins the battle!</div>
      </div>
    ),
  },
];
