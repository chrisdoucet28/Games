import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Every tense of the passive is built from the exact same two-part formula — the "be" verb
// changes, the past participle never does — so the diagram shows all three tenses side by side to
// make that constant piece visible, with the "by" agent rule and the trickier be-agreement
// mistakes (was/were, is/are with uncountable "homework") in the footer.
export function PassiveSimpleDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Be changes, the past participle never does
      </div>
      <svg viewBox="0 0 460 185" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="12" width="140" height="58" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>PRESENT</text>
        <text x="80" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>am/is/are + participle</text>
        <text x="80" y="58" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>English is spoken here.</text>

        <rect x="160" y="12" width="140" height="58" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>PAST</text>
        <text x="230" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>was/were + participle</text>
        <text x="230" y="58" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>This bridge was built in 1950.</text>

        <rect x="310" y="12" width="140" height="58" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>FUTURE</text>
        <text x="380" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>will be + participle</text>
        <text x="380" y="58" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>Results will be announced.</text>

        <text x="230" y="88" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>the agent (who did it) always follows "by" — never "from"</text>

        <line x1="20" y1="100" x2="440" y2="100" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="120" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ was bake by my mother. · results will announced tomorrow.</text>
        <text x="230" y="136" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ was baked by my mother. · will be announced tomorrow.</text>

        <text x="230" y="156" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ made from the team. · documents was signed yesterday.</text>
        <text x="230" y="172" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ made by the team. · documents were signed yesterday.</text>
      </svg>
    </div>
  );
}
