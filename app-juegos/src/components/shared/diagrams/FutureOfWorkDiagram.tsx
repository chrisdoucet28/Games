import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own future-of-work vocabulary as a reference row, not the reported-
// speech/inversion/third-conditional/mixed-conditional grammar skeleton this topic shares with
// every other C1 theme lesson.
function WorkIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "automation":
      return (
        <g>
          <circle cx={cx} cy={cy} r="7" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx} cy={cy} r="2.5" fill="none" stroke={ink} strokeWidth="1" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = cx + Math.cos(rad) * 7, y1 = cy + Math.sin(rad) * 7;
            const x2 = cx + Math.cos(rad) * 11, y2 = cy + Math.sin(rad) * 11;
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth="1.6" />;
          })}
        </g>
      );
    case "ai":
      return (
        <g>
          <rect x={cx - 8} y={cy - 6} width="16" height="13" rx="2" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx - 3} cy={cy - 1} r="1.6" fill={ink} />
          <circle cx={cx + 3} cy={cy - 1} r="1.6" fill={ink} />
          <line x1={cx} y1={cy - 6} x2={cx} y2={cy - 11} stroke={ink} strokeWidth="1.2" />
          <circle cx={cx} cy={cy - 12} r="1.5" fill="none" stroke={ink} strokeWidth="1" />
        </g>
      );
    case "freelance":
      return (
        <g>
          <rect x={cx - 11} y={cy - 5} width="22" height="14" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 14} y1={cy + 9} x2={cx + 14} y2={cy + 9} stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "gig":
      return (
        <g>
          <circle cx={cx - 6} cy={cy + 8} r="4" fill="none" stroke={ink} strokeWidth="1.2" />
          <circle cx={cx + 8} cy={cy + 8} r="4" fill="none" stroke={ink} strokeWidth="1.2" />
          <path d={`M ${cx - 6} ${cy + 8} L ${cx - 2} ${cy - 2} L ${cx + 8} ${cy + 8}`} fill="none" stroke={ink} strokeWidth="1.2" />
          <path d={`M ${cx - 2} ${cy - 2} L ${cx + 2} ${cy - 8}`} fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    default:
      return null;
  }
}

const ITEMS = [
  { id: "automation", label: "automation" },
  { id: "ai", label: "artificial intelligence" },
  { id: "freelance", label: "freelance" },
  { id: "gig", label: "gig economy" },
];

export function FutureOfWorkDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="robot" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Talking About the Future of Work
      </div>
      <svg viewBox="0 0 460 300" style={{ width: "100%", height: "auto", display: "block" }}>
        {ITEMS.map((it, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={it.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <WorkIcon id={it.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="7.4" fontWeight="700" fill={ink}>{it.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9.3" fontStyle="italic" fill={ink}>Many workers are <tspan fontWeight="800">upskilling</tspan> to keep up with technology.</text>

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["redundancy", "job security", "workforce", "burnout", "entrepreneur", "upskill"].map((w, i) => {
          const pillColWidth = 420 / 3;
          const row = Math.floor(i / 3);
          const col = i % 3;
          const boxX = 20 + col * pillColWidth + (pillColWidth - 130) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y={156 + row * 30} width="130" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 65} y={172 + row * 30} textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="224" x2="440" y2="224" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="244" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={wrong}>✗ The CEO said AI is transforming their industry.</text>
        <text x="230" y="260" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={right}>✓ The CEO said AI was transforming their industry.</text>

        <text x="230" y="278" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={wrong}>✗ The company's fail to invest led to high turnover.</text>
        <text x="230" y="294" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={right}>✓ The company's failure to invest led to high turnover.</text>
      </svg>
    </div>
  );
}
