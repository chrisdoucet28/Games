import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The am/is/are split is already covered by the To Be diagram, so this one spends its space on
// what's actually new here: the four -ing spelling rules, each drawn as its own tiny
// before-arrow-after transformation using the lesson's own example verb.
export function PresentContinuousA1Diagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";

  const cards = [
    { ruleLine1: "most verbs:", ruleLine2: "just add -ing", before: "watch", after: "watching" },
    { ruleLine1: "short vowel + consonant:", ruleLine2: "double it", before: "run", after: "running" },
    { ruleLine1: "ends in -e:", ruleLine2: "drop it, add -ing", before: "dance", after: "dancing" },
    { ruleLine1: "ends in -y:", ruleLine2: "keep it, add -ing", before: "cry", after: "crying" },
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
          <Icon name="pencil" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        am / is / are + verb-ing — spelling the -ing form
      </div>
      <svg viewBox="0 0 460 200" style={{ width: "100%", height: "auto", display: "block" }}>
        {cards.map((c, i) => {
          const x = 15 + i * 113;
          return (
            <g key={i}>
              <rect x={x} y="10" width="103" height="86" rx="8" fill={fill} stroke={ink} strokeWidth="1.5" />
              <text x={x + 51.5} y="38" textAnchor="middle" fontSize="13" fontWeight="700" fill={ink}>{c.before}</text>
              <text x={x + 51.5} y="52" textAnchor="middle" fontSize="11" fill={accent}>↓</text>
              <text x={x + 51.5} y="70" textAnchor="middle" fontSize="13" fontWeight="800" fill={accent}>{c.after}</text>
              <text x={x + 51.5} y="82" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>{c.ruleLine1}</text>
              <text x={x + 51.5} y="92" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>{c.ruleLine2}</text>
            </g>
          );
        })}
        <text x="230" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill={ink}>I am writing · She is reading · They are not watching</text>
        <text x="230" y="143" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>What are you doing?</text>
      </svg>
    </div>
  );
}
