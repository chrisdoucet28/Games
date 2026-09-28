import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Direction arrows are one of the few pieces of English content that are genuinely universal —
// an arrow needs no translation — so this leads with plain arrow glyphs instead of describing the
// movement in words, which matters even more for a teacher without the student's L1. The
// on/in preposition trap gets its own small fork, marked wrong with a literal strike-through
// rather than a sentence about it. All chrome text kept to plain A1 words.
export function GivingDirectionsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";

  const arrows = [
    { glyph: "←", label: "turn left" },
    { glyph: "→", label: "turn right" },
    { glyph: "↑", label: "go straight ahead" },
  ];

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
          <Icon name="target" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        No "on" before left/right, no "in" for a side
      </div>
      <svg viewBox="0 0 460 256" style={{ width: "100%", height: "auto", display: "block" }}>
        {arrows.map((a, i) => {
          const x = 10 + i * 150;
          const cx = x + 70;
          return (
            <g key={a.label}>
              <rect x={x} y="16" width="140" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
              <text x={cx} y="56" textAnchor="middle" fontSize="28" fontWeight="800" fill={accent}>{a.glyph}</text>
              <text x={cx} y="78" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>{a.label}</text>
            </g>
          );
        })}

        <rect x="20" y="98" width="195" height="60" rx="8" fill={fill} stroke={right} strokeWidth="2" />
        <text x="117" y="118" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ ON your left/right</text>
        <text x="117" y="136" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>The bank is on your left.</text>
        <text x="117" y="150" textAnchor="middle" fontSize="7.6" fill={caption}>also: at the lights · on the corner</text>

        <rect x="245" y="98" width="195" height="60" rx="8" fill={fill} stroke={wrong} strokeWidth="2" />
        <text x="342" y="118" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ IN your left/right</text>
        <text x="342" y="136" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={wrong} textDecoration="line-through">The bank is in your left.</text>

        <line x1="20" y1="170" x2="440" y2="170" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="190" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Turn on the left at the lights. · How do I go to the station?</text>
        <text x="230" y="206" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Turn left at the lights. · How do I get to the station?</text>

        <text x="230" y="224" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Is it long from here?</text>
        <text x="230" y="240" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Is it far from here?</text>
      </svg>
    </div>
  );
}
