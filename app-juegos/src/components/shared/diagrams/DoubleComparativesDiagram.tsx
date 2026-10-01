import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own first mistake is the one worth building around: both halves need their own
// "the", a rule easy to drop from the first half since it doesn't feel like it's modifying a noun.
// The other mistakes (double marking a short comparative, adding "is" inside the clause) are
// smaller slips on the same template, so they stay in the footer rather than earning their own box.
export function DoubleComparativesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Both halves need their own "the"
      </div>
      <svg viewBox="0 0 460 195" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="32" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>THE + comparative</text>
        <text x="117" y="50" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>The harder you work,</text>
        <text x="117" y="66" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>short: -er · long: the more ___</text>

        <text x="230" y="46" textAnchor="middle" fontSize="16" fill={accent}>→</text>

        <rect x="245" y="12" width="195" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="32" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>THE + comparative</text>
        <text x="342" y="50" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>the better your results.</text>
        <text x="342" y="66" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>good→the better, bad→the worse</text>

        <text x="230" y="98" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>no "is" inside either clause: the more expensive the hotel...</text>

        <line x1="20" y1="110" x2="440" y2="110" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="130" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ More you practice, the more fluent you become.</text>
        <text x="230" y="146" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ The more you practice, the more fluent you become.</text>

        <text x="230" y="166" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ the more quicker you can leave. · the more thin the air became.</text>
        <text x="230" y="182" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ the quicker you can leave. · the thinner the air became.</text>
      </svg>
    </div>
  );
}
