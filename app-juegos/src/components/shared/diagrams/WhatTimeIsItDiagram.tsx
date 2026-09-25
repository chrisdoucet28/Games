import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Two things this lesson calls out as the genuinely tricky parts: the hour number jumps FORWARD
// once you cross the half hour ("quarter to five" at 4:45, not "quarter to four"), and the
// past/to switch happens at exactly 30 minutes. A literal clock face at 4:45 shows the first;
// a split bar next to it shows the second as a rule, not just one instance of it.
export function WhatTimeIsItDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const pastFill = isScreen ? hexToRgba(accentColor, 0.14) : "white";
  const toFill = isScreen ? hexToRgba(accentColor, 0.28) : "white";

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
          <Icon name="clock" size={14} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        The hour jumps forward
      </div>
      <svg viewBox="0 0 460 250" style={{ width: "100%", height: "auto", display: "block" }}>
        {/* Clock face at 4:45 = "quarter to five" */}
        <circle cx="115" cy="115" r="88" fill="white" stroke={ink} strokeWidth="2.5" />
        <text x="115" y="40" textAnchor="middle" fontSize="12" fontWeight="700" fill={caption}>12</text>
        <text x="190" y="120" textAnchor="middle" fontSize="12" fontWeight="700" fill={caption}>3</text>
        <text x="115" y="197" textAnchor="middle" fontSize="12" fontWeight="700" fill={caption}>6</text>
        <text x="40" y="120" textAnchor="middle" fontSize="12" fontWeight="700" fill={caption}>9</text>

        {/* Highlighted "5" — the hour it's jumped forward to */}
        <circle cx="160" cy="203" r="11" fill="none" stroke={accent} strokeWidth="2" />
        <text x="160" y="207" textAnchor="middle" fontSize="12" fontWeight="800" fill={accent}>5</text>

        {/* Hour hand (pointing almost at 5) and minute hand (pointing at 9 = 45 min) */}
        <line x1="115" y1="115" x2="142" y2="151" stroke={ink} strokeWidth="4" strokeLinecap="round" />
        <line x1="115" y1="115" x2="45" y2="115" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <circle cx="115" cy="115" r="4" fill={ink} />

        <text x="115" y="224" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={ink}>quarter to FIVE</text>
        <text x="115" y="240" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>(4:45 — not "quarter to four")</text>

        {/* Past / To split bar */}
        <rect x="270" y="15" width="170" height="90" fill={pastFill} stroke={ink} strokeWidth="1.5" />
        <text x="355" y="45" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>PAST</text>
        <text x="355" y="65" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>minutes 1–29</text>
        <text x="355" y="82" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>ten past two</text>

        <rect x="270" y="105" width="170" height="90" fill={toFill} stroke={ink} strokeWidth="1.5" />
        <text x="355" y="135" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>TO (next hour)</text>
        <text x="355" y="155" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>minutes 31–59</text>
        <text x="355" y="172" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>ten to three</text>

        <line x1="270" y1="105" x2="440" y2="105" stroke={accent} strokeWidth="2.5" />
        <text x="355" y="118" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={accent}>30 = HALF PAST</text>
      </svg>
    </div>
  );
}
