import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: this lesson's own vocabulary bank naturally splits into a city side and a
// country side, so a two-column contrast shows the real words directly instead of a single
// grammar rule. The one line below uses the double-comparative structure that's genuinely unique
// to this topic among the B1 set ("the bigger... the worse...").
export function CityVsCountryDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="house" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        City or Country?
      </div>
      <svg viewBox="0 0 460 258" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="120" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="10" fontWeight="800" letterSpacing="0.04em" fill={accent}>CITY</text>
        {["cost of living", "public transport", "congestion", "pollution"].map((w, i) => (
          <text key={w} x="117" y={50 + i * 20} textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{w}</text>
        ))}

        <rect x="245" y="12" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="10" fontWeight="800" letterSpacing="0.04em" fill={accent}>COUNTRY</text>
        {["sense of community", "peace and quiet"].map((w, i) => (
          <text key={w} x="342" y={50 + i * 20} textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{w}</text>
        ))}

        <text x="230" y="152" textAnchor="middle" fontSize="9.2" fontStyle="italic" fill={ink}><tspan fontWeight="800">The bigger</tspan> the city gets, <tspan fontWeight="800">the worse</tspan> the traffic gets.</text>

        <line x1="20" y1="170" x2="440" y2="170" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="190" textAnchor="middle" fontSize="9.8" fontWeight="800" fill={wrong}>✗ I live in countryside.</text>
        <text x="230" y="206" textAnchor="middle" fontSize="9.8" fontWeight="800" fill={right}>✓ I live in the countryside.</text>

        <text x="230" y="228" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ The people in my village is very friendly.</text>
        <text x="230" y="244" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ The people in my village are very friendly.</text>
      </svg>
    </div>
  );
}
