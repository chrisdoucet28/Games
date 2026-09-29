import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: a receipt is the one object this whole topic revolves around — drawing it as an
// actual torn-edge receipt carries the lesson's own irregular past-tense shopping verbs as line
// items, instead of listing "bought/sold/had" as a bare grammar rule. The vocab strip below adds
// the lesson's own shopping words without turning the receipt itself into a word list.
function receiptPath(x: number, y: number, w: number, h: number) {
  const teeth = 9;
  const toothW = w / teeth;
  let d = `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h - 6}`;
  for (let i = teeth; i >= 1; i--) {
    const xEnd = x + (i - 1) * toothW;
    const xMid = x + (i - 0.5) * toothW;
    d += ` L ${xMid} ${y + h} L ${xEnd} ${y + h - 6}`;
  }
  d += " Z";
  return d;
}

const ITEMS = [
  { name: "Jacket", verb: "bought" },
  { name: "Old phone", verb: "sold" },
  { name: "Big sale", verb: "had" },
];

const VOCAB = ["discount", "refund", "bargain", "budget", "afford", "checkout"];

export function MoneyAndShoppingDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="cart" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Last Week's Shopping
      </div>
      <svg viewBox="0 0 460 312" style={{ width: "100%", height: "auto", display: "block" }}>
        <path d={receiptPath(140, 12, 180, 116)} fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="230" y="30" textAnchor="middle" fontSize="9.5" fontWeight="800" letterSpacing="0.06em" fill={accent}>RECEIPT</text>
        <line x1="152" y1="38" x2="308" y2="38" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />

        {ITEMS.map((it, i) => (
          <g key={it.name}>
            <text x="152" y={56 + i * 18} fontSize="8.3" fill={ink}>{it.name}</text>
            <text x="308" y={56 + i * 18} textAnchor="end" fontSize="8.3" fontWeight="800" fill={accent}>{it.verb}</text>
          </g>
        ))}
        <line x1="152" y1="118" x2="308" y2="118" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />

        <text x="20" y="152" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {VOCAB.map((w, i) => {
          const colWidth = 420 / 3;
          const row = Math.floor(i / 3);
          const col = i % 3;
          const boxX = 20 + col * colWidth + (colWidth - 130) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y={158 + row * 30} width="130" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 65} y={174 + row * 30} textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="226" x2="440" y2="226" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="246" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I buyed this jacket last week.</text>
        <text x="230" y="262" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I bought this jacket last week.</text>

        <text x="230" y="284" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ You must to show your receipt.</text>
        <text x="230" y="300" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ You must show your receipt.</text>
      </svg>
    </div>
  );
}
