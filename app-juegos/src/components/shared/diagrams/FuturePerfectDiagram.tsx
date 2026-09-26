import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Three of five common mistakes drop "have" from the formula entirely, and a fourth breaks its
// word order in questions — so the fixed three-word chain, with the question order shown right
// beside it, is the whole diagram.
export function FuturePerfectDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
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
        Will HAVE + past participle — never skip "have"
      </div>
      <svg viewBox="0 0 460 175" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="50" y="14" width="360" height="56" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="36" textAnchor="middle" fontSize="14" fontWeight="800" fill={accent}>WILL HAVE + PAST PARTICIPLE</text>
        <text x="230" y="55" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>By June, she will have finished the course.</text>

        <text x="230" y="90" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>question: Will + subject + HAVE + participle? · negative: won't HAVE + participle</text>
        <text x="230" y="105" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>almost always paired with "by" + a future time</text>

        <line x1="20" y1="118" x2="440" y2="118" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="138" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I will finished my degree. · She will has graduated by June.</text>
        <text x="230" y="154" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I will have finished my degree. · She will have graduated by June.</text>

        <text x="230" y="170" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Will have she completed the report by Monday? (word order)</text>
      </svg>
    </div>
  );
}
