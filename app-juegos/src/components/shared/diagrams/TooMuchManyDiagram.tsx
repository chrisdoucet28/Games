import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// All four of this lesson's common mistakes come down to one question: is there a noun after
// "too", and can you count it? The diagram is built as the three-way fork the lesson itself uses
// as its "quick check" test, so it doubles as a lookup a student can use mid-sentence.
export function TooMuchManyDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        What comes after "too" decides the word
      </div>
      <svg viewBox="0 0 460 200" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="14" width="140" height="82" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="33" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>TOO</text>
        <text x="80" y="47" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>+ adjective/adverb</text>
        <text x="80" y="60" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(no noun at all)</text>
        <text x="80" y="76" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>too hot</text>
        <text x="80" y="90" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>too quietly</text>

        <rect x="160" y="14" width="140" height="82" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="33" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>TOO MUCH</text>
        <text x="230" y="47" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>+ uncountable noun</text>
        <text x="230" y="60" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(can't count it)</text>
        <text x="230" y="76" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>too much sugar</text>
        <text x="230" y="90" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>too much time</text>

        <rect x="310" y="14" width="140" height="82" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="33" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>TOO MANY</text>
        <text x="380" y="47" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>+ countable plural</text>
        <text x="380" y="60" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(can count it)</text>
        <text x="380" y="76" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>too many people</text>
        <text x="380" y="90" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>too many books</text>

        <text x="230" y="118" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>quick check: can you count it? no noun → TOO · yes → MANY · no → MUCH</text>

        <line x1="10" y1="130" x2="450" y2="130" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="150" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ It's too much hot. · There's too many sugar. · too much people</text>
        <text x="230" y="168" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ It's too hot. · too much sugar. · too many people</text>
        <text x="230" y="186" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>same rule for adverbs: she talks too quietly (not "too much quietly")</text>
      </svg>
    </div>
  );
}
