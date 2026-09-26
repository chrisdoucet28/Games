import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The short/long -er-vs-more fork is the same content as Comparatives & Superlatives (minus the
// superlative half) — what actually earns this diagram its own space is the thing that lesson
// doesn't cover at all: "as...as" for equality, a genuinely third option alongside ranking two
// things against each other. Drawn as three branches, not two, with the "plain adjective, never
// -er" rule on the equality branch called out directly since that's its own common mistake.
export function ComparativesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Not every comparison ranks one above the other
      </div>
      <svg viewBox="0 0 460 210" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="12" width="140" height="46" rx="7" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>SHORT adjective</text>
        <text x="80" y="48" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>-er than</text>

        <rect x="160" y="12" width="140" height="46" rx="7" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>LONG adjective</text>
        <text x="230" y="48" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>more ___ than</text>

        <rect x="310" y="12" width="140" height="46" rx="7" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>EQUAL, not ranked</text>
        <text x="380" y="48" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>as ___ as</text>

        <text x="80" y="76" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>taller than</text>
        <text x="230" y="76" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>more interesting than</text>
        <text x="380" y="76" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>as tall as</text>

        <text x="230" y="100" textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>as...as always uses the plain adjective — no -er, ever</text>

        <line x1="20" y1="116" x2="440" y2="116" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="138" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ as heavier as that one</text>
        <text x="230" y="156" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ as heavy as that one</text>

        <text x="230" y="180" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ as tall than her brother</text>
        <text x="230" y="198" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ as tall as her brother</text>
      </svg>
    </div>
  );
}
