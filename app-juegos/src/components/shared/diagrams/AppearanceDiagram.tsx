import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const EYE_COLOR = "#2563EB";

// User feedback: the first version led with the be-vs-have grammar split. This one leads with what
// the lesson is actually named after — the question itself, and the physical vocabulary a student
// uses to answer it — with the figure drawn to show a real curly hairstyle and real blue eyes
// rather than just labelling "HAVE"/"BE". The have/be choice is still there (each label carries a
// small "(has)"/"(is)" tag), but it's secondary now, not the headline. Only the pure agreement
// mistake (missing third-person -s) still needs the wrong/right footer — the others are grounded
// by the correct phrasing already shown on the figure. All chrome text kept to plain A1 words.
export function AppearanceDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";

  const curlPositions = [-16, -8, 0, 8, 16];

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
          <Icon name="person" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        What does she look like?
      </div>
      <svg viewBox="0 0 460 296" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="16" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="36" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>What does she look like?</text>
        <text x="117" y="54" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>She's tall and has curly hair.</text>
        <text x="117" y="70" textAnchor="middle" fontSize="7.3" fill={caption}>one person: does</text>

        <rect x="245" y="16" width="195" height="76" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="36" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>What do they look like?</text>
        <text x="342" y="54" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>They have dark hair.</text>
        <text x="342" y="70" textAnchor="middle" fontSize="7.3" fill={caption}>2 or more: do</text>

        <line x1="48" y1="118" x2="48" y2="224" stroke={ink} strokeWidth="2" />
        <line x1="40" y1="118" x2="56" y2="118" stroke={ink} strokeWidth="2" />
        <line x1="40" y1="224" x2="56" y2="224" stroke={ink} strokeWidth="2" />

        {curlPositions.map((dx) => (
          <circle key={dx} cx={110 + dx} cy={122 - Math.abs(dx) * 0.15} r="7" fill={ink} />
        ))}
        <circle cx="110" cy="140" r="22" fill={fill} stroke={ink} strokeWidth="1.5" />
        <circle cx="102" cy="142" r="3" fill={EYE_COLOR} />
        <circle cx="118" cy="142" r="3" fill={EYE_COLOR} />
        <circle cx="102" cy="142" r="7" fill="none" stroke={ink} strokeWidth="1.3" />
        <circle cx="118" cy="142" r="7" fill="none" stroke={ink} strokeWidth="1.3" />
        <line x1="109" y1="142" x2="111" y2="142" stroke={ink} strokeWidth="1.3" />
        <line x1="95" y1="140" x2="88" y2="137" stroke={ink} strokeWidth="1.3" />
        <line x1="125" y1="140" x2="132" y2="137" stroke={ink} strokeWidth="1.3" />
        <path d="M 80 164 L 140 164 L 150 224 L 70 224 Z" fill={fill} stroke={accent} strokeWidth="2" />

        <line x1="128" y1="118" x2="222" y2="108" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />
        <text x="228" y="106" fontSize="9.5" fontWeight="800" fill={ink}>curly hair</text>
        <text x="228" y="117" fontSize="7.2" fill={caption}>(has) — also: short, dark, straight</text>

        <line x1="125" y1="142" x2="222" y2="140" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />
        <text x="228" y="138" fontSize="9.5" fontWeight="800" fill={ink}>blue eyes</text>
        <circle cx="284" cy="135" r="4" fill="#16A34A" />
        <circle cx="296" cy="135" r="4" fill="#92400E" />
        <text x="228" y="149" fontSize="7.2" fill={caption}>(has) — also: green, brown</text>

        <line x1="105" y1="135" x2="222" y2="172" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />
        <text x="228" y="176" fontSize="9.5" fontWeight="800" fill={ink}>wearing glasses</text>
        <text x="228" y="187" fontSize="7.2" fill={caption}>(is) — not "has wearing"</text>

        <line x1="145" y1="184" x2="222" y2="206" stroke={caption} strokeWidth="1" strokeDasharray="2 3" />
        <text x="228" y="210" fontSize="9.5" fontWeight="800" fill={ink}>tall and slim</text>
        <text x="228" y="221" fontSize="7.2" fill={caption}>(is) — height and build</text>

        <text x="228" y="238" fontSize="7.6" fontStyle="italic" fill={caption}>+ age (is): 30 years old · in her twenties</text>

        <line x1="20" y1="250" x2="440" y2="250" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="270" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ He have blue eyes. · She is have green eyes.</text>
        <text x="230" y="286" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ He has blue eyes. · She has green eyes.</text>
      </svg>
    </div>
  );
}
