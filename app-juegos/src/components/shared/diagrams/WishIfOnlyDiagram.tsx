import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro frames this as three patterns borrowed from the conditionals, each
// signaling a different target: now, the past, or someone else's annoying behavior. That three-way
// fork is the whole diagram — every one of the five common mistakes is a student reaching for the
// wrong one of these three tenses.
export function WishIfOnlyDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";

  return (
    <div
      style={{
        position: "relative",
        border: `2px solid ${isScreen ? hexToRgba(accentColor, 0.3) : "#9CA3AF"}`,
        borderRadius: "14px",
        background: isScreen ? hexToRgba(accentColor, 0.05) : "white",
        padding: isScreen ? "16px 18px 12px" : "10px 12px 8px",
        margin: isScreen ? "0 0 20px" : "0 0 8px",
      }}
    >
      {isScreen && (
        <div
          style={{
            position: "absolute", top: "-12px", right: "16px", width: "28px", height: "28px", borderRadius: "50%",
            background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
          }}
        >
          <Icon name="target" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        The tense signals what you're wishing about
      </div>
      <svg viewBox="0 0 460 195" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="12" width="140" height="72" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>NOW</text>
        <text x="80" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>+ past simple / were / could</text>
        <text x="80" y="60" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>I wish I had more time.</text>
        <text x="80" y="73" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>If only I were taller!</text>

        <rect x="160" y="12" width="140" height="72" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>THE PAST</text>
        <text x="230" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>+ past perfect</text>
        <text x="230" y="60" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>I wish I had studied</text>
        <text x="230" y="73" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>harder last week.</text>

        <rect x="310" y="12" width="140" height="72" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="30" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>ANNOYING HABIT</text>
        <text x="380" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>wish + would + verb</text>
        <text x="380" y="60" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>I wish you would stop</text>
        <text x="380" y="73" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>interrupting me.</text>

        <line x1="20" y1="96" x2="440" y2="96" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="116" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I wish I have more free time. · If only I can speak French!</text>
        <text x="230" y="132" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I wish I had more free time. · If only I could speak French!</text>

        <text x="230" y="152" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I wish you will stop interrupting me. · If only she was here.</text>
        <text x="230" y="168" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I wish you would stop interrupting me. · If only she were here.</text>

        <text x="230" y="188" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I wish I studied harder last week. → ✓ I wish I had studied harder.</text>
      </svg>
    </div>
  );
}
