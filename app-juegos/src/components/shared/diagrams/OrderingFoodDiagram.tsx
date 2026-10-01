import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

function MealIcon({ stage, cx, cy, ink }: { stage: string; cx: number; cy: number; ink: string }) {
  switch (stage) {
    case "starter":
      return (
        <g>
          <circle cx={cx} cy={cy} r="13" fill="none" stroke={ink} strokeWidth="1.4" />
          <circle cx={cx - 4} cy={cy - 2} r="1.6" fill={ink} />
          <circle cx={cx + 3} cy={cy + 3} r="1.6" fill={ink} />
          <circle cx={cx + 1} cy={cy - 4} r="1.6" fill={ink} />
        </g>
      );
    case "main":
      return (
        <g>
          <circle cx={cx} cy={cy} r="13" fill="none" stroke={ink} strokeWidth="1.4" />
          <circle cx={cx} cy={cy} r="6" fill="none" stroke={ink} strokeWidth="1.1" />
          <line x1={cx - 20} y1={cy - 9} x2={cx - 20} y2={cy + 9} stroke={ink} strokeWidth="1.3" />
          <line x1={cx - 22} y1={cy - 9} x2={cx - 22} y2={cy - 3} stroke={ink} strokeWidth="1.1" />
          <line x1={cx - 18} y1={cy - 9} x2={cx - 18} y2={cy - 3} stroke={ink} strokeWidth="1.1" />
          <line x1={cx + 20} y1={cy - 9} x2={cx + 20} y2={cy + 9} stroke={ink} strokeWidth="1.3" />
        </g>
      );
    case "dessert":
      return (
        <g>
          <path d={`M ${cx - 10} ${cy} Q ${cx - 10} ${cy + 12} ${cx} ${cy + 12} Q ${cx + 10} ${cy + 12} ${cx + 10} ${cy} Z`} fill="none" stroke={ink} strokeWidth="1.4" />
          <circle cx={cx} cy={cy - 5} r="9" fill="none" stroke={ink} strokeWidth="1.4" />
        </g>
      );
    default:
      return null;
  }
}

// Restaurant English is a fixed phrase bank (the lesson's own intro says so), so this leads with
// the two phrase groups the lesson actually teaches (polite requests, dietary/customising phrases)
// plus the meal's own sequence — starter, main, dessert — drawn as three plate icons, rather than
// a mistake-first layout. All chrome text kept to plain A2 words.
export function OrderingFoodDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        At the restaurant
      </div>
      <svg viewBox="0 0 460 280" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="20" y="16" width="195" height="86" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="34" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>ASKING FOR FOOD</text>
        <text x="117" y="50" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>Could I have the pasta?</text>
        <text x="117" y="64" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>I'd like the soup.</text>
        <text x="117" y="78" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>Can I get some water?</text>
        <text x="117" y="94" textAnchor="middle" fontSize="6.8" fill={caption}>base verb after could/can</text>

        <rect x="245" y="16" width="195" height="86" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="34" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>DIETARY &amp; EXTRAS</text>
        <text x="342" y="50" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>Is this vegetarian?</text>
        <text x="342" y="64" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>Could I swap chips for salad?</text>
        <text x="342" y="78" textAnchor="middle" fontSize="7.6" fontStyle="italic" fill={ink}>Without onions, please.</text>

        <defs>
          <marker id="ofArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={caption} />
          </marker>
        </defs>
        <line x1="20" y1="122" x2="436" y2="122" stroke={caption} strokeWidth="1.5" markerEnd="url(#ofArrow)" />

        <rect x="10" y="132" width="140" height="60" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <MealIcon stage="starter" cx={80} cy={158} ink={ink} />
        <text x="80" y="184" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>starter</text>

        <rect x="160" y="132" width="140" height="60" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <MealIcon stage="main" cx={230} cy={158} ink={ink} />
        <text x="230" y="184" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>main course</text>

        <rect x="310" y="132" width="140" height="60" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <MealIcon stage="dessert" cx={380} cy={158} ink={ink} />
        <text x="380" y="184" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ink}>dessert</text>

        <line x1="20" y1="204" x2="440" y2="204" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="224" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Could I have a water? · Does this soup contains nuts?</text>
        <text x="230" y="240" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Could I have a glass of water? · Does this soup contain nuts?</text>

        <text x="230" y="258" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ Is there some vegetarian options?</text>
        <text x="230" y="274" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ Are there any vegetarian options?</text>
      </svg>
    </div>
  );
}
