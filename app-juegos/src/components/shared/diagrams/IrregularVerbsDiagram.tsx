import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Memorizing irregular forms isn't the actual trap — knowing WHICH column to use where is. Every
// one of the lesson's four common mistakes is the same error: using the middle (past simple)
// column after have/has instead of the third (past participle) column. So the diagram is built as
// a table with two arrows pointing at two different destinations, making that split the whole
// point rather than a footnote under a memorization list.
export function IrregularVerbsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";

  const rows = [
    ["go", "went", "gone"],
    ["see", "saw", "seen"],
    ["eat", "ate", "eaten"],
  ];

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
        Which column, where?
      </div>
      <svg viewBox="0 0 460 220" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="80" y="16" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={caption}>BASE</text>
        <text x="230" y="16" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>PAST SIMPLE</text>
        <text x="380" y="16" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>PAST PARTICIPLE</text>

        {rows.map((r, i) => (
          <g key={i}>
            <text x="80" y={38 + i * 20} textAnchor="middle" fontSize="12.5" fill={ink}>{r[0]}</text>
            <text x="230" y={38 + i * 20} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={ink}>{r[1]}</text>
            <text x="380" y={38 + i * 20} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={ink}>{r[2]}</text>
          </g>
        ))}

        <line x1="230" y1="105" x2="230" y2="130" stroke={accent} strokeWidth="2" markerEnd="url(#ivArrow)" />
        <line x1="380" y1="105" x2="380" y2="130" stroke={accent} strokeWidth="2" markerEnd="url(#ivArrow)" />
        <defs>
          <marker id="ivArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={accent} /></marker>
        </defs>

        <rect x="155" y="133" width="150" height="34" rx="7" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="230" y="147" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>PAST SIMPLE</text>
        <text x="230" y="161" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>Yesterday I went.</text>

        <rect x="305" y="133" width="150" height="34" rx="7" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="380" y="147" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>have / has / had</text>
        <text x="380" y="161" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>I have gone.</text>

        <text x="230" y="188" textAnchor="middle" fontSize="11" fontWeight="800" fill={wrong}>✗ I have went there. · He has ate already.</text>
        <text x="230" y="206" textAnchor="middle" fontSize="11" fontWeight="800" fill={right}>✓ I have been there. · He has eaten already.</text>
      </svg>
    </div>
  );
}
