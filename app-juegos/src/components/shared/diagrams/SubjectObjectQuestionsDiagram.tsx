import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// All four common mistakes come down to one fork: does the question ask about the SUBJECT (no
// auxiliary needed — the question word already sits where the subject was) or the OBJECT (every
// tense needs do/does/did). That single fork is the whole diagram.
export function SubjectObjectQuestionsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="target" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Subject questions skip do/does/did
      </div>
      <svg viewBox="0 0 460 190" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="32" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>SUBJECT QUESTION</text>
        <text x="117" y="48" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>no auxiliary — same word order</text>
        <text x="117" y="65" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>Who broke the window?</text>
        <text x="117" y="80" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(question word = the subject)</text>

        <rect x="245" y="12" width="195" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="32" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>OBJECT QUESTION</text>
        <text x="342" y="48" textAnchor="middle" fontSize="9" fontWeight="700" fill={ink}>needs do/does/did + subject</text>
        <text x="342" y="65" textAnchor="middle" fontSize="9" fontStyle="italic" fill={caption}>What did you break?</text>
        <text x="342" y="80" textAnchor="middle" fontSize="8" fontStyle="italic" fill={caption}>(every tense needs the auxiliary)</text>

        <line x1="20" y1="104" x2="440" y2="104" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="124" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Who did break the window? · Who you called last night?</text>
        <text x="230" y="140" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Who broke the window? · Who did you call last night?</text>

        <text x="230" y="160" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ What happens does at the end?</text>
        <text x="230" y="176" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ What happens at the end?</text>
      </svg>
    </div>
  );
}
