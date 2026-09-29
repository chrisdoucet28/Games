import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: school's own obligation grammar is distinctive among the A2 theme set — must/
// have to shows up active AND passive ("must be handed in"), which no other A2 theme topic does.
// Two rule cards carry that contrast; the middle callout isolates the "no to after must" trap
// (a genuine, separate slip from the passive form itself). All chrome text kept to plain A2 words.
export function SchoolAndStudyDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="school" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        School Rules: MUST + Verb
      </div>
      <svg viewBox="0 0 460 224" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="56" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>ACTIVE — MUST + VERB</text>
        <text x="117" y="46" textAnchor="middle" fontSize="8.3" fontStyle="italic" fill={ink}>Students must arrive on time.</text>
        <text x="117" y="60" textAnchor="middle" fontSize="6.6" fill={caption}>who does it? the student</text>

        <rect x="245" y="12" width="195" height="56" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>PASSIVE — MUST BE + DONE</text>
        <text x="342" y="46" textAnchor="middle" fontSize="7.4" fontStyle="italic" fill={ink}>The essay must be handed in.</text>
        <text x="342" y="60" textAnchor="middle" fontSize="6.6" fill={caption}>who does it? doesn't matter</text>

        <rect x="130" y="82" width="200" height="36" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="230" y="98" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={ink}>NO "TO" AFTER MUST</text>
        <text x="230" y="112" textAnchor="middle" fontSize="8" fill={caption}><tspan fill={wrong}>✗ must to arrive</tspan> · <tspan fill={right}>✓ must arrive</tspan></text>

        <line x1="20" y1="134" x2="440" y2="134" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="154" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I have to assist my classes.</text>
        <text x="230" y="170" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I have to attend my classes.</text>

        <text x="230" y="192" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I always avoid to talk in class.</text>
        <text x="230" y="208" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I always avoid talking in class.</text>
      </svg>
    </div>
  );
}
