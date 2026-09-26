import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro names the problem directly: three phrases that "look similar but mean
// very different things." Three of five common mistakes are the same underlying slip — using the
// wrong verb form after each one (bare infinitive after "used to", but -ing after "be/get used
// to") — so the three-way fork plus that form contrast is the whole diagram.
export function GetUsedToDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Same look, three different meanings
      </div>
      <svg viewBox="0 0 460 195" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="12" width="140" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>USED TO</text>
        <text x="80" y="43" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>a finished past habit</text>
        <text x="80" y="57" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>+ bare verb</text>
        <text x="80" y="70" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>I used to smoke.</text>

        <rect x="160" y="12" width="140" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>BE USED TO</text>
        <text x="230" y="43" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>already familiar</text>
        <text x="230" y="57" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>+ noun/-ing</text>
        <text x="230" y="70" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>She's used to working late.</text>

        <rect x="310" y="12" width="140" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>GET USED TO</text>
        <text x="380" y="43" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>becoming familiar</text>
        <text x="380" y="57" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>+ noun/-ing</text>
        <text x="380" y="70" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>I got used to the cold.</text>

        <line x1="20" y1="96" x2="440" y2="96" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="116" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ is used to work late. · used to living in a flat.</text>
        <text x="230" y="132" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ is used to working late. · used to live in a flat.</text>

        <text x="230" y="152" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She use to be shy. · Did you used to live in Spain?</text>
        <text x="230" y="168" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She used to be shy. · Did you use to live in Spain?</text>
      </svg>
    </div>
  );
}
