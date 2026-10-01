import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Three of this lesson's five common mistakes are the same error in different clothes: mixing up
// which closing word belongs to which structure (as...as vs less...than). The diagram is built
// entirely around that one pairing rule rather than trying to cover equal/unequal meaning, since
// "not as...as" and "as...as" actually share the same particle — only "less" changes it to "than".
export function EquativesNonEquativesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        AS pairs with AS — LESS pairs with THAN
      </div>
      <svg viewBox="0 0 460 205" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="112" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>AS ___ AS</text>
        <text x="117" y="47" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>add "not" to make it unequal</text>
        <text x="40" y="67" fontSize="10" fontStyle="italic" fill={caption}>as tall as her brother</text>
        <text x="40" y="83" fontSize="10" fontStyle="italic" fill={caption}>not as big as this one</text>
        <text x="40" y="99" fontSize="10" fontStyle="italic" fill={caption}>almost as good as new</text>
        <text x="40" y="115" fontSize="10" fontStyle="italic" fill={caption}>just as heavy as before</text>

        <rect x="245" y="12" width="195" height="112" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>LESS ___ THAN</text>
        <text x="342" y="47" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>always unequal</text>
        <text x="262" y="67" fontSize="10" fontStyle="italic" fill={caption}>less expensive than that one</text>
        <text x="262" y="83" fontSize="10" fontStyle="italic" fill={caption}>less difficult than before</text>

        <text x="230" y="148" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>always the plain adjective: as heavy as (not heavier), less heavy than</text>

        <line x1="20" y1="160" x2="440" y2="160" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="180" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ as tall than her brother · less expensive as that one</text>
        <text x="230" y="198" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ as tall as her brother · less expensive than that one</text>
      </svg>
    </div>
  );
}
