import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own remote-work vocabulary bank as a reference row, not the
// present-perfect/passive/conditional grammar this topic shares with most other B1 theme lessons.
function WfhIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "homeoffice":
      return (
        <g>
          <path d={`M ${cx - 11} ${cy - 2} L ${cx} ${cy - 12} L ${cx + 11} ${cy - 2}`} fill="none" stroke={ink} strokeWidth="1.3" />
          <rect x={cx - 8} y={cy - 2} width="16" height="12" fill="none" stroke={ink} strokeWidth="1.3" />
          <rect x={cx - 4} y={cy + 3} width="8" height="4" fill="none" stroke={ink} strokeWidth="1" />
        </g>
      );
    case "commute":
      return (
        <g>
          <path d={`M ${cx - 12} ${cy + 4} L ${cx - 10} ${cy - 3} L ${cx + 10} ${cy - 3} L ${cx + 12} ${cy + 4} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx - 6} cy={cy + 6} r="2.5" fill="none" stroke={ink} strokeWidth="1.2" />
          <circle cx={cx + 6} cy={cy + 6} r="2.5" fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "hybrid":
      return (
        <g>
          <rect x={cx - 12} y={cy - 8} width="10" height="16" rx="2" fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx + 2} ${cy - 8} L ${cx + 7} ${cy - 13} L ${cx + 12} ${cy - 8} L ${cx + 12} ${cy + 8} L ${cx + 2} ${cy + 8} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "logoff":
      return (
        <g>
          <circle cx={cx} cy={cy} r="10" fill="none" stroke={ink} strokeWidth="1.4" />
          <line x1={cx} y1={cy - 12} x2={cx} y2={cy - 3} stroke={ink} strokeWidth="1.4" />
        </g>
      );
    default:
      return null;
  }
}

const ITEMS = [
  { id: "homeoffice", label: "home office" },
  { id: "commute", label: "commute" },
  { id: "hybrid", label: "hybrid working" },
  { id: "logoff", label: "log off" },
];

export function WorkingFromHomeDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";
  const colWidth = 420 / ITEMS.length;

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
          <Icon name="screen" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        A Remote Work Day
      </div>
      <svg viewBox="0 0 460 276" style={{ width: "100%", height: "auto", display: "block" }}>
        {ITEMS.map((it, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={it.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <WfhIcon id={it.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{it.label}</text>
            </g>
          );
        })}

        <text x="230" y="122" textAnchor="middle" fontSize="9" fontStyle="italic" fill={ink}>She has a <tspan fontWeight="800">home office</tspan> in the spare bedroom.</text>
        <text x="230" y="134" textAnchor="middle" fontSize="6.6" fill={caption}>("home office" = the room, not the practice of working from home)</text>

        <text x="20" y="152" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["distraction", "isolated", "concentrate on"].map((w, i) => {
          const pillColWidth = 420 / 3;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 130) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="158" width="130" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 65} y="174" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="196" x2="440" y2="196" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="216" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ I am agree that working from home saves time.</text>
        <text x="230" y="232" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ I agree that working from home saves time.</text>

        <text x="230" y="254" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ She is remote worker who manages her own schedule.</text>
        <text x="230" y="270" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ She is a remote worker who manages her own schedule.</text>
      </svg>
    </div>
  );
}
