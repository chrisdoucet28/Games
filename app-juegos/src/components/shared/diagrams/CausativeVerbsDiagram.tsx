import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Two organizing ideas the previous version missed: make/have/get/let form a genuine intensity
// scale from "forced" to "their choice" (the actual mental model that makes the four easy to tell
// apart), and the lesson draws a hard line between ACTIVE causative (a named person performs the
// action) and PASSIVE causative — have/get + object + past participle, the "I had my hair cut"
// pattern, where you arrange a service and don't name who did it. The "no that after make/let"
// trap the previous version led with is still real, so it stays in the footer.
export function CausativeVerbsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";
  const gradId = "causativeScale";

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
        From forced to their choice — and active vs passive
      </div>
      <svg viewBox="0 0 460 265" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="1" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.15" />
          </linearGradient>
        </defs>

        <rect x="8" y="12" width="108" height="66" rx="7" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="62" y="27" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>MAKE</text>
        <text x="62" y="39" textAnchor="middle" fontSize="7" fontStyle="italic" fill={caption}>+ object + verb</text>
        <text x="62" y="52" textAnchor="middle" fontSize="7" fontStyle="italic" fill={ink}>made us sit</text>
        <text x="62" y="65" textAnchor="middle" fontSize="7" fontWeight="700" fill={ink}>forced — no choice</text>

        <rect x="120" y="12" width="108" height="66" rx="7" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="174" y="27" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>HAVE</text>
        <text x="174" y="39" textAnchor="middle" fontSize="7" fontStyle="italic" fill={caption}>+ object + verb</text>
        <text x="174" y="52" textAnchor="middle" fontSize="7" fontStyle="italic" fill={ink}>have him check it</text>
        <text x="174" y="65" textAnchor="middle" fontSize="7" fontWeight="700" fill={ink}>arranged — expected</text>

        <rect x="232" y="12" width="108" height="66" rx="7" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="286" y="27" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>GET</text>
        <text x="286" y="39" textAnchor="middle" fontSize="7" fontStyle="italic" fill={caption}>+ object + TO verb</text>
        <text x="286" y="52" textAnchor="middle" fontSize="7" fontStyle="italic" fill={ink}>got him to help</text>
        <text x="286" y="65" textAnchor="middle" fontSize="7" fontWeight="700" fill={ink}>persuaded — convince</text>

        <rect x="344" y="12" width="108" height="66" rx="7" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="398" y="27" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>LET</text>
        <text x="398" y="39" textAnchor="middle" fontSize="7" fontStyle="italic" fill={caption}>+ object + verb</text>
        <text x="398" y="52" textAnchor="middle" fontSize="7" fontStyle="italic" fill={ink}>lets us leave early</text>
        <text x="398" y="65" textAnchor="middle" fontSize="7" fontWeight="700" fill={ink}>permitted — their choice</text>

        <rect x="8" y="88" width="444" height="9" rx="4.5" fill={`url(#${gradId})`} />
        <text x="8" y="110" fontSize="8.5" fontStyle="italic" fill={caption}>strongest command</text>
        <text x="452" y="110" textAnchor="end" fontSize="8.5" fontStyle="italic" fill={caption}>most freedom</text>

        <rect x="20" y="124" width="420" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="142" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>PASSIVE CAUSATIVE — HAVE/GET + OBJECT + PAST PARTICIPLE</text>
        <text x="230" y="157" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>I had my hair cut. · I got my car fixed.</text>
        <text x="230" y="171" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>you don't name who did it — the OBJECT receives the action, not a person</text>

        <text x="230" y="192" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>active: a named person does the action · passive: a service happens to your object</text>

        <line x1="20" y1="202" x2="440" y2="202" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="222" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ made us THAT we had to finish. · didn't let THAT I went.</text>
        <text x="230" y="238" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ made us finish. · didn't let me go. (never "that" after make/let)</text>

        <text x="230" y="256" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ got the plumber fix the leak. · have my shoes repair. (needs to / repaired)</text>
      </svg>
    </div>
  );
}
