import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro calls this "one of the most common mistakes at this level" and names the
// stative-verb exception as absolute ("never take the continuous, even with for/since") — three of
// five common mistakes are variations on picking continuous when simple was needed (or vice versa),
// so the duration/activity vs result/count fork plus the stative-verb callout is the whole diagram.
export function PresentPerfectContinuousDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Stative verbs never take the continuous
      </div>
      <svg viewBox="0 0 460 205" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>CONTINUOUS</text>
        <text x="117" y="46" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>duration / the activity itself</text>
        <text x="117" y="63" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>I've been waiting for an hour.</text>

        <rect x="245" y="12" width="195" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>SIMPLE</text>
        <text x="342" y="46" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>result, a count, or done</text>
        <text x="342" y="63" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>I've finished. She's written 3 novels.</text>

        <rect x="30" y="88" width="400" height="34" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="230" y="102" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={ink}>stative verbs (know, want, believe...) → always SIMPLE, even with for/since</text>
        <text x="230" y="116" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>I've known her for ten years. (not "have been knowing")</text>

        <line x1="20" y1="132" x2="440" y2="132" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="152" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I have been knowing him for ten years.</text>
        <text x="230" y="168" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I have known him for ten years.</text>

        <text x="230" y="188" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ How many books have you been reading? · I have been losing my keys.</text>
        <text x="230" y="204" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ How many books have you read? · I have lost my keys.</text>
      </svg>
    </div>
  );
}
