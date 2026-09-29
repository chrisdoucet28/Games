import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Topic identity: this lesson's own central tension (punishment vs. rehabilitation) IS the topic's
// vocabulary in action — a tipped scale between the two carries it visually, deliberately different
// from the B2 crime_and_law topic's case-file folder so the two levels don't reuse the same device.
// Grammar (reported speech/inversion/third-conditional/mixed-conditional/concessive clauses) stays
// out of the main visual — the same skeleton shared across every C1 theme lesson.
export function CrimeAndJusticeDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
          <Icon name="gavel" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Punishment or Rehabilitation?
      </div>
      <svg viewBox="0 0 460 300" style={{ width: "100%", height: "auto", display: "block" }}>
        <line x1="140" y1="24" x2="320" y2="40" stroke={ink} strokeWidth="1.8" />
        <path d={`M 222 44 L 238 44 L 230 28 Z`} fill={ink} />
        <line x1="230" y1="44" x2="230" y2="94" stroke={ink} strokeWidth="1.6" />
        <line x1="212" y1="94" x2="248" y2="94" stroke={ink} strokeWidth="1.6" />

        <line x1="140" y1="24" x2="140" y2="44" stroke={caption} strokeWidth="1" />
        <rect x="102" y="44" width="76" height="30" rx="5" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="140" y="64" textAnchor="middle" fontSize="8" fontWeight="800" fill={ink}>PUNISHMENT</text>

        <line x1="320" y1="40" x2="320" y2="60" stroke={caption} strokeWidth="1" />
        <rect x="278" y="60" width="84" height="30" rx="5" fill={fill} stroke={accent} strokeWidth="1.5" />
        <text x="320" y="80" textAnchor="middle" fontSize="7.4" fontWeight="800" fill={ink}>REHABILITATION</text>

        <text x="230" y="118" textAnchor="middle" fontSize="9.3" fontStyle="italic" fill={ink}><tspan fontWeight="800">Rehabilitation</tspan> programs help offenders build a different future.</text>

        <text x="20" y="140" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>USEFUL WORDS</text>
        {["recidivism", "parole", "wrongful conviction", "due process", "plea bargain", "mitigating circumstances"].map((w, i) => {
          const pillColWidth = 420 / 3;
          const row = Math.floor(i / 3);
          const col = i % 3;
          const boxX = 20 + col * pillColWidth + (pillColWidth - 130) / 2;
          return (
            <g key={w}>
              <rect x={boxX} y={146 + row * 30} width="130" height="24" rx="12" fill={fill} stroke={accent} strokeWidth="1.3" />
              <text x={boxX + 65} y={162 + row * 30} textAnchor="middle" fontSize="6.6" fontWeight="700" fill={ink}>{w}</text>
            </g>
          );
        })}

        <line x1="20" y1="214" x2="440" y2="214" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="234" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={wrong}>✗ The lawyer claimed the system is failing young offenders.</text>
        <text x="230" y="250" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={right}>✓ The lawyer claimed the system was failing young offenders.</text>

        <text x="230" y="272" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={wrong}>✗ Despite he had a strong alibi, he was still convicted.</text>
        <text x="230" y="288" textAnchor="middle" fontSize="9.2" fontWeight="800" fill={right}>✓ Despite having a strong alibi, he was still convicted.</text>
      </svg>
    </div>
  );
}
