import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own culture vocabulary as a reference row, not the relative-clause/
// present-perfect-continuous/second-conditional grammar skeleton this topic shares with most other
// B2 theme lessons.
function CultureIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "bodylanguage":
      return (
        <g>
          <circle cx={cx} cy={cy - 9} r="4" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 6} stroke={ink} strokeWidth="1.3" />
          <line x1={cx} y1={cy - 2} x2={cx - 9} y2={cy - 8} stroke={ink} strokeWidth="1.3" />
          <line x1={cx} y1={cy - 2} x2={cx + 9} y2={cy - 2} stroke={ink} strokeWidth="1.3" />
          <line x1={cx} y1={cy + 6} x2={cx - 6} y2={cy + 13} stroke={ink} strokeWidth="1.3" />
          <line x1={cx} y1={cy + 6} x2={cx + 6} y2={cy + 13} stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "etiquette":
      return (
        <g>
          <path d={`M ${cx - 11} ${cy - 3} Q ${cx - 4} ${cy - 3} ${cx - 1} ${cy}`} fill="none" stroke={ink} strokeWidth="1.4" />
          <path d={`M ${cx + 11} ${cy + 3} Q ${cx + 4} ${cy + 3} ${cx + 1} ${cy}`} fill="none" stroke={ink} strokeWidth="1.4" />
          <circle cx={cx - 12} cy={cy - 5} r="3" fill="none" stroke={ink} strokeWidth="1.1" />
          <circle cx={cx + 12} cy={cy + 5} r="3" fill="none" stroke={ink} strokeWidth="1.1" />
        </g>
      );
    case "multicultural":
      return (
        <g>
          <circle cx={cx} cy={cy} r="11" fill="none" stroke={ink} strokeWidth="1.3" />
          <ellipse cx={cx} cy={cy} rx="4.5" ry="11" fill="none" stroke={ink} strokeWidth="1" />
          <line x1={cx - 11} y1={cy} x2={cx + 11} y2={cy} stroke={ink} strokeWidth="1" />
          <path d={`M ${cx - 9} ${cy - 6} Q ${cx} ${cy - 9} ${cx + 9} ${cy - 6}`} fill="none" stroke={ink} strokeWidth="1" />
          <path d={`M ${cx - 9} ${cy + 6} Q ${cx} ${cy + 9} ${cx + 9} ${cy + 6}`} fill="none" stroke={ink} strokeWidth="1" />
        </g>
      );
    case "cultureshock":
      return (
        <g>
          <circle cx={cx} cy={cy} r="11" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx - 4} cy={cy - 2} r="1.6" fill={ink} />
          <circle cx={cx + 4} cy={cy - 2} r="1.6" fill={ink} />
          <circle cx={cx} cy={cy + 5} r="2.6" fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    default:
      return null;
  }
}

const ITEMS = [
  { id: "bodylanguage", label: "body language" },
  { id: "etiquette", label: "etiquette" },
  { id: "multicultural", label: "multicultural" },
  { id: "cultureshock", label: "culture shock" },
];

export function CulturalDifferencesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";
  const colWidth = 420 / ITEMS.length;

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
          <Icon name="people" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Talking About Culture
      </div>
      <svg viewBox="0 0 460 276" style={{ width: "100%", height: "auto", display: "block" }}>
        {ITEMS.map((it, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={it.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <CultureIcon id={it.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="7.8" fontWeight="700" fill={ink}>{it.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9" fontStyle="italic" fill={ink}>Table manners are very <tspan fontWeight="800">different from</tspan> table manners in Spain.</text>

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["stereotypes", "aware of", "adapt to", "body language"].map((w, i) => {
          const pillColWidth = 420 / 4;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 96) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="156" width="96" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 48} y="172" textAnchor="middle" fontSize="7.4" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="194" x2="440" y2="194" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="214" textAnchor="middle" fontSize="10" fontWeight="800" fill={wrong}>✗ In my country, we make a big party.</text>
        <text x="230" y="230" textAnchor="middle" fontSize="10" fontWeight="800" fill={right}>✓ In my country, we have a big party.</text>

        <text x="230" y="248" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={wrong}>✗ Table manners are very different of Spain.</text>
        <text x="230" y="264" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={right}>✓ Table manners are very different from Spain.</text>
      </svg>
    </div>
  );
}
