import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Two of five common mistakes are backshift slips (will→would, is going to→was going to) and two
// are was/were-going-to mechanics (missing "to", subject-verb agreement) — so the diagram contrasts
// the two forms this lesson actually teaches: a past plan/imminent action vs a backshifted
// prediction, each shown with its own fixed formula.
export function FutureInPastDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        A past plan vs a backshifted prediction
      </div>
      <svg viewBox="0 0 460 195" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>WAS/WERE GOING TO</text>
        <text x="117" y="46" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>a past plan (often unfulfilled)</text>
        <text x="117" y="63" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>I was going to go for a run.</text>
        <text x="117" y="78" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>was/were ABOUT TO = imminent</text>

        <rect x="245" y="12" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>WOULD + base verb</text>
        <text x="342" y="46" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>"will" backshifted in reported speech</text>
        <text x="342" y="63" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>She said she would call me back.</text>
        <text x="342" y="78" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>(she said: "I will call...")</text>

        <line x1="20" y1="104" x2="440" y2="104" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="124" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She said she will call me. · I was going study medicine.</text>
        <text x="230" y="140" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She said she would call me. · I was going to study medicine.</text>

        <text x="230" y="160" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ They was about to leave. · I knew she is going to win.</text>
        <text x="230" y="176" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ They were about to leave. · I knew she was going to win.</text>
      </svg>
    </div>
  );
}
