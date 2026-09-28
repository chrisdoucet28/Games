import type { ReactElement } from "react";
import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const BUILD_WORDS = ["tall", "short", "slim", "fat", "young", "old"];
const HAIR_WORDS = ["curly hair", "straight hair", "blonde", "dark hair", "red hair", "bald", "long hair", "short hair"];
const FACE_WORDS = ["blue eyes", "brown eyes", "beard", "glasses", "big nose", "smile"];

function BuildIcon({ word, cx, base, ink }: { word: string; cx: number; base: number; ink: string }) {
  const cane = <line x1={cx + 7} y1={base - 13} x2={cx + 10} y2={base + 2} stroke={ink} strokeWidth="1.5" />;
  const shapes: Record<string, { w: number; h: number; r: number; extra?: ReactElement }> = {
    tall: { w: 10, h: 24, r: 5 },
    short: { w: 17, h: 13, r: 6 },
    slim: { w: 7, h: 24, r: 5 },
    fat: { w: 23, h: 16, r: 7 },
    young: { w: 9, h: 10, r: 6 },
    old: { w: 10, h: 21, r: 5, extra: cane },
  };
  const s = shapes[word];
  return (
    <g>
      <rect x={cx - s.w / 2} y={base - s.h} width={s.w} height={s.h} rx="2.5" fill="none" stroke={ink} strokeWidth="1.4" />
      <circle cx={cx} cy={base - s.h - s.r} r={s.r} fill="none" stroke={ink} strokeWidth="1.4" />
      {s.extra}
    </g>
  );
}

function HairIcon({ word, cx, cy, ink, caption }: { word: string; cx: number; cy: number; ink: string; caption: string }) {
  const dome = (fill: string, rx = 10, ry = 9, dy = -2) => (
    <path d={`M ${cx - rx} ${cy + dy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy + dy} Z`} fill={fill} />
  );
  switch (word) {
    case "curly hair":
      return (
        <g>
          <circle cx={cx} cy={cy} r="10" fill="none" stroke={ink} strokeWidth="1.4" />
          {[-7, -2.3, 2.3, 7].map((dx) => (
            <circle key={dx} cx={cx + dx} cy={cy - 9 + Math.abs(dx) * 0.15} r="3.6" fill={ink} />
          ))}
        </g>
      );
    case "straight hair":
      return (
        <g>
          <circle cx={cx} cy={cy} r="10" fill="none" stroke={ink} strokeWidth="1.4" />
          {dome(caption)}
        </g>
      );
    case "blonde":
      return (
        <g>
          <circle cx={cx} cy={cy} r="10" fill="none" stroke={ink} strokeWidth="1.4" />
          {dome("#EAB308")}
        </g>
      );
    case "dark hair":
      return (
        <g>
          <circle cx={cx} cy={cy} r="10" fill="none" stroke={ink} strokeWidth="1.4" />
          {dome("#111827")}
        </g>
      );
    case "red hair":
      return (
        <g>
          <circle cx={cx} cy={cy} r="10" fill="none" stroke={ink} strokeWidth="1.4" />
          {dome("#C2410C")}
        </g>
      );
    case "bald":
      return (
        <g>
          <circle cx={cx} cy={cy} r="10" fill="none" stroke={ink} strokeWidth="1.4" />
          <path d={`M ${cx - 4} ${cy - 12} Q ${cx - 2} ${cy - 15} ${cx} ${cy - 12}`} fill="none" stroke={caption} strokeWidth="1.2" />
          <path d={`M ${cx + 1} ${cy - 13} Q ${cx + 3} ${cy - 16} ${cx + 5} ${cy - 13}`} fill="none" stroke={caption} strokeWidth="1.2" />
        </g>
      );
    case "long hair":
      return (
        <g>
          <rect x={cx - 13} y={cy - 4} width="5" height="18" rx="2.5" fill={ink} />
          <rect x={cx + 8} y={cy - 4} width="5" height="18" rx="2.5" fill={ink} />
          <circle cx={cx} cy={cy} r="10" fill="none" stroke={ink} strokeWidth="1.4" />
          {dome(ink)}
        </g>
      );
    case "short hair":
      return (
        <g>
          <circle cx={cx} cy={cy} r="10" fill="none" stroke={ink} strokeWidth="1.4" />
          {dome(ink, 10, 5, -4)}
        </g>
      );
    default:
      return null;
  }
}

