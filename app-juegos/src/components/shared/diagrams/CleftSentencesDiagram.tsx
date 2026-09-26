import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Two of four common mistakes are the exact same slip: dropping the linking "is/was" that the
// whole structure depends on ("It Maria who...", "What I need it a break"). That's the diagram's
// focus — showing "is/was" as the non-optional hinge between the two clauses — with singular
// agreement (even for a plural-sounding subject) as the second, related trap.
export function CleftSentencesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        IS/WAS is the hinge — never drop it
      </div>
      <svg viewBox="0 0 460 195" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="12" width="195" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>IT-CLEFT</text>
        <text x="117" y="46" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>It + WAS + [focus] + who/that</text>
        <text x="117" y="64" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>It was Maria who solved it.</text>
        <text x="117" y="77" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={wrong}>not "It Maria who..."</text>

        <rect x="245" y="12" width="195" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent}>WHAT-CLEFT</text>
        <text x="342" y="46" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>What + clause + IS/WAS + [focus]</text>
        <text x="342" y="64" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>What I need is a break.</text>
        <text x="342" y="77" textAnchor="middle" fontSize="7.5" fontStyle="italic" fill={wrong}>not "What I need it..."</text>

        <text x="230" y="102" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill={caption}>the what-clause is always singular — use is/was even for a plural focus</text>

        <line x1="20" y1="114" x2="440" y2="114" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="134" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ It Maria who solved the problem. · What I need it a break.</text>
        <text x="230" y="150" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ It was Maria who solved the problem. · What I need is a break.</text>

        <text x="230" y="170" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ It weren't until Monday that we found out.</text>
        <text x="230" y="186" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ It wasn't until Monday that we found out. ("it" is always singular)</text>
      </svg>
    </div>
  );
}
