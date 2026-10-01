import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const IDIOMS = [
  { phrase: "throw in the towel", gloss: "give up", icon: "towel" },
  { phrase: "stay under the radar", gloss: "avoid attention", icon: "radar" },
  { phrase: "on the same page", gloss: "in agreement", icon: "page" },
  { phrase: "back to the drawing board", gloss: "start over", icon: "board" },
  { phrase: "go the extra mile", gloss: "make more effort", icon: "mile" },
  { phrase: "put foot in mouth", gloss: "say something wrong", icon: "foot" },
  { phrase: "ball is in your court", gloss: "it's your turn", icon: "ball" },
  { phrase: "burn your bridges", gloss: "destroy a relationship", icon: "bridge" },
];

function IdiomIcon({ icon, cx, cy, ink, accent }: { icon: string; cx: number; cy: number; ink: string; accent: string }) {
  switch (icon) {
    case "towel":
      return (
        <g>
          <path d={`M ${cx - 8} ${cy - 10} Q ${cx - 4} ${cy - 6} ${cx - 8} ${cy - 2} Q ${cx - 4} ${cy + 2} ${cx - 8} ${cy + 6} L ${cx + 2} ${cy + 6} Q ${cx - 2} ${cy + 2} ${cx + 2} ${cy - 2} Q ${cx - 2} ${cy - 6} ${cx + 2} ${cy - 10} Z`} fill="none" stroke={ink} strokeWidth="1.2" />
          <line x1={cx + 8} y1={cy - 8} x2={cx + 8} y2={cy + 8} stroke={accent} strokeWidth="1.4" markerEnd="url(#aiArrow)" />
        </g>
      );
    case "radar":
      return (
        <g>
          <circle cx={cx} cy={cy} r="11" fill="none" stroke={ink} strokeWidth="1.3" />
          <circle cx={cx} cy={cy} r="6" fill="none" stroke={ink} strokeWidth="1" />
          <line x1={cx} y1={cy} x2={cx + 9} y2={cy - 7} stroke={accent} strokeWidth="1.4" />
          <circle cx={cx - 4} cy={cy + 4} r="1.6" fill={ink} />
        </g>
      );
    case "page":
      return (
        <g>
          <rect x={cx - 9} y={cy - 9} width="14" height="18" rx="1.5" fill="none" stroke={ink} strokeWidth="1.2" />
          <rect x={cx - 4} y={cy - 6} width="14" height="18" rx="1.5" fill="none" stroke={accent} strokeWidth="1.2" />
        </g>
      );
    case "board":
      return (
        <g>
          <rect x={cx - 10} y={cy - 10} width="20" height="14" rx="1.5" fill="none" stroke={ink} strokeWidth="1.3" />
          <line x1={cx} y1={cy + 4} x2={cx} y2={cy + 10} stroke={ink} strokeWidth="1.3" />
          <path d={`M ${cx - 5} ${cy - 5} A 5 5 0 1 1 ${cx - 5} ${cy + 3}`} fill="none" stroke={accent} strokeWidth="1.3" markerEnd="url(#aiArrow)" />
        </g>
      );
    case "mile":
      return (
        <g>
          <line x1={cx - 12} y1={cy + 8} x2={cx + 4} y2={cy + 8} stroke={ink} strokeWidth="1.4" />
          <line x1={cx + 4} y1={cy + 8} x2={cx + 4} y2={cy - 8} stroke={ink} strokeWidth="1.4" />
          <path d={`M ${cx + 4} ${cy - 8} L ${cx + 12} ${cy - 6} L ${cx + 4} ${cy - 2} Z`} fill={accent} />
        </g>
      );
    case "foot":
      return (
        <g>
          <ellipse cx={cx - 5} cy={cy + 4} rx="6" ry="4" fill="none" stroke={ink} strokeWidth="1.3" transform={`rotate(-20 ${cx - 5} ${cy + 4})`} />
          <path d={`M ${cx + 2} ${cy - 9} Q ${cx + 12} ${cy - 9} ${cx + 10} ${cy - 1} L ${cx + 2} ${cy - 3} Z`} fill="none" stroke={accent} strokeWidth="1.3" />
        </g>
      );
    case "ball":
      return (
        <g>
          <line x1={cx - 10} y1={cy + 9} x2={cx - 10} y2={cy - 6} stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 10} y1={cy - 6} x2={cx + 10} y2={cy - 6} stroke={ink} strokeWidth="1.3" />
          <circle cx={cx + 3} cy={cy + 3} r="4.5" fill="none" stroke={accent} strokeWidth="1.3" />
        </g>
      );
    case "bridge":
      return (
        <g>
          <path d={`M ${cx - 11} ${cy + 6} Q ${cx} ${cy - 10} ${cx + 11} ${cy + 6}`} fill="none" stroke={ink} strokeWidth="1.4" />
          <line x1={cx - 11} y1={cy + 6} x2={cx - 11} y2={cy + 10} stroke={ink} strokeWidth="1.2" />
          <line x1={cx + 11} y1={cy + 6} x2={cx + 11} y2={cy + 10} stroke={ink} strokeWidth="1.2" />
          <path d={`M ${cx + 5} ${cy - 2} Q ${cx + 8} ${cy - 6} ${cx + 5} ${cy - 10}`} fill="none" stroke={accent} strokeWidth="1.3" />
        </g>
      );
    default:
      return null;
  }
}

// Every one of the lesson's eight commonMistakes is a different idiom, so the reference grid
// itself covers all eight, each with a small illustrative icon and its plain meaning — the same
// pattern as Very Common Idioms — rather than a mistake-first layout. All chrome text kept to
// plain B2 words.
export function AdvancedIdiomsExpressionsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Fixed idioms, exact wording
      </div>
      <svg viewBox="0 0 460 274" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="aiArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={accent} />
          </marker>
        </defs>
        {IDIOMS.map((idiom, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = 20 + col * 105;
          const y = 16 + row * 84;
          const cx = x + 47.5;
          return (
            <g key={idiom.phrase}>
              <rect x={x} y={y} width="95" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
              <IdiomIcon icon={idiom.icon} cx={cx} cy={y + 24} ink={ink} accent={accent} />
              <text x={cx} y={y + 46} textAnchor="middle" fontSize="6" fontWeight="700" fill={ink}>{idiom.phrase}</text>
              <text x={cx} y={y + 60} textAnchor="middle" fontSize="6.4" fontStyle="italic" fill={caption}>{idiom.gloss}</text>
            </g>
          );
        })}

        <line x1="20" y1="188" x2="440" y2="188" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="208" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ ...stay on the radar. · I think we're in the same page.</text>
        <text x="230" y="224" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ ...stay under the radar. · I think we're on the same page.</text>

        <text x="230" y="242" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ He put his foot in the mouth. · The ball is on your court.</text>
        <text x="230" y="258" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ He put his foot in his mouth. · The ball is in your court.</text>
      </svg>
    </div>
  );
}
