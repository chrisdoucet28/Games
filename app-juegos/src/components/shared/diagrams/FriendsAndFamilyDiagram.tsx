import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Rebuilt per feedback: present perfect + since was a real point in the lesson but not its core —
// the lesson's own opening section is a vocabulary bank of fixed relationship phrases (keep in
// touch, close-knit family, only child, take after someone). A row of those phrases, each with a
// small drawn icon, is now the main visual; "since" survives only as one of the two mistake
// reinforcements below, not the whole diagram.
function PhraseIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "touch":
      return (
        <g>
          <path d={`M ${cx - 10} ${cy - 7} L ${cx + 10} ${cy - 7} L ${cx + 10} ${cy + 5} L ${cx - 2} ${cy + 5} L ${cx - 6} ${cy + 9} L ${cx - 6} ${cy + 5} L ${cx - 10} ${cy + 5} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 8} ${cy - 3} L ${cx} ${cy + 2} L ${cx + 8} ${cy - 3}`} fill="none" stroke={ink} strokeWidth="1.1" />
        </g>
      );
    case "closeknit":
      return (
        <g>
          <circle cx={cx - 6} cy={cy - 3} r="5.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx + 6} cy={cy - 3} r="5.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx} cy={cy + 7} r="5.5" fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "onlychild":
      return (
        <g>
          <circle cx={cx} cy={cy - 4} r="5" fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 7} ${cy + 10} Q ${cx - 7} ${cy + 2} ${cx} ${cy + 2} Q ${cx + 7} ${cy + 2} ${cx + 7} ${cy + 10}`} fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx} cy={cy} r="14" fill="none" stroke={ink} strokeWidth="1" strokeDasharray="2 2" />
        </g>
      );
    case "takeafter":
      return (
        <g>
          <circle cx={cx - 8} cy={cy - 2} r="5" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx + 8} cy={cy - 2} r="7" fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 2} ${cy - 2} L ${cx + 1} ${cy - 2}`} fill="none" stroke={ink} strokeWidth="1.2" markerEnd="url(#fafTakeArrow)" />
        </g>
      );
    default:
      return null;
  }
}

const PHRASES = [
  { id: "touch", label: "keep in touch" },
  { id: "closeknit", label: "close-knit family" },
  { id: "onlychild", label: "only child" },
  { id: "takeafter", label: "take after someone" },
];

export function FriendsAndFamilyDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";
  const colWidth = 420 / PHRASES.length;

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
          <Icon name="heart" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Talking About Family
      </div>
      <svg viewBox="0 0 460 224" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="fafTakeArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={ink} />
          </marker>
        </defs>

        {PHRASES.map((p, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={p.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <PhraseIcon id={p.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="7.6" fontWeight="700" fill={ink}>{p.label}</text>
            </g>
          );
        })}

        <line x1="20" y1="128" x2="440" y2="128" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="148" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ I know my best friend since we were children.</text>
        <text x="230" y="164" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ I have known my best friend since we were children.</text>

        <text x="230" y="184" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ My cousin is married with a doctor.</text>
        <text x="230" y="200" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ My cousin is married to a doctor.</text>
      </svg>
    </div>
  );
}
