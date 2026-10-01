import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own opening line is this exact minimal pair — same words, different meaning — so
// it becomes the whole top-level fork rather than one more sentence about it. All chrome text
// kept to plain A1 words.
export function PersonalityDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Same words, two different questions
      </div>
      <svg viewBox="0 0 460 196" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="16" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="36" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>WHAT IS she LIKE?</text>
        <text x="117" y="50" textAnchor="middle" fontSize="7.8" fill={caption}>her personality</text>
        <text x="117" y="66" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>What is she like?</text>
        <text x="117" y="80" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>She's very friendly.</text>

        <rect x="245" y="16" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="36" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>WHAT DOES she LIKE?</text>
        <text x="342" y="50" textAnchor="middle" fontSize="7.8" fill={caption}>her preferences</text>
        <text x="342" y="66" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>What does she like?</text>
        <text x="342" y="80" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>She likes pizza.</text>

        <line x1="20" y1="108" x2="440" y2="108" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="128" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ He is a very kindly person. · She is more shyer than her brother.</text>
        <text x="230" y="144" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ He is a very kind person. · She is shyer than her brother.</text>

        <text x="230" y="162" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ They are very creative persons.</text>
        <text x="230" y="178" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ They are very creative people.</text>
      </svg>
    </div>
  );
}
