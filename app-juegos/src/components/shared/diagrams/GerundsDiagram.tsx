import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro calls this "the single biggest source of mistakes": after ANY
// preposition, English always needs a gerund, never a to-infinitive — even when that preposition
// is hiding in plain sight, like the "to" in "look forward to". That disguised-preposition trap
// gets its own callout since it's the one case that looks exactly like the opposite rule.
export function GerundsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        After any preposition — always -ing
      </div>
      <svg viewBox="0 0 460 200" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="72" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>PREPOSITION + -ING</text>
        <text x="117" y="46" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>without, for, by, after, before...</text>
        <text x="117" y="62" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>She left without saying goodbye.</text>
        <text x="117" y="76" textAnchor="middle" fontSize="8" fontStyle="italic" fill={wrong}>not "without to say"</text>

        <rect x="245" y="12" width="195" height="72" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>LOOK FORWARD TO + -ING</text>
        <text x="342" y="46" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>"to" here is a preposition</text>
        <text x="342" y="62" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>looking forward to seeing you.</text>
        <text x="342" y="76" textAnchor="middle" fontSize="8" fontStyle="italic" fill={wrong}>not "to see" — it looks like one!</text>

        <text x="230" y="102" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>also gerund: as a subject (Learning takes time) &amp; can't help / feel like / spend time</text>

        <line x1="20" y1="114" x2="440" y2="114" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="134" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ left without to say goodbye. · looking forward to see you.</text>
        <text x="230" y="150" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ left without saying goodbye. · looking forward to seeing you.</text>

        <text x="230" y="170" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ It's no use to complain. · I can't help to cry. · By study hard...</text>
        <text x="230" y="186" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ It's no use complaining. · I can't help crying. · By studying hard...</text>
      </svg>
    </div>
  );
}
