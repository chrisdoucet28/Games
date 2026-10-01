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

// Same fixed pixel-art language as QuestionCard.tsx/TurnTimerBar.tsx — a thick dark outline and a
// hard offset shadow instead of a soft glow, rounded corners kept (not squared off — a flat 90°
// card next to the rest of the app's rounded chrome read as inconsistent, not "more game-like").
// Team colors themselves stay untouched (a team's own color is the player's choice, not chrome to
// reskin) — only the outline/shadow language changes.
const INK = "#1A1A2E";

export function ScoreBoard({ teams, highlight, headingFont }: ScoreBoardProps) {
  // Dense rank on score, not an array-index sort — two teams tied for the lead both show gold
  // instead of one arbitrarily reading as "winning" over the other.
  const ranked = denseRank(teams, t => t.score).sort((a, b) => b.value - a.value);

  return (
    // flex-basis (not minWidth alone) is what lets cards shrink together and pack 2-3 per row on
    // a phone instead of each card sizing to its own content and wrapping onto its own line.
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
      {ranked.map(({ item: t, rank }) => {
        const isHighlighted = highlight === t.id;
        return (
          <div key={t.id} style={{
            background: isHighlighted ? t.color.bg : t.color.light,
            border: `3px solid ${INK}`,
            borderRadius: "16px",
            padding: "10px 14px",
            textAlign: "center",
            flex: "1 1 100px",
            maxWidth: "160px",
            boxSizing: "border-box",
            transform: isHighlighted ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.2s, box-shadow 0.2s",
            // A bigger hard offset shadow for the leader instead of a soft blurred glow — reads as
            // the card physically sitting closer to the "camera," not a lighting effect.
            boxShadow: isHighlighted ? `5px 5px 0 ${INK}` : `3px 3px 0 ${INK}`,
          }}>
            <div>
              <RankBadge rank={rank} size={24} />
            </div>
            <div style={{ fontWeight: "800", fontSize: "14px", color: isHighlighted ? "white" : t.color.dark, fontFamily: headingFont, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              <TeamIcon team={t} /> {t.name}
            </div>
            <div style={{ fontWeight: "900", fontSize: "26px", color: isHighlighted ? "white" : t.color.dark }}>
              {t.score}
            </div>
          </div>
        );
      })}
    </div>
  );
}
