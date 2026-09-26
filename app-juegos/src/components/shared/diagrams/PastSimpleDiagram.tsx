import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The same underlying grammar as Present Simple's "only one -s, ever" (do-support), just in the
// past: the verb carries the past-tense marker in a positive statement, but the moment did/didn't
// shows up, the verb goes back to its base form — it never stays in its past form too. Two of the
// lesson's six common mistakes are exactly that doubling error, so it gets the same two-column
// treatment as Present Simple rather than a new shape. Irregular verbs get a small side note since
// they're the other thing that can't be looked up from a rule.
export function PastSimpleDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="clock" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Only one past-tense marker, ever
      </div>
      <svg viewBox="0 0 460 210" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="15" y="12" width="200" height="34" rx="8" fill={blockFill} stroke={ink} strokeWidth="2" />
        <text x="115" y="34" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ink}>POSITIVE</text>
        <text x="115" y="68" textAnchor="middle" fontSize="13.5" fontWeight="800" fill={accent}>verb + -ed (or irregular)</text>
        <text x="115" y="86" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>She walked. · She went. (go → went)</text>

        <rect x="245" y="12" width="200" height="34" rx="8" fill={blockFill} stroke={ink} strokeWidth="2" />
        <text x="345" y="34" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ink}>NEGATIVE / QUESTION</text>
        <text x="345" y="68" textAnchor="middle" fontSize="13.5" fontWeight="800" fill={accent}>did / didn't + base verb</text>
        <text x="345" y="86" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>She didn't walk. · Did she go?</text>

        <text x="115" y="115" textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>irregular? no rule — just learn it</text>
        <text x="115" y="130" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>go → went · eat → ate · see → saw</text>

        <text x="345" y="115" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ Did you called her?</text>
        <text x="345" y="133" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ Did you call her?</text>

        <line x1="20" y1="150" x2="440" y2="150" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="172" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ I didn't went. · What she cooked?</text>
        <text x="230" y="192" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ I didn't go. · What did she cook?</text>
        <text x="230" y="207" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>the base verb never carries -ed once did/didn't is there — and a question word never replaces "did"</text>
      </svg>
    </div>
  );
}
