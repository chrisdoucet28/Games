import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Two of five common mistakes are the same surprising rule: a reported question keeps STATEMENT
// word order, never the inverted question order of the original — that's the trap a listener never
// sees coming since the sentence still has a question word or "if" in it. Tense backshifting stays
// as a compact supporting table rather than its own box, since it's more mechanical to apply.
export function ReportedSpeechDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Reported questions keep statement word order
      </div>
      <svg viewBox="0 0 460 200" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="72" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>WH-QUESTIONS</text>
        <text x="117" y="46" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>wh-word + subject + verb</text>
        <text x="117" y="62" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>He asked where I lived.</text>
        <text x="117" y="76" textAnchor="middle" fontSize="8" fontStyle="italic" fill={wrong}>not "where did I live"</text>

        <rect x="245" y="12" width="195" height="72" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>YES/NO QUESTIONS</text>
        <text x="342" y="46" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>if/whether + subject + verb</text>
        <text x="342" y="62" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>She asked if I had eaten.</text>
        <text x="342" y="76" textAnchor="middle" fontSize="8" fontStyle="italic" fill={wrong}>not "had I eaten"</text>

        <text x="230" y="100" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>backshift: am/is/are→was/were · will→would · can→could</text>

        <line x1="20" y1="112" x2="440" y2="112" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="132" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ asked me where was the station.</text>
        <text x="230" y="148" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ asked me where the station was.</text>

        <text x="230" y="168" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ asked if did she agree. · She said me that she was hungry.</text>
        <text x="230" y="184" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ asked if she agreed. · She told me that she was hungry.</text>
      </svg>
    </div>
  );
}
