import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Three of the lesson's four common mistakes are the exact same error in different clothes:
// using "more/most" on a short adjective that should take -er/-est instead. Drawn as a 2x2 grid
// (short/long × comparative/superlative) so the one axis that actually matters — adjective
// length — is the thing the diagram is organized around, not comparative-vs-superlative.
export function ComparativesSuperlativesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Word length decides the ending — never both
      </div>
      <svg viewBox="0 0 460 205" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="150" y="16" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={caption}>COMPARATIVE</text>
        <text x="360" y="16" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={caption}>SUPERLATIVE</text>

        <text x="35" y="52" fontSize="10.5" fontWeight="800" fill={ink}>SHORT</text>
        <text x="35" y="66" fontSize="9" fontStyle="italic" fill={caption}>1 syllable</text>
        <rect x="90" y="30" width="120" height="46" rx="7" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="150" y="50" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>-er than</text>
        <text x="150" y="66" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>taller than</text>

        <rect x="300" y="30" width="120" height="46" rx="7" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="360" y="50" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>the -est</text>
        <text x="360" y="66" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>the tallest</text>

        <text x="35" y="112" fontSize="10.5" fontWeight="800" fill={ink}>LONG</text>
        <text x="35" y="126" fontSize="9" fontStyle="italic" fill={caption}>2+ syllables</text>
        <rect x="90" y="90" width="120" height="46" rx="7" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="150" y="110" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>more ___</text>
        <text x="150" y="126" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>more interesting</text>

        <rect x="300" y="90" width="120" height="46" rx="7" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="360" y="110" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>the most ___</text>
        <text x="360" y="126" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>the most expensive</text>

        <text x="230" y="152" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>irregular: good → better → the best · bad → worse → the worst</text>

        <line x1="20" y1="162" x2="440" y2="162" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="182" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ more tall · the most old</text>
        <text x="230" y="200" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ taller · the oldest</text>
      </svg>
    </div>
  );
}
