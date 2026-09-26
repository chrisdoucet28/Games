import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// All four of this lesson's common mistakes are the exact same mechanical error in different
// clothes: adding "to", "-ing", or "-s" after one of these modals. The certainty scale
// (might/could/may → must → can't) is the lesson's own organizing idea and stays as the visual
// backbone, but the diagram's real weight goes on "always the bare verb", since that's the one
// thing every single mistake actually breaks.
export function ModalsPossibilityDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Always the bare verb — never to, -ing, or -s
      </div>
      <svg viewBox="0 0 460 185" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="12" width="140" height="58" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="30" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>CAN'T</text>
        <text x="80" y="44" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>impossible</text>
        <text x="80" y="58" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>can't be at home</text>

        <rect x="160" y="12" width="140" height="58" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="30" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>MIGHT · COULD · MAY</text>
        <text x="230" y="44" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>uncertain guess</text>
        <text x="230" y="58" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>might rain later</text>

        <rect x="310" y="12" width="140" height="58" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="30" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>MUST</text>
        <text x="380" y="44" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>confident deduction</text>
        <text x="380" y="58" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>must be tired</text>

        <text x="230" y="88" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>always + BARE VERB — never "to", never "-ing", never "-s"</text>

        <line x1="20" y1="100" x2="440" y2="100" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="120" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ It might to rain. · She musts be tired.</text>
        <text x="230" y="136" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ It might rain. · She must be tired.</text>

        <text x="230" y="154" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ He can't being at home. · It could to be true.</text>
        <text x="230" y="170" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ He can't be at home. · It could be true.</text>
      </svg>
    </div>
  );
}
