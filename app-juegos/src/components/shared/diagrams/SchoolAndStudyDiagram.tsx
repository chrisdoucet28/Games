import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const WORDS = [
  { word: "subject", icon: "book" },
  { word: "exam", icon: "exam" },
  { word: "homework", icon: "notebook" },
  { word: "grade", icon: "grade" },
  { word: "library", icon: "library" },
  { word: "classmate", icon: "classmate" },
  { word: "timetable", icon: "timetable" },
];

function SchoolIcon({ icon, cx, cy, ink, accent }: { icon: string; cx: number; cy: number; ink: string; accent: string }) {
  switch (icon) {
    case "book":
      return (
        <g>
          <path d={`M ${cx} ${cy - 8} L ${cx} ${cy + 8} Q ${cx - 12} ${cy + 4} ${cx - 12} ${cy - 6} Q ${cx - 6} ${cy - 10} ${cx} ${cy - 8} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx} ${cy - 8} L ${cx} ${cy + 8} Q ${cx + 12} ${cy + 4} ${cx + 12} ${cy - 6} Q ${cx + 6} ${cy - 10} ${cx} ${cy - 8} Z`} fill="none" stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "exam":
      return (
        <g>
          <rect x={cx - 8} y={cy - 10} width="16" height="20" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy - 4} stroke={ink} strokeWidth="1" />
          <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke={ink} strokeWidth="1" />
          <line x1={cx - 4} y1={cy + 4} x2={cx + 1} y2={cy + 4} stroke={ink} strokeWidth="1" />
          <line x1={cx + 4} y1={cy + 8} x2={cx + 12} y2={cy - 2} stroke={accent} strokeWidth="1.6" />
        </g>
      );
    case "notebook":
      return (
        <g>
          <rect x={cx - 8} y={cy - 10} width="16" height="20" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
          {[-6, -2, 2, 6].map((dy) => (
            <circle key={dy} cx={cx - 8} cy={cy + dy} r="0.9" fill={ink} />
          ))}
        </g>
      );
    case "grade":
      return (
        <g>
          <circle cx={cx} cy={cy} r="11" fill="none" stroke={ink} strokeWidth="1.3" />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>A</text>
        </g>
      );
    case "library":
      return (
        <g>
          {[-9, -3, 3, 9].map((dx, i) => (
            <rect key={dx} x={cx + dx - 2.5} y={cy - 10 + (i % 2 === 0 ? 0 : 2)} width="5" height={i % 2 === 0 ? 20 : 18} fill="none" stroke={ink} strokeWidth="1.2" />
          ))}
        </g>
      );
    case "classmate":
      return (
        <g>
          <circle cx={cx - 6} cy={cy - 4} r="5" fill="none" stroke={ink} strokeWidth="1.2" />
          <path d={`M ${cx - 12} ${cy + 10} Q ${cx - 12} ${cy + 2} ${cx - 6} ${cy + 2} Q ${cx} ${cy + 2} ${cx} ${cy + 10}`} fill="none" stroke={ink} strokeWidth="1.2" />
          <circle cx={cx + 6} cy={cy - 4} r="5" fill="none" stroke={ink} strokeWidth="1.2" />
          <path d={`M ${cx} ${cy + 10} Q ${cx} ${cy + 2} ${cx + 6} ${cy + 2} Q ${cx + 12} ${cy + 2} ${cx + 12} ${cy + 10}`} fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    case "timetable":
      return (
        <g>
          <rect x={cx - 10} y={cy - 10} width="20" height="20" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 10} y1={cy - 3} x2={cx + 10} y2={cy - 3} stroke={ink} strokeWidth="1" />
          <line x1={cx - 10} y1={cy + 4} x2={cx + 10} y2={cy + 4} stroke={ink} strokeWidth="1" />
          <line x1={cx - 3} y1={cy - 10} x2={cx - 3} y2={cy + 10} stroke={ink} strokeWidth="1" />
          <line x1={cx + 4} y1={cy - 10} x2={cx + 4} y2={cy + 10} stroke={ink} strokeWidth="1" />
        </g>
      );
    default:
      return null;
  }
}

// User feedback: the first version was six generic grammar-mistake cards that could belong to any
// lesson and never showed the school vocabulary this topic is actually named for. This rebuild
// leads with a reference grid of the lesson's own school words, each with a drawn icon, the way
// Numbers & Colours pairs a word with what it actually looks like. The must/have-to obligation
// rule is real, topic-specific content (school rules and deadlines), kept as a small pair
// underneath. All chrome text kept to plain A2 words.
export function SchoolAndStudyDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="pencil" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        School vocabulary
      </div>
      <svg viewBox="0 0 460 216" style={{ width: "100%", height: "auto", display: "block" }}>
        {WORDS.map((w, i) => {
          const colWidth = 420 / WORDS.length;
          const boxX = 20 + i * colWidth + (colWidth - 52) / 2;
          const cx = boxX + 26;
          return (
            <g key={w.word}>
              <rect x={boxX} y="16" width="52" height="60" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <SchoolIcon icon={w.icon} cx={cx} cy={40} ink={ink} accent={accent} />
              <text x={cx} y="68" textAnchor="middle" fontSize="7.4" fontWeight="700" fill={ink}>{w.word}</text>
            </g>
          );
        })}

        <text x="230" y="90" textAnchor="middle" fontSize="8.3" fontStyle="italic" fill={caption}>hand in homework · pass/fail an exam · take notes · be good at a subject</text>

        <rect x="20" y="100" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="118" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>MUST</text>
        <text x="117" y="132" textAnchor="middle" fontSize="7.5" fill={caption}>no "to" after must</text>
        <text x="117" y="146" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>Students must arrive on time.</text>

        <rect x="245" y="100" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="118" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>MUST BE + DONE</text>
        <text x="342" y="132" textAnchor="middle" fontSize="7.5" fill={caption}>a rule about something</text>
        <text x="342" y="146" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>The essay must be handed in.</text>

        <line x1="20" y1="164" x2="440" y2="164" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="184" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I have to assist my classes.</text>
        <text x="230" y="200" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I have to attend my classes.</text>
      </svg>
    </div>
  );
}
