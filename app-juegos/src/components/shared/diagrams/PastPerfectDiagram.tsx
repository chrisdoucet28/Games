import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// This lesson's whole job is ordering two past events, so a timeline with the earlier event
// marked "had + participle" is the natural shape — matching the established timeline family used
// for present-perfect-vs-past-simple. "had never" word order and has/had confusion (both about
// getting the earlier-event marker wrong) anchor the footer.
export function PastPerfectDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
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
        The earlier of two past events
      </div>
      <svg viewBox="0 0 460 190" style={{ width: "100%", height: "auto", display: "block" }}>
        <line x1="30" y1="45" x2="430" y2="45" stroke={caption} strokeWidth="2" markerEnd="url(#arrow-pp)" />
        <defs>
          <marker id="arrow-pp" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={caption} />
          </marker>
        </defs>

        <circle cx="110" cy="45" r="6" fill={accent} />
        <text x="110" y="26" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>EARLIER</text>
        <text x="110" y="68" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>had + participle</text>
        <text x="110" y="84" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>she had already left</text>

        <circle cx="340" cy="45" r="6" fill={accent} />
        <text x="340" y="26" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>LATER</text>
        <text x="340" y="68" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>past simple</text>
        <text x="340" y="84" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>when I arrived</text>

        <text x="230" y="106" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>signal words: already, just, never, ever, before — often with "by the time"</text>

        <line x1="20" y1="118" x2="440" y2="118" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="138" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ By the time I got there, they finished. · she has lost her necklace.</text>
        <text x="230" y="154" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ ...they had finished. · she had lost her necklace.</text>

        <text x="230" y="174" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I never had seen the ocean. · They had ate dinner. (word order/eaten)</text>
      </svg>
    </div>
  );
}
