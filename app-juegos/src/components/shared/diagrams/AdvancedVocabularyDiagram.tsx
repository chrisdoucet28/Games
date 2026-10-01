import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const SWAPS = [
  { from: "big", to: "substantial" },
  { from: "use", to: "utilise" },
  { from: "help", to: "facilitate" },
  { from: "start", to: "commence" },
  { from: "buy", to: "purchase" },
  { from: "show", to: "demonstrate" },
];

// The lesson's own core point — the verb that collocates with the noun, not a literal translation
// of "do" — leads as a MAKE/HAVE/TAKE fork, and its formal-register point (everyday word → precise
// synonym) becomes its own reference grid of word pairs, mirroring the phrase-to-form pattern used
// elsewhere. All chrome text kept to plain C1 words.
export function AdvancedVocabularyDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        The right verb, and the formal word
      </div>
      <svg viewBox="0 0 460 246" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="16" width="140" height="72" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="34" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>MAKE</text>
        <text x="80" y="50" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>a decision</text>
        <text x="80" y="64" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>a strong impression</text>
        <text x="80" y="78" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>an effort</text>

        <rect x="160" y="16" width="140" height="72" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="34" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>HAVE</text>
        <text x="230" y="50" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>an impact on</text>
        <text x="230" y="64" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>an effect on</text>

        <rect x="310" y="16" width="140" height="72" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="34" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>TAKE</text>
        <text x="380" y="50" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>a stance</text>
        <text x="380" y="64" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>into consideration</text>

        <text x="20" y="102" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>EVERYDAY WORD → FORMAL WORD</text>
        {SWAPS.map((s, i) => {
          const colWidth = 420 / SWAPS.length;
          const boxX = 20 + i * colWidth + (colWidth - 62) / 2;
          const cx = boxX + 31;
          return (
            <g key={s.from}>
              <rect x={boxX} y="108" width="62" height="50" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <text x={cx} y="126" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>{s.from}</text>
              <text x={cx} y="139" textAnchor="middle" fontSize="9" fill={accent}>↓</text>
              <text x={cx} y="153" textAnchor="middle" fontSize="7.6" fontWeight="700" fill={ink}>{s.to}</text>
            </g>
          );
        })}

        <line x1="20" y1="170" x2="440" y2="170" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="190" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ He did a strong impression. · The report made several conclusions.</text>
        <text x="230" y="206" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ He made a strong impression. · The report drew several conclusions.</text>

        <text x="230" y="224" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ ...argument was based in evidence. · ...facilitates to communication.</text>
        <text x="230" y="240" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ ...argument was based on evidence. · ...facilitates communication.</text>
      </svg>
    </div>
  );
}
