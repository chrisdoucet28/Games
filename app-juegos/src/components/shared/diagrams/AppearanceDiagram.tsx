import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// All four of the lesson's commonMistakes are the same be-vs-have split, so that split is the
// whole diagram. All chrome text kept to plain A1 words.
export function AppearanceDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Be, or have?
      </div>
      <svg viewBox="0 0 460 206" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="16" width="195" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="36" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>BE</text>
        <text x="117" y="50" textAnchor="middle" fontSize="7.8" fill={caption}>height · build · age</text>
        <text x="117" y="68" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>She is tall and slim.</text>
        <text x="117" y="84" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>He is 30 years old.</text>

        <rect x="245" y="16" width="195" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="36" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>HAVE / HAS</text>
        <text x="342" y="50" textAnchor="middle" fontSize="7.8" fill={caption}>hair · eyes · other features</text>
        <text x="342" y="68" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>He has blue eyes.</text>
        <text x="342" y="84" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>She has curly hair.</text>

        <line x1="20" y1="118" x2="440" y2="118" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="138" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ He have blue eyes. · She is have green eyes.</text>
        <text x="230" y="154" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ He has blue eyes. · She has green eyes.</text>

        <text x="230" y="172" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She has 25 years old. · My grandfather has tall and thin.</text>
        <text x="230" y="188" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She is 25 years old. · My grandfather is tall and thin.</text>
      </svg>
    </div>
  );
}
