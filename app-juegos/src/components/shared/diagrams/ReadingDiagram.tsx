import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: one open book carries the lesson's own book-review vocabulary as tags around it
// (protagonist, plot, genre, bestseller), with the fixed-preposition examples the lesson actually
// teaches ("based on", "interested in") as the one supporting sentence — vocab first, not the
// present-perfect-for-experience grammar this topic shares with several other B1 lessons.
export function ReadingDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";
  const cx = 230, cy = 66;

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
          <Icon name="bookOpen" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Talking About a Book
      </div>
      <svg viewBox="0 0 460 288" style={{ width: "100%", height: "auto", display: "block" }}>
        <path d={`M ${cx} ${cy - 16} Q ${cx - 20} ${cy - 20} ${cx - 34} ${cy - 10} L ${cx - 30} ${cy + 14} Q ${cx - 16} ${cy + 18} ${cx} ${cy + 16} Z`} fill="none" stroke={ink} strokeWidth="1.4" />
        <path d={`M ${cx} ${cy - 16} Q ${cx + 20} ${cy - 20} ${cx + 34} ${cy - 10} L ${cx + 30} ${cy + 14} Q ${cx + 16} ${cy + 18} ${cx} ${cy + 16} Z`} fill="none" stroke={ink} strokeWidth="1.4" />
        {[-6, 0, 6].map((dy) => (
          <g key={dy}>
            <line x1={cx - 26} y1={cy + dy} x2={cx - 6} y2={cy + dy} stroke={caption} strokeWidth="1" />
            <line x1={cx + 6} y1={cy + dy} x2={cx + 26} y2={cy + dy} stroke={caption} strokeWidth="1" />
          </g>
        ))}

        <text x="20" y="98" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["protagonist", "plot", "genre", "gripping", "bookworm", "bestseller"].map((w, i) => {
          const colWidth = 420 / 3;
          const row = Math.floor(i / 3);
          const col = i % 3;
          const boxX = 20 + col * colWidth + (colWidth - 130) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y={104 + row * 30} width="130" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 65} y={120 + row * 30} textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <text x="230" y="180" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>This novel <tspan fontWeight="800">is based on</tspan> a true story.</text>

        <line x1="20" y1="198" x2="440" y2="198" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="218" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ She is avid reader who finishes a book every week.</text>
        <text x="230" y="234" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ She is an avid reader who finishes a book every week.</text>

        <text x="230" y="256" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ I bought this novel at the library.</text>
        <text x="230" y="272" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ I bought this novel at the bookshop.</text>
      </svg>
    </div>
  );
}
