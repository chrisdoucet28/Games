import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro names the trap directly: remembering the auxiliary, and not adding an
// extra one. Drawn as a fixed four-block chain (mirroring Basic Word Order's locked-chain shape,
// since it's the same kind of fixed-order rule) with the auxiliary's position as the one thing
// that never moves. The how many/much/often/long mapping is kept as a compact reference underneath
// since it's genuinely new content this lesson introduces, not covered by any other diagram.
export function MakingQuestionsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const blockFill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
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
          <Icon name="idea" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        The auxiliary's spot never moves
      </div>
      <svg viewBox="0 0 460 210" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="18" width="90" height="40" rx="7" fill={blockFill} stroke={accent} strokeWidth="2" />
        <text x="55" y="42" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>WH-WORD</text>

        <line x1="103" y1="38" x2="118" y2="38" stroke={accent} strokeWidth="2" markerEnd="url(#mqArrow)" />
        <rect x="121" y="18" width="90" height="40" rx="7" fill={blockFill} stroke={accent} strokeWidth="2" />
        <text x="166" y="42" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>AUXILIARY</text>

        <line x1="214" y1="38" x2="229" y2="38" stroke={accent} strokeWidth="2" markerEnd="url(#mqArrow)" />
        <rect x="232" y="18" width="90" height="40" rx="7" fill={blockFill} stroke={accent} strokeWidth="2" />
        <text x="277" y="42" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>SUBJECT</text>

        <line x1="325" y1="38" x2="340" y2="38" stroke={accent} strokeWidth="2" markerEnd="url(#mqArrow)" />
        <rect x="343" y="18" width="105" height="40" rx="7" fill={blockFill} stroke={accent} strokeWidth="2" />
        <text x="395" y="42" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>BASE VERB</text>
        <defs>
          <marker id="mqArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill={accent} /></marker>
        </defs>

        <text x="55" y="76" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={caption}>Where</text>
        <text x="166" y="76" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={caption}>did</text>
        <text x="277" y="76" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={caption}>you</text>
        <text x="395" y="76" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={caption}>go?</text>

        <text x="230" y="100" textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>the auxiliary is never missing, and never doubled</text>

        <line x1="20" y1="112" x2="440" y2="112" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="132" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ What you did yesterday? · Where you are going?</text>
        <text x="230" y="150" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ What did you do yesterday? · Where are you going?</text>

        <text x="230" y="174" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>how many + countable · how much + uncountable/price</text>
        <text x="230" y="192" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>how often + frequency · how long + duration</text>
      </svg>
    </div>
  );
}
