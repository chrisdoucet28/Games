import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own core grammar point is separable vs inseparable, and a pronoun is the one thing
// that forces the difference into the open — a noun object can often go either side, but a
// pronoun MUST split a separable verb and can NEVER split an inseparable one. The two "fixed
// preposition" mistakes get the footer since they're a different, vocabulary-level trap.
export function PhrasalVerbsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        A pronoun forces the split — or forbids it
      </div>
      <svg viewBox="0 0 460 200" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="88" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>SEPARABLE</text>
        <text x="117" y="45" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>verb + PRONOUN + particle</text>
        <text x="117" y="60" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(a noun object could go either side —</text>
        <text x="117" y="72" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>a pronoun can't)</text>
        <text x="117" y="86" textAnchor="middle" fontSize="9" fontStyle="italic" fill={ink}>pick me up (not "pick up me")</text>

        <rect x="245" y="12" width="195" height="88" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>INSEPARABLE</text>
        <text x="342" y="45" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>verb + particle + object</text>
        <text x="342" y="60" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(the pronoun/noun never moves</text>
        <text x="342" y="72" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>in front of the particle)</text>
        <text x="342" y="86" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>look after my dog</text>

        <line x1="20" y1="112" x2="440" y2="112" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="132" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Could you pick up me? · Can you look after for my dog?</text>
        <text x="230" y="148" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Could you pick me up? · Can you look after my dog?</text>

        <text x="230" y="168" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ cut down of sugar · come up an excuse</text>
        <text x="230" y="184" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ cut down on sugar · come up with an excuse</text>
      </svg>
    </div>
  );
}
