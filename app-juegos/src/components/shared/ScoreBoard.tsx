import type { Team } from "../../types";

interface ScoreBoardProps {
  teams: Team[];
  highlight?: string | number | null;
}

export function ScoreBoard({ teams, highlight }: ScoreBoardProps) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
      {sorted.map((t, i) => (
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
            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i === 3 ? "🏅" : "🎖️"}
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
