import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro names the trap: mixing up which word each one takes and in what order.
// Two of six mistakes are the exact same reversal — "enough" flips position depending on what it
// modifies (before a noun, after an adjective) — so that flip gets equal weight to the so/such fork.
export function IntensifiersDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="warning" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Each one has its own fixed word order
      </div>
      <svg viewBox="0 0 460 195" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="12" width="140" height="62" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="30" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>SO</text>
        <text x="80" y="45" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>+ adjective, NO noun</text>
        <text x="80" y="62" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>The traffic was so bad.</text>

        <rect x="160" y="12" width="140" height="62" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>SUCH (A/AN)</text>
        <text x="230" y="45" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>+ adjective + NOUN</text>
        <text x="230" y="62" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>such an amazing concert</text>

        <rect x="310" y="12" width="140" height="62" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="30" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>ENOUGH</text>
        <text x="380" y="45" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>flips position!</text>
        <text x="380" y="62" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>enough money / old enough</text>

        <text x="230" y="94" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>enough + NOUN (before) · adjective + enough (after) — never reversed</text>

        <line x1="20" y1="106" x2="440" y2="106" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="126" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ It was so boring film. · She's such talented.</text>
        <text x="230" y="142" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ It was such a boring film. · She's so talented.</text>

        <text x="230" y="162" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I don't have money enough. · She isn't enough old to drive.</text>
        <text x="230" y="178" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I don't have enough money. · She isn't old enough to drive.</text>
      </svg>
    </div>
  );
}
