import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own healthcare-systems vocabulary as a reference row, not the
// reported-speech/inversion/third-conditional/mixed-conditional grammar skeleton this topic shares
// with every other C1 theme lesson.
function HealthIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "universal":
      return (
        <g>
          <circle cx={cx} cy={cy} r="11" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke={ink} strokeWidth="1.8" />
          <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke={ink} strokeWidth="1.8" />
        </g>
      );
    case "preventive":
      return (
        <g>
          <path d={`M ${cx} ${cy - 11} L ${cx + 9} ${cy - 7} L ${cx + 9} ${cy + 2} Q ${cx + 9} ${cy + 9} ${cx} ${cy + 12} Q ${cx - 9} ${cy + 9} ${cx - 9} ${cy + 2} L ${cx - 9} ${cy - 7} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 4} ${cy} L ${cx - 1} ${cy + 4} L ${cx + 5} ${cy - 4}`} fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "telemedicine":
      return (
        <g>
          <rect x={cx - 9} y={cy - 12} width="18" height="24" rx="2.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 3} y1={cy - 3} x2={cx + 3} y2={cy - 3} stroke={ink} strokeWidth="1.4" />
          <line x1={cx} y1={cy - 6} x2={cx} y2={cy} stroke={ink} strokeWidth="1.4" />
        </g>
      );
    case "waiting":
      return (
        <g>
          <circle cx={cx} cy={cy} r="11" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx} y1={cy} x2={cx} y2={cy - 6} stroke={ink} strokeWidth="1.3" />
          <line x1={cx} y1={cy} x2={cx + 5} y2={cy + 2} stroke={ink} strokeWidth="1.3" />
        </g>
      );
    default:
      return null;
  }
}

const ITEMS = [
  { id: "universal", label: "universal healthcare" },
  { id: "preventive", label: "preventive care" },
  { id: "telemedicine", label: "telemedicine" },
  { id: "waiting", label: "waiting times" },
];

export function HealthHealthcareSystemsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="shield" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Talking About Healthcare
      </div>
      <svg viewBox="0 0 460 300" style={{ width: "100%", height: "auto", display: "block" }}>
        {ITEMS.map((it, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={it.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <HealthIcon id={it.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="7.2" fontWeight="700" fill={ink}>{it.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9.3" fontStyle="italic" fill={ink}><tspan fontWeight="800">Burnout</tspan> among healthcare workers is a serious problem.</text>

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["health insurance", "chronic illness", "healthcare funding", "life expectancy", "outbreak", "mental health services"].map((w, i) => {
          const pillColWidth = 420 / 3;
          const row = Math.floor(i / 3);
          const col = i % 3;
          const boxX = 20 + col * pillColWidth + (pillColWidth - 130) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y={156 + row * 30} width="130" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 65} y={172 + row * 30} textAnchor="middle" fontSize="6.8" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="224" x2="440" y2="224" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="244" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={wrong}>✗ The doctor claimed the system is failing rural patients.</text>
        <text x="230" y="260" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={right}>✓ The doctor claimed the system was failing rural patients.</text>

        <text x="230" y="278" textAnchor="middle" fontSize="9" fontWeight="800" fill={wrong}>✗ With hospitals overwhelming, doctors had to prioritise cases.</text>
        <text x="230" y="294" textAnchor="middle" fontSize="9" fontWeight="800" fill={right}>✓ With hospitals overwhelmed, doctors had to prioritise cases.</text>
      </svg>
    </div>
  );
}
