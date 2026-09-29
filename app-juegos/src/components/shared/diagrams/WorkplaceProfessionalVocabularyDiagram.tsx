import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const PHRASES = [
  { lines: ["hand in", "your notice"], icon: "envelope" },
  { lines: ["meet a", "deadline"], icon: "deadline" },
  { lines: ["a pay", "rise"], icon: "payrise" },
  { lines: ["a job", "offer"], icon: "offer" },
  { lines: ["sign off", "on"], icon: "signoff" },
  { lines: ["pull your", "weight"], icon: "weight" },
];

function WorkIcon({ icon, cx, cy, ink, accent }: { icon: string; cx: number; cy: number; ink: string; accent: string }) {
  switch (icon) {
    case "envelope":
      return (
        <g>
          <rect x={cx - 12} y={cy - 8} width="24" height="16" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 12} ${cy - 8} L ${cx} ${cy + 2} L ${cx + 12} ${cy - 8}`} fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "deadline":
      return (
        <g>
          <circle cx={cx} cy={cy} r="11" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx} y1={cy} x2={cx} y2={cy - 6} stroke={ink} strokeWidth="1.2" />
          <line x1={cx} y1={cy} x2={cx + 5} y2={cy + 2} stroke={ink} strokeWidth="1.2" />
          <path d={`M ${cx + 9} ${cy - 9} L ${cx + 14} ${cy - 9} L ${cx + 14} ${cy - 4}`} fill="none" stroke={accent} strokeWidth="1.4" />
        </g>
      );
    case "payrise":
      return (
        <g>
          <line x1={cx - 12} y1={cy + 9} x2={cx + 12} y2={cy - 9} stroke={accent} strokeWidth="1.6" markerEnd="url(#wpArrow)" />
          <text x={cx - 5} y={cy + 8} fontSize="9" fontWeight="800" fill={ink}>$</text>
        </g>
      );
    case "offer":
      return (
        <g>
          <rect x={cx - 11} y={cy - 9} width="22" height="18" rx="2" fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 5} ${cy} L ${cx - 1} ${cy + 4} L ${cx + 7} ${cy - 5}`} fill="none" stroke={accent} strokeWidth="1.6" />
        </g>
      );
    case "signoff":
      return (
        <g>
          <path d={`M ${cx - 11} ${cy + 6} Q ${cx - 6} ${cy - 6} ${cx - 1} ${cy + 2} Q ${cx + 4} ${cy + 9} ${cx + 11} ${cy - 4}`} fill="none" stroke={ink} strokeWidth="1.4" />
          <circle cx={cx + 11} cy={cy - 4} r="0.5" fill={ink} />
        </g>
      );
    case "weight":
      return (
        <g>
          <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} stroke={ink} strokeWidth="1.6" />
          <rect x={cx - 13} y={cy - 6} width="5" height="12" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <rect x={cx + 8} y={cy - 6} width="5" height="12" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    default:
      return null;
  }
}

// The lesson's own intro says the fixed word pairing is the whole point, so the collocations lead
// as a reference grid with a small icon per phrase, and six of them map directly onto the lesson's
// own commonMistakes. All chrome text kept to plain B2 words.
export function WorkplaceProfessionalVocabularyDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Fixed workplace collocations
      </div>
      <svg viewBox="0 0 460 220" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="wpArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={accent} />
          </marker>
        </defs>
        {PHRASES.map((p, i) => {
          const colWidth = 420 / PHRASES.length;
          const boxX = 20 + i * colWidth + (colWidth - 62) / 2;
          const cx = boxX + 31;
          return (
            <g key={p.lines.join(" ")}>
              <rect x={boxX} y="16" width="62" height="72" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <WorkIcon icon={p.icon} cx={cx} cy={40} ink={ink} accent={accent} />
              <text x={cx} y="64" textAnchor="middle" fontSize="7.3" fontWeight="700" fill={ink}>{p.lines[0]}</text>
              <text x={cx} y="74" textAnchor="middle" fontSize="7.3" fontWeight="700" fill={ink}>{p.lines[1]}</text>
            </g>
          );
        })}

        <line x1="20" y1="100" x2="440" y2="100" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="120" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She hand in her notice last week. · We meet the deadline last week.</text>
        <text x="230" y="136" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She handed in her notice last week. · We met the deadline last week.</text>

        <text x="230" y="154" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She got a rise pay. · He received a job offer of the company.</text>
        <text x="230" y="170" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She got a pay rise. · He received a job offer from the company.</text>

        <text x="230" y="188" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She signed off the proposal. · He didn't pull his weight enough.</text>
        <text x="230" y="204" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She signed off on the proposal. · He didn't pull his weight.</text>
      </svg>
    </div>
  );
}
