import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const PLURAL_WORDS = ["jeans", "trousers", "shorts", "glasses", "gloves", "socks", "boots", "pyjamas"];

function ClothingIcon({ word, cx, cy, ink, fill, accent }: { word: string; cx: number; cy: number; ink: string; fill: string; accent: string }) {
  const legPair = (legHeight: number, stitch: boolean) => (
    <>
      <rect x={cx - 11} y={cy - 14} width="22" height="5" rx="2" fill={ink} />
      <rect x={cx - 10} y={cy - 9} width="8" height={legHeight} rx="2" fill={fill} stroke={ink} strokeWidth="1.2" />
      <rect x={cx + 2} y={cy - 9} width="8" height={legHeight} rx="2" fill={fill} stroke={ink} strokeWidth="1.2" />
      {stitch && <line x1={cx - 8} y1={cy - 6} x2={cx - 4} y2={cy - 3} stroke={accent} strokeWidth="1" />}
    </>
  );

  switch (word) {
    case "jeans":
      return <g>{legPair(18, true)}</g>;
    case "trousers":
      return <g>{legPair(18, false)}</g>;
    case "shorts":
      return <g>{legPair(9, false)}</g>;
    case "glasses":
      return (
        <g>
          <circle cx={cx - 7} cy={cy} r="6" fill="none" stroke={ink} strokeWidth="1.5" />
          <circle cx={cx + 7} cy={cy} r="6" fill="none" stroke={ink} strokeWidth="1.5" />
          <line x1={cx - 1} y1={cy} x2={cx + 1} y2={cy} stroke={ink} strokeWidth="1.5" />
          <line x1={cx - 13} y1={cy} x2={cx - 17} y2={cy - 3} stroke={ink} strokeWidth="1.5" />
          <line x1={cx + 13} y1={cy} x2={cx + 17} y2={cy - 3} stroke={ink} strokeWidth="1.5" />
        </g>
      );
    case "gloves":
      return (
        <g>
          <rect x={cx - 6} y={cy - 7} width="12" height="16" rx="5" fill={fill} stroke={ink} strokeWidth="1.2" />
          <rect x={cx - 11} y={cy - 9} width="6" height="9" rx="2" fill={fill} stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "socks":
      return (
        <g>
          <rect x={cx - 4} y={cy - 10} width="8" height="16" rx="3" fill={fill} stroke={ink} strokeWidth="1.2" />
          <rect x={cx - 4} y={cy + 4} width="14" height="6" rx="2" fill={fill} stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "boots":
      return (
        <g>
          <rect x={cx - 5} y={cy - 8} width="10" height="10" rx="3" fill={fill} stroke={ink} strokeWidth="1.2" />
          <rect x={cx - 6} y={cy + 1} width="16" height="7" rx="2" fill={fill} stroke={ink} strokeWidth="1.2" />
          <line x1={cx - 6} y1={cy + 8} x2={cx + 10} y2={cy + 8} stroke={ink} strokeWidth="1.5" />
        </g>
      );
    case "pyjamas":
      return (
        <g>
          <path d={`M ${cx - 9} ${cy - 10} L ${cx + 9} ${cy - 10} L ${cx + 6} ${cy - 2} L ${cx - 6} ${cy - 2} Z`} fill={fill} stroke={ink} strokeWidth="1.2" />
          <rect x={cx - 7} y={cy - 2} width="14" height="3" fill={ink} />
          <rect x={cx - 6} y={cy + 1} width="5" height="8" rx="1.5" fill={fill} stroke={ink} strokeWidth="1" />
          <rect x={cx + 1} y={cy + 1} width="5" height="8" rx="1.5" fill={fill} stroke={ink} strokeWidth="1" />
        </g>
      );
    default:
      return null;
  }
}

// The lesson's own second section names the three-way tense choice directly (habit / now /
// finished), so it becomes the main fork, each box led by a glyph (repeat / play / stop) instead
// of just a coloured heading. The always-plural clothing words each get their own drawn icon — no
// "a" shown anywhere near them — instead of a plain word grid, since this lesson is exactly the
// kind of vocabulary a teacher without the student's L1 needs to be able to point at rather than
// say. All chrome text kept to plain A1 words.
export function ClothesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";

  const tenses = [
    { glyph: "↻", title: "HABIT", sub: "every day", example: "He wears a suit." },
    { glyph: "▶", title: "RIGHT NOW", sub: "in this moment", example: "He is wearing a suit." },
    { glyph: "■", title: "FINISHED", sub: "yesterday", example: "He wore a suit." },
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
          <Icon name="clock" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Habit, right now, or finished?
      </div>
      <svg viewBox="0 0 460 276" style={{ width: "100%", height: "auto", display: "block" }}>
        {tenses.map((t, i) => {
          const x = 10 + i * 150;
          const cx = x + 70;
          return (
            <g key={t.title}>
              <rect x={x} y="16" width="140" height="86" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
              <text x={cx} y="40" textAnchor="middle" fontSize="20" fontWeight="800" fill={accent}>{t.glyph}</text>
              <text x={cx} y="58" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>{t.title}</text>
              <text x={cx} y="70" textAnchor="middle" fontSize="7.2" fill={caption}>{t.sub}</text>
              <text x={cx} y="90" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>{t.example}</text>
            </g>
          );
        })}

        <text x="230" y="114" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>always plural — never "a" before them</text>
        {PLURAL_WORDS.map((w, i) => {
          const colWidth = 420 / PLURAL_WORDS.length;
          const boxX = 20 + i * colWidth + (colWidth - 46) / 2;
          const cx = boxX + 23;
          return (
            <g key={w}>
              <rect x={boxX} y="122" width="46" height="56" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <ClothingIcon word={w} cx={cx} cy={142} ink={ink} fill={fill} accent={accent} />
              <text x={cx} y="172" textAnchor="middle" fontSize="7.2" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="190" x2="440" y2="190" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="210" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She is wear a coat. · We are wearing shorts blue today.</text>
        <text x="230" y="226" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She is wearing a coat. · We are wearing blue shorts today.</text>

        <text x="230" y="244" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I am wearing a jeans. · Every day she is wearing a uniform.</text>
        <text x="230" y="260" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I am wearing jeans. · Every day she wears a uniform.</text>
      </svg>
    </div>
  );
}
