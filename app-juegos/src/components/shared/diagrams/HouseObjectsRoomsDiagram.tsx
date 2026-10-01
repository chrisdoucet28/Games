import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const ROOMS: { room: string; obj?: string }[] = [
  { room: "kitchen", obj: "fridge" },
  { room: "bedroom", obj: "wardrobe" },
  { room: "bathroom", obj: "mirror" },
  { room: "living room", obj: "sofa" },
  { room: "dining room", obj: "table" },
  { room: "garage", obj: "car" },
  { room: "hallway" },
  { room: "garden", obj: "plants" },
];

const ROOM_GRID_X = 20;
const ROOM_GRID_WIDTH = 420;
const ROOM_BOX_WIDTH = 46;
const ROOM_BOX_HEIGHT = 48;

function roomX(i: number) {
  const colWidth = ROOM_GRID_WIDTH / ROOMS.length;
  return ROOM_GRID_X + i * colWidth + (colWidth - ROOM_BOX_WIDTH) / 2;
}

// Room+object pairing reuses the reference-grid pattern from Numbers & Colours (the teacher's own
// feedback: a direct word-to-thing match, not a sentence explaining the match). The three
// prepositions get their own literal pictograms (a dot inside a box for "in", above/below a line
// for "on"/"under") rather than a sentence asserting the relationship — same "show, don't tell"
// principle, and doubly important here since "in/on/under" is exactly the kind of content a
// teacher without the student's L1 needs to show rather than say. All chrome text kept to plain
// A1 words; the target example phrases are the lesson's own content.
export function HouseObjectsRoomsDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Rooms, objects, and where things are
      </div>
      <svg viewBox="0 0 460 344" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="20" y="10" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>ROOMS</text>
        {ROOMS.map((r) => {
          const x = roomX(ROOMS.indexOf(r));
          return (
            <g key={r.room}>
              <rect x={x} y="16" width={ROOM_BOX_WIDTH} height={ROOM_BOX_HEIGHT} rx="6" fill={fill} stroke={accent} strokeWidth="1.5" />
              {r.obj ? (
                <>
                  <text x={x + ROOM_BOX_WIDTH / 2} y="34" textAnchor="middle" fontSize="6.6" fontWeight="800" fill={accent}>{r.room}</text>
                  <text x={x + ROOM_BOX_WIDTH / 2} y="52" textAnchor="middle" fontSize="6.6" fontStyle="italic" fill={ink}>{r.obj}</text>
                </>
              ) : (
                <text x={x + ROOM_BOX_WIDTH / 2} y="44" textAnchor="middle" fontSize="6.8" fontWeight="800" fill={accent}>{r.room}</text>
              )}
            </g>
          );
        })}

        <rect x="10" y="76" width="140" height="84" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="94" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>IN</text>
        <rect x="65" y="106" width="30" height="28" rx="3" fill="none" stroke={ink} strokeWidth="1.5" />
        <circle cx="80" cy="120" r="5" fill={accent} />
        <text x="80" y="150" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>a fridge in the kitchen</text>

        <rect x="160" y="76" width="140" height="84" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="94" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>ON</text>
        <line x1="205" y1="122" x2="255" y2="122" stroke={ink} strokeWidth="3" />
        <circle cx="230" cy="112" r="5" fill={accent} />
        <text x="230" y="150" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>a lamp on the table</text>

        <rect x="310" y="76" width="140" height="84" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="94" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>UNDER</text>
        <line x1="355" y1="116" x2="405" y2="116" stroke={ink} strokeWidth="3" />
        <circle cx="380" cy="130" r="5" fill={accent} />
        <text x="380" y="150" textAnchor="middle" fontSize="8" fontStyle="italic" fill={ink}>shoes under the bed</text>

        <line x1="20" y1="172" x2="440" y2="172" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <rect x="20" y="182" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="200" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>THERE IS</text>
        <text x="117" y="213" textAnchor="middle" fontSize="7.8" fill={caption}>one thing (singular)</text>
        <text x="117" y="226" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>There is a table in the dining room.</text>

        <rect x="245" y="182" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="200" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>THERE ARE</text>
        <text x="342" y="213" textAnchor="middle" fontSize="7.8" fill={caption}>2 or more things (plural)</text>
        <text x="342" y="226" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>There are two chairs in the kitchen.</text>

        <text x="230" y="248" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>"some" becomes "any" in negatives and questions</text>

        <line x1="20" y1="260" x2="440" y2="260" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="280" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ The fridge is on the kitchen. · The lamp is in the table.</text>
        <text x="230" y="296" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ The fridge is in the kitchen. · The lamp is on the table.</text>

        <text x="230" y="314" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ There are a table... · There aren't some books...</text>
        <text x="230" y="330" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ There is a table... · There aren't any books...</text>
      </svg>
    </div>
  );
}
