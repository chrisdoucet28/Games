import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// All four of the lesson's commonMistakes are the same be-vs-have split, and appearance is
// literally something you point at — so this leads with a drawn figure and leader lines straight
// to the feature each verb describes (hair/eyes → have, height/build → be), instead of two plain
// text boxes. Age isn't drawable, so it stays a short note. Only the agreement-form mistakes (not
// visual) still need the wrong/right footer. All chrome text kept to plain A1 words.
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
        Be, or have?
      </div>
      <svg viewBox="0 0 460 266" style={{ width: "100%", height: "auto", display: "block" }}>
        <line x1="48" y1="44" x2="48" y2="150" stroke={ink} strokeWidth="2" />
        <line x1="40" y1="44" x2="56" y2="44" stroke={ink} strokeWidth="2" />
        <line x1="40" y1="150" x2="56" y2="150" stroke={ink} strokeWidth="2" />
        <text x="14" y="94" fontSize="7.3" fontStyle="italic" fill={caption}>tall</text>
        <text x="10" y="106" fontSize="7.3" fontStyle="italic" fill={caption}>short</text>

        <path d={`M 88 66 A 22 18 0 0 1 132 66 Z`} fill={ink} />
        <circle cx="110" cy="66" r="22" fill={fill} stroke={ink} strokeWidth="1.5" />
        <circle cx="102" cy="68" r="2.5" fill={ink} />
        <circle cx="118" cy="68" r="2.5" fill={ink} />
        <path d="M 80 90 L 140 90 L 150 150 L 70 150 Z" fill={fill} stroke={accent} strokeWidth="2" />

        <line x1="128" y1="55" x2="222" y2="42" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />
        <text x="228" y="38" fontSize="9.5" fontWeight="800" fill={accent}>HAVE</text>
        <text x="228" y="50" fontSize="8.5" fontStyle="italic" fill={ink}>hair</text>

        <line x1="118" y1="68" x2="222" y2="82" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />
        <text x="228" y="78" fontSize="9.5" fontWeight="800" fill={accent}>HAVE</text>
        <text x="228" y="90" fontSize="8.5" fontStyle="italic" fill={ink}>eyes (and other features)</text>

        <line x1="145" y1="112" x2="222" y2="124" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />
        <text x="228" y="120" fontSize="9.5" fontWeight="800" fill={accent}>BE</text>
        <text x="228" y="132" fontSize="8.5" fontStyle="italic" fill={ink}>tall, short (height, build)</text>

        <text x="228" y="158" fontSize="8.5" fontStyle="italic" fill={caption}>also BE: age → He is 30 years old.</text>

        <line x1="20" y1="176" x2="440" y2="176" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="196" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ He have blue eyes. · She is have green eyes.</text>
        <text x="230" y="212" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ He has blue eyes. · She has green eyes.</text>

        <text x="230" y="230" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She has 25 years old. · My grandfather has tall and thin.</text>
        <text x="230" y="246" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She is 25 years old. · My grandfather is tall and thin.</text>
      </svg>
    </div>
  );
}
