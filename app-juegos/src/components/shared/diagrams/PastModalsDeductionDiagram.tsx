import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Four of five common mistakes are the same mechanical slip in different clothes: dropping "have",
// swapping it for "has", or forgetting the past participle after it. The certainty scale mirrors
// Modals of Possibility's own percentage treatment (same underlying confidence idea, now about the
// past), with "should have" kept separate since it's regret/criticism, not a guess.
export function PastModalsDeductionDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Always HAVE + past participle
      </div>
      <svg viewBox="0 0 460 220" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="12" width="140" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>CAN'T HAVE</text>
        <text x="80" y="47" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>0%</text>
        <text x="80" y="64" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>can't have known</text>

        <rect x="160" y="12" width="140" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="30" textAnchor="middle" fontSize="9" fontWeight="800" fill={accent}>MIGHT · COULD HAVE</text>
        <text x="230" y="47" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>~50%</text>
        <text x="230" y="64" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>might have forgotten</text>

        <rect x="310" y="12" width="140" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>MUST HAVE</text>
        <text x="380" y="47" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>90%+</text>
        <text x="380" y="64" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>must have left</text>

        <rect x="30" y="90" width="400" height="34" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="230" y="104" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={ink}>SHOULD(N'T) HAVE — a past mistake, not a guess</text>
        <text x="230" y="118" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>I should have studied harder — I failed the exam.</text>

        <text x="230" y="140" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>never "has", never a base verb, never "to" — just modal + have + participle</text>

        <line x1="20" y1="152" x2="440" y2="152" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="172" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She must has left already. · He must have leave already.</text>
        <text x="230" y="188" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She must have left already. · He must have left already.</text>

        <text x="230" y="208" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I might have went to the wrong address. · should have tell me</text>
      </svg>
    </div>
  );
}
