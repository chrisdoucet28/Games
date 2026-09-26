import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro names both directions of the mistake explicitly: adding "the" where a
// general statement needs no article, and dropping "a/an" where a singular countable noun always
// needs one. Those two named directions are the whole diagram; the -uniques/superlatives/plural-
// country "the" rules and the a/an sound rule stay in the footer as smaller add-ons.
export function ArticlesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Two opposite article mistakes
      </div>
      <svg viewBox="0 0 460 200" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>GENERAL CATEGORY</text>
        <text x="117" y="46" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>NO article at all</text>
        <text x="117" y="63" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>Dogs are loyal animals.</text>
        <text x="117" y="78" textAnchor="middle" fontSize="8" fontStyle="italic" fill={wrong}>not "The dogs..."</text>

        <rect x="245" y="12" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>SINGULAR COUNTABLE</text>
        <text x="342" y="46" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>ALWAYS needs a/an</text>
        <text x="342" y="63" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>She is a teacher.</text>
        <text x="342" y="78" textAnchor="middle" fontSize="8" fontStyle="italic" fill={wrong}>not "She is teacher"</text>

        <text x="230" y="106" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>a/an follows the SOUND: an hour (silent h) · a university (sounds "yoo-")</text>

        <line x1="20" y1="118" x2="440" y2="118" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="138" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ The dogs are loyal animals. · I have dog. She is teacher.</text>
        <text x="230" y="154" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Dogs are loyal animals. · I have a dog. She is a teacher.</text>

        <text x="230" y="174" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ The France is beautiful. · This is a best restaurant in town.</text>
        <text x="230" y="190" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ France is beautiful. · This is the best restaurant in town.</text>
      </svg>
    </div>
  );
}
