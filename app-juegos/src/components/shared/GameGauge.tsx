import { HELP_LEVEL_LABELS, helpLevelColor, type HelpLevel } from "../../data/gameCategories";

// A speedometer-style dial: a semicircle in five colored segments (lots of help on the left → no
// help on the right) with a needle resting in the segment for `level`. Only that segment is fully
// lit — the rest are faded — so "which part of the circle the dial is on" reads at a glance. Pure
// inline SVG (nothing reusable existed: the only rings in the codebase are full-circle timers).
// The ink outline and hard edges match the rest of the arcade-style chrome (TurnTimerBar, QuestionCard).
const INK = "#0C1E3D";
const CX = 60;
const CY = 60;
const OUTER = 54;
const INNER = 34;
const SEGMENT_DEG = 36;
const GAP_DEG = 2.5;

function point(radius: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY - radius * Math.sin(rad)];
}

// One ring segment between two angles (degrees, 180 = far left, 0 = far right).
function segmentPath(fromDeg: number, toDeg: number): string {
  const [ox1, oy1] = point(OUTER, fromDeg);
  const [ox2, oy2] = point(OUTER, toDeg);
  const [ix2, iy2] = point(INNER, toDeg);
  const [ix1, iy1] = point(INNER, fromDeg);
  return `M ${ox1} ${oy1} A ${OUTER} ${OUTER} 0 0 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${INNER} ${INNER} 0 0 0 ${ix1} ${iy1} Z`;
}

const LEVELS: HelpLevel[] = [1, 2, 3, 4, 5];

type Props = {
  level: HelpLevel;
  size?: "sm" | "lg";
  showLabel?: boolean;
  // The label sits on whatever the dial is placed on, so the caller says whether that's dark or light.
  labelColor?: string;
};

export function GameGauge({ level, size = "sm", showLabel = true, labelColor = INK }: Props) {
  const width = size === "lg" ? 170 : 104;
  const needleDeg = 180 - (level - 0.5) * SEGMENT_DEG;
  const [nx, ny] = point(OUTER - 6, needleDeg);
  const label = HELP_LEVEL_LABELS[level];

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "2px", flexShrink: 0 }}>
      <svg
        viewBox="0 0 120 68" width={width} height={(width * 68) / 120}
        role="img" aria-label={`Help level: ${label.toLowerCase()}, ${level} of 5`}
        style={{ display: "block" }}
      >
        {LEVELS.map(l => {
          const from = 180 - (l - 1) * SEGMENT_DEG - GAP_DEG / 2;
          const to = 180 - l * SEGMENT_DEG + GAP_DEG / 2;
          return (
            <path
              key={l} d={segmentPath(from, to)} fill={helpLevelColor(l)} stroke={INK}
              strokeWidth={l === level ? 2.6 : 1.4} strokeLinejoin="round" opacity={l === level ? 1 : 0.4}
            />
          );
        })}
        <line x1={CX} y1={CY} x2={nx} y2={ny} stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <circle cx={CX} cy={CY} r="6.5" fill={INK} />
        <circle cx={CX} cy={CY} r="2.4" fill="#FCD34D" />
      </svg>
      {showLabel && (
        <div style={{ fontSize: size === "lg" ? "13px" : "11px", fontWeight: 800, color: labelColor, textAlign: "center", lineHeight: 1.2 }}>{label}</div>
      )}
    </div>
  );
}
