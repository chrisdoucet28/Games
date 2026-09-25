import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Three noun types, three rules — the lesson's actual structure. The middle lane (a plural
// already ending in -s) is the one genuinely different rule; the two outer lanes both end up at
// 's, which the diagram makes visible by giving them the same badge color while the middle lane
// gets its own.
export function PossessiveSDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const altAccent = isScreen ? "#DC2626" : "#1F2937";

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
        What kind of noun owns it?
      </div>
      <svg viewBox="0 0 460 175" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="15" width="135" height="44" rx="8" fill={fill} stroke={ink} strokeWidth="2" />
        <text x="77" y="35" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>SINGULAR NOUN</text>
        <text x="77" y="50" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>Tom · the teacher</text>
        <line x1="77" y1="59" x2="77" y2="78" stroke={accent} strokeWidth="1.5" markerEnd="url(#psArrow1)" />
        <text x="77" y="97" textAnchor="middle" fontSize="16" fontWeight="800" fill={accent}>'s</text>
        <text x="77" y="115" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>Tom's house</text>

        <rect x="163" y="15" width="135" height="44" rx="8" fill={fill} stroke={ink} strokeWidth="2" />
        <text x="230" y="35" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>PLURAL ENDING IN -S</text>
        <text x="230" y="50" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>parents · students</text>
        <line x1="230" y1="59" x2="230" y2="78" stroke={altAccent} strokeWidth="1.5" markerEnd="url(#psArrow2)" />
        <text x="230" y="97" textAnchor="middle" fontSize="16" fontWeight="800" fill={altAccent}>s'</text>
        <text x="230" y="115" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>parents' house</text>

        <rect x="316" y="15" width="135" height="44" rx="8" fill={fill} stroke={ink} strokeWidth="2" />
        <text x="383" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>IRREGULAR PLURAL</text>
        <text x="383" y="42" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={ink}>(no -s ending)</text>
        <text x="383" y="54" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>children</text>
        <line x1="383" y1="59" x2="383" y2="78" stroke={accent} strokeWidth="1.5" markerEnd="url(#psArrow3)" />
        <text x="383" y="97" textAnchor="middle" fontSize="16" fontWeight="800" fill={accent}>'s</text>
        <text x="383" y="115" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>children's room</text>

        <defs>
          <marker id="psArrow1" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill={accent} /></marker>
          <marker id="psArrow2" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill={altAccent} /></marker>
          <marker id="psArrow3" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill={accent} /></marker>
        </defs>

        <text x="230" y="140" textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>never double the s</text>
        <text x="230" y="157" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>✗ my auntss house  →  ✓ my aunt's house</text>
      </svg>
    </div>
  );
}
