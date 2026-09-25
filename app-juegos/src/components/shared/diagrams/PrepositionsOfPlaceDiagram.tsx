import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Mirrors the lesson's own two-part structure: a top scene shows single-object prepositions
// (above/on/in/under/behind/in front of/next to) positioned around one box; a bottom row shows
// the two prepositions the lesson explicitly contrasts against each other — between (needs two
// reference points) and opposite (two things facing across a gap) — since those can't be shown
// relative to a single box the way the top scene's prepositions can.
export function PrepositionsOfPlaceDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const boxFill = isScreen ? hexToRgba(accentColor, 0.12) : "white";

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
          <Icon name="target" size={14} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Where is it?
      </div>
      <svg viewBox="0 0 460 280" style={{ width: "100%", height: "auto", display: "block" }}>
        {/* Ghost box peeking out behind the main one — "behind" */}
        <rect x="163" y="63" width="120" height="60" fill="none" stroke={caption} strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="140" y="54" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={caption}>BEHIND</text>

        {/* Main reference box */}
        <rect x="185" y="80" width="120" height="60" rx="4" fill={boxFill} stroke={ink} strokeWidth="2" />

        {/* ABOVE */}
        <line x1="245" y1="38" x2="245" y2="76" stroke={ink} strokeWidth="1.5" markerEnd="url(#ppArrow)" />
        <text x="245" y="28" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>ABOVE</text>

        {/* ON / ON TOP OF */}
        <circle cx="295" cy="80" r="5" fill={accent} />
        <line x1="330" y1="66" x2="298" y2="78" stroke={caption} strokeWidth="1" />
        <text x="333" y="70" fontSize="10.5" fontWeight="700" fill={accent}>ON / ON TOP OF</text>

        {/* IN */}
        <circle cx="245" cy="110" r="5" fill={ink} />
        <text x="245" y="128" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>IN</text>

        {/* NEXT TO */}
        <circle cx="330" cy="110" r="5" fill={accent} />
        <line x1="305" y1="110" x2="325" y2="110" stroke={caption} strokeWidth="1" />
        <text x="336" y="114" fontSize="10.5" fontWeight="700" fill={accent}>NEXT TO</text>

        {/* Floor line */}
        <line x1="40" y1="200" x2="420" y2="200" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        {/* UNDER */}
        <line x1="245" y1="140" x2="245" y2="198" stroke={ink} strokeWidth="1.5" markerEnd="url(#ppArrow)" />
        <circle cx="245" cy="200" r="4" fill={ink} />
        <text x="245" y="216" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>UNDER</text>

        {/* IN FRONT OF */}
        <line x1="185" y1="140" x2="150" y2="198" stroke={caption} strokeWidth="1.5" />
        <circle cx="150" cy="200" r="4" fill={accent} />
        <text x="150" y="216" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={accent}>IN FRONT OF</text>

        <defs>
          <marker id="ppArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={ink} />
          </marker>
        </defs>

        {/* Bottom row — the lesson's own "between vs next to vs near" comparison, which needs a
            second reference point rather than one box */}
        <text x="230" y="240" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>comparing two things</text>

        <rect x="30" y="250" width="20" height="20" fill="none" stroke={ink} strokeWidth="1.5" />
        <rect x="170" y="250" width="20" height="20" fill="none" stroke={ink} strokeWidth="1.5" />
        <circle cx="120" cy="260" r="4" fill={accent} />
        <text x="120" y="278" textAnchor="middle" fontSize="10" fontWeight="700" fill={accent}>BETWEEN</text>

        <rect x="290" y="250" width="20" height="20" fill="none" stroke={ink} strokeWidth="1.5" />
        <rect x="410" y="250" width="20" height="20" fill="none" stroke={ink} strokeWidth="1.5" />
        <line x1="315" y1="260" x2="405" y2="260" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />
        <text x="360" y="278" textAnchor="middle" fontSize="10" fontWeight="700" fill={accent}>OPPOSITE</text>
      </svg>
    </div>
  );
}
