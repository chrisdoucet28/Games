import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// All five common mistakes are the same mechanical error — adding "to", "-s", or a past-tense
// form after one of these modals — no matter which of the three families (permission, advice,
// ability) the modal belongs to. The three families stay as the visual backbone since that's the
// lesson's own structure, but the bare-infinitive rule gets the diagram's real weight.
export function ModalVerbsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Three jobs, one rule: always the bare verb
      </div>
      <svg viewBox="0 0 460 185" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="12" width="140" height="58" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>PERMISSION</text>
        <text x="80" y="44" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>can · could · may</text>
        <text x="80" y="58" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>Could I borrow...?</text>

        <rect x="160" y="12" width="140" height="58" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>ADVICE</text>
        <text x="230" y="44" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>should · ought to · had better</text>
        <text x="230" y="58" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>You should see a doctor.</text>

        <rect x="310" y="12" width="140" height="58" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="30" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>ABILITY</text>
        <text x="380" y="44" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>can · could · was able to</text>
        <text x="380" y="58" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>She can speak Spanish.</text>

        <text x="230" y="88" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>always + BARE VERB — never "to", never "-s", never past tense</text>

        <line x1="20" y1="100" x2="440" y2="100" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="120" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She can to speak. · He should works harder.</text>
        <text x="230" y="136" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She can speak. · He should work harder.</text>

        <text x="230" y="154" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She could speaked three languages. · had better to hurry</text>
        <text x="230" y="170" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She could speak three languages. · had better hurry</text>
      </svg>
    </div>
  );
}
