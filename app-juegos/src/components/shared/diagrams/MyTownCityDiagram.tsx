import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: a row of the town's own landmarks carries the lesson's two structures at once —
// passive-for-history ("was built") on the things that get built, "there is/are" on the things
// that just exist there. Both are drawn from the lesson's own examples, not invented ones.
function LandmarkIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "cathedral":
      return (
        <g>
          <rect x={cx - 9} y={cy - 2} width="18" height="16" fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 9} ${cy - 2} L ${cx} ${cy - 14} L ${cx + 9} ${cy - 2} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx} y1={cy - 14} x2={cx} y2={cy - 19} stroke={ink} strokeWidth="1.2" />
          <line x1={cx - 2.5} y1={cy - 17} x2={cx + 2.5} y2={cy - 17} stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "bridge":
      return (
        <g>
          <path d={`M ${cx - 14} ${cy + 8} Q ${cx} ${cy - 10} ${cx + 14} ${cy + 8}`} fill="none" stroke={ink} strokeWidth="1.4" />
          <line x1={cx - 14} y1={cy + 8} x2={cx - 14} y2={cy + 14} stroke={ink} strokeWidth="1.2" />
          <line x1={cx + 14} y1={cy + 8} x2={cx + 14} y2={cy + 14} stroke={ink} strokeWidth="1.2" />
          <line x1={cx - 16} y1={cy + 14} x2={cx + 16} y2={cy + 14} stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "market":
      return (
        <g>
          <path d={`M ${cx - 12} ${cy - 4} L ${cx - 6} ${cy - 12} L ${cx} ${cy - 4} Z`} fill="none" stroke={ink} strokeWidth="1.2" />
          <path d={`M ${cx} ${cy - 4} L ${cx + 6} ${cy - 12} L ${cx + 12} ${cy - 4} Z`} fill="none" stroke={ink} strokeWidth="1.2" />
          <rect x={cx - 12} y={cy - 4} width="24" height="12" fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "park":
      return (
        <g>
          <circle cx={cx} cy={cy - 6} r="9" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx} y1={cy + 2} x2={cx} y2={cy + 12} stroke={ink} strokeWidth="1.4" />
        </g>
      );
    default:
      return null;
  }
}

const LANDMARKS = [
  { id: "cathedral", name: "cathedral", tag: "was built" },
  { id: "bridge", name: "bridge", tag: "was built" },
  { id: "market", name: "market", tag: "there is" },
  { id: "park", name: "parks", tag: "there are" },
];

export function MyTownCityDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";
  const colWidth = 420 / LANDMARKS.length;

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
          <Icon name="house" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Describing My Town
      </div>
      <svg viewBox="0 0 460 264" style={{ width: "100%", height: "auto", display: "block" }}>
        {LANDMARKS.map((l, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={l.id}>
              <rect x={boxX} y="20" width="90" height="100" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <LandmarkIcon id={l.id} cx={cx} cy={58} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{l.name}</text>
              <text x={cx} y="106" textAnchor="middle" fontSize="7" fontStyle="italic" fill={accent}>{l.tag}</text>
            </g>
          );
        })}

        <text x="20" y="132" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL PHRASES</text>
        {["famous for", "quieter than", "busier than", "the most beautiful"].map((w, i) => {
          const pillColWidth = 420 / 4;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 96) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="138" width="96" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 48} y="154" textAnchor="middle" fontSize="7.4" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="174" x2="440" y2="174" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="194" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I like to make photos of old buildings.</text>
        <text x="230" y="210" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I like to take photos of old buildings.</text>

        <text x="230" y="232" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={wrong}>✗ There is a good library where you can buy books.</text>
        <text x="230" y="248" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={right}>✓ There is a good bookshop where you can buy books.</text>
      </svg>
    </div>
  );
}
