import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const PHRASES = [
  { word: "delegate", icon: "delegate" },
  { word: "streamline", icon: "streamline" },
  { word: "the bottom line", icon: "bottomline" },
  { word: "red tape", icon: "redtape" },
  { word: "on the same page", icon: "page" },
  { word: "green light", icon: "greenlight" },
];

function BizIcon({ icon, cx, cy, ink, accent }: { icon: string; cx: number; cy: number; ink: string; accent: string }) {
  switch (icon) {
    case "delegate":
      return (
        <g>
          <circle cx={cx - 10} cy={cy} r="5" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx + 10} cy={cy} r="5" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke={accent} strokeWidth="1.5" markerEnd="url(#bpArrow)" />
        </g>
      );
    case "streamline":
      return (
        <g>
          <path d={`M ${cx - 11} ${cy - 6} Q ${cx - 5} ${cy + 8} ${cx + 2} ${cy - 2}`} fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx + 2} y1={cy - 2} x2={cx + 12} y2={cy - 2} stroke={accent} strokeWidth="1.5" markerEnd="url(#bpArrow)" />
        </g>
      );
    case "bottomline":
      return (
        <g>
          <rect x={cx - 9} y={cy - 10} width="18" height="20" rx="1.5" fill="none" stroke={ink} strokeWidth="1.2" />
          <line x1={cx - 6} y1={cy - 4} x2={cx + 6} y2={cy - 4} stroke={ink} strokeWidth="0.9" />
          <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke={ink} strokeWidth="0.9" />
          <line x1={cx - 6} y1={cy + 7} x2={cx + 6} y2={cy + 7} stroke={accent} strokeWidth="2" />
        </g>
      );
    case "redtape":
      return (
        <g>
          <path d={`M ${cx - 11} ${cy - 8} Q ${cx - 3} ${cy - 2} ${cx - 11} ${cy + 4} Q ${cx - 3} ${cy + 10} ${cx + 5} ${cy + 4} Q ${cx + 13} ${cy - 2} ${cx + 5} ${cy - 8}`} fill="none" stroke="#DC2626" strokeWidth="2.2" />
        </g>
      );
    case "page":
      return (
        <g>
          <rect x={cx - 9} y={cy - 9} width="14" height="18" rx="1.5" fill="none" stroke={ink} strokeWidth="1.2" />
          <rect x={cx - 4} y={cy - 6} width="14" height="18" rx="1.5" fill="none" stroke={accent} strokeWidth="1.2" />
        </g>
      );
    case "greenlight":
      return (
        <g>
          <circle cx={cx} cy={cy} r="10" fill="#16A34A" />
          <path d={`M ${cx - 4} ${cy} L ${cx - 1} ${cy + 4} L ${cx + 5} ${cy - 4}`} fill="none" stroke="white" strokeWidth="1.8" />
        </g>
      );
    default:
      return null;
  }
}

// Six of the lesson's own commonMistakes are exactly this set of fixed business phrases, so the
// reference grid covers all six, each with a small icon (red tape and the green light keep their
// real colours, since the colour is part of the phrase's own image). All chrome text kept to plain
// C1 words.
export function BusinessProfessionalVocabularyDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="target" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Fixed business phrases
      </div>
      <svg viewBox="0 0 460 220" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="bpArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={accent} />
          </marker>
        </defs>
        {PHRASES.map((p, i) => {
          const colWidth = 420 / PHRASES.length;
          const boxX = 20 + i * colWidth + (colWidth - 62) / 2;
          const cx = boxX + 31;
          return (
            <g key={p.word}>
              <rect x={boxX} y="16" width="62" height="60" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <BizIcon icon={p.icon} cx={cx} cy={40} ink={ink} accent={accent} />
              <text x={cx} y="68" textAnchor="middle" fontSize="6" fontWeight="700" fill={ink}>{p.word}</text>
            </g>
          );
        })}

        <line x1="20" y1="92" x2="440" y2="92" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="112" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She delegate the task. · The company is streamline its processes.</text>
        <text x="230" y="128" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She delegated the task. · The company is streamlining its processes.</text>

        <text x="230" y="146" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ ...the bottom lines. · Small businesses struggle of red tape.</text>
        <text x="230" y="162" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ ...the bottom line. · Small businesses struggle with red tape.</text>

        <text x="230" y="180" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ We are in the same page. · ...gave the green light for the project.</text>
        <text x="230" y="196" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ We are on the same page. · ...gave the green light to the project.</text>
      </svg>
    </div>
  );
}
