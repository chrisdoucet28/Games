import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Three of five common mistakes are the exact same missing piece: dropping "be" from the "will be
// + -ing" formula, in statements, questions, and after adverbs like "probably" alike. That single
// missing-word trap is the whole diagram.
export function FutureContinuousDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
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
        Will BE + -ing — never skip "be"
      </div>
      <svg viewBox="0 0 460 185" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="60" y="14" width="340" height="56" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="36" textAnchor="middle" fontSize="14" fontWeight="800" fill={accent}>WILL + BE + VERB-ING</text>
        <text x="230" y="55" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>This time tomorrow, I'll be flying to Rome.</text>

        <text x="230" y="90" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>question: Will + subject + BE + -ing? · negative: won't BE + -ing</text>
        <text x="230" y="105" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>"probably" sits between will and be, never replacing "be"</text>

        <line x1="20" y1="118" x2="440" y2="118" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="138" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I will flying to Rome. · At 8pm, we will having dinner.</text>
        <text x="230" y="154" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I will be flying to Rome. · we will be having dinner.</text>

        <text x="230" y="174" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Will you using the car tonight? · He will be work late.</text>
      </svg>
    </div>
  );
}
