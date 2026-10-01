import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The genuinely hard part of this topic isn't the 's/s' spelling split (a footnote here) — it's
// that English glues the OWNER onto the front of the thing owned, backwards from how many
// learners' own language phrases it ("the car of my brother"). So the main visual is a straight
// three-piece assembly (owner + 's + thing owned), and the second row is the lesson's own
// word-order mistake shown as a direct reversed-vs-correct contrast, since that's the trap that
// actually catches students, not which apostrophe variant to use.
export function PossessiveSDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        The owner comes first
      </div>
      <svg viewBox="0 0 460 220" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="15" y="18" width="165" height="50" rx="8" fill={fill} stroke={ink} strokeWidth="2" />
        <text x="97" y="48" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>MY BROTHER</text>
        <text x="97" y="10" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>the owner</text>

        <line x1="180" y1="43" x2="292" y2="43" stroke={accent} strokeWidth="2" markerEnd="url(#psArrow)" />
        <text x="236" y="30" textAnchor="middle" fontSize="19" fontWeight="800" fill={accent}>'s</text>

        <rect x="295" y="18" width="150" height="50" rx="8" fill={fill} stroke={ink} strokeWidth="2" />
        <text x="370" y="48" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>CAR</text>
        <text x="370" y="10" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>the thing owned</text>

        <defs>
          <marker id="psArrow" markerWidth="9" markerHeight="9" refX="4" refY="4" orient="auto"><path d="M0,0 L9,4 L0,9 Z" fill={accent} /></marker>
        </defs>

        <text x="230" y="97" textAnchor="middle" fontSize="16" fontWeight="700" fill={ink}>
          my brother<tspan fontWeight="800" fill={accent} fontSize="18">'s</tspan> car
        </text>

        <line x1="30" y1="118" x2="430" y2="118" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="144" textAnchor="middle" fontSize="12" fontWeight="800" fill={wrong}>✗ the sister of Tom</text>
        <text x="230" y="164" textAnchor="middle" fontSize="12" fontWeight="800" fill={right}>✓ Tom's sister</text>
        <text x="230" y="180" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>never "the [thing] of [owner]" — say [owner]'s [thing]</text>

        <text x="230" y="203" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>if the owner is already plural ending in -s, just add the apostrophe:</text>
        <text x="230" y="216" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>my parents' house · the boys' bikes</text>
      </svg>
    </div>
  );
}
