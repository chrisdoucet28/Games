import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own trip vocabulary (pack, check in, take off, souvenir) as a real
// journey row, with the fixed-preposition + gerund example it actually teaches ("looking forward
// to seeing") as the one supporting sentence — vocab first, not the present-perfect-for-experience
// grammar this topic shares with several other B1 lessons.
function TravelIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "pack":
      return (
        <g>
          <rect x={cx - 11} y={cy - 6} width="22" height="16" rx="2" fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 4} ${cy - 6} L ${cx - 4} ${cy - 10} L ${cx + 4} ${cy - 10} L ${cx + 4} ${cy - 6}`} fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "checkin":
      return (
        <g>
          <rect x={cx - 10} y={cy - 9} width="20" height="14" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 10} y1={cy - 3} x2={cx + 10} y2={cy - 3} stroke={ink} strokeWidth="1" strokeDasharray="1.5 1.5" />
          <path d={`M ${cx - 4} ${cy + 1} L ${cx - 1} ${cy + 4} L ${cx + 5} ${cy - 2}`} fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "takeoff":
      return (
        <g>
          <path d={`M ${cx - 12} ${cy + 4} L ${cx + 4} ${cy - 6} L ${cx + 12} ${cy - 10} L ${cx + 8} ${cy - 2} L ${cx - 2} ${cy + 4} L ${cx - 4} ${cy + 10} L ${cx - 7} ${cy + 8} L ${cx - 6} ${cy + 2} Z`} fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "souvenir":
      return (
        <g>
          <rect x={cx - 9} y={cy - 4} width="18" height="14" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 9} y1={cy - 4} x2={cx + 9} y2={cy - 4} stroke={ink} strokeWidth="1" />
          <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 10} stroke={ink} strokeWidth="1.2" />
          <path d={`M ${cx - 3} ${cy - 4} Q ${cx - 3} ${cy - 10} ${cx} ${cy - 10} Q ${cx + 3} ${cy - 10} ${cx + 3} ${cy - 4}`} fill="none" stroke={ink} strokeWidth="1.1" />
        </g>
      );
    default:
      return null;
  }
}

const ITEMS = [
  { id: "pack", label: "pack" },
  { id: "checkin", label: "check in" },
  { id: "takeoff", label: "take off" },
  { id: "souvenir", label: "souvenir" },
];

export function TravelAndHolidaysDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="tent" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Planning a Trip
      </div>
      <svg viewBox="0 0 460 270" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="tahArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={accent} />
          </marker>
        </defs>
        {ITEMS.map((it, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={it.id}>
              {i > 0 && <line x1={boxX - 15} y1="55" x2={boxX - 3} y2="55" stroke={accent} strokeWidth="1.5" markerEnd="url(#tahArrow)" />}
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <TravelIcon id={it.id} cx={cx} cy={55} ink={ink} />
              <text x={cx} y="96" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{it.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9.3" fontStyle="italic" fill={ink}>I'm <tspan fontWeight="800">looking forward to seeing</tspan> the pyramids.</text>

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["book in advance", "boarding pass", "jet lag"].map((w, i) => {
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

        <text x="230" y="214" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ We arrived to the airport two hours early.</text>
        <text x="230" y="230" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ We arrived at the airport two hours early.</text>

        <text x="230" y="248" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ I'm looking forward to visit the pyramids.</text>
        <text x="230" y="264" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ I'm looking forward to seeing the pyramids.</text>
      </svg>
    </div>
  );
}
