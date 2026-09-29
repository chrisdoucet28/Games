import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the topic's own name IS a visual metaphor — a tipped scale (work heavier, life
// lighter) shows the imbalance the lesson's vocabulary describes, instead of leading with the
// present-perfect-continuous/passive/relative-clause grammar this topic shares with other B2
// lessons.
export function WorkLifeBalanceDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="hourglass" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Out of Balance
      </div>
      <svg viewBox="0 0 460 250" style={{ width: "100%", height: "auto", display: "block" }}>
        <line x1="140" y1="36" x2="320" y2="12" stroke={ink} strokeWidth="1.8" />
        <path d={`M 222 40 L 238 40 L 230 24 Z`} fill={ink} />
        <line x1="230" y1="40" x2="230" y2="90" stroke={ink} strokeWidth="1.6" />
        <line x1="212" y1="90" x2="248" y2="90" stroke={ink} strokeWidth="1.6" />

        <line x1="140" y1="36" x2="140" y2="56" stroke={caption} strokeWidth="1" />
        <rect x="108" y="56" width="64" height="30" rx="5" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="140" y="76" textAnchor="middle" fontSize="9" fontWeight="800" fill={ink}>WORK</text>

        <line x1="320" y1="12" x2="320" y2="32" stroke={caption} strokeWidth="1" />
        <rect x="288" y="32" width="64" height="30" rx="5" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="320" y="52" textAnchor="middle" fontSize="9" fontWeight="800" fill={ink}>LIFE</text>

        <text x="140" y="102" textAnchor="middle" fontSize="7.2" fontStyle="italic" fill={caption}>burnout</text>
        <text x="320" y="78" textAnchor="middle" fontSize="7.2" fontStyle="italic" fill={caption}>switch off</text>

        <text x="20" y="132" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["set boundaries", "flexible hours", "hustle culture"].map((w, i) => {
          const pillColWidth = 420 / 3;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 130) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="138" width="130" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 65} y="154" textAnchor="middle" fontSize="7.6" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="176" x2="440" y2="176" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="196" textAnchor="middle" fontSize="10" fontWeight="800" fill={wrong}>✗ She was embarrassed with her first child.</text>
        <text x="230" y="212" textAnchor="middle" fontSize="10" fontWeight="800" fill={right}>✓ She was pregnant with her first child.</text>

        <text x="230" y="228" textAnchor="middle" fontSize="10" fontWeight="800" fill={wrong}>✗ I always make a pause at midday.</text>
        <text x="230" y="244" textAnchor="middle" fontSize="10" fontWeight="800" fill={right}>✓ I always take a break at midday.</text>
      </svg>
    </div>
  );
}
