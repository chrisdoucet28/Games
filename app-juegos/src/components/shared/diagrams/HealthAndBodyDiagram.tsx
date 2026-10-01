import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Health vocabulary is literally about the body, so a labelled figure carries the vocabulary
// itself (a headache, a sore throat, stomach hurts, a broken arm, feet hurt) instead of listing
// the words in a grid — the leader line to each body part is the "show" here. The for/since
// contrast is real content from its own section, kept small underneath. All chrome text kept to
// plain A2 words.
export function HealthAndBodyDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="person" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        What hurts?
      </div>
      <svg viewBox="0 0 460 288" style={{ width: "100%", height: "auto", display: "block" }}>
        <circle cx="90" cy="40" r="14" fill={fill} stroke={ink} strokeWidth="1.5" />
        <rect x="74" y="54" width="32" height="54" rx="6" fill={fill} stroke={accent} strokeWidth="1.7" />
        <line x1="74" y1="62" x2="50" y2="92" stroke={ink} strokeWidth="2" />
        <circle cx="50" cy="92" r="4" fill="none" stroke={ink} strokeWidth="1.4" />
        <line x1="106" y1="62" x2="130" y2="92" stroke={ink} strokeWidth="2" />
        <circle cx="130" cy="92" r="4" fill="none" stroke={ink} strokeWidth="1.4" />
        <line x1="84" y1="108" x2="76" y2="158" stroke={ink} strokeWidth="2" />
        <line x1="96" y1="108" x2="104" y2="158" stroke={ink} strokeWidth="2" />
        <ellipse cx="74" cy="160" rx="7" ry="3.2" fill="none" stroke={ink} strokeWidth="1.4" />
        <ellipse cx="106" cy="160" rx="7" ry="3.2" fill="none" stroke={ink} strokeWidth="1.4" />

        <line x1="100" y1="36" x2="215" y2="28" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />
        <text x="220" y="26" fontSize="9.5" fontWeight="800" fill={ink}>a headache</text>

        <line x1="91" y1="56" x2="215" y2="58" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />
        <text x="220" y="56" fontSize="9.5" fontWeight="800" fill={ink}>a sore throat</text>

        <line x1="90" y1="80" x2="215" y2="88" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />
        <text x="220" y="86" fontSize="9.5" fontWeight="800" fill={ink}>My stomach hurts.</text>

        <line x1="120" y1="78" x2="215" y2="118" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />
        <text x="220" y="116" fontSize="9.5" fontWeight="800" fill={ink}>a broken arm</text>

        <line x1="90" y1="159" x2="215" y2="146" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />
        <text x="220" y="144" fontSize="9.5" fontWeight="800" fill={ink}>My feet hurt.</text>
        <text x="220" y="155" fontSize="7.2" fill={caption}>(plural body part, no -s)</text>

        <rect x="20" y="180" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="198" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>FOR</text>
        <text x="117" y="211" textAnchor="middle" fontSize="7.5" fill={caption}>a length of time</text>
        <text x="117" y="225" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>I've had this cough for 3 days.</text>

        <rect x="245" y="180" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="198" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>SINCE</text>
        <text x="342" y="211" textAnchor="middle" fontSize="7.5" fill={caption}>a starting point</text>
        <text x="342" y="225" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>My throat has been sore since Monday.</text>

        <line x1="20" y1="244" x2="440" y2="244" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="264" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ He is allergic at penicillin. · He is suffering of a cold.</text>
        <text x="230" y="280" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ He is allergic to penicillin. · He is suffering from a cold.</text>
      </svg>
    </div>
  );
}
