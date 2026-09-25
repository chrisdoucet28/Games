import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Everything in this lesson hangs off one fork: is the noun singular/uncountable or plural? Two
// lanes carry both tenses at once (is/was vs are/were) since they follow the identical split, plus
// the lesson's own "any" rule for negatives/questions and its most telling common mistake — using
// "it is" where English actually requires "there is" to introduce something that exists.
export function ThereIsAreDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Singular or plural?
      </div>
      <svg viewBox="0 0 460 210" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="15" y="12" width="200" height="34" rx="8" fill={fill} stroke={ink} strokeWidth="2" />
        <text x="115" y="34" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ink}>SINGULAR / UNCOUNTABLE</text>
        <text x="115" y="68" textAnchor="middle" fontSize="15" fontWeight="800" fill={accent}>there IS / WAS</text>
        <text x="115" y="86" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>There is a cat in the garden.</text>
        <text x="115" y="101" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>There was a queue outside.</text>

        <rect x="245" y="12" width="200" height="34" rx="8" fill={fill} stroke={ink} strokeWidth="2" />
        <text x="345" y="34" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ink}>PLURAL</text>
        <text x="345" y="68" textAnchor="middle" fontSize="15" fontWeight="800" fill={accent}>there ARE / WERE</text>
        <text x="345" y="86" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>There are many students here.</text>
        <text x="345" y="101" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>There were a lot of people.</text>

        <text x="230" y="128" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>negative / question → add ANY</text>
        <text x="230" y="144" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>There isn't any bread. · Are there any apples?</text>

        <text x="230" y="172" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ It is a nice park near the school.</text>
        <text x="230" y="190" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ There is a nice park near the school.</text>
        <text x="230" y="204" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>use "there is/are" to say something exists — not "it is"</text>
      </svg>
    </div>
  );
}
