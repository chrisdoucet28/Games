import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Pilot grammar diagram (see diagrams/GrammarDiagram.tsx for the per-topic registry this plugs
// into). Puts both tenses on one shared timeline so the contrast is visual, not just verbal:
// Past Simple is drawn as a single finished dot at a named time, with nothing connecting it
// forward to "now" — it just stops. Present Perfect is drawn as an arrow that starts at a
// deliberately vague point (dashed lead-in — no exact time given) and runs solid all the way to
// "now", because that's the one fact that actually matters for this tense.
// `variant` controls styling only, never layout: "screen" gets the caller's accent color and a
// light tinted card (matches LessonContent's on-screen look); "print" drops all color to a single
// ink tone, per the app's established B&W-friendly print convention (see printSectionHeadingStyle
// and friends in LessonPlanScreen.tsx) — a teacher's printer shouldn't need color to make sense of it.
export function PresentPerfectVsPastSimpleDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";

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
          <Icon name="hourglass" size={14} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        On the timeline
      </div>
      <svg viewBox="0 0 460 160" style={{ width: "100%", height: "auto", display: "block" }}>
        {/* Shared "now" reference line both rows point at */}
        <line x1="436" y1="20" x2="436" y2="148" stroke={ink} strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="436" y="14" textAnchor="middle" fontSize="11" fontWeight="700" fill={ink}>NOW</text>

        {/* Past Simple row — one finished dot, nothing drawn after it (disconnected from now) */}
        <text x="8" y="46" fontSize="12.5" fontWeight="800" fill={ink}>Past Simple</text>
        <text x="8" y="60" fontSize="9.5" fontStyle="italic" fill={caption}>one finished, named moment</text>
        <circle cx="260" cy="52" r="7" fill={ink} />
        <text x="260" y="76" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={ink}>yesterday</text>

        {/* Present Perfect row — dashed (vague start) into a solid arrow that reaches "now" */}
        <text x="8" y="116" fontSize="12.5" fontWeight="800" fill={accent}>Present Perfect</text>
        <text x="8" y="130" fontSize="9.5" fontStyle="italic" fill={caption}>no exact time — still true now</text>
        <line x1="170" y1="122" x2="210" y2="122" stroke={accent} strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" />
        <line x1="210" y1="122" x2="420" y2="122" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <polygon points="416,112 416,132 434,122" fill={accent} />
        <text x="300" y="148" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>since / for / just / already / ever</text>
      </svg>
    </div>
  );
}
