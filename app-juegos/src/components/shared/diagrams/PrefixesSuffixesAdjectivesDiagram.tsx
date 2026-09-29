import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const IN_VARIANTS = [
  { prefix: "im-", rule: "before m/p", example: "immature" },
  { prefix: "ir-", rule: "before r", example: "irrational" },
  { prefix: "il-", rule: "before l", example: "illegal" },
  { prefix: "in-", rule: "most others", example: "inconvenient" },
];

const SUFFIXES = [
  { suffix: "-al", example: "inspirational" },
  { suffix: "-ive", example: "innovative" },
  { suffix: "-ent", example: "persistent" },
  { suffix: "-ful", example: "careful" },
  { suffix: "-less", example: "careless" },
];

// The lesson's own three im-/ir-/il- mistakes lead as one reference grid (the shape the prefix
// takes depends on the sound that follows it — see, not tell), and the three suffix-confusion
// mistakes lead as a second grid, rather than a single fork covering only one pattern. All chrome
// text kept to plain B2 words.
export function PrefixesSuffixesAdjectivesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="warning" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        The negative prefix changes shape
      </div>
      <svg viewBox="0 0 460 232" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="20" y="10" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>IN- BEFORE...</text>
        {IN_VARIANTS.map((v, i) => {
          const colWidth = 420 / IN_VARIANTS.length;
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={v.prefix}>
              <rect x={boxX} y="16" width="90" height="54" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <text x={cx} y="34" textAnchor="middle" fontSize="13" fontWeight="800" fill={accent}>{v.prefix}</text>
              <text x={cx} y="46" textAnchor="middle" fontSize="7" fill={caption}>{v.rule}</text>
              <text x={cx} y="62" textAnchor="middle" fontSize="8.2" fontStyle="italic" fill={ink}>{v.example}</text>
            </g>
          );
        })}

        <text x="20" y="88" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>ADJECTIVE SUFFIXES</text>
        {SUFFIXES.map((s, i) => {
          const colWidth = 420 / SUFFIXES.length;
          const boxX = 20 + i * colWidth + (colWidth - 74) / 2;
          const cx = boxX + 37;
          return (
            <g key={s.suffix}>
              <rect x={boxX} y="94" width="74" height="48" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <text x={cx} y="114" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>{s.suffix}</text>
              <text x={cx} y="132" textAnchor="middle" fontSize="7.8" fontStyle="italic" fill={ink}>{s.example}</text>
            </g>
          );
        })}

        <line x1="20" y1="154" x2="440" y2="154" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="174" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ inmature · inlegal · inrational</text>
        <text x="230" y="190" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ immature · illegal · irrational</text>

        <text x="230" y="208" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ inspirationful · innovateful · persistful</text>
        <text x="230" y="224" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ inspirational · innovative · persistent</text>
      </svg>
    </div>
  );
}
