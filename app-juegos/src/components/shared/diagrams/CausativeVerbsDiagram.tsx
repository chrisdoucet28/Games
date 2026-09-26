import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro flags this as "a distinctive mistake this topic drills": treating make/let
// like a reporting verb and adding a "that" clause after them, which produces a sentence with no
// correct-English equivalent at all. That trap gets the hero spot, with the have/get distinction
// (service vs directing a person) as a supporting strip.
export function CausativeVerbsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="warning" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Make/let are never followed by "that"
      </div>
      <svg viewBox="0 0 460 218" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="30" y="12" width="400" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>MAKE/LET + OBJECT + BARE VERB</text>
        <text x="230" y="46" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={wrong}>✗ made us that we had to finish our homework</text>
        <text x="230" y="59" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={right}>✓ made us finish our homework</text>

        <text x="230" y="82" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={ink}>make = force · let = permit — no "that", no separate subject</text>

        <rect x="20" y="94" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="117" y="112" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>HAVE + person + bare verb</text>
        <text x="117" y="128" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>have the plumber check the pipes</text>
        <text x="117" y="141" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>(directing a person)</text>

        <rect x="245" y="94" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="342" y="112" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>GET + person + TO-verb</text>
        <text x="342" y="128" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>got her brother to help move</text>
        <text x="342" y="141" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>(directing a person)</text>

        <text x="230" y="164" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>arranging a service: have/get + object + past participle — had my hair cut</text>

        <line x1="20" y1="174" x2="440" y2="174" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="194" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ didn't let that I went to the party. · made us to sit in silence.</text>
        <text x="230" y="210" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ didn't let me go to the party. · made us sit in silence.</text>
      </svg>
    </div>
  );
}
