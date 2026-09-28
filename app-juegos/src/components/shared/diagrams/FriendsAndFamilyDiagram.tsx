import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const PHRASES = [
  { word: "keep in touch", icon: "touch" },
  { word: "close-knit family", icon: "closeknit" },
  { word: "only child", icon: "onlychild" },
  { word: "rely on", icon: "relyon" },
  { word: "get on with", icon: "geton" },
  { word: "take after", icon: "takeafter" },
];

function FamilyIcon({ icon, cx, cy, ink, accent }: { icon: string; cx: number; cy: number; ink: string; accent: string }) {
  switch (icon) {
    case "touch":
      return (
        <g>
          <path d={`M ${cx - 11} ${cy - 8} L ${cx + 11} ${cy - 8} Q ${cx + 14} ${cy - 8} ${cx + 14} ${cy - 4} L ${cx + 14} ${cy + 2} Q ${cx + 14} ${cy + 6} ${cx + 11} ${cy + 6} L ${cx - 3} ${cy + 6} L ${cx - 6} ${cy + 11} L ${cx - 6} ${cy + 6} L ${cx - 11} ${cy + 6} Q ${cx - 14} ${cy + 6} ${cx - 14} ${cy + 2} L ${cx - 14} ${cy - 4} Q ${cx - 14} ${cy - 8} ${cx - 11} ${cy - 8} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "closeknit":
      return (
        <g>
          <circle cx={cx - 6} cy={cy - 3} r="6" fill="none" stroke={ink} strokeWidth="1.2" />
          <circle cx={cx + 6} cy={cy - 3} r="6" fill="none" stroke={ink} strokeWidth="1.2" />
          <circle cx={cx} cy={cy + 6} r="6" fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "onlychild":
      return (
        <g>
          <circle cx={cx} cy={cy} r="6" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx} cy={cy} r="12" fill="none" stroke={accent} strokeWidth="1.2" strokeDasharray="2 2" />
        </g>
      );
    case "relyon":
      return (
        <g>
          <line x1={cx + 6} y1={cy - 12} x2={cx + 6} y2={cy + 12} stroke={ink} strokeWidth="1.6" />
          <circle cx={cx - 5} cy={cy - 5} r="4" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 5} y1={cy - 1} x2={cx + 4} y2={cy + 8} stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 10} y1={cy + 12} x2={cx - 2} y2={cy + 4} stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "geton":
      return (
        <g>
          <circle cx={cx - 7} cy={cy} r="6" fill="none" stroke={ink} strokeWidth="1.2" />
          <circle cx={cx + 7} cy={cy} r="6" fill="none" stroke={ink} strokeWidth="1.2" />
          <line x1={cx - 2} y1={cy - 6} x2={cx - 2} y2={cy + 6} stroke={accent} strokeWidth="1.3" />
          <line x1={cx - 5} y1={cy - 3} x2={cx + 1} y2={cy - 3} stroke={accent} strokeWidth="1.3" />
        </g>
      );
    case "takeafter":
      return (
        <g>
          <circle cx={cx} cy={cy - 8} r="5" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx} cy={cy + 8} r="4" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx + 6} y1={cy - 4} x2={cx + 6} y2={cy + 4} stroke={accent} strokeWidth="1.3" markerEnd="url(#ffArrow)" />
        </g>
      );
    default:
      return null;
  }
}

// User feedback: the first version was six generic grammar-mistake cards that could belong to any
// lesson and never showed the relationship phrases this topic is actually about. This rebuild
// leads with a reference grid of the lesson's own fixed phrases, each with a small drawn icon,
// matching the Numbers & Colours pattern rather than a mistake-only layout. The comparative rule
// stays as one plain caption line, and only one topic-specific false-friend mistake keeps a
// footer line. All chrome text kept to plain A2 words.
export function FriendsAndFamilyDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="person" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Talking about relationships
      </div>
      <svg viewBox="0 0 460 168" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="ffArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={accent} />
          </marker>
        </defs>
        {PHRASES.map((p, i) => {
          const colWidth = 420 / PHRASES.length;
          const boxX = 20 + i * colWidth + (colWidth - 62) / 2;
          const cx = boxX + 31;
          return (
            <g key={p.word}>
              <rect x={boxX} y="16" width="62" height="64" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <FamilyIcon icon={p.icon} cx={cx} cy={40} ink={ink} accent={accent} />
              <text x={cx} y="70" textAnchor="middle" fontSize="6.8" fontWeight="700" fill={ink}>{p.word}</text>
            </g>
          );
        })}

        <text x="230" y="100" textAnchor="middle" fontSize="8.3" fontStyle="italic" fill={caption}>comparing 3+ people: older → the oldest (not "more old")</text>

        <line x1="20" y1="112" x2="440" y2="112" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="132" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ My cousin is married with a doctor.</text>
        <text x="230" y="148" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ My cousin is married to a doctor.</text>
      </svg>
    </div>
  );
}
