import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own hobby vocabulary, each captioned in the "enjoy + -ing" pattern
// it teaches (never "enjoy to swim") — a reference row like the vocabulary-diagram pattern, but
// with a real grammar anchor baked into every caption instead of being a bare word list.
function HobbyIcon({ hobby, cx, cy, ink }: { hobby: string; cx: number; cy: number; ink: string }) {
  switch (hobby) {
    case "swimming":
      return (
        <g>
          <circle cx={cx - 4} cy={cy - 9} r="3.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 10} ${cy} Q ${cx - 6} ${cy - 4} ${cx - 2} ${cy} Q ${cx + 2} ${cy - 4} ${cx + 6} ${cy} Q ${cx + 10} ${cy - 4} ${cx + 14} ${cy}`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 10} ${cy + 6} Q ${cx - 6} ${cy + 2} ${cx - 2} ${cy + 6} Q ${cx + 2} ${cy + 2} ${cx + 6} ${cy + 6} Q ${cx + 10} ${cy + 2} ${cx + 14} ${cy + 6}`} fill="none" stroke={ink} strokeWidth="1.1" />
        </g>
      );
    case "reading":
      return (
        <g>
          <path d={`M ${cx} ${cy - 8} Q ${cx - 13} ${cy - 11} ${cx - 13} ${cy - 2} Q ${cx - 13} ${cy + 8} ${cx} ${cy + 6} Q ${cx} ${cy + 6} ${cx} ${cy - 8} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx} ${cy - 8} Q ${cx + 13} ${cy - 11} ${cx + 13} ${cy - 2} Q ${cx + 13} ${cy + 8} ${cx} ${cy + 6} Q ${cx} ${cy + 6} ${cx} ${cy - 8} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "gaming":
      return (
        <g>
          <rect x={cx - 14} y={cy - 6} width="28" height="14" rx="6" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 9} y1={cy - 1} x2={cx - 9} y2={cy + 4} stroke={ink} strokeWidth="1.2" />
          <line x1={cx - 11.5} y1={cy + 1.5} x2={cx - 6.5} y2={cy + 1.5} stroke={ink} strokeWidth="1.2" />
          <circle cx={cx + 7} cy={cy - 1} r="1.6" fill={ink} />
          <circle cx={cx + 11} cy={cy + 2} r="1.6" fill={ink} />
        </g>
      );
    case "cooking":
      return (
        <g>
          <path d={`M ${cx - 10} ${cy - 2} L ${cx + 10} ${cy - 2} L ${cx + 8} ${cy + 8} L ${cx - 8} ${cy + 8} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 13} y1={cy - 4} x2={cx - 10} y2={cy - 2} stroke={ink} strokeWidth="1.3" />
          <line x1={cx + 13} y1={cy - 4} x2={cx + 10} y2={cy - 2} stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 3} ${cy - 8} Q ${cx - 1} ${cy - 11} ${cx - 3} ${cy - 14}`} fill="none" stroke={ink} strokeWidth="1.1" />
          <path d={`M ${cx + 3} ${cy - 8} Q ${cx + 5} ${cy - 11} ${cx + 3} ${cy - 14}`} fill="none" stroke={ink} strokeWidth="1.1" />
        </g>
      );
    default:
      return null;
  }
}

const HOBBIES = [
  { id: "swimming", label: "enjoy swimming" },
  { id: "reading", label: "enjoy reading" },
  { id: "gaming", label: "enjoy gaming" },
  { id: "cooking", label: "enjoy cooking" },
];

export function FreeTimeA2Diagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";
  const colWidth = 420 / HOBBIES.length;

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
          <Icon name="joystick" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        In My Free Time...
      </div>
      <svg viewBox="0 0 460 256" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="20" y="14" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>ENJOY / LIKE + -ING (NEVER "TO")</text>

        {HOBBIES.map((h, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 90) / 2;
          const cx = boxX + 45;
          return (
            <g key={h.id}>
              <rect x={boxX} y="20" width="90" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <HobbyIcon hobby={h.id} cx={cx} cy={52} ink={ink} />
              <text x={cx} y="94" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{h.label}</text>
            </g>
          );
        })}

        <text x="20" y="124" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL PHRASES</text>
        {["join a club", "take up a hobby", "practise a skill"].map((w, i) => {
          const pillColWidth = 420 / 3;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 130) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="130" width="130" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 65} y="146" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="168" x2="440" y2="168" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="188" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I am boring when I have nothing to do.</text>
        <text x="230" y="204" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I am bored when I have nothing to do.</text>

        <text x="230" y="226" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I make sport every weekend.</text>
        <text x="230" y="242" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I do sport every weekend.</text>
      </svg>
    </div>
  );
}
