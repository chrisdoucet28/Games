import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson's headline claim is that "can" never changes form and never takes "to" — so the
// diagram's whole job is showing what CAN'T attach to it, not what can. One fixed block, two
// crossed-out attachments (to, -s) that never show up regardless of subject, with "could" mirrored
// below as its past form under the identical rule.
export function CanCantDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";

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
          <Icon name="lock" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        "Can" never changes
      </div>
      <svg viewBox="0 0 460 205" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="60" y="50" textAnchor="middle" fontSize="11" fontStyle="italic" fill={caption}>I / he / she / we / they</text>
        <line x1="60" y1="58" x2="60" y2="74" stroke={caption} strokeWidth="1.5" markerEnd="url(#ccArrow)" />

        <rect x="20" y="76" width="90" height="36" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="65" y="99" textAnchor="middle" fontSize="14" fontWeight="800" fill={accent}>CAN</text>

        <line x1="110" y1="94" x2="150" y2="94" stroke={ink} strokeWidth="2" markerEnd="url(#ccArrow)" />
        <rect x="153" y="76" width="110" height="36" rx="8" fill={fill} stroke={ink} strokeWidth="2" />
        <text x="208" y="99" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>base verb</text>

        <text x="208" y="60" textAnchor="middle" fontSize="10" fontWeight="700" fill={wrong}>never "to", never -s</text>
        <circle cx="295" cy="94" r="13" fill="none" stroke={wrong} strokeWidth="1.5" />
        <text x="295" y="98" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={wrong}>to</text>
        <line x1="286" y1="85" x2="304" y2="103" stroke={wrong} strokeWidth="1.5" />

        <text x="385" y="99" textAnchor="middle" fontSize="11.5" fontStyle="italic" fill={caption}>speak, swim, drive…</text>

        <text x="65" y="130" textAnchor="middle" fontSize="10" fontWeight="700" fill={accent}>ability</text>
        <text x="65" y="145" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>I can speak two languages.</text>

        <text x="270" y="130" textAnchor="middle" fontSize="10" fontWeight="700" fill={accent}>permission</text>
        <text x="270" y="145" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={ink}>Can I open the window?</text>

        <line x1="20" y1="160" x2="440" y2="160" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />
        <text x="230" y="178" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>past: COULD / COULDN'T + base verb</text>
        <text x="230" y="193" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>I could climb trees when I was young.</text>

        <defs>
          <marker id="ccArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={caption} />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
