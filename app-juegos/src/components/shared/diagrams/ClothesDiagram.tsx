import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const PLURAL_WORDS = ["jeans", "trousers", "shorts", "glasses", "gloves", "socks", "boots", "pyjamas"];

// The lesson's own second section names the three-way tense choice directly (habit / now /
// finished), so it becomes the main fork rather than a sentence about it. The always-plural
// clothing words get their own reference grid — no "a" shown in front of any of them, letting the
// missing article do the teaching instead of a sentence about it. All chrome text kept to plain
// A1 words.
export function ClothesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";

  const tenses = [
    { title: "HABIT", sub: "every day", example: "He wears a suit." },
    { title: "RIGHT NOW", sub: "in this moment", example: "He is wearing a suit." },
    { title: "FINISHED", sub: "yesterday", example: "He wore a suit." },
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
      <svg viewBox="0 0 460 248" style={{ width: "100%", height: "auto", display: "block" }}>
        {tenses.map((t, i) => {
          const x = 10 + i * 150;
          const cx = x + 70;
          return (
            <g key={t.title}>
              <rect x={x} y="16" width="140" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
              <text x={cx} y="34" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>{t.title}</text>
              <text x={cx} y="48" textAnchor="middle" fontSize="7.5" fill={caption}>{t.sub}</text>
              <text x={cx} y="70" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>{t.example}</text>
            </g>
          );
        })}

        <text x="230" y="106" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>always plural — never "a" before them</text>
        {PLURAL_WORDS.map((w, i) => {
          const colWidth = 420 / PLURAL_WORDS.length;
          const x = 20 + i * colWidth + (colWidth - 46) / 2;
          return (
            <g key={w}>
              <rect x={x} y="114" width="46" height="32" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <text x={x + 23} y="134" textAnchor="middle" fontSize="7.3" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="160" x2="440" y2="160" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="180" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She is wear a coat. · We are wearing shorts blue today.</text>
        <text x="230" y="196" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She is wearing a coat. · We are wearing blue shorts today.</text>

        <text x="230" y="214" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I am wearing a jeans. · Every day she is wearing a uniform.</text>
        <text x="230" y="230" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I am wearing jeans. · Every day she wears a uniform.</text>
      </svg>
    </div>
  );
}
