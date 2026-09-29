import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: this C1 topic's own vocabulary bank (20 words!) as a reference row, deliberately
// different words and icons from the A2 friends_and_family and B1 relationships_and_socialising
// topics so the three levels don't reuse the same vocabulary or visual device. Grammar (reported
// speech/inversion/third-conditional/mixed-conditional/ellipsis) stays out of the main visual —
// it's the same skeleton shared across every C1 theme lesson.
function RelIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "dating":
      return (
        <g>
          <rect x={cx - 7} y={cy - 11} width="14" height="20" rx="2" fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx} ${cy + 1} C ${cx - 5} ${cy - 4} ${cx - 3} ${cy - 8} ${cx} ${cy - 5} C ${cx + 3} ${cy - 8} ${cx + 5} ${cy - 4} ${cx} ${cy + 1} Z`} fill={ink} />
        </g>
      );
    case "ghosting":
      return (
        <g>
          <circle cx={cx} cy={cy - 3} r="6" fill="none" stroke={ink} strokeWidth="1.2" strokeDasharray="2 2" />
          <path d={`M ${cx - 7} ${cy + 11} Q ${cx - 7} ${cy + 3} ${cx} ${cy + 3} Q ${cx + 7} ${cy + 3} ${cx + 7} ${cy + 11}`} fill="none" stroke={ink} strokeWidth="1.2" strokeDasharray="2 2" />
        </g>
      );
    case "boundaries":
      return (
        <g>
          <line x1={cx} y1={cy - 12} x2={cx} y2={cy + 12} stroke={ink} strokeWidth="1.6" strokeDasharray="3 2" />
          <circle cx={cx - 8} cy={cy} r="4" fill="none" stroke={ink} strokeWidth="1.2" />
          <circle cx={cx + 8} cy={cy} r="4" fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "driftapart":
      return (
        <g>
          <circle cx={cx - 9} cy={cy} r="4.5" fill="none" stroke={ink} strokeWidth="1.2" />
          <circle cx={cx + 9} cy={cy} r="4.5" fill="none" stroke={ink} strokeWidth="1.2" />
          <line x1={cx - 13} y1={cy} x2={cx - 18} y2={cy} stroke={ink} strokeWidth="1.2" markerEnd="url(#rmlArrow)" />
          <line x1={cx + 13} y1={cy} x2={cx + 18} y2={cy} stroke={ink} strokeWidth="1.2" markerEnd="url(#rmlArrow2)" />
        </g>
      );
    default:
      return null;
  }
}

const ITEMS = [
  { id: "dating", label: "online dating" },
  { id: "ghosting", label: "ghosting" },
  { id: "boundaries", label: "boundaries" },
  { id: "driftapart", label: "drift apart" },
];

export function RelationshipsModernLifeDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="phone" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Relationships in Modern Life
      </div>
      <svg viewBox="0 0 460 300" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="rmlArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6 Z" fill={ink} />
          </marker>
          <marker id="rmlArrow2" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={ink} />
          </marker>
        </defs>
        {ITEMS.map((it, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={it.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <RelIcon id={it.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="7.8" fontWeight="700" fill={ink}>{it.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>Building real <tspan fontWeight="800">intimacy</tspan> takes time and trust.</text>

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["commitment", "vulnerability", "reconciliation", "codependency", "estrangement", "compatibility"].map((w, i) => {
          const pillColWidth = 420 / 3;
          const row = Math.floor(i / 3);
          const col = i % 3;
          const boxX = 20 + col * pillColWidth + (pillColWidth - 130) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y={156 + row * 30} width="130" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 65} y={172 + row * 30} textAnchor="middle" fontSize="7.2" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="224" x2="440" y2="224" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="244" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ James admitted he is not ready to commit.</text>
        <text x="230" y="260" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ James admitted he was not ready to commit.</text>

        <text x="230" y="278" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={wrong}>✗ She wants a serious relationship, and so is he.</text>
        <text x="230" y="294" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={right}>✓ She wants a serious relationship, and so does he.</text>
      </svg>
    </div>
  );
}
