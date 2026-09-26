import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own two named traps are never "would" in the if-clause and "were" for every
// subject — together three of five common mistakes. Those two rules are the whole diagram, framed
// the same way First Conditional's diagram frames its own "will" placement rule for consistency.
export function SecondConditionalDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Never "would" in the if-clause
      </div>
      <svg viewBox="0 0 460 195" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="32" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>IF + PAST SIMPLE</text>
        <text x="117" y="48" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>the hypothetical part</text>
        <text x="117" y="65" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>If I had more money,</text>

        <rect x="245" y="12" width="195" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="32" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>WOULD + BASE VERB</text>
        <text x="342" y="48" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>the imagined result</text>
        <text x="342" y="65" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>I would travel the world.</text>

        <text x="230" y="98" textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>use "were" for EVERY subject: If I were you...</text>

        <line x1="20" y1="110" x2="440" y2="110" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="130" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ If I would win the lottery, I would buy a house.</text>
        <text x="230" y="146" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ If I won the lottery, I would buy a house.</text>

        <text x="230" y="166" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ If I am you, I would apologise. · If they was here...</text>
        <text x="230" y="182" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ If I were you, I would apologise. · If they were here...</text>
      </svg>
    </div>
  );
}
