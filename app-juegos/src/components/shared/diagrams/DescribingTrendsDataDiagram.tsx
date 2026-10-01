import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const TRENDS = [
  { word: "rise", shape: "rise" },
  { word: "soar", shape: "soar" },
  { word: "fall", shape: "fall" },
  { word: "plummet", shape: "plummet" },
  { word: "fluctuate", shape: "fluctuate" },
  { word: "level off", shape: "leveloff" },
];

function TrendIcon({ shape, cx, cy, accent }: { shape: string; cx: number; cy: number; accent: string }) {
  const arrow = "url(#dtdArrow)";
  switch (shape) {
    case "rise":
      return <line x1={cx - 10} y1={cy + 7} x2={cx + 10} y2={cy - 7} stroke={accent} strokeWidth="1.8" markerEnd={arrow} />;
    case "fall":
      return <line x1={cx - 10} y1={cy - 7} x2={cx + 10} y2={cy + 7} stroke={accent} strokeWidth="1.8" markerEnd={arrow} />;
    case "soar":
      return <line x1={cx - 7} y1={cy + 10} x2={cx + 7} y2={cy - 12} stroke={accent} strokeWidth="1.8" markerEnd={arrow} />;
    case "plummet":
      return <line x1={cx - 7} y1={cy - 12} x2={cx + 7} y2={cy + 10} stroke={accent} strokeWidth="1.8" markerEnd={arrow} />;
    case "fluctuate":
      return <path d={`M ${cx - 11} ${cy} L ${cx - 4} ${cy - 8} L ${cx + 3} ${cy + 7} L ${cx + 11} ${cy - 6}`} fill="none" stroke={accent} strokeWidth="1.8" markerEnd={arrow} />;
    case "leveloff":
      return <path d={`M ${cx - 11} ${cy + 8} L ${cx - 1} ${cy - 7} L ${cx + 11} ${cy - 7}`} fill="none" stroke={accent} strokeWidth="1.8" markerEnd={arrow} />;
    default:
      return null;
  }
}

// User feedback: this topic is literally about reading graphs, and the first version had no
// graphs at all — just text. This rebuild leads with a small line-graph icon for each verb of
// change (rise/soar/fall/plummet/fluctuate/level off), and the by/to/from-to prepositions now each
// annotate the SAME small rising graph — a bracket for the amount (by), an end point for the new
// figure (to), and two labelled points for the full range (from...to) — instead of three bare
// example sentences. All chrome text kept to plain B2 words.
export function DescribingTrendsDataDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";

  const prepBoxes = [
    { x: 20, x1: 35, x2: 101 },
    { x: 165, x1: 180, x2: 246 },
    { x: 310, x1: 325, x2: 391 },
  ];

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
          <Icon name="warning" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Trends, drawn
      </div>
      <svg viewBox="0 0 460 340" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="dtdArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={accent} />
          </marker>
        </defs>

        <text x="20" y="10" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>SHAPES OF A TREND</text>
        {TRENDS.map((t, i) => {
          const colWidth = 420 / TRENDS.length;
          const boxX = 20 + i * colWidth + (colWidth - 60) / 2;
          const cx = boxX + 30;
          return (
            <g key={t.word}>
              <rect x={boxX} y="16" width="60" height="54" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <TrendIcon shape={t.shape} cx={cx} cy={34} accent={accent} />
              <text x={cx} y="60" textAnchor="middle" fontSize="7.2" fontWeight="700" fill={ink}>{t.word}</text>
            </g>
          );
        })}

        <rect x="20" y="80" width="195" height="58" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="98" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>RISE / FALL</text>
        <text x="117" y="112" textAnchor="middle" fontSize="7.6" fill={caption}>no object after it</text>
        <text x="117" y="128" textAnchor="middle" fontSize="8.3" fontStyle="italic" fill={ink}>Prices rose sharply.</text>

        <rect x="245" y="80" width="195" height="58" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="98" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>RAISE</text>
        <text x="342" y="112" textAnchor="middle" fontSize="7.6" fill={caption}>needs an object</text>
        <text x="342" y="128" textAnchor="middle" fontSize="8.3" fontStyle="italic" fill={ink}>The government raised taxes.</text>

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>PREPOSITIONS WITH NUMBERS — SAME TREND</text>

        <rect x={prepBoxes[0].x} y="156" width="130" height="88" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x={prepBoxes[0].x + 65} y="172" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>BY</text>
        <line x1={prepBoxes[0].x1} y1="204" x2={prepBoxes[0].x2} y2="182" stroke={ink} strokeWidth="1.6" />
        <line x1={prepBoxes[0].x2 + 10} y1="182" x2={prepBoxes[0].x2 + 10} y2="204" stroke={accent} strokeWidth="1.3" />
        <line x1={prepBoxes[0].x2 + 6} y1="182" x2={prepBoxes[0].x2 + 14} y2="182" stroke={accent} strokeWidth="1.3" />
        <line x1={prepBoxes[0].x2 + 6} y1="204" x2={prepBoxes[0].x2 + 14} y2="204" stroke={accent} strokeWidth="1.3" />
        <text x={prepBoxes[0].x + 65} y="230" textAnchor="middle" fontSize="7.3" fontStyle="italic" fill={ink}>the amount: 15%</text>

        <rect x={prepBoxes[1].x} y="156" width="130" height="88" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x={prepBoxes[1].x + 65} y="172" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>TO</text>
        <line x1={prepBoxes[1].x1} y1="204" x2={prepBoxes[1].x2} y2="182" stroke={ink} strokeWidth="1.6" />
        <circle cx={prepBoxes[1].x2} cy="182" r="3" fill={accent} />
        <text x={prepBoxes[1].x + 65} y="230" textAnchor="middle" fontSize="7.3" fontStyle="italic" fill={ink}>the new figure: $50</text>

        <rect x={prepBoxes[2].x} y="156" width="130" height="88" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x={prepBoxes[2].x + 65} y="172" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>FROM ... TO</text>
        <line x1={prepBoxes[2].x1} y1="204" x2={prepBoxes[2].x2} y2="182" stroke={ink} strokeWidth="1.6" />
        <circle cx={prepBoxes[2].x1} cy="204" r="3" fill={accent} />
        <circle cx={prepBoxes[2].x2} cy="182" r="3" fill={accent} />
        <text x={prepBoxes[2].x + 65} y="230" textAnchor="middle" fontSize="7.3" fontStyle="italic" fill={ink}>$2m ... $5m</text>

        <line x1="20" y1="254" x2="440" y2="254" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="274" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Prices raised sharply. · Sales increased of 10%.</text>
        <text x="230" y="290" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Prices rose sharply. · Sales increased by 10%.</text>

        <text x="230" y="308" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ There was a rise sharp in prices. · Prices have rose.</text>
        <text x="230" y="324" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ There was a sharp rise in prices. · Prices have risen.</text>
      </svg>
    </div>
  );
}
