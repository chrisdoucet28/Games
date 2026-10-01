import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// This lesson's whole point is that "get" covers six genuinely different jobs — a two-box diagram
// scoped to just one contrast (informal passive vs arranging a service) left out everything else
// the lesson actually teaches. Every meaning gets its own simple block here, so a student can scan
// all six at a glance; the passive-vs-service contrast that causes the most mistakes still gets a
// one-line callout underneath, since it's still the trickiest pair.
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
          <Icon name="target" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Six jobs for one verb
      </div>
      <svg viewBox="0 0 460 275" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="12" width="140" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="30" textAnchor="middle" fontSize="9" fontWeight="800" fill={accent}>OBTAIN · RECEIVE · BUY</text>
        <text x="80" y="50" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>I got a new laptop.</text>
        <text x="80" y="64" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>(received or bought)</text>

        <rect x="160" y="12" width="140" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>ARRIVE (get to)</text>
        <text x="230" y="50" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>We got to the airport.</text>
        <text x="230" y="64" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>(= arrived there)</text>

        <rect x="310" y="12" width="140" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="30" textAnchor="middle" fontSize="9" fontWeight="800" fill={accent}>BECOME (+adjective)</text>
        <text x="380" y="50" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>It's getting dark.</text>
        <text x="380" y="64" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>(a change of state)</text>

        <rect x="10" y="92" width="140" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="110" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>PHRASAL VERBS</text>
        <text x="80" y="130" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>get up · get on/off</text>
        <text x="80" y="142" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>get back · get together</text>

        <rect x="160" y="92" width="140" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="110" textAnchor="middle" fontSize="9" fontWeight="800" fill={accent}>INFORMAL PASSIVE</text>
        <text x="230" y="124" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>get + past participle</text>
        <text x="230" y="141" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>She got promoted.</text>

        <rect x="310" y="92" width="140" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="110" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={accent}>ARRANGE A SERVICE</text>
        <text x="380" y="124" textAnchor="middle" fontSize="7" fontStyle="italic" fill={caption}>get + object + participle</text>
        <text x="380" y="141" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>I got my hair cut.</text>

        <text x="230" y="180" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>passive vs service: does it happen TO you, or do YOU arrange it?</text>

        <line x1="20" y1="192" x2="440" y2="192" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="212" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She promoted last month. · I got my hair cutting.</text>
        <text x="230" y="228" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She got promoted. · I got my hair cut.</text>

        <text x="230" y="248" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Did you got my message? · It get really cold at night.</text>
        <text x="230" y="264" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Did you get my message? · It gets really cold at night.</text>
      </svg>
    </div>
  );
}
