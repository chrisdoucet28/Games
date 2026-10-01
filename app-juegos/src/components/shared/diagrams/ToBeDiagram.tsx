import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The one fact every other rule in this lesson (contractions, negatives, questions) is built on:
// which subject takes which form. Three lanes, each feeding a subject group down into its one
// correct form. The footer pulls the lesson's two most L1-transfer-prone traps as concrete
// before/afters: there's no "amn't", and age uses BE, never HAVE.
export function ToBeDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="person" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Which form goes with which subject
      </div>
      <svg viewBox="0 0 460 190" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="15" y="15" width="130" height="34" rx="7" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="37" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ink}>I</text>
        <line x1="80" y1="49" x2="80" y2="70" stroke={accent} strokeWidth="1.5" markerEnd="url(#tbArrow)" />
        <text x="80" y="90" textAnchor="middle" fontSize="14" fontWeight="800" fill={accent}>AM</text>
        <text x="80" y="108" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>I'm 25.</text>

        <rect x="165" y="15" width="130" height="34" rx="7" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="37" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ink}>HE / SHE / IT</text>
        <line x1="230" y1="49" x2="230" y2="70" stroke={accent} strokeWidth="1.5" markerEnd="url(#tbArrow)" />
        <text x="230" y="90" textAnchor="middle" fontSize="14" fontWeight="800" fill={accent}>IS</text>
        <text x="230" y="108" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>She's a nurse.</text>

        <rect x="315" y="15" width="130" height="34" rx="7" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="37" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ink}>YOU / WE / THEY</text>
        <line x1="380" y1="49" x2="380" y2="70" stroke={accent} strokeWidth="1.5" markerEnd="url(#tbArrow)" />
        <text x="380" y="90" textAnchor="middle" fontSize="14" fontWeight="800" fill={accent}>ARE</text>
        <text x="380" y="108" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>We're in the same class.</text>

        <defs>
          <marker id="tbArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={accent} />
          </marker>
        </defs>

        <text x="230" y="132" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ I amn't hungry.</text>
        <text x="230" y="150" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ I am not hungry. (no such word as "amn't")</text>

        <text x="230" y="174" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ I have 20 years old.</text>
        <text x="230" y="188" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={right}>✓ I am 20 years old. — age always uses BE, never HAVE</text>
      </svg>
    </div>
  );
}
