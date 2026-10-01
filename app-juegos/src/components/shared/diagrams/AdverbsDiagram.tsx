import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro names the core mix-up directly: an adjective where an adverb belongs, or
// the reverse. That noun-vs-verb contrast is the main visual; the three genuine exceptions (linking
// verbs, frequency position, sense verbs/enough) each cause their own mistake but are secondary
// refinements of the same rule, so they stay compact in the footer.
export function AdverbsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Adjective describes nouns — adverb describes verbs
      </div>
      <svg viewBox="0 0 460 205" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>ADJECTIVE</text>
        <text x="117" y="46" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>describes a noun</text>
        <text x="117" y="63" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>She is a careful driver.</text>
        <text x="117" y="78" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>also after be/seem/look</text>

        <rect x="245" y="12" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>ADVERB (-ly)</text>
        <text x="342" y="46" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>describes a verb</text>
        <text x="342" y="63" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>She drives carefully.</text>
        <text x="342" y="78" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>good → well (irregular)</text>

        <text x="230" y="104" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>exceptions: sense verbs (tastes wonderful) · frequency (is always late) · X enough</text>

        <line x1="20" y1="116" x2="440" y2="116" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="136" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She is a carefully driver. · He drives careful.</text>
        <text x="230" y="152" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She is a careful driver. · He drives carefully.</text>

        <text x="230" y="172" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She looks happily today. · This soup tastes wonderfully.</text>
        <text x="230" y="188" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She looks happy today. · This soup tastes wonderful.</text>
      </svg>
    </div>
  );
}
