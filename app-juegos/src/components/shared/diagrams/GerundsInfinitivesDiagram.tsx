import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Which verbs take a gerund or infinitive looks like arbitrary vocabulary, but there's a real
// memory trick behind most of it: gerund verbs describe something real, ongoing, or already true;
// infinitive verbs describe a decision, hope, or plan that hasn't happened yet. That heuristic is
// far more useful day-to-day than the small remember/stop/try exception (which still gets a
// one-line mention, since it's a real trap, just not the main event).
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
          <Icon name="target" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        A trick for the "arbitrary" lists
      </div>
      <svg viewBox="0 0 460 225" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="102" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>GERUND (-ing)</text>
        <text x="117" y="45" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>real, ongoing, or already true</text>
        <text x="117" y="62" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>enjoy · finish · suggest · avoid</text>
        <text x="117" y="74" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>consider · admit · keep · deny</text>
        <text x="117" y="94" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>I enjoy visiting new places.</text>
        <text x="117" y="108" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>(a real, ongoing activity)</text>

        <rect x="245" y="12" width="195" height="102" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>INFINITIVE (to + verb)</text>
        <text x="342" y="45" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink}>a decision, hope, or plan — not yet real</text>
        <text x="342" y="62" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>decide · agree · hope · promise</text>
        <text x="342" y="74" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>manage · refuse · afford · offer</text>
        <text x="342" y="94" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>She decided to leave her job.</text>
        <text x="342" y="108" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>(not done yet — just decided)</text>

        <text x="230" y="134" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>exception: remember/stop/try change meaning depending on which one follows</text>

        <line x1="20" y1="146" x2="440" y2="146" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="166" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I enjoy to visit new places. · She decided leaving her job.</text>
        <text x="230" y="182" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I enjoy visiting new places. · She decided to leave her job.</text>

        <text x="230" y="202" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ He suggested to take a break. · Please remember locking the door.</text>
        <text x="230" y="218" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ He suggested taking a break. · Please remember to lock the door.</text>
      </svg>
    </div>
  );
}
