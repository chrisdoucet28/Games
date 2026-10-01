import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The short/long -est-vs-most split is already the headline of Comparatives & Superlatives, so
// this diagram spends its space on the two things unique to superlatives specifically: "the" is
// never optional (a comparative never needs it, which is exactly the kind of thing that's easy to
// drop once a student's used to comparatives), and "one of the" + superlative always needs a
// PLURAL noun after it — a genuinely different sentence shape, not just a spelling rule.
export function SuperlativesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        "THE" is never optional
      </div>
      <svg viewBox="0 0 460 210" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="30" y="12" width="90" height="40" rx="7" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="75" y="36" textAnchor="middle" fontSize="14" fontWeight="800" fill={accent}>THE</text>

        <text x="130" y="38" textAnchor="middle" fontSize="12" fontWeight="700" fill={ink}>+</text>

        <rect x="150" y="12" width="140" height="40" rx="7" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="220" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>tallest</text>
        <text x="220" y="44" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>most expensive</text>

        <text x="325" y="38" textAnchor="middle" fontSize="12" fontStyle="italic" fill={caption}>← always together</text>

        <text x="230" y="72" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ tallest building in the city</text>
        <text x="230" y="90" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ the tallest building in the city</text>

        <line x1="20" y1="104" x2="440" y2="104" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="126" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>"one of the" + superlative needs a PLURAL noun</text>

        <rect x="90" y="136" width="280" height="38" rx="7" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="153" textAnchor="middle" fontSize="11" fill={ink}>one of the best restaurant<tspan fontWeight="800" fill={right}>s</tspan></text>
        <text x="230" y="168" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>"among the best" — softer than "the single best"</text>

        <text x="230" y="192" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ one of the best restaurant in town</text>
        <text x="230" y="208" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ one of the best restaurants in town</text>
      </svg>
    </div>
  );
}
