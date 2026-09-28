import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// A1 vocabulary topic with its own real commonMistakes array, so this reuses the same fork +
// wrong/right pattern as the grammar diagrams rather than a phrase-bank shape. All chrome text
// kept to plain A1 words — no grammar terms like "possessive adjective" (the lesson itself never
// needs that word; it just needs "his/her/their before the name").
export function IntroducingOthersDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        One person, or more than one?
      </div>
      <svg viewBox="0 0 460 218" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="32" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>THIS IS</text>
        <text x="117" y="48" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>one person</text>
        <text x="117" y="65" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>This is Marco.</text>
        <text x="117" y="79" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>His name is Marco.</text>

        <rect x="245" y="12" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="32" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>THESE ARE</text>
        <text x="342" y="48" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>two or more people</text>
        <text x="342" y="65" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>These are my classmates.</text>
        <text x="342" y="79" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>Their names are Ana and Leo.</text>

        <text x="230" y="106" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>meeting two people? say their name first</text>
        <text x="230" y="120" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>Sarah, this is David.</text>

        <line x1="20" y1="132" x2="440" y2="132" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="152" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ He name is Marco. · This is my friends.</text>
        <text x="230" y="168" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ His name is Marco. · These are my friends.</text>

        <text x="230" y="188" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ His name are Marco and Leo.</text>
        <text x="230" y="204" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Their names are Marco and Leo.</text>
      </svg>
    </div>
  );
}
