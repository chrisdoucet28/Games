import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// This lesson is a conversation toolkit with four real purposes (the lesson's own four sections),
// so a 2x2 grid of phrase banks is the natural shape rather than one grammar fork. All chrome text
// kept to plain B1 words.
export function AskingForClarificationDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Four ways to ask for clarification
      </div>
      <svg viewBox="0 0 460 276" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="16" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="34" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>REPEAT / SLOW DOWN</text>
        <text x="117" y="50" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>Could you repeat that?</text>
        <text x="117" y="64" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>Pardon?</text>
        <text x="117" y="78" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>Could you say that more slowly?</text>

        <rect x="245" y="16" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="34" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>ASKING THE MEANING</text>
        <text x="342" y="50" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>What do you mean by...?</text>
        <text x="342" y="64" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>Could you clarify that?</text>
        <text x="342" y="78" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>Could you put that in simpler terms?</text>

        <rect x="20" y="102" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="120" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>CHECKING YOU UNDERSTOOD</text>
        <text x="117" y="136" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>Just to clarify, ...?</text>
        <text x="117" y="150" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>So what you're saying is...?</text>
        <text x="117" y="164" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>In other words, ...?</text>

        <rect x="245" y="102" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="120" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>ASKING FOR MORE DETAIL</text>
        <text x="342" y="136" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>Could you be more specific?</text>
        <text x="342" y="150" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>Could you give me an example?</text>
        <text x="342" y="164" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>I'm not sure I follow.</text>

        <line x1="20" y1="190" x2="440" y2="190" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="210" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ What do you mean with that? · Could you give an example for that?</text>
        <text x="230" y="226" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ What do you mean by that? · Could you give an example of that?</text>

        <text x="230" y="244" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Could you explain me the instructions? · Would you mind to repeat?</text>
        <text x="230" y="260" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Could you explain the instructions to me? · Would you mind repeating?</text>
      </svg>
    </div>
  );
}
