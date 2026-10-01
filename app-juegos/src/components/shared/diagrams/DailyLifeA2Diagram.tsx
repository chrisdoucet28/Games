import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Theme lesson mixing 5 grammar points around one routine — the diagram picks ONE real visual
// device (a day timeline, the actual topic identity) and hangs just the two things the lesson's
// own intro calls out as "classic mistakes" off the bottom, instead of trying to re-teach every
// grammar point from the lesson body (that's what the lesson text itself already does).
function StageIcon({ stage, cx, cy, ink }: { stage: string; cx: number; cy: number; ink: string }) {
  switch (stage) {
    case "wake": {
      const rays = [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * 9, y1 = cy + Math.sin(rad) * 9;
        const x2 = cx + Math.cos(rad) * 13, y2 = cy + Math.sin(rad) * 13;
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth="1.3" />;
      });
      return (
        <g>
          {rays}
          <circle cx={cx} cy={cy} r="7" fill="none" stroke={ink} strokeWidth="1.5" />
        </g>
      );
    }
    case "breakfast":
      return (
        <g>
          <rect x={cx - 6} y={cy - 4} width="12" height="10" rx="1.5" fill="none" stroke={ink} strokeWidth="1.4" />
          <path d={`M ${cx + 6} ${cy - 2} Q ${cx + 11} ${cy - 2} ${cx + 11} ${cy + 1} Q ${cx + 11} ${cy + 4} ${cx + 6} ${cy + 4}`} fill="none" stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 3} ${cy - 8} Q ${cx - 1} ${cy - 10} ${cx - 3} ${cy - 12}`} fill="none" stroke={ink} strokeWidth="1.1" />
          <path d={`M ${cx + 2} ${cy - 8} Q ${cx + 4} ${cy - 10} ${cx + 2} ${cy - 12}`} fill="none" stroke={ink} strokeWidth="1.1" />
        </g>
      );
    case "work":
      return (
        <g>
          <path d={`M ${cx - 5} ${cy - 3} Q ${cx - 5} ${cy - 9} ${cx} ${cy - 9} Q ${cx + 5} ${cy - 9} ${cx + 5} ${cy - 3}`} fill="none" stroke={ink} strokeWidth="1.4" />
          <rect x={cx - 7} y={cy - 3} width="14" height="11" rx="1.5" fill="none" stroke={ink} strokeWidth="1.4" />
          <line x1={cx - 7} y1={cy + 1} x2={cx + 7} y2={cy + 1} stroke={ink} strokeWidth="1.1" />
        </g>
      );
    case "chores":
      return (
        <g>
          <line x1={cx - 6} y1={cy - 11} x2={cx + 1} y2={cy + 3} stroke={ink} strokeWidth="1.5" />
          {[-4, -1, 2, 5].map((dx) => (
            <line key={dx} x1={cx + 1} y1={cy + 3} x2={cx + 1 + dx} y2={cy + 10} stroke={ink} strokeWidth="1.2" />
          ))}
        </g>
      );
    case "bed":
      return (
        <g>
          <path d={`M ${cx - 6} ${cy - 8} A 8 8 0 1 0 ${cx + 6} ${cy + 6} A 6.5 6.5 0 0 1 ${cx - 6} ${cy - 8} Z`} fill="none" stroke={ink} strokeWidth="1.4" />
          <text x={cx + 9} y={cy - 6} fontSize="6.5" fontStyle="italic" fill={ink}>z</text>
          <text x={cx + 13} y={cy - 11} fontSize="5" fontStyle="italic" fill={ink}>z</text>
        </g>
      );
    default:
      return null;
  }
}

const STAGES = [
  { id: "wake", verb: "wakes up", seq: "" },
  { id: "breakfast", verb: "has breakfast", seq: "First" },
  { id: "work", verb: "goes to school", seq: "Then" },
  { id: "chores", verb: "does chores", seq: "After that" },
  { id: "bed", verb: "goes to bed", seq: "Finally" },
];

export function DailyLifeA2Diagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";
  const colWidth = 420 / STAGES.length;

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
          <Icon name="clock" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        A Day, Step by Step
      </div>
      <svg viewBox="0 0 460 266" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="20" y="14" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>HE / SHE — ADD -S</text>

        {STAGES.map((s, i) => {
          const boxX = 20 + i * colWidth + (colWidth - 60) / 2;
          const cx = boxX + 30;
          const seqWords = s.seq.split(" ");
          return (
            <g key={s.id}>
              {i > 0 && (
                <>
                  {seqWords.map((word, wi) => (
                    <text key={word} x={boxX - 12} y={seqWords.length === 1 ? 46 : 36 + wi * 8} textAnchor="middle" fontSize="6.6" fontStyle="italic" fill={caption}>{word}</text>
                  ))}
                  <line x1={boxX - 22} y1="58" x2={boxX - 3} y2="58" stroke={accent} strokeWidth="1.5" markerEnd="url(#dlaArrow)" />
                </>
              )}
              <rect x={boxX} y="20" width="60" height="100" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <StageIcon stage={s.id} cx={cx} cy={58} ink={ink} />
              <text x={cx} y="104" textAnchor="middle" fontSize="7.4" fontWeight="700" fill={ink}>{s.verb}</text>
            </g>
          );
        })}
        <defs>
          <marker id="dlaArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={accent} />
          </marker>
        </defs>

        <text x="20" y="146" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["free time", "spare time", "unwind", "fall asleep"].map((w, i) => {
          const pillColWidth = 420 / 4;
          const boxX = 20 + i * pillColWidth + (pillColWidth - 96) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y="152" width="96" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 48} y="168" textAnchor="middle" fontSize="7.6" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="188" x2="440" y2="188" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="208" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I have 20 years old.</text>
        <text x="230" y="224" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I am 20 years old.</text>

        <text x="230" y="246" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She goed to the gym yesterday.</text>
        <text x="230" y="262" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She went to the gym yesterday.</text>
      </svg>
    </div>
  );
}
