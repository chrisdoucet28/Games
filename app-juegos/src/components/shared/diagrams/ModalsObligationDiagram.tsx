import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Four forms, one 2x2 grid, equal visual weight — must/have to (obligation) get their own boxes
// alongside mustn't/don't have to (prohibition/no obligation) rather than being folded into a
// caption strip under a negatives-only contrast. The lesson's own intro still names "mixing up
// 'mustn't' and 'don't have to'" as the classic trap, so those two stay diagonally adjacent for
// an easy side-by-side read, with must/have to placed above them.
const BOXES = [
  { id: "must", label: "MUST", sub: "OBLIGATION — a rule", example: "Students must wear a uniform.", note: "(often the speaker's own rule)" },
  { id: "haveto", label: "HAVE TO", sub: "OBLIGATION — a rule", example: "I have to finish this by Friday.", note: "(often comes from someone else)" },
  { id: "mustnt", label: "MUSTN'T", sub: "FORBIDDEN — not allowed", example: "You mustn't smoke here.", note: "(there IS a rule against it)" },
  { id: "donthaveto", label: "DON'T HAVE TO", sub: "NOT NECESSARY — optional", example: "You don't have to pay — it's free.", note: "(no rule either way)" },
];

export function ModalsObligationDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Four forms, four meanings
      </div>
      <svg viewBox="0 0 460 306" style={{ width: "100%", height: "auto", display: "block" }}>
        {BOXES.map((b, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const boxX = 20 + col * 220;
          const boxY = 12 + row * 92;
          const cx = boxX + 100;
          return (
            <g key={b.id}>
              <rect x={boxX} y={boxY} width="200" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
              <text x={cx} y={boxY + 20} textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>{b.label}</text>
              <text x={cx} y={boxY + 36} textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>{b.sub}</text>
              <text x={cx} y={boxY + 53} textAnchor="middle" fontSize="8.3" fontStyle="italic" fill={caption}>{b.example}</text>
              <text x={cx} y={boxY + 66} textAnchor="middle" fontSize="7.8" fontStyle="italic" fill={caption}>{b.note}</text>
            </g>
          );
        })}

        <text x="230" y="212" textAnchor="middle" fontSize="9.7" fontWeight="700" fill={ink}>must never changes — no "to", no "-s", no question form</text>
        <text x="230" y="226" textAnchor="middle" fontSize="9.7" fontWeight="700" fill={ink}>have to conjugates like a normal verb: has to · do you have to?</text>

        <line x1="20" y1="236" x2="440" y2="236" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="252" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={wrong}>✗ We mustn't bring food. (meaning: it's optional)</text>
        <text x="230" y="266" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={right}>✓ We don't have to bring food.</text>

        <text x="230" y="284" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={wrong}>✗ Do you must arrive early? · Students must to wear a uniform.</text>
        <text x="230" y="298" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={right}>✓ Do you have to arrive early? · Students must wear a uniform.</text>
      </svg>
    </div>
  );
}
