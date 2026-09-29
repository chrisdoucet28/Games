import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const EXCUSES = [
  { word: "missed the bus", icon: "bus" },
  { word: "stuck in traffic", icon: "traffic" },
  { word: "overslept", icon: "overslept" },
  { word: "something came up", icon: "cameup" },
  { word: "slipped my mind", icon: "slipped" },
];

function ExcuseIcon({ icon, cx, cy, ink, accent }: { icon: string; cx: number; cy: number; ink: string; accent: string }) {
  switch (icon) {
    case "bus":
      return (
        <g>
          <rect x={cx - 12} y={cy - 7} width="24" height="12" rx="2" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx - 7} cy={cy + 6} r="2.2" fill="none" stroke={ink} strokeWidth="1.1" />
          <circle cx={cx + 7} cy={cy + 6} r="2.2" fill="none" stroke={ink} strokeWidth="1.1" />
          <line x1={cx - 18} y1={cy} x2={cx - 14} y2={cy} stroke={accent} strokeWidth="1.2" />
          <line x1={cx - 22} y1={cy - 4} x2={cx - 18} y2={cy - 4} stroke={accent} strokeWidth="1.2" />
        </g>
      );
    case "traffic":
      return (
        <g>
          <rect x={cx - 13} y={cy - 3} width="12" height="8" rx="1.5" fill="none" stroke={ink} strokeWidth="1.2" />
          <rect x={cx + 1} y={cy - 3} width="12" height="8" rx="1.5" fill="none" stroke={ink} strokeWidth="1.2" />
          <circle cx={cx - 10} cy={cy + 6} r="1.6" fill="none" stroke={ink} strokeWidth="1" />
          <circle cx={cx - 4} cy={cy + 6} r="1.6" fill="none" stroke={ink} strokeWidth="1" />
          <circle cx={cx + 4} cy={cy + 6} r="1.6" fill="none" stroke={ink} strokeWidth="1" />
          <circle cx={cx + 10} cy={cy + 6} r="1.6" fill="none" stroke={ink} strokeWidth="1" />
        </g>
      );
    case "overslept":
      return (
        <g>
          <circle cx={cx} cy={cy} r="10" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx} y1={cy} x2={cx} y2={cy - 6} stroke={ink} strokeWidth="1.2" />
          <line x1={cx} y1={cy} x2={cx + 5} y2={cy + 2} stroke={ink} strokeWidth="1.2" />
          <text x={cx + 10} y={cy - 8} fontSize="7" fontWeight="800" fill={accent}>z</text>
          <text x={cx + 14} y={cy - 13} fontSize="9" fontWeight="800" fill={accent}>Z</text>
        </g>
      );
    case "cameup":
      return (
        <g>
          <circle cx={cx} cy={cy} r="11" fill="none" stroke={ink} strokeWidth="1.3" />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="14" fontWeight="800" fill={accent}>!</text>
        </g>
      );
    case "slipped":
      return (
        <g>
          <circle cx={cx} cy={cy} r="9" fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx + 6} ${cy - 10} Q ${cx + 14} ${cy - 10} ${cx + 12} ${cy - 4} Q ${cx + 10} ${cy} ${cx + 15} ${cy - 1}`} fill="none" stroke={accent} strokeWidth="1.3" />
        </g>
      );
    default:
      return null;
  }
}

// The lesson's own excuse phrases are a fixed vocabulary bank, so they lead as a reference grid,
// each with a drawn icon, rather than a mistake-first layout. The because/so pairing is real
// content from its own section, kept small underneath. All chrome text kept to plain A2 words.
export function MakingExcusesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="idea" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Common excuses
      </div>
      <svg viewBox="0 0 460 250" style={{ width: "100%", height: "auto", display: "block" }}>
        {EXCUSES.map((e, i) => {
          const colWidth = 420 / EXCUSES.length;
          const boxX = 20 + i * colWidth + (colWidth - 74) / 2;
          const cx = boxX + 37;
          return (
            <g key={e.word}>
              <rect x={boxX} y="16" width="74" height="60" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <ExcuseIcon icon={e.icon} cx={cx} cy={40} ink={ink} accent={accent} />
              <text x={cx} y="68" textAnchor="middle" fontSize="6.4" fontWeight="700" fill={ink}>{e.word}</text>
            </g>
          );
        })}

        <rect x="20" y="86" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="104" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>RESULT + BECAUSE</text>
        <text x="117" y="118" textAnchor="middle" fontSize="7.5" fill={caption}>result first, then cause</text>
        <text x="117" y="132" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>I was late because I missed the bus.</text>

        <rect x="245" y="86" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="104" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>CAUSE + SO</text>
        <text x="342" y="118" textAnchor="middle" fontSize="7.5" fill={caption}>cause first, then result</text>
        <text x="342" y="132" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>I missed the bus, so I was late.</text>

        <text x="230" y="152" textAnchor="middle" fontSize="8.3" fontStyle="italic" fill={caption}>admitting fault: I should have called you. (a past regret)</text>

        <line x1="20" y1="164" x2="440" y2="164" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="184" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I had a traffic. · I should have call you.</text>
        <text x="230" y="200" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ There was a lot of traffic. · I should have called you.</text>

        <text x="230" y="218" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ It slipped of my mind. · I forget my phone at home.</text>
        <text x="230" y="234" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ It slipped my mind. · I forgot my phone at home.</text>
      </svg>
    </div>
  );
}
