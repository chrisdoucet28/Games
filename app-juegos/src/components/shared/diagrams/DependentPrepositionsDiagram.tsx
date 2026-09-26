import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro says it plainly: there's no rule for which preposition goes with which
// word — they're fixed pairs to memorize. So instead of one grammar fork, this is a reference chart
// of the actual pairs, split the same way the lesson splits them (adjective+prep, verb+prep), with
// "arrive" called out separately since it's the one word that genuinely has more than one option.
export function DependentPrepositionsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="target" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Fixed pairs — learn them together
      </div>
      <svg viewBox="0 0 460 205" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="98" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>ADJECTIVE + PREPOSITION</text>
        <text x="35" y="47" fontSize="9" fontStyle="italic" fill={caption}>interested IN · good AT</text>
        <text x="35" y="62" fontSize="9" fontStyle="italic" fill={caption}>afraid/proud/tired OF</text>
        <text x="35" y="77" fontSize="9" fontStyle="italic" fill={caption}>famous/responsible FOR</text>
        <text x="35" y="92" fontSize="9" fontStyle="italic" fill={caption}>married/similar TO</text>
        <text x="35" y="105" fontSize="9" fontStyle="italic" fill={caption}>worried/excited ABOUT</text>

        <rect x="245" y="12" width="195" height="98" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>VERB + PREPOSITION</text>
        <text x="260" y="47" fontSize="9" fontStyle="italic" fill={caption}>depend ON · listen TO</text>
        <text x="260" y="62" fontSize="9" fontStyle="italic" fill={caption}>believe IN · agree WITH</text>
        <text x="260" y="77" fontSize="9" fontStyle="italic" fill={caption}>wait/look/apologize FOR</text>
        <text x="260" y="92" fontSize="9" fontStyle="italic" fill={caption}>complain ABOUT</text>
        <text x="260" y="105" fontSize="9" fontStyle="italic" fill={caption}>congratulate ... ON</text>

        <text x="230" y="130" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>arrive AT a building/point · arrive IN a city/country (no single fixed one)</text>

        <line x1="20" y1="142" x2="440" y2="142" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="162" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ interested for learning. · good in maths. · depends of the weather.</text>
        <text x="230" y="178" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ interested in learning. · good at maths. · depends on the weather.</text>

        <text x="230" y="196" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Please listen me. · married with him. → ✓ listen to me. · married to him.</text>
      </svg>
    </div>
  );
}
