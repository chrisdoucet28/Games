import type { Team } from "../../types";
import { TeamIcon } from "./TeamIcon";
import { denseRank } from "../../utils/ranking";
import { RankBadge } from "./RankBadge";

interface ScoreBoardProps {
  teams: Team[];
  highlight?: string | number | null;
  // Optional so games that don't have a theme handy (or don't want it) still work unstyled.
  headingFont?: string;
}

export function ScoreBoard({ teams, highlight, headingFont }: ScoreBoardProps) {
  // Dense rank on score, not an array-index sort — two teams tied for the lead both show gold
  // instead of one arbitrarily reading as "winning" over the other.
  const ranked = denseRank(teams, t => t.score).sort((a, b) => b.value - a.value);

  return (
    // flex-basis (not minWidth alone) is what lets cards shrink together and pack 2-3 per row on
    // a phone instead of each card sizing to its own content and wrapping onto its own line.
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
      {ranked.map(({ item: t, rank }) => (
        <div key={t.id} style={{
          background: highlight === t.id ? t.color.bg : t.color.light,
          border: `3px solid ${t.color.bg}`,
          borderRadius: "16px",
          padding: "10px 14px",
          textAlign: "center",
          flex: "1 1 100px",
          maxWidth: "160px",
          boxSizing: "border-box",
          transform: highlight === t.id ? "scale(1.1)" : "scale(1)",
          transition: "all 0.3s",
          boxShadow: highlight === t.id ? `0 0 20px ${t.color.bg}80` : "none"
        }}>
          <div>
            <RankBadge rank={rank} size={24} />
          </div>
          <div style={{ fontWeight: "800", fontSize: "14px", color: highlight === t.id ? "white" : t.color.dark, fontFamily: headingFont, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <TeamIcon team={t} /> {t.name}
          </div>
          <div style={{ fontWeight: "900", fontSize: "26px", color: highlight === t.id ? "white" : t.color.dark }}>
            {t.score}
          </div>
        </div>
      ))}
    </div>
  );
}
