import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// This lesson has exactly one rule, and all five common mistakes break it the same way: -ed
// describes how a person feels, -ing describes the thing that causes the feeling. A clean two-box
// contrast is all this topic needs — there's no secondary trap to add without diluting it.
export function EdIngAdjectivesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        -ed = how you feel — -ing = what causes it
      </div>
      <svg viewBox="0 0 460 190" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="32" textAnchor="middle" fontSize="13" fontWeight="800" fill={accent}>-ED</text>
        <text x="117" y="48" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={ink}>the PERSON feels it</text>
        <text x="117" y="66" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>I'm interested in history.</text>
        <text x="117" y="82" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>I was bored during the meeting.</text>
        <text x="117" y="97" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>excited · exhausted · confused</text>

        <rect x="245" y="12" width="195" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="32" textAnchor="middle" fontSize="13" fontWeight="800" fill={accent}>-ING</text>
        <text x="342" y="48" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={ink}>the THING causes it</text>
        <text x="342" y="66" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>History is interesting.</text>
        <text x="342" y="82" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>The meeting was boring.</text>
        <text x="342" y="97" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>exciting · exhausting · confusing</text>

        <line x1="20" y1="112" x2="440" y2="112" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="132" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I'm really interesting in this film. · The lecture was so bored.</text>
        <text x="230" y="148" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I'm really interested in this film. · The lecture was so boring.</text>

        <text x="230" y="168" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She felt exciting about her results.</text>
        <text x="230" y="184" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She felt excited about her results.</text>
      </svg>
    </div>
  );
}
