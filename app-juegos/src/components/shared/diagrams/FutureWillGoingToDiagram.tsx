import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's own intro frames this as one question — "was this decided just now, or was it
// planned already?" — so the diagram is built directly on that timing test rather than listing
// both forms' uses side by side. A decision made AT this moment (or no real evidence, just an
// opinion) points to WILL; a decision made BEFORE now, or evidence visible right now, points to
// GOING TO — both flow from the same "when" question, which is what actually decides the choice.
export function FutureWillGoingToDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="crystalBall" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        When was it decided?
      </div>
      <svg viewBox="0 0 460 225" style={{ width: "100%", height: "auto", display: "block" }}>
        <line x1="230" y1="15" x2="230" y2="55" stroke={caption} strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="230" y="10" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={ink}>NOW</text>

        <line x1="225" y1="35" x2="80" y2="65" stroke={accent} strokeWidth="1.5" markerEnd="url(#fwArrow)" />
        <line x1="235" y1="35" x2="380" y2="65" stroke={accent} strokeWidth="1.5" markerEnd="url(#fwArrow)" />
        <defs>
          <marker id="fwArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={accent} /></marker>
        </defs>

        <rect x="10" y="68" width="150" height="50" rx="8" fill={fill} stroke={ink} strokeWidth="2" />
        <text x="85" y="88" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>decided right now</text>
        <text x="85" y="103" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>no evidence, just an opinion</text>

        <text x="85" y="140" textAnchor="middle" fontSize="15" fontWeight="800" fill={accent}>WILL</text>
        <text x="85" y="157" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>The phone's ringing — I'll get it!</text>

        <rect x="300" y="68" width="150" height="50" rx="8" fill={fill} stroke={ink} strokeWidth="2" />
        <text x="375" y="83" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>decided before now</text>
        <text x="375" y="98" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>or evidence you can see now</text>
        <text x="375" y="112" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>(already arranged)</text>

        <text x="375" y="140" textAnchor="middle" fontSize="15" fontWeight="800" fill={accent}>GOING TO</text>
        <text x="375" y="157" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>Those clouds — it's going to rain.</text>

        <line x1="20" y1="172" x2="440" y2="172" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="192" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I'm going to help you (deciding right now)</text>
        <text x="230" y="209" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I'll help you</text>
      </svg>
    </div>
  );
}
