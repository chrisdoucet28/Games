import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro names exactly two rules: flip positive/negative, and match the existing
// auxiliary. Those two rules are the whole diagram; the irregulars (aren't I, main-verb "have",
// hidden negatives) are memorized exceptions rather than a single teachable idea, so they stay
// compact in the footer.
export function QuestionTagsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Flip the polarity, match the auxiliary
      </div>
      <svg viewBox="0 0 460 195" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>POSITIVE statement</text>
        <text x="117" y="46" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>→ NEGATIVE tag</text>
        <text x="117" y="64" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>She's a doctor, isn't she?</text>

        <rect x="245" y="12" width="195" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>NEGATIVE statement</text>
        <text x="342" y="46" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>→ POSITIVE tag</text>
        <text x="342" y="64" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>You don't like coffee, do you?</text>

        <text x="230" y="100" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>no auxiliary already there → use do/does/did to build the tag</text>

        <line x1="20" y1="112" x2="440" y2="112" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="132" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She is tired, is she? · You don't smoke, don't you?</text>
        <text x="230" y="148" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She is tired, isn't she? · You don't smoke, do you?</text>

        <text x="230" y="168" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ You have a car, haven't you? (main-verb "have" → don't you)</text>
        <text x="230" y="184" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ You have a car, don't you? · She never eats meat, does she?</text>
      </svg>
    </div>
  );
}
