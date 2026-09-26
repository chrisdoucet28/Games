import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Present Simple vs Continuous already covers the general "stative verbs are never continuous"
// exception, so repeating that here would waste the space. What's actually new in THIS lesson is
// the one verb that breaks its own rule depending on meaning: "have" is a state (never continuous)
// when it means possession, but an activity (can be continuous) when it means doing something —
// the single trickiest edge case in the whole topic, and worth the diagram's full attention.
export function PresentContinuousA2Diagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        "Have" has two different jobs
      </div>
      <svg viewBox="0 0 460 210" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="15" y="12" width="200" height="46" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="115" y="32" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>POSSESSION — a state</text>
        <text x="115" y="49" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>have a car, have a sister</text>

        <rect x="245" y="12" width="200" height="46" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="345" y="32" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>ACTIVITY — doing something</text>
        <text x="345" y="49" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>having lunch, having a shower</text>

        <text x="115" y="80" textAnchor="middle" fontSize="13" fontWeight="800" fill={wrong}>never continuous</text>
        <text x="115" y="96" textAnchor="middle" fontSize="10" fontStyle="italic" fill={ink}>I have a car.</text>

        <text x="345" y="80" textAnchor="middle" fontSize="13" fontWeight="800" fill={right}>can be continuous</text>
        <text x="345" y="96" textAnchor="middle" fontSize="10" fontStyle="italic" fill={ink}>I'm having lunch.</text>

        <text x="230" y="118" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ He is having a nice car.</text>
        <text x="230" y="135" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ He has a nice car.</text>

        <line x1="20" y1="148" x2="440" y2="148" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="168" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>other state verbs — same rule, no exception</text>
        <text x="230" y="184" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>like · love · hate · want · need · know · understand · believe · own</text>

        <text x="230" y="203" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>"temporary" can still last months: I'm living with a friend for now.</text>
      </svg>
    </div>
  );
}
