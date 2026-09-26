import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own definition is the diagram: mixing a condition from one time with a result from
// another. The "no would in the if-clause" rule is already the star of Second and Third
// Conditional's own diagrams, so this one stays scoped to what's actually new here — which two
// time periods get crossed, and in which direction.
export function MixedConditionalsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Two different time periods, crossed
      </div>
      <svg viewBox="0 0 460 195" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="74" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>PAST CAUSE → NOW RESULT</text>
        <text x="117" y="46" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>if + HAD + pp, + would + verb</text>
        <text x="117" y="62" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>If she had studied medicine,</text>
        <text x="117" y="75" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>she would be a doctor today.</text>

        <rect x="245" y="12" width="195" height="74" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>NOW STATE → PAST RESULT</text>
        <text x="342" y="46" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>if + past simple, + would have + pp</text>
        <text x="342" y="62" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>If he weren't so shy, he would</text>
        <text x="342" y="75" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>have spoken up at the meeting.</text>

        <text x="230" y="100" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>still never "would" in the if-clause, in either direction</text>

        <line x1="20" y1="112" x2="440" y2="112" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="132" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ If I would have taken that job, I would be in Paris now.</text>
        <text x="230" y="148" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ If I had taken that job, I would be in Paris now.</text>

        <text x="230" y="168" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ If she hadn't missed that flight, she is here now.</text>
        <text x="230" y="184" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ If she hadn't missed that flight, she would be here now.</text>
      </svg>
    </div>
  );
}
