import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const IDIOMS = [
  { phrase: "a piece of cake", gloss: "very easy", icon: "cake" },
  { phrase: "under the weather", gloss: "slightly ill", icon: "weather" },
  { phrase: "cost an arm and a leg", gloss: "very expensive", icon: "tag" },
  { phrase: "break the ice", gloss: "ease tension", icon: "ice" },
  { phrase: "spill the beans", gloss: "reveal a secret", icon: "beans" },
  { phrase: "bite the bullet", gloss: "face something hard", icon: "bullet" },
  { phrase: "hit the nail on the head", gloss: "exactly right", icon: "nail" },
  { phrase: "the ball is in your court", gloss: "it's your turn", icon: "ball" },
];

function IdiomIcon({ icon, cx, cy, ink, accent }: { icon: string; cx: number; cy: number; ink: string; accent: string }) {
  switch (icon) {
    case "cake":
      return (
        <g>
          <path d={`M ${cx - 10} ${cy + 8} L ${cx + 10} ${cy + 8} L ${cx} ${cy - 9} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 6.5} y1={cy + 1} x2={cx + 6.5} y2={cy + 1} stroke={accent} strokeWidth="1.2" />
        </g>
      );
    case "weather":
      return (
        <g>
          <path d={`M ${cx - 9} ${cy} Q ${cx - 12} ${cy - 8} ${cx - 3} ${cy - 8} Q ${cx - 1} ${cy - 12} ${cx + 5} ${cy - 8} Q ${cx + 11} ${cy - 8} ${cx + 9} ${cy} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 4} y1={cy + 4} x2={cx - 6} y2={cy + 9} stroke={accent} strokeWidth="1.2" />
          <line x1={cx + 3} y1={cy + 4} x2={cx + 1} y2={cy + 9} stroke={accent} strokeWidth="1.2" />
        </g>
      );
    case "tag":
      return (
        <g>
          <path d={`M ${cx - 10} ${cy - 8} L ${cx + 4} ${cy - 8} L ${cx + 11} ${cy} L ${cx + 4} ${cy + 8} L ${cx - 10} ${cy + 8} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx - 5} cy={cy} r="1.6" fill={ink} />
          <text x={cx + 1} y={cy + 3} fontSize="8" fontWeight="800" fill={accent}>$</text>
        </g>
      );
    case "ice":
      return (
        <g>
          <rect x={cx - 9} y={cy - 9} width="18" height="18" rx="2" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 6} y1={cy - 6} x2={cx + 6} y2={cy + 6} stroke={accent} strokeWidth="1.3" />
        </g>
      );
    case "beans":
      return (
        <g>
          <path d={`M ${cx - 7} ${cy - 8} L ${cx + 7} ${cy - 8} L ${cx + 5} ${cy + 6} Q ${cx} ${cy + 10} ${cx - 5} ${cy + 6} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <ellipse cx={cx - 10} cy={cy + 9} rx="2.5" ry="1.6" fill={accent} />
          <ellipse cx={cx - 4} cy={cy + 12} rx="2.5" ry="1.6" fill={accent} />
        </g>
      );
    case "bullet":
      return (
        <g>
          <path d={`M ${cx - 9} ${cy} Q ${cx - 9} ${cy - 7} ${cx - 2} ${cy - 7} L ${cx + 8} ${cy - 7} L ${cx + 8} ${cy + 7} L ${cx - 2} ${cy + 7} Q ${cx - 9} ${cy + 7} ${cx - 9} ${cy} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 4} ${cy - 5} Q ${cx} ${cy} ${cx - 4} ${cy + 5}`} fill="none" stroke={accent} strokeWidth="1.2" />
        </g>
      );
    case "nail":
      return (
        <g>
          <line x1={cx} y1={cy - 9} x2={cx} y2={cy + 9} stroke={ink} strokeWidth="1.6" />
          <line x1={cx - 5} y1={cy - 9} x2={cx + 5} y2={cy - 9} stroke={ink} strokeWidth="1.8" />
          <text x={cx + 8} y={cy + 3} fontSize="9" fontWeight="800" fill={accent}>✓</text>
        </g>
      );
    case "ball":
      return (
        <g>
          <line x1={cx - 10} y1={cy + 9} x2={cx - 10} y2={cy - 6} stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 10} y1={cy - 6} x2={cx + 10} y2={cy - 6} stroke={ink} strokeWidth="1.3" />
          <circle cx={cx + 3} cy={cy + 3} r="4.5" fill="none" stroke={accent} strokeWidth="1.3" />
        </g>
      );
    default:
      return null;
  }
}

// Idioms are fixed wording (the lesson's own intro says you can't swap a word), so this leads with
// a reference grid pairing each idiom with a small literal-ish icon and its plain meaning, rather
// than a mistake-first layout — the swapped-word mistakes in the footer only make sense once the
// real idiom is already familiar. All chrome text kept to plain B1 words.
export function CommonIdiomsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="idea" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        The exact words matter
      </div>
      <svg viewBox="0 0 460 274" style={{ width: "100%", height: "auto", display: "block" }}>
        {IDIOMS.map((idiom, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = 20 + col * 105;
          const y = 16 + row * 84;
          const cx = x + 47.5;
          return (
            <g key={idiom.phrase}>
              <rect x={x} y={y} width="95" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <IdiomIcon icon={idiom.icon} cx={cx} cy={y + 24} ink={ink} accent={accent} />
              <text x={cx} y={y + 48} textAnchor="middle" fontSize="7" fontWeight="700" fill={ink}>{idiom.phrase}</text>
              <text x={cx} y={y + 62} textAnchor="middle" fontSize="6.6" fontStyle="italic" fill={caption}>{idiom.gloss}</text>
            </g>
          );
        })}

        <line x1="20" y1="188" x2="440" y2="188" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="208" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ ...a slice of cake. · He told a joke to hit the ice.</text>
        <text x="230" y="224" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ ...a piece of cake. · He told a joke to break the ice.</text>

        <text x="230" y="242" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Don't pour the beans! · It's time to eat the bullet.</text>
        <text x="230" y="258" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Don't spill the beans! · It's time to bite the bullet.</text>
      </svg>
    </div>
  );
}
