import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own learning-strategy phrases form a real journey (mother tongue ->
// picking up words -> practising with someone -> becoming fluent), so a 4-stage path carries that
// vocabulary the same way daily_life_a2's routine timeline does, instead of leading with the
// present-perfect-for-duration grammar this topic shares with several other B1 theme lessons.
function StepIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "mothertongue":
      return (
        <g>
          <path d={`M ${cx - 11} ${cy - 6} Q ${cx - 11} ${cy - 12} ${cx - 4} ${cy - 12} L ${cx + 8} ${cy - 12} Q ${cx + 11} ${cy - 12} ${cx + 11} ${cy - 6} Q ${cx + 11} ${cy} ${cx + 4} ${cy} L ${cx - 2} ${cy} L ${cx - 6} ${cy + 5} L ${cx - 5} ${cy} L ${cx - 6} ${cy} Q ${cx - 11} ${cy} ${cx - 11} ${cy - 6} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "pickup":
      return (
        <g>
          <rect x={cx - 9} y={cy - 8} width="18" height="11" rx="2" fill="none" stroke={ink} strokeWidth="1.3" />
          <text x={cx} y={cy - 0.5} textAnchor="middle" fontSize="7" fontWeight="800" fill={ink}>ab</text>
          <path d={`M ${cx - 4} ${cy + 7} L ${cx} ${cy + 3} L ${cx + 4} ${cy + 7}`} fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "practise":
      return (
        <g>
          <circle cx={cx - 6} cy={cy - 2} r="6.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx + 6} cy={cy + 2} r="6.5" fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "fluent":
      return (
        <g>
          <path d={`M ${cx - 9} ${cy} L ${cx - 2} ${cy + 7} L ${cx + 10} ${cy - 8}`} fill="none" stroke={ink} strokeWidth="1.8" />
        </g>
      );
    default:
      return null;
  }
}

const STEPS = [
  { id: "mothertongue", label: "mother tongue" },
  { id: "pickup", label: "pick up new words" },
  { id: "practise", label: "practise with someone" },
  { id: "fluent", label: "become fluent" },
];

export function LearningLanguageDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";
  const colWidth = 420 / STEPS.length;

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
          <Icon name="chat" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Your Language Journey
      </div>
      <svg viewBox="0 0 460 280" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="llArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={accent} />
          </marker>
        </defs>
        {STEPS.map((s, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={s.id}>
              {i > 0 && <line x1={boxX - 15} y1="55" x2={boxX - 3} y2="55" stroke={accent} strokeWidth="1.5" markerEnd="url(#llArrow)" />}
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <StepIcon id={s.id} cx={cx} cy={55} ink={ink} />
              <text x={cx} y="96" textAnchor="middle" fontSize="6.8" fontWeight="700" fill={ink}>{s.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>I try to <tspan fontWeight="800">practise with</tspan> native speakers every week.</text>

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL PHRASES</text>
        {["immerse yourself in", "become fluent"].map((w, i) => {
          const pillColWidth = 420 / 2;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 190) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="156" width="190" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 95} y="172" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="194" x2="440" y2="194" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="212" textAnchor="middle" fontSize="10" fontWeight="800" fill={wrong}>✗ I assisted to an English class.</text>
        <text x="230" y="228" textAnchor="middle" fontSize="10" fontWeight="800" fill={right}>✓ I attended an English class.</text>

        <text x="230" y="248" textAnchor="middle" fontSize="10" fontWeight="800" fill={wrong}>✗ Don't be afraid to make questions.</text>
        <text x="230" y="264" textAnchor="middle" fontSize="10" fontWeight="800" fill={right}>✓ Don't be afraid to ask questions.</text>
      </svg>
    </div>
  );
}
