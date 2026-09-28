import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const MISTAKES = [
  { tag: "AGE: be, not have", wrong: "I have 20 years old.", right: "I am 20 years old." },
  { tag: "no \"am\" before agree", wrong: "I am agree with her.", right: "I agree with her." },
  { tag: "listen TO", wrong: "I listen music.", right: "I listen to music." },
  { tag: "adjective before noun", wrong: "a house big", right: "a big house" },
  { tag: "one negative only", wrong: "I don't do nothing.", right: "I don't do anything." },
  { tag: "irregular past: go", wrong: "She goed to the gym.", right: "She went to the gym." },
];

// This topic covers several unrelated grammar points at once (the lesson's own intro says so), so
// there's no single fork to build around — instead, a grid of small labelled mistake cards, one
// per trap, grounded in each of the lesson's own commonMistakes. All chrome text kept to plain A2
// words.
export function DailyLifeA2Diagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
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
          <Icon name="warning" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Six traps in everyday routine talk
      </div>
      <svg viewBox="0 0 460 200" style={{ width: "100%", height: "auto", display: "block" }}>
        {MISTAKES.map((m, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = 10 + col * 150;
          const y = 16 + row * 92;
          const cx = x + 70;
          return (
            <g key={m.tag}>
              <rect x={x} y={y} width="140" height="82" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
              <text x={cx} y={y + 16} textAnchor="middle" fontSize="7.6" fontWeight="800" fill={accent}>{m.tag}</text>
              <text x={cx} y={y + 38} textAnchor="middle" fontSize="7.8" fill={wrong} textDecoration="line-through">{m.wrong}</text>
              <text x={cx} y={y + 60} textAnchor="middle" fontSize="8.3" fontWeight="700" fill={right}>{m.right}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
