import type { Team } from "../../types";
import { denseRank, medalForRank } from "../../utils/ranking";

interface ScoreBoardProps {
  teams: Team[];
  highlight?: string | number | null;
}

export function ScoreBoard({ teams, highlight }: ScoreBoardProps) {
  // Dense rank on score, not an array-index sort — two teams tied for the lead both show gold
  // instead of one arbitrarily reading as "winning" over the other.
  const ranked = denseRank(teams, t => t.score).sort((a, b) => b.value - a.value);

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
      {ranked.map(({ item: t, rank }) => (
        <div key={t.id} style={{
          background: highlight === t.id ? t.color.bg : t.color.light,
          border: `3px solid ${t.color.bg}`,
          borderRadius: "16px",
          padding: "12px 20px",
          textAlign: "center",
          minWidth: "120px",
          transform: highlight === t.id ? "scale(1.1)" : "scale(1)",
          transition: "all 0.3s",
          boxShadow: highlight === t.id ? `0 0 20px ${t.color.bg}80` : "none"
        }}>
          <div style={{ fontSize: "24px" }}>
            {medalForRank(rank)}
          </div>
          <div style={{ fontWeight: "800", fontSize: "15px", color: highlight === t.id ? "white" : t.color.dark }}>
            {t.color.emoji} {t.name}
          </div>
          <div style={{ fontWeight: "900", fontSize: "28px", color: highlight === t.id ? "white" : t.color.dark }}>
            {t.score}
          </div>
        </div>
      ))}
    </div>
  );
}
