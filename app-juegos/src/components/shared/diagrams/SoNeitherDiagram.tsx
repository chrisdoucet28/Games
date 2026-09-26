import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Two of five common mistakes are the same inversion error (subject before the auxiliary instead
// of after), so that flip is the diagram's whole focus, shown as a before/after transformation
// rather than just labeled boxes. Double negatives and auxiliary-matching stay in the footer.
export function SoNeitherDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Invert: the auxiliary jumps in front of the subject
      </div>
      <svg viewBox="0 0 460 195" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="117" y="28" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={caption}>"I love pizza."</text>
        <text x="117" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>subject + verb (normal order)</text>

        <text x="230" y="36" textAnchor="middle" fontSize="16" fill={accent}>→</text>

        <rect x="290" y="14" width="150" height="40" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="365" y="34" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>So do I.</text>
        <text x="365" y="48" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>aux before subject</text>

        <rect x="20" y="66" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="86" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>SO + aux + subject</text>
        <text x="117" y="102" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>agrees with a POSITIVE</text>
        <text x="117" y="115" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>"So have we." "So was he."</text>

        <rect x="245" y="66" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="86" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>NEITHER + aux + subject</text>
        <text x="342" y="102" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>agrees with a NEGATIVE</text>
        <text x="342" y="115" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>"Neither can I." "Neither does he."</text>

        <line x1="20" y1="128" x2="440" y2="128" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="148" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Neither I am. · So I do.</text>
        <text x="230" y="164" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Neither am I. · So do I.</text>

        <text x="230" y="184" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Neither do I don't. (double negative — drop the "don't")</text>
      </svg>
    </div>
  );
}
