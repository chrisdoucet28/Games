import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const STAGES = [
  { word: "wake up", icon: "sun" },
  { word: "get up", icon: "getup" },
  { word: "breakfast", icon: "mug" },
  { word: "work/school", icon: "bag" },
  { word: "chores", icon: "broom" },
  { word: "relax", icon: "sofa" },
  { word: "go to bed", icon: "bed" },
  { word: "fall asleep", icon: "moon" },
];

function RoutineIcon({ icon, cx, cy, ink }: { icon: string; cx: number; cy: number; ink: string }) {
  switch (icon) {
    case "sun":
      return (
        <g>
          <circle cx={cx} cy={cy} r="7" fill="none" stroke={ink} strokeWidth="1.4" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = cx + Math.cos(rad) * 10;
            const y1 = cy + Math.sin(rad) * 10;
            const x2 = cx + Math.cos(rad) * 13;
            const y2 = cy + Math.sin(rad) * 13;
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth="1.4" />;
          })}
        </g>
      );
    case "getup":
      return (
        <g>
          <rect x={cx - 11} y={cy + 3} width="22" height="9" rx="2" fill="none" stroke={ink} strokeWidth="1.4" />
          <circle cx={cx - 4} cy={cy - 6} r="5" fill="none" stroke={ink} strokeWidth="1.4" />
          <line x1={cx - 4} y1={cy - 1} x2={cx - 4} y2={cy + 3} stroke={ink} strokeWidth="1.4" />
        </g>
      );
    case "mug":
      return (
        <g>
          <rect x={cx - 7} y={cy - 6} width="14" height="14" rx="2" fill="none" stroke={ink} strokeWidth="1.4" />
          <path d={`M ${cx + 7} ${cy - 2} Q ${cx + 13} ${cy - 2} ${cx + 13} ${cy + 2} Q ${cx + 13} ${cy + 6} ${cx + 7} ${cy + 6}`} fill="none" stroke={ink} strokeWidth="1.4" />
          <path d={`M ${cx - 4} ${cy - 10} Q ${cx - 2} ${cy - 13} ${cx} ${cy - 10}`} fill="none" stroke={ink} strokeWidth="1" />
        </g>
      );
    case "bag":
      return (
        <g>
          <rect x={cx - 9} y={cy - 6} width="18" height="16" rx="3" fill="none" stroke={ink} strokeWidth="1.4" />
          <path d={`M ${cx - 4} ${cy - 6} L ${cx - 4} ${cy - 10} L ${cx + 4} ${cy - 10} L ${cx + 4} ${cy - 6}`} fill="none" stroke={ink} strokeWidth="1.4" />
        </g>
      );
    case "broom":
      return (
        <g>
          <line x1={cx - 6} y1={cy - 12} x2={cx + 4} y2={cy + 6} stroke={ink} strokeWidth="1.6" />
          <path d={`M ${cx + 4} ${cy + 6} L ${cx + 12} ${cy + 4} L ${cx + 10} ${cy + 12} Z`} fill={ink} />
        </g>
      );
    case "sofa":
      return (
        <g>
          <path d={`M ${cx - 12} ${cy + 6} Q ${cx - 12} ${cy - 8} ${cx} ${cy - 8} Q ${cx + 12} ${cy - 8} ${cx + 12} ${cy + 6}`} fill="none" stroke={ink} strokeWidth="1.4" />
          <line x1={cx - 12} y1={cy + 6} x2={cx + 12} y2={cy + 6} stroke={ink} strokeWidth="1.4" />
        </g>
      );
    case "bed":
      return (
        <g>
          <rect x={cx - 12} y={cy - 2} width="24" height="10" rx="2" fill="none" stroke={ink} strokeWidth="1.4" />
          <rect x={cx - 10} y={cy - 6} width="7" height="5" rx="1.5" fill="none" stroke={ink} strokeWidth="1.2" />
          <line x1={cx - 2} y1={cy + 3} x2={cx + 10} y2={cy + 3} stroke={ink} strokeWidth="1" />
        </g>
      );
    case "moon":
      return (
        <g>
          <path d={`M ${cx + 4} ${cy - 8} A 8 8 0 1 0 ${cx + 4} ${cy + 8} A 6.5 6.5 0 1 1 ${cx + 4} ${cy - 8} Z`} fill={ink} />
          <line x1={cx - 10} y1={cy - 6} x2={cx - 6} y2={cy - 6} stroke={ink} strokeWidth="1.2" />
          <line x1={cx - 8} y1={cy - 8} x2={cx - 8} y2={cy - 4} stroke={ink} strokeWidth="1.2" />
        </g>
      );
    default:
      return null;
  }
}

// User feedback: the first version was six generic grammar-mistake cards that could belong to any
// lesson and never showed a single word of what this topic is actually about. This rebuild leads
// with the routine itself — the lesson's own wake-up-to-bed sequence, drawn as a day's timeline
// with an icon per stage — since that's the one thing that makes this topic instantly
// recognisable. The have-to/don't-have-to obligation contrast is real content from its own
// section, kept small underneath. All chrome text kept to plain A2 words.
export function DailyLifeA2Diagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";

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
          <Icon name="clock" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        A day, wake-up to bed
      </div>
      <svg viewBox="0 0 460 228" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="dl2Arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={caption} />
          </marker>
        </defs>
        <line x1="20" y1="24" x2="436" y2="24" stroke={caption} strokeWidth="1.5" markerEnd="url(#dl2Arrow)" />

        {STAGES.map((s, i) => {
          const colWidth = 420 / STAGES.length;
          const boxX = 20 + i * colWidth + (colWidth - 46) / 2;
          const cx = boxX + 23;
          return (
            <g key={s.word}>
              <circle cx={cx} cy="24" r="3.5" fill={accent} />
              <rect x={boxX} y="34" width="46" height="60" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <RoutineIcon icon={s.icon} cx={cx} cy={58} ink={ink} />
              <text x={cx} y="86" textAnchor="middle" fontSize="6.8" fontWeight="700" fill={ink}>{s.word}</text>
            </g>
          );
        })}

        <rect x="20" y="104" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="122" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>HAVE TO</text>
        <text x="117" y="136" textAnchor="middle" fontSize="7.5" fill={caption}>an obligation</text>
        <text x="117" y="150" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>She has to wake up early.</text>

        <rect x="245" y="104" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="122" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>DON'T HAVE TO</text>
        <text x="342" y="136" textAnchor="middle" fontSize="7.5" fill={caption}>no obligation</text>
        <text x="342" y="150" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>She doesn't have to on Saturdays.</text>

        <line x1="20" y1="168" x2="440" y2="168" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="188" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She goed to the gym yesterday.</text>
        <text x="230" y="204" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She went to the gym yesterday.</text>
      </svg>
    </div>
  );
}
