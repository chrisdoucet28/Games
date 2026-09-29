import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own education vocabulary as a reference row, not the present-
// perfect-continuous/passive/relative-clause/second-conditional grammar skeleton this topic shares
// with most other B2 theme lessons.
function EduIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "curriculum":
      return (
        <g>
          <rect x={cx - 10} y={cy - 9} width="20" height="16" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 6} y1={cy - 4} x2={cx + 6} y2={cy - 4} stroke={ink} strokeWidth="1" />
          <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke={ink} strokeWidth="1" />
          <line x1={cx - 6} y1={cy + 4} x2={cx + 6} y2={cy + 4} stroke={ink} strokeWidth="1" />
        </g>
      );
    case "fees":
      return (
        <g>
          <circle cx={cx} cy={cy} r="11" fill="none" stroke={ink} strokeWidth="1.3" />
          <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>$</text>
        </g>
      );
    case "scholarship":
      return (
        <g>
          <circle cx={cx} cy={cy - 3} r="8" fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 5} ${cy + 4} L ${cx - 7} ${cy + 12} L ${cx} ${cy + 7} L ${cx + 7} ${cy + 12} L ${cx + 5} ${cy + 4}`} fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "vocational":
      return (
        <g>
          <circle cx={cx - 4} cy={cy - 4} r="4.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 1} y1={cy - 1} x2={cx + 9} y2={cy + 9} stroke={ink} strokeWidth="2.2" />
        </g>
      );
    default:
      return null;
  }
}

const ITEMS = [
  { id: "curriculum", label: "curriculum" },
  { id: "fees", label: "tuition fees" },
  { id: "scholarship", label: "scholarship" },
  { id: "vocational", label: "vocational training" },
];

export function EducationSystemsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="books" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Talking About School Systems
      </div>
      <svg viewBox="0 0 460 270" style={{ width: "100%", height: "auto", display: "block" }}>
        {ITEMS.map((it, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={it.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <EduIcon id={it.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="7.8" fontWeight="700" fill={ink}>{it.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9.3" fontStyle="italic" fill={ink}>The curriculum <tspan fontWeight="800">focuses on</tspan> practical skills.</text>

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["compulsory education", "critical thinking", "curriculum", "scholarship"].map((w, i) => {
          const pillColWidth = 420 / 4;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 96) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="156" width="96" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 48} y="172" textAnchor="middle" fontSize="7" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="194" x2="440" y2="194" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="214" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ During the lecture, students made questions.</text>
        <text x="230" y="230" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ During the lecture, students asked questions.</text>

        <text x="230" y="248" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ My mother is teacher at a primary school.</text>
        <text x="230" y="264" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ My mother is a teacher at a primary school.</text>
      </svg>
    </div>
  );
}
