import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own core point — agree/disagree are ordinary verbs, never "I'm agree" — becomes the
// AGREE/DISAGREE fork's shared header note, with partial agreement as its own smaller box. All
// chrome text kept to plain B1 words.
export function AgreeingDisagreeingDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Agree / disagree are verbs, not adjectives
      </div>
      <svg viewBox="0 0 460 248" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="16" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="34" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>I AGREE</text>
        <text x="117" y="50" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>I completely agree.</text>
        <text x="117" y="64" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>I couldn't agree more.</text>
        <text x="117" y="78" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>We're on the same page.</text>

        <rect x="245" y="16" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="34" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>I DISAGREE</text>
        <text x="342" y="50" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>I'm afraid I disagree.</text>
        <text x="342" y="64" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>I see your point, but...</text>
        <text x="342" y="78" textAnchor="middle" fontSize="7.7" fontStyle="italic" fill={ink}>I beg to differ.</text>

        <rect x="20" y="106" width="420" height="44" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="124" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>PARTIAL AGREEMENT</text>
        <text x="230" y="140" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>To some extent I agree, but I don't think it's realistic.</text>

        <line x1="20" y1="162" x2="440" y2="162" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="182" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I'm agree that we need to change. · I disagree on your interpretation.</text>
        <text x="230" y="198" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I agree that we need to change. · I disagree with your interpretation.</text>

        <text x="230" y="216" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ With all do respect... · I see from where you're coming.</text>
        <text x="230" y="232" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ With all due respect... · I see where you're coming from.</text>
      </svg>
    </div>
  );
}
