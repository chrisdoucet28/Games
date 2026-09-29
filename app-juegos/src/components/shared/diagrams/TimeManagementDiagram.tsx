import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: the lesson's own vocabulary bank is literally a to-do list's contents
// (prioritise, deadline, delegate, switch off) — drawing it as an actual checklist, with
// procrastination as the one crossed-out item, needs no invented metaphor at all.
const CHECKLIST = [
  { text: "prioritise tasks", done: true },
  { text: "meet the deadline", done: true },
  { text: "delegate work", done: false },
  { text: "switch off", done: false },
];

export function TimeManagementDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="clipboard" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Today's To-Do List
      </div>
      <svg viewBox="0 0 460 292" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="140" y="16" width="180" height="140" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="230" y="34" textAnchor="middle" fontSize="9.5" fontWeight="800" letterSpacing="0.04em" fill={accent}>TO-DO LIST</text>
        <line x1="152" y1="42" x2="308" y2="42" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />

        {CHECKLIST.map((c, i) => (
          <g key={c.text}>
            <rect x="152" y={52 + i * 20} width="12" height="12" rx="2" fill="none" stroke={ink} strokeWidth="1.3" />
            {c.done && <path d={`M 154 ${58 + i * 20} L 157 ${61 + i * 20} L 163 ${54 + i * 20}`} fill="none" stroke={right} strokeWidth="1.6" />}
            <text x="170" y={62 + i * 20} fontSize="8.5" fontWeight={c.done ? "700" : "400"} fill={ink}>{c.text}</text>
          </g>
        ))}

        <line x1="152" y1="138" x2="308" y2="138" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />
        <text x="230" y="150" textAnchor="middle" fontSize="8" fill={wrong}>✗ procrastination</text>

        <text x="20" y="172" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["to-do list", "procrastination", "prioritise", "switch off"].map((w, i) => {
          const pillColWidth = 420 / 4;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 96) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="178" width="96" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 48} y="194" textAnchor="middle" fontSize="7.4" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="216" x2="440" y2="216" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="236" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ The team meeting has place every Monday.</text>
        <text x="230" y="252" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ The team meeting takes place every Monday.</text>

        <text x="230" y="272" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={wrong}>✗ I eventually check my emails two or three times.</text>
        <text x="230" y="288" textAnchor="middle" fontSize="9.4" fontWeight="800" fill={right}>✓ I occasionally check my emails two or three times.</text>
      </svg>
    </div>
  );
}
