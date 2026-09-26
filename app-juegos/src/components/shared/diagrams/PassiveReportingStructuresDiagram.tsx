import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson is built around exactly three fixed patterns for how far the reporting verb reaches
// back in time (impersonal, personal present, personal past) — a natural three-way fork, matching
// the shape already used for other multi-form lessons like Modals of Possibility.
export function PassiveReportingStructuresDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        How far back the claim reaches decides the form
      </div>
      <svg viewBox="0 0 460 215" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="12" width="140" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="30" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>IMPERSONAL</text>
        <text x="80" y="44" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={ink}>It is + verb + that</text>
        <text x="80" y="60" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>It is said that the</text>
        <text x="80" y="72" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>company will merge.</text>

        <rect x="160" y="12" width="140" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="30" textAnchor="middle" fontSize="9" fontWeight="800" fill={accent}>PERSONAL, PRESENT</text>
        <text x="230" y="44" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={ink}>Subject is + verb + to + base</text>
        <text x="230" y="60" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>He is known to</text>
        <text x="230" y="72" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>dislike interviews.</text>

        <rect x="310" y="12" width="140" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="30" textAnchor="middle" fontSize="9" fontWeight="800" fill={accent}>PERSONAL, PAST</text>
        <text x="380" y="44" textAnchor="middle" fontSize="7" fontWeight="700" fill={ink}>Subject is + verb + to have + pp</text>
        <text x="380" y="60" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>He is believed to</text>
        <text x="380" y="72" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>have fled the country.</text>

        <text x="230" y="104" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>shift the whole report to the past: is/are → was/were said/believed...</text>

        <line x1="20" y1="116" x2="440" y2="116" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="136" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ It is say that the company will merge. · is said have fled.</text>
        <text x="230" y="152" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ It is said that the company will merge. · is said to have fled.</text>

        <text x="230" y="172" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ He is known to has strong opinions. · It were said that...</text>
        <text x="230" y="188" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ He is known to have strong opinions. · It was said that...</text>

        <text x="230" y="208" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ is said to resigned. · is reported being unsafe. (needs to have / to be)</text>
      </svg>
    </div>
  );
}
