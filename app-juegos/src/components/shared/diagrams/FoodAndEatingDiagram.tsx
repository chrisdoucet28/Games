import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: a meal's own courses carry the lesson's three irregular past-tense verbs
// (eat/drink/have) naturally, one per course, instead of drilling them as a bare conjugation list.
function CourseIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "starter":
      return (
        <g>
          <path d={`M ${cx - 11} ${cy - 2} Q ${cx} ${cy + 10} ${cx + 11} ${cy - 2} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 3} ${cy - 8} Q ${cx - 1} ${cy - 11} ${cx - 3} ${cy - 14}`} fill="none" stroke={ink} strokeWidth="1.1" />
          <path d={`M ${cx + 3} ${cy - 8} Q ${cx + 5} ${cy - 11} ${cx + 3} ${cy - 14}`} fill="none" stroke={ink} strokeWidth="1.1" />
        </g>
      );
    case "main":
      return (
        <g>
          <circle cx={cx + 2} cy={cy} r="11" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx + 2} cy={cy} r="5" fill="none" stroke={ink} strokeWidth="1" />
          <line x1={cx - 13} y1={cy - 9} x2={cx - 13} y2={cy + 9} stroke={ink} strokeWidth="1.2" />
          <line x1={cx - 15} y1={cy - 9} x2={cx - 15} y2={cy - 3} stroke={ink} strokeWidth="1" />
          <line x1={cx - 11} y1={cy - 9} x2={cx - 11} y2={cy - 3} stroke={ink} strokeWidth="1" />
        </g>
      );
    case "dessert":
      return (
        <g>
          <path d={`M ${cx - 8} ${cy} L ${cx + 8} ${cy} L ${cx + 6} ${cy + 10} L ${cx - 6} ${cy + 10} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 9} ${cy} Q ${cx - 6} ${cy - 6} ${cx - 3} ${cy} Q ${cx} ${cy - 6} ${cx + 3} ${cy} Q ${cx + 6} ${cy - 6} ${cx + 9} ${cy}`} fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx} cy={cy - 9} r="1.8" fill={ink} />
        </g>
      );
    case "drinks":
      return (
        <g>
          <path d={`M ${cx - 7} ${cy - 8} L ${cx - 6} ${cy + 8} Q ${cx - 6} ${cy + 10} ${cx - 4} ${cy + 10} L ${cx + 4} ${cy + 10} Q ${cx + 6} ${cy + 10} ${cx + 6} ${cy + 8} L ${cx + 7} ${cy - 8} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 5} ${cy - 3} Q ${cx} ${cy - 5} ${cx + 5} ${cy - 3}`} fill="none" stroke={ink} strokeWidth="1" />
          <line x1={cx + 3} y1={cy - 8} x2={cx + 5} y2={cy - 15} stroke={ink} strokeWidth="1.1" />
        </g>
      );
    default:
      return null;
  }
}

const COURSES = [
  { id: "starter", name: "starter", verb: "ate the soup" },
  { id: "main", name: "main course", verb: "had the pasta" },
  { id: "dessert", name: "dessert", verb: "ate the cake" },
  { id: "drinks", name: "drinks", verb: "drank coffee" },
];

export function FoodAndEatingDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";
  const colWidth = 420 / COURSES.length;

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
          <Icon name="plate" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Yesterday's Meal
      </div>
      <svg viewBox="0 0 460 224" style={{ width: "100%", height: "auto", display: "block" }}>
        {COURSES.map((c, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={c.id}>
              <rect x={boxX} y="20" width="90" height="100" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <CourseIcon id={c.id} cx={cx} cy={56} ink={ink} />
              <text x={cx} y="92" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{c.name}</text>
              <text x={cx} y="105" textAnchor="middle" fontSize="7" fontStyle="italic" fill={accent}>{c.verb}</text>
            </g>
          );
        })}

        <line x1="20" y1="134" x2="440" y2="134" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="154" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ We arrived to the restaurant late.</text>
        <text x="230" y="170" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ We arrived at the restaurant late.</text>

        <text x="230" y="192" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I have eaten paella yesterday.</text>
        <text x="230" y="208" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I ate paella yesterday.</text>
      </svg>
    </div>
  );
}
