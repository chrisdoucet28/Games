import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro names exactly two rules: flip positive/negative, and match the existing
// auxiliary. Labeling a finished example "POSITIVE statement → NEGATIVE tag" tells a student the
// category, but not how "she's a doctor" actually becomes "isn't she" — so the diagram breaks the
// mechanism into three visible steps (find the auxiliary, flip it, add the pronoun) for one
// positive and one negative example. The irregulars (aren't I, main-verb "have", hidden negatives)
// are memorized exceptions rather than a single teachable idea, so they stay compact in the footer.
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
      <svg viewBox="0 0 460 225" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="10" y="26" fontSize="9" fontWeight="800" fill={caption}>POSITIVE</text>
        <rect x="10" y="34" width="135" height="34" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="77" y="55" textAnchor="middle" fontSize="9" fontStyle="italic" fill={ink}>She's a doctor.</text>

        <text x="152" y="55" textAnchor="middle" fontSize="14" fill={accent}>→</text>

        <rect x="163" y="34" width="105" height="34" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="215" y="49" textAnchor="middle" fontSize="8" fontWeight="700" fill={caption}>flip the aux</text>
        <text x="215" y="62" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>is → isn't</text>

        <text x="277" y="55" textAnchor="middle" fontSize="14" fill={accent}>→</text>

        <rect x="288" y="34" width="162" height="34" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="369" y="55" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>, isn't she?</text>

        <text x="10" y="88" fontSize="9" fontWeight="800" fill={caption}>NEGATIVE</text>
        <rect x="10" y="96" width="135" height="34" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="77" y="117" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>You don't like coffee.</text>

        <text x="152" y="117" textAnchor="middle" fontSize="14" fill={accent}>→</text>

        <rect x="163" y="96" width="105" height="34" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="215" y="111" textAnchor="middle" fontSize="8" fontWeight="700" fill={caption}>flip the aux</text>
        <text x="215" y="124" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>don't → do</text>

        <text x="277" y="117" textAnchor="middle" fontSize="14" fill={accent}>→</text>

        <rect x="288" y="96" width="162" height="34" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="369" y="117" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>, do you?</text>

        <text x="230" y="150" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>no auxiliary already there → use do/does/did to build the tag</text>

        <line x1="20" y1="162" x2="440" y2="162" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="182" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She is tired, is she? · You don't smoke, don't you?</text>
        <text x="230" y="198" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She is tired, isn't she? · You don't smoke, do you?</text>

        <text x="230" y="216" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ You have a car, haven't you? (main-verb "have" needs don't you)</text>
      </svg>
    </div>
  );
}
