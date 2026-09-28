import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Direction language is about as visual as English content gets, so this leans on drawn scenes —
// arrow glyphs, a traffic light, a crossing, a roundabout, and a little "path + building" scene for
// on/in — instead of leaning on red/green mistake text, which matters even more for a teacher
// without the student's L1. Only two mistakes here (get to / far) resist a picture, so those alone
// stay as a single wrong/right footer line. All chrome text kept to plain A1 words.
export function GivingDirectionsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
  const isScreen = variant === "screen";
  const accent = isScreen ? accentColor : "#1F2937";
  const ink = "#1F2937";
  const caption = "#6B7280";
  const fill = isScreen ? hexToRgba(accentColor, 0.12) : "white";
  const wrong = isScreen ? "#DC2626" : "#1F2937";
  const right = isScreen ? "#16A34A" : "#1F2937";

  const arrows = [
    { glyph: "←", label: "turn left" },
    { glyph: "→", label: "turn right" },
    { glyph: "↑", label: "go straight ahead" },
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
          <Icon name="target" size={13} color="white" />
        </div>
      )}
      <div style={{ fontWeight: "800", fontSize: isScreen ? "11.5px" : "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: isScreen ? accentColor : "#374151", marginBottom: "6px" }}>
        Giving directions, drawn out
      </div>
      <svg viewBox="0 0 460 344" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <marker id="gdArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={accent} />
          </marker>
        </defs>

        {arrows.map((a, i) => {
          const x = 10 + i * 150;
          const cx = x + 70;
          return (
            <g key={a.label}>
              <rect x={x} y="16" width="140" height="70" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
              <text x={cx} y="56" textAnchor="middle" fontSize="28" fontWeight="800" fill={accent}>{a.glyph}</text>
              <text x={cx} y="78" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>{a.label}</text>
            </g>
          );
        })}

        <rect x="10" y="96" width="140" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <rect x="71" y="110" width="18" height="44" rx="6" fill="#374151" />
        <circle cx="80" cy="122" r="5.5" fill="#DC2626" />
        <circle cx="80" cy="132" r="5.5" fill="#FACC15" />
        <circle cx="80" cy="142" r="5.5" fill="#16A34A" />
        <text x="80" y="168" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>at the traffic lights</text>

        <rect x="160" y="96" width="140" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <rect x="200" y="112" width="60" height="36" fill={caption} opacity="0.35" />
        <rect x="200" y="116" width="60" height="5" fill="white" />
        <rect x="200" y="124" width="60" height="5" fill="white" />
        <rect x="200" y="132" width="60" height="5" fill="white" />
        <rect x="200" y="140" width="60" height="5" fill="white" />
        <text x="230" y="135" textAnchor="middle" fontSize="15" fontWeight="800" fill={accent}>↓</text>
        <text x="230" y="168" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>cross the road</text>

        <rect x="310" y="96" width="140" height="80" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <circle cx="380" cy="132" r="16" fill={fill} stroke={accent} strokeWidth="2" />
        <line x1="380" y1="116" x2="380" y2="105" stroke={caption} strokeWidth="2" />
        <line x1="364" y1="132" x2="353" y2="132" stroke={caption} strokeWidth="2" />
        <line x1="380" y1="148" x2="380" y2="159" stroke={caption} strokeWidth="2" />
        <line x1="396" y1="132" x2="412" y2="132" stroke={accent} strokeWidth="2.5" markerEnd="url(#gdArrow)" />
        <text x="405" y="124" textAnchor="middle" fontSize="9" fontWeight="800" fill={accent}>2nd</text>
        <text x="380" y="168" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>take the 2nd exit</text>

        <rect x="20" y="186" width="195" height="88" rx="8" fill={fill} stroke={right} strokeWidth="2" />
        <text x="117" y="204" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ ON your left</text>
        <line x1="117" y1="254" x2="117" y2="216" stroke={ink} strokeWidth="3" markerEnd="url(#gdArrow)" />
        <path d="M 85 236 L 85 214 L 97 206 L 109 214 L 109 236 Z" fill={fill} stroke={right} strokeWidth="2" />
        <rect x="98" y="224" width="8" height="12" fill={right} opacity="0.6" />
        <text x="117" y="266" textAnchor="middle" fontSize="7.8" fontStyle="italic" fill={ink}>The bank is on your left.</text>

        <rect x="245" y="186" width="195" height="88" rx="8" fill={fill} stroke={wrong} strokeWidth="2" />
        <text x="342" y="204" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ IN your left</text>
        <line x1="342" y1="254" x2="342" y2="216" stroke={ink} strokeWidth="3" markerEnd="url(#gdArrow)" />
        <path d="M 322 236 L 322 214 L 342 202 L 362 214 L 362 236 Z" fill={fill} stroke={wrong} strokeWidth="2" />
        <line x1="322" y1="204" x2="362" y2="236" stroke={wrong} strokeWidth="2.5" />
        <line x1="362" y1="204" x2="322" y2="236" stroke={wrong} strokeWidth="2.5" />
        <text x="342" y="266" textAnchor="middle" fontSize="7.8" fontStyle="italic" fill={wrong} textDecoration="line-through">The bank is in your left.</text>

        <line x1="20" y1="288" x2="440" y2="288" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="308" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ How do I go to the station? · Is it long from here?</text>
        <text x="230" y="324" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ How do I get to the station? · Is it far from here?</text>
      </svg>
    </div>
  );
}
