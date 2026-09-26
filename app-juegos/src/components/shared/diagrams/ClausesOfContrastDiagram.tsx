import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro frames this as words that all mean roughly the same thing but split
// across three different GRAMMARS (a clause, a noun/gerund, or a brand new sentence) — that three-
// way split, not any one word's meaning, is what's actually hard, and is the lesson's own explicit
// "most common mistake at this level".
export function ClausesOfContrastDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Same meaning, three different grammars
      </div>
      <svg viewBox="0 0 460 195" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="12" width="140" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="30" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>ALTHOUGH · THOUGH</text>
        <text x="80" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>+ full clause, one sentence</text>
        <text x="80" y="60" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>Although it rained, we went.</text>
        <text x="80" y="72" textAnchor="middle" fontSize="7" fontStyle="italic" fill={wrong}>never + "but" too</text>

        <rect x="160" y="12" width="140" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="30" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>DESPITE · IN SPITE OF</text>
        <text x="230" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>+ noun/-ing, never a clause</text>
        <text x="230" y="60" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>Despite the rain, we went.</text>
        <text x="230" y="72" textAnchor="middle" fontSize="7" fontStyle="italic" fill={caption}>in spite OF · despite (no "of")</text>

        <rect x="310" y="12" width="140" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="30" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>HOWEVER · NEVERTHELESS</text>
        <text x="380" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>starts a NEW sentence</text>
        <text x="380" y="60" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>It rained. However, we went.</text>
        <text x="380" y="72" textAnchor="middle" fontSize="7" fontStyle="italic" fill={wrong}>comma alone can't join clauses</text>

        <line x1="20" y1="94" x2="440" y2="94" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="114" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Despite it was raining, we went out. · In spite the traffic...</text>
        <text x="230" y="130" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Despite the rain, we went out. · In spite of the traffic...</text>

        <text x="230" y="150" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She passed, however she didn't study much.</text>
        <text x="230" y="166" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She passed. However, she didn't study much.</text>

        <text x="230" y="186" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Although he was tired, but he kept working. (drop "but")</text>
      </svg>
    </div>
  );
}
