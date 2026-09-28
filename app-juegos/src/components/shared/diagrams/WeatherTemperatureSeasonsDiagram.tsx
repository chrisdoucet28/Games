import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const SEASONS = ["spring", "summer", "autumn", "winter"];

// The lesson's own hardest idea is noun vs adjective (sun/heat/cloud/rain vs sunny/hot/cloudy/
// rainy), so that gets the main fork, marked wrong/right directly (line-through on the noun
// example) rather than a sentence explaining why. The right-now/general-truth tense choice is the
// second real trap the lesson flags, so it gets its own smaller fork below. All chrome text kept
// to plain A1 words.
export function WeatherTemperatureSeasonsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        "It is" + the adjective, not the noun
      </div>
      <svg viewBox="0 0 460 300" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="20" y="10" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>SEASONS</text>
        {SEASONS.map((s, i) => {
          const x = 20 + i * 105;
          return (
            <g key={s}>
              <rect x={x} y="16" width="95" height="30" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <text x={x + 47.5} y="36" textAnchor="middle" fontSize="9" fontWeight="800" fill={ink}>{s}</text>
            </g>
          );
        })}

        <rect x="20" y="58" width="195" height="80" rx="8" fill={fill} stroke={wrong} strokeWidth="2" />
        <text x="117" y="76" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ NOUN</text>
        <text x="117" y="92" textAnchor="middle" fontSize="8" fill={ink}>sun · heat · cloud · rain</text>
        <text x="117" y="110" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={wrong} textDecoration="line-through">It is sun.</text>

        <rect x="245" y="58" width="195" height="80" rx="8" fill={fill} stroke={right} strokeWidth="2" />
        <text x="342" y="76" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ ADJECTIVE</text>
        <text x="342" y="92" textAnchor="middle" fontSize="8" fill={ink}>sunny · hot · cloudy · rainy</text>
        <text x="342" y="110" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={right}>It is sunny.</text>

        <rect x="20" y="148" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="166" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>RIGHT NOW</text>
        <text x="117" y="179" textAnchor="middle" fontSize="7.8" fill={caption}>an action happening now</text>
        <text x="117" y="192" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>It is raining outside.</text>

        <rect x="245" y="148" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="166" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>GENERAL TRUTH</text>
        <text x="342" y="179" textAnchor="middle" fontSize="7.8" fill={caption}>about a season or place</text>
        <text x="342" y="192" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>It rains a lot in winter.</text>

        <line x1="20" y1="212" x2="440" y2="212" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="232" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Today is very heat. · The weather is sun.</text>
        <text x="230" y="248" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Today is very hot. · The weather is sunny.</text>

        <text x="230" y="266" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ It is cloud today. · It is raining a lot in winter.</text>
        <text x="230" y="282" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ It is cloudy today. · It rains a lot in winter.</text>
      </svg>
    </div>
  );
}
