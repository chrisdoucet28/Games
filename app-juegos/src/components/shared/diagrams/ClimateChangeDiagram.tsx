import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own climate vocabulary as a reference row, not the passive-voice/
// relative-clause/second-conditional grammar skeleton this topic shares with most other B2 theme
// lessons.
function ClimateIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "fossilfuels":
      return (
        <g>
          <rect x={cx - 8} y={cy - 4} width="16" height="14" fill="none" stroke={ink} strokeWidth="1.3" />
          <rect x={cx - 3} y={cy - 12} width="6" height="8" fill="none" stroke={ink} strokeWidth="1.2" />
          <path d={`M ${cx - 1} ${cy - 12} Q ${cx + 2} ${cy - 16} ${cx - 1} ${cy - 19}`} fill="none" stroke={ink} strokeWidth="1" />
        </g>
      );
    case "renewable":
      return (
        <g>
          <circle cx={cx} cy={cy - 12} r="10.5" fill="none" stroke={ink} strokeWidth="1.4" />
          <line x1={cx - 5} y1={cy - 5} x2={cx - 9} y2={cy + 12} stroke={ink} strokeWidth="1.3" />
          <line x1={cx} y1={cy - 2} x2={cx} y2={cy + 12} stroke={ink} strokeWidth="1.3" />
          <line x1={cx + 5} y1={cy - 5} x2={cx + 9} y2={cy + 12} stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "footprint":
      return (
        <g>
          <ellipse cx={cx} cy={cy + 3} rx="6" ry="9" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx - 5} cy={cy - 9} r="1.7" fill={ink} />
          <circle cx={cx - 1.5} cy={cy - 11} r="1.9" fill={ink} />
          <circle cx={cx + 2.5} cy={cy - 10.5} r="1.8" fill={ink} />
          <circle cx={cx + 6} cy={cy - 8} r="1.5" fill={ink} />
        </g>
      );
    case "sealevels":
      return (
        <g>
          <path d={`M ${cx - 12} ${cy + 8} Q ${cx - 8} ${cy + 2} ${cx - 4} ${cy + 8} Q ${cx} ${cy + 2} ${cx + 4} ${cy + 8} Q ${cx + 8} ${cy + 2} ${cx + 12} ${cy + 8}`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 12} ${cy + 14} Q ${cx - 8} ${cy + 8} ${cx - 4} ${cy + 14} Q ${cx} ${cy + 8} ${cx + 4} ${cy + 14} Q ${cx + 8} ${cy + 8} ${cx + 12} ${cy + 14}`} fill="none" stroke={ink} strokeWidth="1.1" />
          <line x1={cx + 2} y1={cy - 4} x2={cx + 2} y2={cy - 14} stroke={ink} strokeWidth="1.4" markerEnd="url(#ccArrow)" />
        </g>
      );
    default:
      return null;
  }
}

const ITEMS = [
  { id: "fossilfuels", label: "fossil fuels" },
  { id: "renewable", label: "renewable energy" },
  { id: "footprint", label: "carbon footprint" },
  { id: "sealevels", label: "rising sea levels" },
];

export function ClimateChangeDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="leaf" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Talking About Climate Change
      </div>
      <svg viewBox="0 0 460 270" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="ccArrow" markerWidth="6" markerHeight="6" refX="3" refY="0.5" orient="auto">
            <path d="M0,6 L3,0 L6,6 Z" fill={ink} />
          </marker>
        </defs>
        {ITEMS.map((it, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={it.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <ClimateIcon id={it.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="7.6" fontWeight="700" fill={ink}>{it.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9.3" fontStyle="italic" fill={ink}>Factories are <tspan fontWeight="800">responsible for</tspan> a large share of emissions.</text>

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["greenhouse gases", "deforestation"].map((w, i) => {
          const pillColWidth = 420 / 2;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 180) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="156" width="180" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 90} y="172" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="194" x2="440" y2="194" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="214" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ We should avoid to use single-use plastic.</text>
        <text x="230" y="230" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ We should avoid using single-use plastic.</text>

        <text x="230" y="248" textAnchor="middle" fontSize="10" fontWeight="800" fill={wrong}>✗ Factories are responsible of emissions.</text>
        <text x="230" y="264" textAnchor="middle" fontSize="10" fontWeight="800" fill={right}>✓ Factories are responsible for emissions.</text>
      </svg>
    </div>
  );
}
