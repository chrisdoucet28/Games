import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: present perfect + since is this topic's own grammar throughline ("have been
// friends since primary school") — no other A2 theme topic leans on it. A single timeline from a
// past point to NOW is the real visual device; the bracket underneath shows the relationship
// staying true the whole way, not just starting in the past. All chrome text kept to plain A2 words.
export function FriendsAndFamilyDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="heart" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Friends Since When?
      </div>
      <svg viewBox="0 0 460 210" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="230" y="32" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={ink}>We have been friends since primary school.</text>

        <line x1="40" y1="60" x2="420" y2="60" stroke={accent} strokeWidth="2" markerEnd="url(#fafArrow)" />
        <circle cx="40" cy="60" r="4" fill={accent} />
        <defs>
          <marker id="fafArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={accent} />
          </marker>
        </defs>
        <text x="40" y="78" textAnchor="middle" fontSize="7.2" fontWeight="800" fill={caption}>PRIMARY SCHOOL</text>
        <text x="420" y="78" textAnchor="middle" fontSize="7.2" fontWeight="800" fill={caption}>NOW</text>

        <path d="M 40 90 L 40 96 L 420 96 L 420 90" fill="none" stroke={caption} strokeWidth="1.2" />
        <text x="230" y="112" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={caption}>started then — still true now</text>

        <line x1="20" y1="128" x2="440" y2="128" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="148" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I know my best friend since we were children.</text>
        <text x="230" y="164" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I have known my best friend since we were children.</text>

        <text x="230" y="184" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ My cousin is married with a doctor.</text>
        <text x="230" y="200" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ My cousin is married to a doctor.</text>
      </svg>
    </div>
  );
}
