import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own motivation vocabulary as a reference row, not the present-
// perfect/passive/relative-clause/second-conditional grammar skeleton this topic shares with most
// other B2 theme lessons.
function MotivationIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "goals":
      return (
        <g>
          <circle cx={cx} cy={cy} r="11" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx} cy={cy} r="6.5" fill="none" stroke={ink} strokeWidth="1.1" />
          <circle cx={cx} cy={cy} r="2" fill={ink} />
        </g>
      );
    case "rolemodel":
      return (
        <g>
          <path d={`M ${cx} ${cy - 11} L ${cx + 3} ${cy - 3} L ${cx + 11} ${cy - 3} L ${cx + 4.5} ${cy + 2} L ${cx + 7} ${cy + 10} L ${cx} ${cy + 5} L ${cx - 7} ${cy + 10} L ${cx - 4.5} ${cy + 2} L ${cx - 11} ${cy - 3} L ${cx - 3} ${cy - 3} Z`} fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "mindset":
      return (
        <g>
          <path d={`M ${cx - 11} ${cy + 6} L ${cx - 3} ${cy - 2} L ${cx + 3} ${cy + 2} L ${cx + 11} ${cy - 8}`} fill="none" stroke={ink} strokeWidth="1.5" />
          <path d={`M ${cx + 4} ${cy - 8} L ${cx + 11} ${cy - 8} L ${cx + 11} ${cy - 1}`} fill="none" stroke={ink} strokeWidth="1.5" />
        </g>
      );
    case "resilience":
      return (
        <g>
          <path d={`M ${cx} ${cy + 9} C ${cx - 12} ${cy - 1} ${cx - 8} ${cy - 11} ${cx} ${cy - 4} C ${cx + 8} ${cy - 11} ${cx + 12} ${cy - 1} ${cx} ${cy + 9} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    default:
      return null;
  }
}

const ITEMS = [
  { id: "goals", label: "goals" },
  { id: "rolemodel", label: "role model" },
  { id: "mindset", label: "growth mindset" },
  { id: "resilience", label: "resilience" },
];

export function SuccessMotivationDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="target" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Talking About Success
      </div>
      <svg viewBox="0 0 460 270" style={{ width: "100%", height: "auto", display: "block" }}>
        {ITEMS.map((it, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={it.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <MotivationIcon id={it.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="7.8" fontWeight="700" fill={ink}>{it.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9.3" fontStyle="italic" fill={ink}>Success often <tspan fontWeight="800">depends on</tspan> persistence.</text>

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["procrastination", "stepping stone", "goals", "resilience"].map((w, i) => {
          const pillColWidth = 420 / 4;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 96) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="156" width="96" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 48} y="172" textAnchor="middle" fontSize="7.2" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="194" x2="440" y2="194" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="214" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={wrong}>✗ My coach is very sensible about my feelings.</text>
        <text x="230" y="230" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={right}>✓ My coach is very sensitive about my feelings.</text>

        <text x="230" y="248" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ Successful people don't avoid to fail.</text>
        <text x="230" y="264" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ Successful people don't avoid failing.</text>
      </svg>
    </div>
  );
}
