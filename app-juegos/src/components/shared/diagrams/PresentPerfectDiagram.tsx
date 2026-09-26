import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Two of six common mistakes are the exact same word-order slip in mirror image (already/just
// placed at the start instead of glued between have/has and the participle), so that placement
// rule is the diagram's main visual. "Yet" gets its own box since it sits in a different spot
// entirely (the end) and signals present perfect rather than past simple.
export function PresentPerfectDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Just/already glue to the middle — yet goes at the end
      </div>
      <svg viewBox="0 0 460 200" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>JUST · ALREADY</text>
        <text x="117" y="46" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>have/has + [word] + participle</text>
        <text x="117" y="64" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>She has just arrived.</text>
        <text x="117" y="80" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>I've already finished.</text>

        <rect x="245" y="12" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>YET</text>
        <text x="342" y="46" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>at the END — negatives/questions</text>
        <text x="342" y="64" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>I haven't finished yet.</text>
        <text x="342" y="80" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(signals present perfect, not past simple)</text>

        <text x="230" y="106" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>for + a length of time · since + a starting point</text>

        <line x1="20" y1="118" x2="440" y2="118" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="138" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Already I have finished. · She just has arrived.</text>
        <text x="230" y="154" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I have already finished. · She has just arrived.</text>

        <text x="230" y="174" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ They didn't arrive yet.</text>
        <text x="230" y="190" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ They haven't arrived yet.</text>
      </svg>
    </div>
  );
}
