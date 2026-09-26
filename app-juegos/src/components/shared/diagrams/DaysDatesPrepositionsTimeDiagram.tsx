import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own framing is a size pattern — at/on/in scale from a precise point to a long
// period — so the diagram is literally three growing shapes, small to large, each holding its
// preposition's example. The lesson's one exception ("on Saturday morning" — a part of day tied
// to a specific day still takes "on") sits underneath as the one case that breaks the clean scale.
// Below that: the lesson's other genuinely hard part, which the at/on/in scale doesn't touch at
// all — ordinal numbers in dates, where 1st/2nd/3rd are irregular and that SAME irregular pattern
// repeats after 20 (21st/22nd/23rd) before going back to the regular -th. Two of the lesson's own
// seven common mistakes are about exactly this, so it earns its own row rather than being left out.
export function DaysDatesPrepositionsTimeDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.14) : "white";
  const highlightFill = isScreen ? hexToRgba(accentColor, 0.16) : "white";

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
          <Icon name="hourglass" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Zooming out: point → day → period
      </div>
      <svg viewBox="0 0 460 290" style={{ width: "100%", height: "auto", display: "block" }}>
        <line x1="40" y1="90" x2="420" y2="90" stroke={caption} strokeWidth="1.5" markerEnd="url(#ddArrow)" />

        <circle cx="80" cy="90" r="6" fill={accent} />
        <text x="80" y="65" textAnchor="middle" fontSize="13" fontWeight="800" fill={accent}>AT</text>
        <text x="80" y="115" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>a precise point</text>
        <text x="80" y="130" textAnchor="middle" fontSize="10" fontStyle="italic" fill={ink}>at 6 o'clock</text>

        <rect x="205" y="75" width="30" height="30" rx="4" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="220" y="55" textAnchor="middle" fontSize="13" fontWeight="800" fill={accent}>ON</text>
        <text x="220" y="122" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>a day or date</text>
        <text x="220" y="137" textAnchor="middle" fontSize="10" fontStyle="italic" fill={ink}>on Monday · on May 10th</text>

        <rect x="345" y="55" width="70" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="42" textAnchor="middle" fontSize="13" fontWeight="800" fill={accent}>IN</text>
        <text x="380" y="150" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>a month, year, or part of day</text>
        <text x="380" y="165" textAnchor="middle" fontSize="10" fontStyle="italic" fill={ink}>in July · in the morning</text>

        <defs>
          <marker id="ddArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={caption} />
          </marker>
        </defs>

        <text x="230" y="184" textAnchor="middle" fontSize="10" fontStyle="italic" fill={ink}>exception: a part of day tied to one day still uses ON — "on Saturday morning"</text>

        <line x1="20" y1="202" x2="440" y2="202" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="222" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>dates use ordinal numbers — the irregular pattern repeats after 20</text>

        <rect x="15" y="234" width="118" height="24" rx="5" fill={highlightFill} stroke={accent} strokeWidth="1.5" />
        <text x="30" y="250" fontSize="12" fontWeight="800" fill={accent}>1st</text>
        <text x="60" y="250" fontSize="12" fontWeight="800" fill={accent}>2nd</text>
        <text x="94" y="250" fontSize="12" fontWeight="800" fill={accent}>3rd</text>

        <text x="150" y="250" fontSize="11" fill={caption}>4th</text>
        <text x="180" y="250" fontSize="11" fill={caption}>5th</text>
        <text x="205" y="250" fontSize="11" fill={caption}>⋯</text>
        <text x="228" y="250" fontSize="11" fill={caption}>20th</text>

        <rect x="262" y="234" width="145" height="24" rx="5" fill={highlightFill} stroke={accent} strokeWidth="1.5" />
        <text x="272" y="250" fontSize="12" fontWeight="800" fill={accent}>21st</text>
        <text x="308" y="250" fontSize="12" fontWeight="800" fill={accent}>22nd</text>
        <text x="350" y="250" fontSize="12" fontWeight="800" fill={accent}>23rd</text>

        <text x="425" y="250" fontSize="11" fill={caption}>24th</text>

        <text x="230" y="276" textAnchor="middle" fontSize="10" fontStyle="italic" fill={ink}>October 21st (not "21th") · June 3rd (not "3th")</text>
      </svg>
    </div>
  );
}
