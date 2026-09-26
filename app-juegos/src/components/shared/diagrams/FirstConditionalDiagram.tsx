import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson names its own #1 rule in plain words: "the if-clause NEVER uses will." The two block
// labels already say this on their own (one reads "present simple", the other "WILL + base verb")
// — an earlier version added a crossed-out "will" over the first box and a "will belongs here"
// label over the second, which was redundant with what the labels already show and just added
// clutter. The "unless already means if not" double-negative trap is the other concrete mistake
// worth keeping, as a smaller footnote.
export function FirstConditionalDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="forbidden" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Rule #1: never "will" in the if-clause
      </div>
      <svg viewBox="0 0 460 193" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="15" y="8" width="195" height="60" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="112" y="30" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>IF + present simple</text>
        <text x="112" y="46" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>if it rains…</text>

        <line x1="215" y1="38" x2="245" y2="38" stroke={accent} strokeWidth="2" markerEnd="url(#fcArrow)" />
        <defs>
          <marker id="fcArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={accent} /></marker>
        </defs>

        <rect x="250" y="8" width="195" height="60" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="347" y="30" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>WILL + base verb</text>
        <text x="347" y="46" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>…we'll cancel the trip.</text>

        <text x="230" y="93" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={caption}>can / might / should can also replace "will" in the result</text>

        <line x1="20" y1="108" x2="440" y2="108" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="130" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ If you will study, you'll pass.</text>
        <text x="230" y="148" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ If you study, you'll pass.</text>

        <text x="230" y="170" textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>"unless" already means "if not" — don't double it</text>
        <text x="230" y="186" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>✗ Unless you don't hurry… → ✓ Unless you hurry…</text>
      </svg>
    </div>
  );
}
