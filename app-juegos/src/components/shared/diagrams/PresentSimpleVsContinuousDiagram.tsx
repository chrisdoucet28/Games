import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The routine-vs-right-now split is the headline contrast, but the genuinely surprising part —
// its own dedicated "Watch out for" section in the lesson — is that a whole class of verbs
// (thoughts, feelings, senses) breaks the rule entirely: they stay present simple even when
// literally true right now. That exception gets equal visual weight to the main contrast rather
// than being a footnote, since "I am understanding" is the mistake a rule-following student is
// most likely to make right after learning the main contrast.
export function PresentSimpleVsContinuousDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="warning" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Routine vs right now — and the verbs that break the rule
      </div>
      <svg viewBox="0 0 460 215" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="15" y="12" width="200" height="34" rx="8" fill={fill} stroke={ink} strokeWidth="2" />
        <text x="115" y="34" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ink}>ROUTINE / FACT</text>
        <text x="115" y="62" textAnchor="middle" fontSize="13" fontWeight="800" fill={accent}>present simple</text>
        <text x="115" y="80" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>She goes to the gym on Mondays.</text>
        <text x="115" y="95" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>Water boils at 100°C.</text>

        <rect x="245" y="12" width="200" height="34" rx="8" fill={fill} stroke={ink} strokeWidth="2" />
        <text x="345" y="34" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ink}>HAPPENING NOW</text>
        <text x="345" y="62" textAnchor="middle" fontSize="13" fontWeight="800" fill={accent}>present continuous</text>
        <text x="345" y="80" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>Look! She's swimming.</text>
        <text x="345" y="95" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>I'm studying French this year.</text>

        <line x1="20" y1="112" x2="440" y2="112" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="132" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ink}>BUT: thought / feeling / sense verbs are never continuous</text>
        <text x="230" y="150" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={caption}>want · know · like · understand · believe · own</text>
        <text x="230" y="169" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>— even when it's true right now</text>

        <text x="230" y="190" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ I am understanding it now.</text>
        <text x="230" y="207" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ I understand it now.</text>
      </svg>
    </div>
  );
}
