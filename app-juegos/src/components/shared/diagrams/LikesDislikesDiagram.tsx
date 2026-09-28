import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// MOCK / exploratory — not registered. Revised after feedback: this topic is A1, and the first
// version used words like "odd one out" that are well above an A1 reader (that word wasn't part of
// the lesson's own content — it was ME explaining the lesson in words harder than the lesson
// itself). The rule for every diagram from here on: every word IN the diagram chrome (titles,
// labels, notes — not the target example sentences, which are the lesson's own content) must sit
// at or below that topic's own CEFR level. Here that also means: let the DASHED border show that
// "enjoy" is different, instead of a sentence explaining it.
export function LikesDislikesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Love, like, hate — and one different verb
      </div>
      <svg viewBox="0 0 460 250" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="12" width="140" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="32" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>LOVE</text>
        <text x="80" y="48" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>+ -ing or to</text>
        <text x="80" y="64" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>love playing</text>
        <text x="80" y="78" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>love to play</text>

        <rect x="160" y="12" width="140" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="32" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>LIKE</text>
        <text x="230" y="48" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>+ -ing or to</text>
        <text x="230" y="64" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>like swimming</text>
        <text x="230" y="78" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>like to swim</text>

        <rect x="310" y="12" width="140" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="32" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>HATE</text>
        <text x="380" y="48" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>+ -ing or to</text>
        <text x="380" y="64" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>hate waiting</text>
        <text x="380" y="78" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>hate to wait</text>

        <rect x="130" y="102" width="200" height="60" rx="8" fill={fill} stroke={accent} strokeWidth="2" strokeDasharray="5 3" />
        <text x="230" y="124" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={accent}>ENJOY</text>
        <text x="230" y="140" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>+ -ing only</text>
        <text x="230" y="155" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>enjoy swimming</text>

        <text x="230" y="182" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>you can also say: not keen on · can't stand · prefer X to Y</text>

        <line x1="20" y1="194" x2="440" y2="194" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="214" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I like to swimming. · I enjoy to swim.</text>
        <text x="230" y="230" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I like swimming. · I enjoy swimming.</text>

        <text x="230" y="248" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I prefer tea than coffee. → ✓ I prefer tea to coffee.</text>
      </svg>
    </div>
  );
}
