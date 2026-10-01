import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own two moves — present an argument, then concede before disagreeing — lead as
// phrase banks, and its own balanced-argument phrase ("on the one hand... on the other hand")
// gets a literal balance-scale drawing rather than a sentence about it. All chrome text kept to
// plain B2 words.
export function PersuadingDisagreeingAdvancedDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Formal argument and disagreement
      </div>
      <svg viewBox="0 0 460 264" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="16" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="34" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>PRESENTING AN ARGUMENT</text>
        <text x="117" y="50" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>I'd argue that...</text>
        <text x="117" y="64" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>It could be argued that...</text>
        <text x="117" y="78" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>To a certain extent, ...</text>

        <rect x="245" y="16" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="34" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>CONCEDE, THEN DISAGREE</text>
        <text x="342" y="50" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>I take your point, but...</text>
        <text x="342" y="64" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>I'm not entirely convinced.</text>
        <text x="342" y="78" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>With all due respect, ...</text>

        <rect x="20" y="102" width="420" height="72" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <line x1="230" y1="114" x2="230" y2="140" stroke={ink} strokeWidth="2" />
        <line x1="150" y1="140" x2="310" y2="140" stroke={ink} strokeWidth="2" />
        <line x1="150" y1="140" x2="150" y2="150" stroke={ink} strokeWidth="1.4" />
        <line x1="310" y1="140" x2="310" y2="150" stroke={ink} strokeWidth="1.4" />
        <text x="150" y="128" textAnchor="middle" fontSize="8.3" fontWeight="800" fill={accent}>ON THE ONE HAND</text>
        <text x="310" y="128" textAnchor="middle" fontSize="8.3" fontWeight="800" fill={accent}>ON THE OTHER HAND</text>
        <text x="230" y="164" textAnchor="middle" fontSize="8.3" fontStyle="italic" fill={ink}>it saves money — but it risks quality</text>

        <line x1="20" y1="184" x2="440" y2="184" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="204" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I'd argue what the policy has failed. · I agree with a certain extent.</text>
        <text x="230" y="220" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I'd argue that the policy has failed. · I agree to a certain extent.</text>

        <text x="230" y="238" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I'm not entire convinced. · With all due respects...</text>
        <text x="230" y="254" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I'm not entirely convinced. · With all due respect...</text>
      </svg>
    </div>
  );
}
