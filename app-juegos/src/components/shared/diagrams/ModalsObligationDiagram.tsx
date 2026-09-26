import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro names this directly: "mixing up 'mustn't' and 'don't have to' is the
// classic trap" — both are negative-looking structures but mean opposite things (forbidden vs
// optional), so that contrast is the whole diagram's focus, with the must/have to conjugation
// difference as a secondary strip since it's a separate, smaller trap in its own right.
export function ModalsObligationDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Two negatives, two opposite meanings
      </div>
      <svg viewBox="0 0 460 222" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="78" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="32" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>MUSTN'T</text>
        <text x="117" y="48" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={ink}>FORBIDDEN — not allowed</text>
        <text x="117" y="65" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>You mustn't smoke here.</text>
        <text x="117" y="78" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(there IS a rule against it)</text>

        <rect x="245" y="12" width="195" height="78" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="32" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>DON'T HAVE TO</text>
        <text x="342" y="48" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={ink}>NOT NECESSARY — optional</text>
        <text x="342" y="65" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>You don't have to pay — it's free.</text>
        <text x="342" y="78" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(no rule either way)</text>

        <text x="230" y="106" textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>must never changes — no "to", no "-s", no question form</text>
        <text x="230" y="122" textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>have to conjugates like a normal verb: has to · do you have to?</text>

        <line x1="20" y1="134" x2="440" y2="134" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="154" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ We mustn't bring food. (meaning: it's optional)</text>
        <text x="230" y="170" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ We don't have to bring food.</text>

        <text x="230" y="190" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Do you must arrive early? · Students must to wear a uniform.</text>
        <text x="230" y="206" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Do you have to arrive early? · Students must wear a uniform.</text>
      </svg>
    </div>
  );
}
