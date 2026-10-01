import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const AGREEMENT = [
  { subj: "I", verb: "am" },
  { subj: "she / he", verb: "feels" },
  { subj: "they / we", verb: "are" },
];

const PREPOSITIONS = [
  { word: "afraid", prep: "of" },
  { word: "interested", prep: "in" },
  { word: "angry", prep: "with" },
  { word: "surprised", prep: "at" },
  { word: "pleased", prep: "with" },
];

// Five of the lesson's nine commonMistakes are the same shape — the wrong fixed preposition after
// a feeling word — so that becomes its own reference grid, the preposition picked out in the
// accent colour since it's the one part that actually changes. The subject/verb agreement mistakes
// get their own small reference row above it. All chrome text kept to plain A1 words.
export function FeelingsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Feelings need their own fixed preposition
      </div>
      <svg viewBox="0 0 460 226" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="20" y="10" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>SUBJECT + VERB</text>
        {AGREEMENT.map((a, i) => {
          const x = 20 + i * 140;
          const cx = x + 60;
          return (
            <g key={a.subj}>
              <rect x={x} y="16" width="120" height="40" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <text x={cx} y="32" textAnchor="middle" fontSize="9" fontWeight="800" fill={ink}>{a.subj}</text>
              <text x={cx} y="47" textAnchor="middle" fontSize="9" fontStyle="italic" fill={accent}>{a.verb}</text>
            </g>
          );
        })}

        <text x="20" y="72" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>FEELING + PREPOSITION</text>
        {PREPOSITIONS.map((p, i) => {
          const x = 20 + i * 84;
          const cx = x + 37;
          return (
            <g key={p.word}>
              <rect x={x} y="78" width="74" height="48" rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              <text x={cx} y="98" textAnchor="middle" fontSize="8.3" fontWeight="800" fill={ink}>{p.word}</text>
              <text x={cx} y="116" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>{p.prep}</text>
            </g>
          );
        })}

        <line x1="20" y1="138" x2="440" y2="138" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="158" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I are happy. · She feel tired.</text>
        <text x="230" y="174" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I am happy. · She feels tired.</text>

        <text x="230" y="192" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I want drink water. · He is afraid from spiders.</text>
        <text x="230" y="208" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I want to drink water. · He is afraid of spiders.</text>
      </svg>
    </div>
  );
}
