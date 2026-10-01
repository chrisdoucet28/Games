import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The core mechanism — a fronted negative/limiting word forces the auxiliary in front of the
// subject — is shown as a before/after transformation, the same "show it" approach used for So do
// I / Neither do I. The hardly...when vs no sooner...than pairing is its own frequently confused
// trap, so it gets a dedicated callout rather than being buried in a bullet list.
export function InversionDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        A fronted negative flips auxiliary and subject
      </div>
      <svg viewBox="0 0 460 200" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="117" y="28" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>"I have never seen such a view."</text>
        <text x="117" y="44" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>normal order</text>

        <text x="230" y="36" textAnchor="middle" fontSize="16" fill={accent}>→</text>

        <rect x="270" y="14" width="180" height="42" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="360" y="34" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>Never have I seen...</text>
        <text x="360" y="48" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={caption}>NEVER + auxiliary + subject</text>

        <text x="230" y="76" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={ink}>same fronting trick: rarely, hardly, seldom, not only, at no point</text>
        <text x="230" y="90" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>match the auxiliary to the tense: have/has, did, do/does</text>

        <rect x="30" y="100" width="400" height="34" rx="8" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="230" y="114" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={ink}>HARDLY HAD...WHEN · NO SOONER HAD...THAN — don't mix them</text>
        <text x="230" y="128" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>Hardly had I sat down when the alarm went off.</text>

        <line x1="20" y1="144" x2="440" y2="144" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="164" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Never I have seen such a view. · Hardly had we arrived than...</text>
        <text x="230" y="180" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Never have I seen such a view. · ...arrived when the storm began.</text>

        <text x="230" y="196" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Little did he knew about the dangers. (base verb after "did")</text>
      </svg>
    </div>
  );
}
