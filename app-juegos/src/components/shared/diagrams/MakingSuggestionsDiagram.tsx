import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const PATTERNS = [
  { phrase: "Let's", form: "watch" },
  { phrase: "Shall we", form: "meet" },
  { phrase: "Why not", form: "ask" },
  { phrase: "How about", form: "going" },
  { phrase: "I suggest", form: "having" },
];

// Every one of the lesson's own commonMistakes is the same shape — the right starter phrase,
// wrong verb form after it — so that pairing is the main reference grid, the same pattern used for
// Invitations. The softer/formal suggestion phrases are real content from their own section, kept
// as a phrase bank underneath. All chrome text kept to plain A2 words.
export function MakingSuggestionsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Each starter has its own next word
      </div>
      <svg viewBox="0 0 460 214" style={{ width: "100%", height: "auto", display: "block" }}>
        {PATTERNS.map((p, i) => {
          const colWidth = 420 / PATTERNS.length;
          const x = 20 + i * colWidth + 5;
          const cx = x + 37;
          return (
            <g key={p.phrase}>
              <rect x={x} y="16" width="74" height="58" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <text x={cx} y="34" textAnchor="middle" fontSize="8.2" fontWeight="800" fill={accent}>{p.phrase}</text>
              <text x={cx} y="50" textAnchor="middle" fontSize="10" fill={caption}>↓</text>
              <text x={cx} y="66" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>{p.form}</text>
            </g>
          );
        })}

        <rect x="20" y="84" width="420" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="102" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>SOFTER OR MORE FORMAL</text>
        <text x="230" y="118" textAnchor="middle" fontSize="7.8" fontStyle="italic" fill={ink}>You should try the museum. · If I were you, I'd wait.</text>
        <text x="230" y="134" textAnchor="middle" fontSize="7.8" fontStyle="italic" fill={ink}>What if we went camping? · May I suggest a break?</text>

        <line x1="20" y1="162" x2="440" y2="162" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="182" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ How about go to the beach? · Let's to watch a film.</text>
        <text x="230" y="198" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ How about going to the beach? · Let's watch a film.</text>
      </svg>
    </div>
  );
}