function FaceIcon({ word, cx, cy, ink, fill }: { word: string; cx: number; cy: number; ink: string; fill: string }) {
  const head = <circle cx={cx} cy={cy} r="10" fill={fill} stroke={ink} strokeWidth="1.4" />;
  switch (word) {
    case "blue eyes":
      return (
        <g>
          {head}
          <circle cx={cx - 4} cy={cy - 1} r="2" fill="#2563EB" />
          <circle cx={cx + 4} cy={cy - 1} r="2" fill="#2563EB" />
        </g>
      );
    case "brown eyes":
      return (
        <g>
          {head}
          <circle cx={cx - 4} cy={cy - 1} r="2" fill="#92400E" />
          <circle cx={cx + 4} cy={cy - 1} r="2" fill="#92400E" />
        </g>
      );
    case "beard":
      return (
        <g>
          {head}
          <path d={`M ${cx - 8} ${cy + 1} Q ${cx} ${cy + 15} ${cx + 8} ${cy + 1} Z`} fill={ink} />
        </g>
      );
    case "glasses":
      return (
        <g>
          {head}
          <circle cx={cx - 4} cy={cy} r="4" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx + 4} cy={cy} r="4" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 0.5} y1={cy} x2={cx + 0.5} y2={cy} stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 8} y1={cy - 1} x2={cx - 11} y2={cy - 3} stroke={ink} strokeWidth="1.3" />
          <line x1={cx + 8} y1={cy - 1} x2={cx + 11} y2={cy - 3} stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "big nose":
      return (
        <g>
          {head}
          <path d={`M ${cx - 3} ${cy - 3} Q ${cx - 5} ${cy + 5} ${cx} ${cy + 6} Q ${cx + 5} ${cy + 5} ${cx + 3} ${cy - 3} Z`} fill="none" stroke={ink} strokeWidth="1.4" />
        </g>
      );
    case "smile":
      return (
        <g>
          {head}
          <path d={`M ${cx - 5} ${cy + 2} Q ${cx} ${cy + 7} ${cx + 5} ${cy + 2}`} fill="none" stroke={ink} strokeWidth="1.6" />
        </g>
      );
    default:
      return null;
  }
}

// User feedback: replace the single figure with a reference grid of the lesson's actual
// vocabulary bank (the same hotSeatWords used in-game), grouped the same way the lesson itself
// groups them (be: height/build/age; have: hair; have: eyes and face) — mirroring the Numbers &
// Colours reference-grid pattern instead of one illustrated person. The has/is choice stays only
// as the row captions and a single footer line; it is not the headline. All chrome text kept to
// plain A1 words.
export function AppearanceDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="person" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        What does she look like?
      </div>
      <svg viewBox="0 0 460 384" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="16" width="195" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="34" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>What does she look like?</text>
        <text x="117" y="52" textAnchor="middle" fontSize="8.3" fontStyle="italic" fill={ink}>She's tall and has curly hair.</text>
        <text x="117" y="66" textAnchor="middle" fontSize="7.2" fill={caption}>one person: does</text>

        <rect x="245" y="16" width="195" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="34" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>What do they look like?</text>
        <text x="342" y="52" textAnchor="middle" fontSize="8.3" fontStyle="italic" fill={ink}>They have dark hair.</text>
        <text x="342" y="66" textAnchor="middle" fontSize="7.2" fill={caption}>2 or more: do</text>

        <text x="20" y="102" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>HEIGHT, BUILD, AGE — BE</text>
        {BUILD_WORDS.map((w, i) => {
          const colWidth = 420 / BUILD_WORDS.length;
          const boxX = 20 + i * colWidth + (colWidth - 60) / 2;
          const cx = boxX + 30;
          return (
            <g key={w}>
              <rect x={boxX} y="108" width="60" height="56" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <BuildIcon word={w} cx={cx} base={148} ink={ink} />
              <text x={cx} y="158" textAnchor="middle" fontSize="7.4" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <text x="20" y="180" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>HAIR — HAVE</text>
        {HAIR_WORDS.map((w, i) => {
          const colWidth = 420 / HAIR_WORDS.length;
          const boxX = 20 + i * colWidth + (colWidth - 46) / 2;
          const cx = boxX + 23;
          return (
            <g key={w}>
              <rect x={boxX} y="186" width="46" height="60" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <HairIcon word={w} cx={cx} cy={210} ink={ink} caption={caption} />
              <text x={cx} y="238" textAnchor="middle" fontSize="6.8" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <text x="20" y="262" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>EYES &amp; FACE — HAVE</text>
        {FACE_WORDS.map((w, i) => {
          const colWidth = 420 / FACE_WORDS.length;
          const boxX = 20 + i * colWidth + (colWidth - 60) / 2;
          const cx = boxX + 30;
          return (
            <g key={w}>
              <rect x={boxX} y="268" width="60" height="60" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <FaceIcon word={w} cx={cx} cy={293} ink={ink} fill={fill} />
              <text x={cx} y="320" textAnchor="middle" fontSize="7.4" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="340" x2="440" y2="340" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="360" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ He have blue eyes. · She is have green eyes.</text>
        <text x="230" y="376" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ He has blue eyes. · She has green eyes.</text>
      </svg>
    </div>
  );
}
