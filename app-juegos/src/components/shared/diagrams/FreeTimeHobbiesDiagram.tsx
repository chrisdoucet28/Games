import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: this B1 topic's own vocabulary is about a hobby's BENEFITS (unwind, recharge,
// acquire new skills, passionate about), unlike the A2 free-time topic's concrete hobby nouns — so
// the icon row draws those abstract benefits concretely (a battery for "recharge") instead of
// reusing A2's swimming/reading/gaming/cooking icons for a different vocabulary set.
function BenefitIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "unwind":
      return (
        <g>
          <path d={`M ${cx - 11} ${cy} Q ${cx - 6} ${cy - 5} ${cx - 1} ${cy} Q ${cx + 4} ${cy - 5} ${cx + 9} ${cy}`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 11} ${cy + 6} Q ${cx - 6} ${cy + 1} ${cx - 1} ${cy + 6} Q ${cx + 4} ${cy + 1} ${cx + 9} ${cy + 6}`} fill="none" stroke={ink} strokeWidth="1.1" />
        </g>
      );
    case "recharge":
      return (
        <g>
          <rect x={cx - 8} y={cy - 10} width="16" height="20" rx="2" fill="none" stroke={ink} strokeWidth="1.3" />
          <rect x={cx - 3} y={cy - 13} width="6" height="3" fill={ink} />
          <path d={`M ${cx + 2} ${cy - 6} L ${cx - 3} ${cy + 1} L ${cx + 1} ${cy + 1} L ${cx - 2} ${cy + 8} L ${cx + 5} ${cy - 1} L ${cx + 1} ${cy - 1} Z`} fill={ink} />
        </g>
      );
    case "skills":
      return (
        <g>
          <path d={`M ${cx} ${cy - 11} L ${cx + 3} ${cy - 3} L ${cx + 11} ${cy - 3} L ${cx + 4.5} ${cy + 2} L ${cx + 7} ${cy + 10} L ${cx} ${cy + 5} L ${cx - 7} ${cy + 10} L ${cx - 4.5} ${cy + 2} L ${cx - 11} ${cy - 3} L ${cx - 3} ${cy - 3} Z`} fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "passionate":
      return (
        <g>
          <path d={`M ${cx} ${cy + 8} C ${cx - 12} ${cy - 2} ${cx - 8} ${cy - 12} ${cx} ${cy - 5} C ${cx + 8} ${cy - 12} ${cx + 12} ${cy - 2} ${cx} ${cy + 8} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    default:
      return null;
  }
}

const BENEFITS = [
  { id: "unwind", label: "unwind" },
  { id: "recharge", label: "recharge" },
  { id: "skills", label: "acquire new skills" },
  { id: "passionate", label: "passionate about" },
];

export function FreeTimeHobbiesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";
  const colWidth = 420 / BENEFITS.length;

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
          <Icon name="star" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Why Have a Hobby?
      </div>
      <svg viewBox="0 0 460 284" style={{ width: "100%", height: "auto", display: "block" }}>
        {BENEFITS.map((b, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={b.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <BenefitIcon id={b.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="7.8" fontWeight="700" fill={ink}>{b.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>She's <tspan fontWeight="800">been collecting</tspan> stamps <tspan fontWeight="800">since</tspan> she was a child.</text>

        <text x="20" y="146" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["fulfilling", "take up a hobby", "unwind", "recharge"].map((w, i) => {
          const pillColWidth = 420 / 4;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 96) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="152" width="96" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 48} y="168" textAnchor="middle" fontSize="7.2" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="194" x2="440" y2="194" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="214" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ I realized a painting course last year.</text>
        <text x="230" y="230" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ I did a painting course last year.</text>

        <text x="230" y="252" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I am painter in my free time.</text>
        <text x="230" y="268" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I am a painter in my free time.</text>
      </svg>
    </div>
  );
}
