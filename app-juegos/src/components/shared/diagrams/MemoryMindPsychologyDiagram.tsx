import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own psychology vocabulary as a reference row, not the reported-
// speech/inversion/third-conditional/mixed-conditional grammar skeleton this topic shares with
// every other C1 theme lesson.
function MindIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "memory":
      return (
        <g>
          <rect x={cx - 10} y={cy - 9} width="20" height="18" rx="1" fill="none" stroke={ink} strokeWidth="1.3" />
          <rect x={cx - 7} y={cy - 6} width="14" height="9" fill="none" stroke={ink} strokeWidth="1.1" />
          <circle cx={cx + 5} cy={cy - 6.5} r="1.2" fill={ink} />
        </g>
      );
    case "mindset":
      return (
        <g>
          <circle cx={cx} cy={cy - 2} r="8" fill="none" stroke={ink} strokeWidth="1.3" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = cx + Math.cos(rad) * 9, y1 = cy - 2 + Math.sin(rad) * 9;
            const x2 = cx + Math.cos(rad) * 12, y2 = cy - 2 + Math.sin(rad) * 12;
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth="1.1" />;
          })}
        </g>
      );
    case "therapy":
      return (
        <g>
          <path d={`M ${cx - 11} ${cy - 6} Q ${cx - 11} ${cy - 12} ${cx - 4} ${cy - 12} L ${cx + 8} ${cy - 12} Q ${cx + 11} ${cy - 12} ${cx + 11} ${cy - 6} Q ${cx + 11} ${cy} ${cx + 4} ${cy} L ${cx - 2} ${cy} L ${cx - 6} ${cy + 5} L ${cx - 5} ${cy} L ${cx - 6} ${cy} Q ${cx - 11} ${cy} ${cx - 11} ${cy - 6} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 4} ${cy - 8} L ${cx - 1} ${cy - 4} L ${cx + 5} ${cy - 10}`} fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "resilience":
      return (
        <g>
          <path d={`M ${cx} ${cy - 11} L ${cx + 9} ${cy - 7} L ${cx + 9} ${cy + 2} Q ${cx + 9} ${cy + 9} ${cx} ${cy + 12} Q ${cx - 9} ${cy + 9} ${cx - 9} ${cy + 2} L ${cx - 9} ${cy - 7} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 4} ${cy} L ${cx - 1} ${cy + 4} L ${cx + 5} ${cy - 4}`} fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    default:
      return null;
  }
}

const ITEMS = [
  { id: "memory", label: "memory" },
  { id: "mindset", label: "mindset" },
  { id: "therapy", label: "therapy" },
  { id: "resilience", label: "resilience" },
];

export function MemoryMindPsychologyDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="idea" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Talking About the Mind
      </div>
      <svg viewBox="0 0 460 300" style={{ width: "100%", height: "auto", display: "block" }}>
        {ITEMS.map((it, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={it.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <MindIcon id={it.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{it.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9.3" fontStyle="italic" fill={ink}>Our <tspan fontWeight="800">subconscious</tspan> influences many daily decisions.</text>

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["subconscious", "bias", "trauma", "wellbeing", "self-esteem", "cognitive"].map((w, i) => {
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

        <text x="230" y="244" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ The patient said she forget things all the time.</text>
        <text x="230" y="260" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ The patient said she forgot things all the time.</text>

        <text x="230" y="278" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={wrong}>✗ Rarely someone forgets such a memory.</text>
        <text x="230" y="294" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={right}>✓ Rarely does someone forget such a memory.</text>
      </svg>
    </div>
  );
}
