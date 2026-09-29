import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: an application-folder object carries the lesson's own career nouns as line
// items, each paired with the passive-voice verb the lesson actually teaches for recruitment
// ("are reviewed", "were promoted") — vocab first, grammar folded in exactly like money's receipt.
function folderPath(x: number, y: number, w: number, h: number) {
  const tab = 50;
  return `M ${x} ${y + 10} L ${x} ${y + h} L ${x + w} ${y + h} L ${x + w} ${y} L ${x + tab} ${y} L ${x + tab - 8} ${y + 10} Z`;
}

const ITEMS = [
  { name: "Application", verb: "reviewed" },
  { name: "Two employees", verb: "promoted" },
  { name: "CV", verb: "updated" },
];

export function CareerChoicesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        The Application Folder
      </div>
      <svg viewBox="0 0 460 276" style={{ width: "100%", height: "auto", display: "block" }}>
        <path d={folderPath(140, 16, 180, 100)} fill={fill} stroke={accent} strokeWidth="1.5" />
        <line x1="152" y1="46" x2="308" y2="46" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />

        {ITEMS.map((it, i) => (
          <g key={it.name}>
            <text x="152" y={64 + i * 18} fontSize="8.3" fill={ink}>{it.name}</text>
            <text x="308" y={64 + i * 18} textAnchor="end" fontSize="8.3" fontWeight="800" fill={accent}>{it.verb}</text>
          </g>
        ))}

        <text x="20" y="146" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL PHRASES</text>
        {["apply for", "interested in", "good at"].map((w, i) => {
          const pillColWidth = 420 / 3;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 130) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="152" width="130" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 65} y="168" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="190" x2="440" y2="190" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="210" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I am agree that soft skills are important.</text>
        <text x="230" y="226" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I agree that soft skills are important.</text>

        <text x="230" y="248" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ My brother is engineer at a tech company.</text>
        <text x="230" y="264" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ My brother is an engineer at a tech company.</text>
      </svg>
    </div>
  );
}
