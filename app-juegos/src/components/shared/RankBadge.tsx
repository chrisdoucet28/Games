// Replaces medalForRank()'s 🥇/🥈/🥉/🎖️ emoji — shown at the top of every game's scoreboard and
// every final-results screen, so it's some of the most-seen UI in the whole app. A numbered tier
// badge instead of a literal medal: same navy-outline + drop-shadow chrome as the 15 game icons
// (see IconBadge.tsx), just small and dynamic (the number has to be computed, so unlike Icon.tsx's
// static glyphs this can't be a fixed currentColor path — colors are tier-specific and baked in).
const TIERS = [
  { bg: "#FCD34D", text: "#78350F" }, // 1st — gold
  { bg: "#CBD5E1", text: "#334155" }, // 2nd — silver
  { bg: "#D9A066", text: "#5C2E0E" }, // 3rd — bronze
];
const OTHER_TIER = { bg: "#94A3B8", text: "#1E293B" }; // 4th and beyond

type Props = { rank: number; size?: number };

export function RankBadge({ rank, size = 24 }: Props) {
  const tier = TIERS[rank] ?? OTHER_TIER;
  const label = String(rank + 1);
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "-5px", flexShrink: 0, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
    >
      <rect x="2" y="2" width="20" height="20" rx="6" fill={tier.bg} stroke="#0C1E3D" strokeWidth="2.2" />
      <text x="12" y="16.5" textAnchor="middle" fontSize={label.length > 1 ? "9" : "11"} fontWeight="900" fill={tier.text}>{label}</text>
    </svg>
  );
}
