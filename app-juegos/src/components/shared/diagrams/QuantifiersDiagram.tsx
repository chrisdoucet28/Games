import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Too Much/Too Many already covers the countable-vs-uncountable fork, so repeating it here would
// waste the space. What's actually new — and easy to miss — is that "much/many" mostly live in
// negatives and questions; affirmative sentences normally reach for "a lot of" instead, and THAT
// structure brings its own trap ("of" is required before a noun but dropped when "a lot" stands
// alone). That sentence-type fork plus the "a lot of" trap covers three of this lesson's four
// common mistakes, so it's the diagram's whole focus.
export function QuantifiersDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Much/many live in negatives &amp; questions
      </div>
      <svg viewBox="0 0 460 222" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>NEGATIVE / QUESTION</text>
        <text x="117" y="47" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>much · many</text>
        <text x="40" y="66" fontSize="9" fontStyle="italic" fill={caption}>How much water is left?</text>
        <text x="40" y="80" fontSize="9" fontStyle="italic" fill={caption}>I don't have many friends.</text>

        <rect x="245" y="12" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>AFFIRMATIVE</text>
        <text x="342" y="47" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>a lot of</text>
        <text x="262" y="66" fontSize="9" fontStyle="italic" fill={caption}>I have a lot of friends.</text>
        <text x="262" y="80" fontSize="9" fontStyle="italic" fill={caption}>She drinks a lot of water.</text>

        <text x="230" y="108" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>"a lot of" needs "of" before a noun — drop "of" only when "a lot" stands alone</text>
        <text x="230" y="124" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>"Do you have pets?" "Yes, a lot!" (no "of" — no noun follows)</text>

        <line x1="20" y1="136" x2="440" y2="136" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="156" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She spends a lot time watching TV.</text>
        <text x="230" y="174" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She spends a lot of time watching TV.</text>
        <text x="230" y="196" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>never double up: "I don't have no time" → "I don't have any time"</text>
        <text x="230" y="211" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>underneath it's still countable vs uncountable</text>
      </svg>
    </div>
  );
}
