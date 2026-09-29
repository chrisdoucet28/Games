import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: this B1 topic's own phrases (fall out, make up, keep in touch, reunion) form a
// real relationship arc — a 4-stage story, not a bare word list — deliberately different from the
// A2 friends_and_family topic's icon grid (keep in touch/close-knit/only child/take after) so the
// two levels don't reuse the same vocabulary or visual device for what are two separate lessons.
function ArcIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "touch":
      return (
        <g>
          <circle cx={cx - 6} cy={cy} r="6" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx + 6} cy={cy} r="6" fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "fallout":
      return (
        <g>
          <circle cx={cx - 9} cy={cy} r="5.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx + 9} cy={cy} r="5.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 2} y1={cy - 4} x2={cx + 2} y2={cy + 4} stroke={ink} strokeWidth="1.4" />
          <line x1={cx + 2} y1={cy - 4} x2={cx - 2} y2={cy + 4} stroke={ink} strokeWidth="1.4" />
        </g>
      );
    case "makeup":
      return (
        <g>
          <path d={`M ${cx - 11} ${cy - 3} L ${cx - 4} ${cy + 4} L ${cx - 1} ${cy - 1} L ${cx + 4} ${cy + 4} L ${cx + 11} ${cy - 5}`} fill="none" stroke={ink} strokeWidth="1.4" />
        </g>
      );
    case "reunion":
      return (
        <g>
          <circle cx={cx} cy={cy} r="9" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx - 10} cy={cy - 4} r="5" fill="none" stroke={ink} strokeWidth="1.1" />
          <circle cx={cx + 10} cy={cy - 4} r="5" fill="none" stroke={ink} strokeWidth="1.1" />
        </g>
      );
    default:
      return null;
  }
}

const STAGES = [
  { id: "touch", label: "keep in touch" },
  { id: "fallout", label: "fall out" },
  { id: "makeup", label: "make up" },
  { id: "reunion", label: "reunion" },
];

export function RelationshipsAndSocialisingDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";
  const colWidth = 420 / STAGES.length;

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
          <Icon name="handshake" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        The Ups and Downs of Friendship
      </div>
      <svg viewBox="0 0 460 258" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="rasArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={accent} />
          </marker>
        </defs>
        {STAGES.map((s, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={s.id}>
              {i > 0 && <line x1={boxX - 15} y1="55" x2={boxX - 3} y2="55" stroke={accent} strokeWidth="1.5" markerEnd="url(#rasArrow)" />}
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <ArcIcon id={s.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="96" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{s.label}</text>
            </g>
          );
        })}

        <text x="20" y="128" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["trust", "support", "bond"].map((w, i) => {
          const pillColWidth = 420 / 3;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 130) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="134" width="130" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 65} y="150" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="172" x2="440" y2="172" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="192" textAnchor="middle" fontSize="10" fontWeight="800" fill={wrong}>✗ She has just apologise to her friend.</text>
        <text x="230" y="208" textAnchor="middle" fontSize="10" fontWeight="800" fill={right}>✓ She has just apologised to her friend.</text>

        <text x="230" y="230" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She is more close to her sister.</text>
        <text x="230" y="246" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She is closer to her sister.</text>
      </svg>
    </div>
  );
}
