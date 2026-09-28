import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// This topic is a phrase bank, not one grammar rule, so the diagram follows the conversation's own
// natural order left to right (hello → answer → personal info → goodbye) instead of forcing a
// fork. All chrome text kept to plain A1 words; the phrases inside each box are the lesson's own
// target content.
export function GreetingsIntroductionsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";

  const boxes = [
    { title: "HELLO", lines: ["Good morning!", "How are you?"] },
    { title: "ANSWER", lines: ["I'm fine, thank you.", "Not bad, thanks!"] },
    { title: "PERSONAL INFO", lines: ["What's your name?", "How old are you?"] },
    { title: "GOODBYE", lines: ["See you later!", "Take care!"] },
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
          <Icon name="target" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        A conversation, step by step
      </div>
      <svg viewBox="0 0 460 200" style={{ width: "100%", height: "auto", display: "block" }}>
        {boxes.map((b, i) => {
          const x = 20 + i * 110;
          const cx = x + 45;
          return (
            <g key={b.title}>
              <rect x={x} y="16" width="90" height="84" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
              <text x={cx} y="34" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>{b.title}</text>
              <text x={cx} y="55" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>{b.lines[0]}</text>
              <text x={cx} y="71" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>{b.lines[1]}</text>
              {i < boxes.length - 1 && (
                <text x={x + 100} y="62" textAnchor="middle" fontSize="12" fontWeight="800" fill={caption}>→</text>
              )}
            </g>
          );
        })}

        <line x1="20" y1="112" x2="440" y2="112" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="132" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I have twenty years old. · Nice meet you!</text>
        <text x="230" y="148" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I am twenty years old. · Nice to meet you!</text>

        <text x="230" y="166" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Where you are from? · I am fine, thank.</text>
        <text x="230" y="182" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Where are you from? · I'm fine, thank you.</text>
      </svg>
    </div>
  );
}
