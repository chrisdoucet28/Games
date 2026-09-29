import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own tech vocabulary as a reference row, not the present-perfect-
// passive/relative-clause/second-conditional grammar skeleton this topic shares with most other B2
// theme lessons. The mass-noun-takes-singular-verb quirk ("Artificial intelligence has changed...")
// gets one example line, not a full contrast box — unlike social_media, it's a smaller, single point
// here rather than the lesson's whole stated subject.
function TechIcon({ id, cx, cy, ink }: { id: string; cx: number; cy: number; ink: string }) {
  switch (id) {
    case "streaming":
      return (
        <g>
          <rect x={cx - 11} y={cy - 8} width="22" height="15" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 3} ${cy - 3} L ${cx - 3} ${cy + 3} L ${cx + 3} ${cy} Z`} fill={ink} />
        </g>
      );
    case "cybersecurity":
      return (
        <g>
          <path d={`M ${cx} ${cy - 11} L ${cx + 9} ${cy - 7} L ${cx + 9} ${cy + 2} Q ${cx + 9} ${cy + 9} ${cx} ${cy + 12} Q ${cx - 9} ${cy + 9} ${cx - 9} ${cy + 2} L ${cx - 9} ${cy - 7} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx} cy={cy + 1} r="2.3" fill="none" stroke={ink} strokeWidth="1.1" />
        </g>
      );
    case "digitalnatives":
      return (
        <g>
          <rect x={cx - 6} y={cy - 11} width="12" height="20" rx="2" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 3} y1={cy + 6} x2={cx + 3} y2={cy + 6} stroke={ink} strokeWidth="1" />
        </g>
      );
    case "remote":
      return (
        <g>
          <rect x={cx - 12} y={cy - 6} width="24" height="14" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 15} y1={cy + 10} x2={cx + 15} y2={cy + 10} stroke={ink} strokeWidth="1.3" />
        </g>
      );
    default:
      return null;
  }
}

const ITEMS = [
  { id: "streaming", label: "streaming" },
  { id: "cybersecurity", label: "cybersecurity" },
  { id: "digitalnatives", label: "digital natives" },
  { id: "remote", label: "work remotely" },
];

export function TechnologyDailyLifeDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="robot" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Talking About Technology
      </div>
      <svg viewBox="0 0 460 274" style={{ width: "100%", height: "auto", display: "block" }}>
        {ITEMS.map((it, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={it.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <TechIcon id={it.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="7.8" fontWeight="700" fill={ink}>{it.label}</text>
            </g>
          );
        })}

        <text x="230" y="128" textAnchor="middle" fontSize="9.3" fontStyle="italic" fill={ink}>Artificial intelligence <tspan fontWeight="800">has changed</tspan> many industries.</text>
        <text x="230" y="140" textAnchor="middle" fontSize="6.8" fill={caption}>(one thing, one idea — not "have changed")</text>

        <text x="20" y="158" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["digital divide", "streaming", "cybersecurity", "work remotely"].map((w, i) => {
          const pillColWidth = 420 / 4;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 96) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="164" width="96" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 48} y="180" textAnchor="middle" fontSize="7" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="202" x2="440" y2="202" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="222" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ My phone battery lasts a large time.</text>
        <text x="230" y="238" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ My phone battery lasts a long time.</text>

        <text x="230" y="256" textAnchor="middle" fontSize="9" fontWeight="800" fill={wrong}>✗ I have this laptop since five years.</text>
        <text x="230" y="270" textAnchor="middle" fontSize="9" fontWeight="800" fill={right}>✓ I have had this laptop for five years.</text>
      </svg>
    </div>
  );
}
