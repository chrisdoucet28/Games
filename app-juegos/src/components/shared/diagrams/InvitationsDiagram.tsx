import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const PATTERNS = [
  { phrase: "Would you like to", form: "come" },
  { phrase: "Do you fancy", form: "going" },
  { phrase: "I can't", form: "make it" },
  { phrase: "Why don't we", form: "meet" },
  { phrase: "I already", form: "have plans" },
];

// Every one of the lesson's own commonMistakes is the same shape — the right fixed phrase, wrong
// verb form after it — so that pairing becomes the main reference grid, mirroring the Feelings
// preposition grid. The ask/accept/decline phrase bank below it drops the earlier register labels
// ("enthusiastic", "casual", "soften") since those words sat above this lesson's own A2 level; the
// box order alone now carries that. All chrome text kept to plain A2 words.
export function InvitationsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Each phrase has its own next word
      </div>
      <svg viewBox="0 0 460 236" style={{ width: "100%", height: "auto", display: "block" }}>
        {PATTERNS.map((p, i) => {
          const colWidth = 420 / PATTERNS.length;
          const x = 20 + i * colWidth + 5;
          const cx = x + 37;
          return (
            <g key={p.phrase}>
              <rect x={x} y="16" width="74" height="58" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <text x={cx} y="34" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={accent}>{p.phrase}</text>
              <text x={cx} y="50" textAnchor="middle" fontSize="10" fill={caption}>↓</text>
              <text x={cx} y="66" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>{p.form}</text>
            </g>
          );
        })}

        <rect x="10" y="86" width="140" height="88" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="104" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>ASKING</text>
        <text x="80" y="120" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>Would you like to...?</text>
        <text x="80" y="134" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>Are you free...?</text>
        <text x="80" y="148" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>Shall we...?</text>

        <rect x="160" y="86" width="140" height="88" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="104" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>ACCEPTING</text>
        <text x="230" y="120" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>That sounds great!</text>
        <text x="230" y="134" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>I'd love to!</text>
        <text x="230" y="148" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>Count me in!</text>

        <rect x="310" y="86" width="140" height="88" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="104" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>DECLINING</text>
        <text x="380" y="120" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>I'm afraid I can't make it.</text>
        <text x="380" y="134" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>I already have plans.</text>
        <text x="380" y="148" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>Maybe another time?</text>
        <text x="380" y="165" textAnchor="middle" fontSize="6.8" fontStyle="italic" fill={caption}>be kind, then give a reason</text>

        <line x1="20" y1="186" x2="440" y2="186" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="206" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Would you like come? · Do you fancy to go hiking?</text>
        <text x="230" y="222" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Would you like to come? · Do you fancy going hiking?</text>
      </svg>
    </div>
  );
}
