import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// This lesson packs in five separate quantity words across two axes (countable/uncountable ×
// large/small/zero amount), so a single fork isn't specific enough — the diagram is a full
// lookup grid mirroring exactly how the lesson itself is organized, with "a few"/"a little"
// given their own row rather than being dropped. The much/many-vs-a-lot-of sentence-type split
// and the "a lot of" + "of" trap (three of four common mistakes) get the footer's full attention.
export function QuantifiersDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Amount and noun type both decide the word
      </div>
      <svg viewBox="0 0 460 280" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="173" y="16" textAnchor="middle" fontSize="10" fontWeight="800" fill={caption}>COUNTABLE</text>
        <text x="356" y="16" textAnchor="middle" fontSize="10" fontWeight="800" fill={caption}>UNCOUNTABLE</text>

        <text x="45" y="63" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>LARGE</text>
        <rect x="88" y="26" width="170" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="173" y="46" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>many</text>
        <text x="173" y="58" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(question / negative)</text>
        <text x="173" y="75" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>a lot of</text>
        <text x="173" y="87" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(affirmative)</text>

        <rect x="266" y="26" width="180" height="66" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="356" y="46" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>much</text>
        <text x="356" y="58" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(question / negative)</text>
        <text x="356" y="75" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>a lot of</text>
        <text x="356" y="87" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(affirmative)</text>

        <text x="45" y="130" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>SMALL</text>
        <rect x="88" y="100" width="170" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="173" y="124" textAnchor="middle" fontSize="13" fontWeight="800" fill={accent}>a few</text>
        <text x="173" y="140" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>a few things</text>

        <rect x="266" y="100" width="180" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="356" y="124" textAnchor="middle" fontSize="13" fontWeight="800" fill={accent}>a little</text>
        <text x="356" y="140" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>a little milk</text>

        <text x="45" y="184" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={ink}>ZERO</text>
        <rect x="88" y="160" width="358" height="40" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="267" y="178" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>no / not any</text>
        <text x="267" y="193" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>same for both types · "none" alone in short answers</text>

        <text x="230" y="218" textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>much/many: negatives &amp; questions. Affirmative: a lot of.</text>

        <line x1="20" y1="228" x2="440" y2="228" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="247" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She spends a lot time watching TV.</text>
        <text x="230" y="263" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ She spends a lot of time watching TV.</text>
        <text x="230" y="277" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>never double up: "I don't have no time" → "I don't have any time"</text>
      </svg>
    </div>
  );
}
