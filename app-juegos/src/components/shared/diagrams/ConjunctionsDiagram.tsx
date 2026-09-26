import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// This lesson covers a genuinely wide set of conjunctions, so the diagram works as a full
// reference chart rather than one narrow fork: all four coordinating conjunctions, the
// because/so direction trap (two of six common mistakes are this same error mirrored both ways),
// the although-group's "never with but" rule, and when/if + present for the future.
export function ConjunctionsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Each conjunction has its own rule
      </div>
      <svg viewBox="0 0 460 310" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="10" width="102" height="46" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="61" y="28" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>AND</text>
        <text x="61" y="42" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>adds</text>

        <rect x="122" y="10" width="102" height="46" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="173" y="28" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>BUT</text>
        <text x="173" y="42" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>contrasts</text>

        <rect x="234" y="10" width="102" height="46" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="285" y="28" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>OR</text>
        <text x="285" y="42" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>alternative</text>

        <rect x="346" y="10" width="102" height="46" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="397" y="28" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>SO</text>
        <text x="397" y="42" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>shows result</text>

        <rect x="20" y="64" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="82" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>BECAUSE</text>
        <text x="117" y="96" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>+ the REASON (why)</text>
        <text x="117" y="110" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>...because it was raining.</text>

        <rect x="245" y="64" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="82" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>SO</text>
        <text x="342" y="96" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>+ the RESULT (what happened)</text>
        <text x="342" y="110" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>..., so we stayed inside.</text>

        <rect x="20" y="126" width="420" height="46" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="230" y="142" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={ink}>ALTHOUGH · THOUGH · EVEN THOUGH · WHEREAS</text>
        <text x="230" y="155" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>already mean "contrast" — never add "but" too</text>
        <text x="230" y="168" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>Although it was raining, we went for a walk.</text>

        <rect x="20" y="180" width="420" height="42" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="230" y="196" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={ink}>WHEN / IF + present tense (never "will")</text>
        <text x="230" y="210" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>When you finish your homework... / If it rains tomorrow...</text>

        <line x1="20" y1="232" x2="440" y2="232" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="250" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ It was raining, because we stayed inside.</text>
        <text x="230" y="266" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ It was raining, so we stayed inside.</text>

        <text x="230" y="286" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Although it was raining, but we went for a walk.</text>
        <text x="230" y="302" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Although it was raining, we went for a walk.</text>
      </svg>
    </div>
  );
}
