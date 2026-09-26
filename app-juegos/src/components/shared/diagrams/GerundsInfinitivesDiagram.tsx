import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Which verbs take a bare gerund or bare infinitive is arbitrary vocabulary (like dependent
// prepositions) — the genuinely hard grammar here is the small set of verbs that change MEANING
// depending on which one follows. Two of five common mistakes are exactly this, so remember/stop
// get the diagram's main focus, with the arbitrary always-gerund/always-infinitive lists as a
// reference strip underneath rather than the headline.
export function GerundsInfinitivesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Some verbs change meaning by what follows
      </div>
      <svg viewBox="0 0 460 215" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="60" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="28" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>REMEMBER + -ING</text>
        <text x="117" y="42" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>recall a past action</text>
        <text x="117" y="58" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>remember watching that film</text>

        <rect x="245" y="12" width="195" height="60" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="28" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>REMEMBER + TO</text>
        <text x="342" y="42" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>a future task, don't forget</text>
        <text x="342" y="58" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>remember to lock the door</text>

        <rect x="20" y="80" width="195" height="60" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="96" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>STOP + -ING</text>
        <text x="117" y="110" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>stop the activity itself</text>
        <text x="117" y="126" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>stopped walking (quit walking)</text>

        <rect x="245" y="80" width="195" height="60" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="96" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>STOP + TO</text>
        <text x="342" y="110" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>pause to do something else</text>
        <text x="342" y="126" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>stopped to buy a coffee</text>

        <text x="230" y="156" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>always -ing: enjoy, finish, suggest, avoid · always to: decide, agree, hope, promise</text>

        <line x1="20" y1="168" x2="440" y2="168" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="188" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I enjoy to visit new places. · She decided leaving her job.</text>
        <text x="230" y="204" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I enjoy visiting new places. · She decided to leave her job.</text>
      </svg>
    </div>
  );
}
