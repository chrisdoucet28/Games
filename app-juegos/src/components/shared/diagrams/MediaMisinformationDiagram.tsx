import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// This lesson's own intro names its vocabulary as the actual subject ("combines specialised
// vocabulary... with advanced structures") — so the icon row leads, same as every other C1 theme
// lesson. The singular/plural agreement quirk with collective/abstract nouns ("algorithms are" vs
// "trust has") gets one supporting example line, not a full contrast box like social_media's —
// here it's a smaller, secondary point rather than the lesson's whole stated subject.
function MediaIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "echochamber":
      return (
        <g>
          <circle cx={cx} cy={cy} r="4" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx} cy={cy} r="8" fill="none" stroke={ink} strokeWidth="1" />
          <circle cx={cx} cy={cy} r="12" fill="none" stroke={ink} strokeWidth="0.8" />
        </g>
      );
    case "fakenews":
      return (
        <g>
          <rect x={cx - 10} y={cy - 9} width="20" height="18" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 6} y1={cy - 4} x2={cx + 6} y2={cy - 4} stroke={ink} strokeWidth="1" />
          <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke={ink} strokeWidth="1" />
          <line x1={cx - 6} y1={cy + 4} x2={cx + 2} y2={cy + 4} stroke={ink} strokeWidth="1" />
        </g>
      );
    case "clickbait":
      return (
        <g>
          <path d={`M ${cx - 6} ${cy - 10} L ${cx - 6} ${cy + 6} Q ${cx - 6} ${cy + 11} ${cx - 1} ${cy + 11} Q ${cx + 5} ${cy + 11} ${cx + 5} ${cy + 5} L ${cx + 5} ${cy}`} fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 9} y1={cy - 4} x2={cx - 3} y2={cy - 4} stroke={ink} strokeWidth="1.1" />
        </g>
      );
    case "deepfake":
      return (
        <g>
          <circle cx={cx} cy={cy} r="11" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 4} y1={cy - 2} x2={cx - 2} y2={cy - 4} stroke={ink} strokeWidth="1.2" />
          <line x1={cx + 2} y1={cy - 4} x2={cx + 4} y2={cy - 2} stroke={ink} strokeWidth="1.2" />
          <path d={`M ${cx - 4} ${cy + 5} L ${cx + 4} ${cy + 3}`} fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    default:
      return null;
  }
}

const ITEMS = [
  { id: "echochamber", label: "echo chamber" },
  { id: "fakenews", label: "fake news" },
  { id: "clickbait", label: "clickbait" },
  { id: "deepfake", label: "deepfake" },
];

export function MediaMisinformationDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="warning" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Talking About Media
      </div>
      <svg viewBox="0 0 460 300" style={{ width: "100%", height: "auto", display: "block" }}>
        {ITEMS.map((it, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={it.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <MediaIcon id={it.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{it.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9.2" fontStyle="italic" fill={ink}>Social media <tspan fontWeight="800">algorithms are</tspan> designed to maximise engagement.</text>

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["filter bubble", "confirmation bias", "fact-check", "media literacy", "disinformation", "misinformation"].map((w, i) => {
          const pillColWidth = 420 / 3;
          const row = Math.floor(i / 3);
          const col = i % 3;
          const boxX = 20 + col * pillColWidth + (pillColWidth - 130) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y={156 + row * 30} width="130" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 65} y={172 + row * 30} textAnchor="middle" fontSize="7.2" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="224" x2="440" y2="224" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="244" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ Social media algorithms is designed to...</text>
        <text x="230" y="260" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ Social media algorithms are designed to...</text>

        <text x="230" y="278" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={wrong}>✗ Not only the story was false...</text>
        <text x="230" y="294" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={right}>✓ Not only was the story false...</text>
      </svg>
    </div>
  );
}
