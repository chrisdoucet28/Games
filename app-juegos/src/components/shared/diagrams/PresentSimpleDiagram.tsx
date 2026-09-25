import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The one insight that actually drives every mistake this lesson lists: there is exactly ONE -s
// marker per sentence, and it lives on the verb for a positive statement but moves onto
// does/doesn't for a negative or question — it never appears in both places at once. Drawn as two
// columns split by subject group, each ending in the lesson's own before/after common-mistake pair
// so the "only one -s, ever" rule is shown concretely rather than just stated.
export function PresentSimpleDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const blockFill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
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
          <Icon name="target" size={14} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Only one -s, ever
      </div>
      <svg viewBox="0 0 460 210" style={{ width: "100%", height: "auto", display: "block" }}>
        {/* Left column: I / you / we / they */}
        <rect x="15" y="12" width="200" height="34" rx="8" fill={blockFill} stroke={ink} strokeWidth="2" />
        <text x="115" y="34" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>I / YOU / WE / THEY</text>

        <text x="115" y="68" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={accent}>base verb — no ending</text>
        <text x="115" y="83" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={caption}>I work</text>

        <text x="115" y="108" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={accent}>don't / do + base verb</text>
        <text x="115" y="123" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={caption}>I don't work · Do I work?</text>

        <text x="115" y="155" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ I doesn't understand.</text>
        <text x="115" y="172" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ I don't understand.</text>

        {/* Right column: he / she / it */}
        <rect x="245" y="12" width="200" height="34" rx="8" fill={blockFill} stroke={ink} strokeWidth="2" />
        <text x="345" y="34" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>HE / SHE / IT</text>

        <text x="345" y="68" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={accent}>verb + -s / -es</text>
        <text x="345" y="83" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={caption}>she works</text>

        <text x="345" y="108" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={accent}>doesn't / does + base verb</text>
        <text x="345" y="123" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={caption}>she doesn't work · Does she work?</text>

        <text x="345" y="155" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ she doesn't works</text>
        <text x="345" y="172" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ she doesn't work</text>

        <text x="230" y="198" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>the -s marker moves to does/doesn't — it never stays on the verb too</text>
      </svg>
    </div>
  );
}
