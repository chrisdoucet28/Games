import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The whole rule collapses to one visual test: does a noun follow? A possessive adjective is
// drawn with an open, dashed slot waiting for a noun; a possessive pronoun is drawn as a closed,
// solid shape with nothing after it. A small mapping row gives the actual word pairs, and the
// footer example pulls the lesson's own "whose ... ? — mine." pattern (answer a whose question
// with a pronoun, never an adjective).
export function PossessiveAdjectivesPronounsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";

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
        Does a noun follow?
      </div>
      <svg viewBox="0 0 460 190" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="15" width="200" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="120" y="38" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>POSSESSIVE ADJECTIVE</text>
        <text x="55" y="65" fontSize="13" fontWeight="700" fill={accent}>my</text>
        <rect x="80" y="52" width="70" height="20" rx="3" fill="none" stroke={caption} strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="115" y="66" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>noun</text>

        <rect x="240" y="15" width="200" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="340" y="38" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>POSSESSIVE PRONOUN</text>
        <text x="340" y="65" textAnchor="middle" fontSize="13" fontWeight="700" fill={accent}>mine.</text>
        <text x="340" y="78" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>complete — nothing after it</text>

        <text x="120" y="105" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={ink}>This is my book.</text>
        <text x="340" y="105" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={ink}>This book is mine.</text>

        <text x="230" y="130" textAnchor="middle" fontSize="10" fontWeight="700" fill={caption}>my → mine  ·  your → yours  ·  her → hers  ·  their → theirs</text>

        <text x="230" y="160" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ink}>Whose bag is this? — It's mine.</text>
        <text x="230" y="176" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>a "whose" question is answered with a pronoun, never an adjective</text>
      </svg>
    </div>
  );
}
