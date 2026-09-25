import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's throughline across all four of its rules is really one idea: subject-verb-object
// order is fixed and nothing gets dropped from it or wedged into it. Drawn as three locked blocks
// with a "nothing goes here" mark on the link most often broken (an adverb squeezed between verb
// and object), plus one concrete before/after pulled from the lesson's own common mistake about
// never dropping the subject — the rule learners find most foreign.
export function BasicWordOrderDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="lock" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        A fixed, locked order
      </div>
      <svg viewBox="0 0 460 190" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="34" width="110" height="44" rx="8" fill={blockFill} stroke={accent} strokeWidth="2" />
        <text x="75" y="61" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>SUBJECT</text>

        <line x1="132" y1="56" x2="173" y2="56" stroke={accent} strokeWidth="2" markerEnd="url(#woArrow)" />
        <circle cx="152" cy="45" r="7" fill="none" stroke={wrong} strokeWidth="1.5" />
        <line x1="147" y1="40" x2="157" y2="50" stroke={wrong} strokeWidth="1.5" />

        <rect x="175" y="34" width="110" height="44" rx="8" fill={blockFill} stroke={accent} strokeWidth="2" />
        <text x="230" y="61" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>VERB</text>

        <line x1="287" y1="56" x2="328" y2="56" stroke={accent} strokeWidth="2" markerEnd="url(#woArrow)" />
        <circle cx="307" cy="45" r="7" fill="none" stroke={wrong} strokeWidth="1.5" />
        <line x1="302" y1="40" x2="312" y2="50" stroke={wrong} strokeWidth="1.5" />
        <text x="307" y="30" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>nothing goes here</text>

        <rect x="330" y="34" width="110" height="44" rx="8" fill={blockFill} stroke={accent} strokeWidth="2" />
        <text x="385" y="61" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>OBJECT</text>

        <defs>
          <marker id="woArrow" markerWidth="9" markerHeight="9" refX="4" refY="4" orient="auto">
            <path d="M0,0 L9,4 L0,9 Z" fill={accent} />
          </marker>
        </defs>

        <text x="75" y="100" textAnchor="middle" fontSize="11.5" fontStyle="italic" fill={caption}>She</text>
        <text x="230" y="100" textAnchor="middle" fontSize="11.5" fontStyle="italic" fill={caption}>often calls</text>
        <text x="385" y="100" textAnchor="middle" fontSize="11.5" fontStyle="italic" fill={caption}>her mother</text>

        <text x="230" y="126" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>never drop the subject or object — even when there's no real "thing" doing the action</text>

        <text x="115" y="160" textAnchor="end" fontSize="12" fontWeight="800" fill={wrong}>✗ Is raining.</text>
        <text x="135" y="160" fontSize="12" fontWeight="800" fill={right}>✓ It's raining.</text>
      </svg>
    </div>
  );
}
