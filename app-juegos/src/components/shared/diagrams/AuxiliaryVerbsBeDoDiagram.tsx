import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// The lesson states its own test plainly: "look at what comes after the subject." Drawn as a
// literal fork on that one question — an adjective/job/place goes one way, an action verb goes
// the other — rather than a timeline or box scene, since the actual skill here is choosing
// correctly, not recognizing a position or sequence.
export function AuxiliaryVerbsBeDoDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="idea" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        What comes after the subject?
      </div>
      <svg viewBox="0 0 460 200" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="140" y="10" width="180" height="36" rx="8" fill={fill} stroke={ink} strokeWidth="2" />
        <text x="230" y="33" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>the main verb is…</text>

        <line x1="180" y1="46" x2="110" y2="72" stroke={caption} strokeWidth="1.5" markerEnd="url(#auxArrow)" />
        <line x1="280" y1="46" x2="350" y2="72" stroke={caption} strokeWidth="1.5" markerEnd="url(#auxArrow)" />
        <defs>
          <marker id="auxArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={caption} />
          </marker>
        </defs>

        <rect x="15" y="75" width="190" height="50" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="110" y="96" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>adjective / job / place</text>
        <text x="110" y="114" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>happy · a teacher · at home</text>

        <text x="110" y="146" textAnchor="middle" fontSize="14" fontWeight="800" fill={accent}>use BE</text>
        <text x="110" y="163" textAnchor="middle" fontSize="10" fontStyle="italic" fill={ink}>Are you happy? · She isn't hungry.</text>

        <rect x="255" y="75" width="190" height="50" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="350" y="96" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>action verb</text>
        <text x="350" y="114" textAnchor="middle" fontSize="10" fontStyle="italic" fill={caption}>like · work · play · study</text>

        <text x="350" y="146" textAnchor="middle" fontSize="14" fontWeight="800" fill={accent}>use DO / DOES</text>
        <text x="350" y="163" textAnchor="middle" fontSize="10" fontStyle="italic" fill={ink}>Do you like pizza? · He doesn't eat meat.</text>

        <text x="230" y="185" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ She is has a car. · He don't is tired.</text>
        <text x="230" y="198" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={right}>never combine BE and DO/DOES in the same sentence</text>
      </svg>
    </div>
  );
}
