import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// MOCK / exploratory — not registered in GrammarDiagram.tsx yet. Vocabulary topics have no
// commonMistakes array to ground a "hardest idea" the way grammar diagrams do, so the shape here is
// different: a phrase bank organized around the natural flow of the interaction (ask → accept or
// decline) rather than a single grammar contrast.
export function InvitationsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";

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
        Three stages, three phrase banks
      </div>
      <svg viewBox="0 0 460 275" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="90" y="12" width="280" height="72" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="30" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>ASKING</text>
        <text x="230" y="46" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>Would you like to...? · Are you free...?</text>
        <text x="230" y="60" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>Do you fancy + -ing? · How about + -ing?</text>
        <text x="230" y="74" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>Why don't we...? · Shall we...?</text>

        <line x1="230" y1="84" x2="230" y2="98" stroke={caption} strokeWidth="1.5" />
        <line x1="120" y1="98" x2="340" y2="98" stroke={caption} strokeWidth="1.5" />
        <line x1="120" y1="98" x2="120" y2="110" stroke={caption} strokeWidth="1.5" />
        <line x1="340" y1="98" x2="340" y2="110" stroke={caption} strokeWidth="1.5" />

        <rect x="20" y="112" width="200" height="94" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="120" y="130" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>ACCEPTING</text>
        <text x="120" y="147" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>That sounds great!</text>
        <text x="120" y="162" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>I'd love to! · Count me in!</text>
        <text x="120" y="177" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>I'm in! · Sounds like a plan!</text>
        <text x="120" y="196" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>enthusiastic → casual</text>

        <rect x="240" y="112" width="200" height="94" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="340" y="130" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>DECLINING POLITELY</text>
        <text x="340" y="147" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>I'm afraid I can't make it —</text>
        <text x="340" y="161" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>I have other plans.</text>
        <text x="340" y="177" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>Thanks for the invite, but...</text>
        <text x="340" y="191" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>always soften + leave the door open</text>

        <text x="230" y="228" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>"make it" = attend · note the word order: "I already have plans" (not "I have already")</text>

        <line x1="20" y1="240" x2="440" y2="240" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="260" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>a decline always pairs a soft opener with a reason or an alternative —</text>
        <text x="230" y="273" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>never just "No."</text>
      </svg>
    </div>
  );
}
