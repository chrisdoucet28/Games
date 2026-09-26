import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The same do-support pattern as Past Simple and Present Simple, just on "use(d) to": the -d
// only shows up in a positive statement, and disappears the moment did/didn't is there — all
// three of the lesson's common mistakes are this exact spelling split. The footer adds the one
// other thing worth keeping: there's no present form of "used to" at all, so a current habit
// needs present simple instead, not a forced "use to".
export function UsedToPastDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="clock" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        The -d only shows up once
      </div>
      <svg viewBox="0 0 460 216" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="15" y="12" width="200" height="34" rx="8" fill={blockFill} stroke={ink} strokeWidth="2" />
        <text x="115" y="34" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ink}>POSITIVE</text>
        <text x="115" y="68" textAnchor="middle" fontSize="13.5" fontWeight="800" fill={accent}>used to + base verb</text>
        <text x="115" y="86" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>I used to play the guitar.</text>

        <rect x="245" y="12" width="200" height="34" rx="8" fill={blockFill} stroke={ink} strokeWidth="2" />
        <text x="345" y="34" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ink}>NEGATIVE / QUESTION</text>
        <text x="345" y="68" textAnchor="middle" fontSize="13.5" fontWeight="800" fill={accent}>use to (no -d)</text>
        <text x="345" y="86" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>Did you use to live here?</text>

        <text x="115" y="115" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>didn't already carries the past</text>

        <line x1="20" y1="128" x2="440" y2="128" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="150" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ Did you used to live here?</text>
        <text x="230" y="168" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ Did you use to live here?</text>

        <text x="230" y="190" textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>no present form — for a habit NOW, use present simple instead</text>
        <text x="230" y="205" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>a CURRENT habit: not "I use to play tennis" — just "I play tennis"</text>
      </svg>
    </div>
  );
}
