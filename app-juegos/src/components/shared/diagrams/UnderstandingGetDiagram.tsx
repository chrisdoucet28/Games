import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// "Get" has many meanings, but the two patterns that look almost identical — GET + past participle
// vs GET + object + past participle — are the ones most likely to get tangled, since one extra
// word (the object) completely changes who does the action. That contrast is the diagram's focus;
// the smaller conjugation slips (did you get, it gets) stay in the footer.
export function UnderstandingGetDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        One word changes who does the action
      </div>
      <svg viewBox="0 0 460 190" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>GET + PAST PARTICIPLE</text>
        <text x="117" y="46" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>it happens TO you</text>
        <text x="117" y="64" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>She got promoted.</text>
        <text x="117" y="80" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(an informal passive)</text>

        <rect x="245" y="12" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>GET + OBJECT + PARTICIPLE</text>
        <text x="342" y="46" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>YOU arrange it for someone</text>
        <text x="342" y="64" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>I got my hair cut.</text>
        <text x="342" y="80" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(a hairdresser cut it, not you)</text>

        <line x1="20" y1="104" x2="440" y2="104" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="124" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She promoted last month. · I got my hair cutting.</text>
        <text x="230" y="140" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She got promoted. · I got my hair cut.</text>

        <text x="230" y="160" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Did you got my message? · It get really cold at night.</text>
        <text x="230" y="176" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Did you get my message? · It gets really cold at night.</text>
      </svg>
    </div>
  );
}
