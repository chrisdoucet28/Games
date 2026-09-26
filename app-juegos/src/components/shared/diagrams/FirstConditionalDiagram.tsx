import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson names its own #1 rule in plain words: "the if-clause NEVER uses will." So the
// diagram is built entirely around that one asymmetry — a forbidden mark sits directly on the
// if-clause where "will" would go, while the same word is correct and expected in the result
// clause right next to it. The "unless already means if not" double-negative trap is the other
// concrete mistake worth keeping, as a smaller footnote.
export function FirstConditionalDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="forbidden" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Rule #1: never "will" in the if-clause
      </div>
      <svg viewBox="0 0 460 205" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="15" y="20" width="195" height="60" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="112" y="42" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>IF + present simple</text>
        <text x="112" y="58" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>if it rains…</text>

        <circle cx="112" cy="10" r="13" fill="none" stroke={wrong} strokeWidth="2" />
        <text x="112" y="14" textAnchor="middle" fontSize="9" fontWeight="800" fill={wrong}>will</text>
        <line x1="103" y1="1" x2="121" y2="19" stroke={wrong} strokeWidth="2" />

        <line x1="215" y1="50" x2="245" y2="50" stroke={accent} strokeWidth="2" markerEnd="url(#fcArrow)" />
        <defs>
          <marker id="fcArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={accent} /></marker>
        </defs>

        <rect x="250" y="20" width="195" height="60" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="347" y="42" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>WILL + base verb</text>
        <text x="347" y="58" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>…we'll cancel the trip.</text>
        <text x="347" y="15" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={right}>✓ will belongs here</text>

        <text x="230" y="105" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill={caption}>can / might / should can also replace "will" in the result</text>

        <line x1="20" y1="120" x2="440" y2="120" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="142" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ If you will study, you'll pass.</text>
        <text x="230" y="160" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ If you study, you'll pass.</text>

        <text x="230" y="182" textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>"unless" already means "if not" — don't double it</text>
        <text x="230" y="198" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>✗ Unless you don't hurry… → ✓ Unless you hurry…</text>
      </svg>
    </div>
  );
}
