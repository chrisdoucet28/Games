import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own sport vocabulary (workout, championship, injury, marathon) as a
// reference row, not the present-perfect/first-conditional/passive/comparative grammar skeleton
// this topic shares with almost every other B1 theme lesson.
function SportIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "workout":
      return (
        <g>
          <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} stroke={ink} strokeWidth="1.6" />
          <rect x={cx - 16} y={cy - 5} width="6" height="10" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <rect x={cx + 10} y={cy - 5} width="6" height="10" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "championship":
      return (
        <g>
          <path d={`M ${cx - 8} ${cy - 9} L ${cx + 8} ${cy - 9} L ${cx + 6} ${cy + 2} Q ${cx + 6} ${cy + 7} ${cx} ${cy + 7} Q ${cx - 6} ${cy + 7} ${cx - 6} ${cy + 2} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 8} ${cy - 8} Q ${cx - 14} ${cy - 8} ${cx - 13} ${cy - 2} Q ${cx - 12} ${cy + 2} ${cx - 7} ${cy + 1}`} fill="none" stroke={ink} strokeWidth="1.1" />
          <path d={`M ${cx + 8} ${cy - 8} Q ${cx + 14} ${cy - 8} ${cx + 13} ${cy - 2} Q ${cx + 12} ${cy + 2} ${cx + 7} ${cy + 1}`} fill="none" stroke={ink} strokeWidth="1.1" />
          <line x1={cx} y1={cy + 7} x2={cx} y2={cy + 10} stroke={ink} strokeWidth="1.2" />
          <line x1={cx - 5} y1={cy + 10} x2={cx + 5} y2={cy + 10} stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "injury":
      return (
        <g>
          <circle cx={cx} cy={cy} r="11" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke={ink} strokeWidth="1.6" />
          <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke={ink} strokeWidth="1.6" />
        </g>
      );
    case "marathon":
      return (
        <g>
          <circle cx={cx} cy={cy - 3} r="7" fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 9} ${cy + 2} L ${cx + 9} ${cy + 2}`} fill="none" stroke={ink} strokeWidth="1.1" />
          <path d={`M ${cx - 6} ${cy + 7} L ${cx + 6} ${cy + 7}`} fill="none" stroke={ink} strokeWidth="1.1" />
        </g>
      );
    default:
      return null;
  }
}

const ITEMS = [
  { id: "workout", label: "workout" },
  { id: "championship", label: "championship" },
  { id: "injury", label: "injury" },
  { id: "marathon", label: "marathon" },
];

export function SportAndFitnessDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="trophy" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Talking About Sport
      </div>
      <svg viewBox="0 0 460 276" style={{ width: "100%", height: "auto", display: "block" }}>
        {ITEMS.map((it, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={it.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <SportIcon id={it.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{it.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9.3" fontStyle="italic" fill={ink}>He <tspan fontWeight="800">hasn't played</tspan> football <tspan fontWeight="800">since</tspan> his injury.</text>

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["stamina", "coach", "personal best"].map((w, i) => {
          const pillColWidth = 420 / 3;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 130) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="156" width="130" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 65} y="172" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="194" x2="440" y2="194" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="214" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She has just win the championship.</text>
        <text x="230" y="230" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She has just won the championship.</text>

        <text x="230" y="248" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Running is gooder than walking.</text>
        <text x="230" y="264" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Running is better than walking.</text>
      </svg>
    </div>
  );
}
