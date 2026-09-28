import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Two of five common mistakes are colour word order/spelling, two are the number-plural link —
// genuinely two separate mini-rules bundled in one lesson, so both get their own box rather than
// forcing one "hardest idea." All chrome text kept to plain A1 words.
export function NumbersAndColoursDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="target" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Colour before the noun, number before -s
      </div>
      <svg viewBox="0 0 460 220" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="32" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>COLOUR + NOUN</text>
        <text x="117" y="48" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>the colour never takes -s</text>
        <text x="117" y="65" textAnchor="middle" fontSize="9" fontStyle="italic" fill={ink}>a black bag</text>
        <text x="117" y="80" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>two red bags</text>

        <rect x="245" y="12" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="32" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>NUMBER + NOUN + S</text>
        <text x="342" y="48" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>2 or more? add -s</text>
        <text x="342" y="65" textAnchor="middle" fontSize="9" fontStyle="italic" fill={ink}>two brothers</text>
        <text x="342" y="80" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>How many pens?</text>

        <text x="230" y="108" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>watch the spelling: forty has no "u" (not "fourty")</text>

        <line x1="20" y1="120" x2="440" y2="120" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="140" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ a bag black · The sky is blues.</text>
        <text x="230" y="156" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ a black bag · The sky is blue.</text>

        <text x="230" y="176" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I have two brother. · How many student are there?</text>
        <text x="230" y="192" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I have two brothers. · How many students are there?</text>
      </svg>
    </div>
  );
}
