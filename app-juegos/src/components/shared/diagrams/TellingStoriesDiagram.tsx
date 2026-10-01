import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// A left-to-right narrative timeline (setup → events → twist → ending), since this lesson's own
// structure is inherently sequential rather than built around one grammar contrast. All chrome
// text kept to plain A2 words.
export function TellingStoriesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        A story's shape, left to right
      </div>
      <svg viewBox="0 0 460 256" style={{ width: "100%", height: "auto", display: "block" }}>
        <line x1="20" y1="45" x2="440" y2="45" stroke={caption} strokeWidth="2" markerEnd="url(#story-arrow)" />
        <defs>
          <marker id="story-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={caption} />
          </marker>
        </defs>

        <circle cx="60" cy="45" r="5" fill={accent} />
        <circle cx="180" cy="45" r="5" fill={accent} />
        <circle cx="300" cy="45" r="5" fill={accent} />
        <circle cx="410" cy="45" r="5" fill={accent} />

        <rect x="10" y="60" width="110" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="65" y="76" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>SETUP</text>
        <text x="65" y="90" textAnchor="middle" fontSize="7" fontStyle="italic" fill={ink}>One day... /</text>
        <text x="65" y="101" textAnchor="middle" fontSize="7" fontStyle="italic" fill={ink}>Once upon a time...</text>
        <text x="65" y="117" textAnchor="middle" fontSize="6.5" fontStyle="italic" fill={caption}>past continuous scene</text>

        <rect x="130" y="60" width="110" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="185" y="76" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>EVENTS</text>
        <text x="185" y="90" textAnchor="middle" fontSize="7" fontStyle="italic" fill={ink}>First... Then...</text>
        <text x="185" y="101" textAnchor="middle" fontSize="7" fontStyle="italic" fill={ink}>Next... After that...</text>
        <text x="185" y="117" textAnchor="middle" fontSize="6.5" fontStyle="italic" fill={caption}>past simple, in order</text>

        <rect x="250" y="60" width="110" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="305" y="76" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>THE TWIST</text>
        <text x="305" y="90" textAnchor="middle" fontSize="7" fontStyle="italic" fill={ink}>Suddenly... /</text>
        <text x="305" y="101" textAnchor="middle" fontSize="7" fontStyle="italic" fill={ink}>Unfortunately...</text>
        <text x="305" y="117" textAnchor="middle" fontSize="6.5" fontStyle="italic" fill={caption}>the unexpected part</text>

        <rect x="370" y="60" width="80" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="410" y="76" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>ENDING</text>
        <text x="410" y="90" textAnchor="middle" fontSize="7" fontStyle="italic" fill={ink}>In the end... /</text>
        <text x="410" y="101" textAnchor="middle" fontSize="7" fontStyle="italic" fill={ink}>As a result...</text>
        <text x="410" y="117" textAnchor="middle" fontSize="6.5" fontStyle="italic" fill={caption}>the outcome</text>

        <line x1="20" y1="140" x2="440" y2="140" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="160" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ One day, I am walking when I heard a noise.</text>
        <text x="230" y="176" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ One day, I was walking when I heard a noise.</text>

        <text x="230" y="194" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ All of sudden... · To make things worst...</text>
        <text x="230" y="210" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ All of a sudden... · To make things worse...</text>

        <text x="230" y="228" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Despite the rain was heavy... · It was so a scary film.</text>
        <text x="230" y="244" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Despite the heavy rain... · It was such a scary film.</text>
      </svg>
    </div>
  );
}
