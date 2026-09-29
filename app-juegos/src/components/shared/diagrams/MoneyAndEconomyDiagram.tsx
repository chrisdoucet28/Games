import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: an economic ledger carries the lesson's own vocabulary as line items, each with
// an up/down arrow showing whether that word means an increase or a decrease — a genuine "show,
// don't tell" opportunity this topic's vocabulary happens to offer, instead of leading with the
// present-perfect-continuous/passive/relative-clause/second-conditional grammar skeleton this topic
// shares with crime_and_law and arts_and_entertainment.
const LEDGER = [
  { name: "Inflation", up: true },
  { name: "Recession", up: false },
  { name: "Interest rate", up: true },
];

export function MoneyAndEconomyDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="coin" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Which Way Is It Moving?
      </div>
      <svg viewBox="0 0 460 278" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="meUp" markerWidth="6" markerHeight="6" refX="3" refY="0.5" orient="auto">
            <path d="M0,6 L3,0 L6,6 Z" fill={right} />
          </marker>
          <marker id="meDown" markerWidth="6" markerHeight="6" refX="3" refY="5.5" orient="auto">
            <path d="M0,0 L3,6 L6,0 Z" fill={wrong} />
          </marker>
        </defs>
        <rect x="120" y="16" width="220" height="112" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="230" y="34" textAnchor="middle" fontSize="9.5" fontWeight="800" letterSpacing="0.04em" fill={accent}>LEDGER</text>
        <line x1="134" y1="42" x2="326" y2="42" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />

        {LEDGER.map((it, i) => (
          <g key={it.name}>
            <text x="134" y={64 + i * 22} fontSize="9" fontWeight="700" fill={ink}>{it.name}</text>
            <line
              x1="300" y1={it.up ? 66 + i * 22 : 58 + i * 22}
              x2="300" y2={it.up ? 58 + i * 22 : 66 + i * 22}
              stroke={it.up ? right : wrong} strokeWidth="1.8"
              markerEnd={`url(#${it.up ? "meUp" : "meDown"})`}
            />
          </g>
        ))}

        <text x="20" y="150" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["wage", "budget", "debt", "invest"].map((w, i) => {
          const colWidth = 420 / 4;
          const boxX = 20 + i * colWidth + (colWidth - 96) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="156" width="96" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 48} y="172" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="192" x2="440" y2="192" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="212" textAnchor="middle" fontSize="9.8" fontWeight="800" fill={wrong}>✗ Interest rates have raised this year.</text>
        <text x="230" y="228" textAnchor="middle" fontSize="9.8" fontWeight="800" fill={right}>✓ Interest rates have been raised this year.</text>

        <text x="230" y="250" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={wrong}>✗ If I have more money, I would travel more.</text>
        <text x="230" y="266" textAnchor="middle" fontSize="9.6" fontWeight="800" fill={right}>✓ If I had more money, I would travel more.</text>
      </svg>
    </div>
  );
}
