import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

const COLOURS: { name: string; hex: string; border?: boolean }[] = [
  { name: "red", hex: "#DC2626" },
  { name: "blue", hex: "#2563EB" },
  { name: "green", hex: "#16A34A" },
  { name: "yellow", hex: "#FACC15" },
  { name: "orange", hex: "#F97316" },
  { name: "purple", hex: "#9333EA" },
  { name: "pink", hex: "#EC4899" },
  { name: "black", hex: "#111827" },
  { name: "white", hex: "#FFFFFF", border: true },
  { name: "brown", hex: "#92400E" },
  { name: "grey", hex: "#9CA3AF" },
];

const NUMBERS: { n: number; word: string }[] = [
  { n: 0, word: "zero" },
  { n: 1, word: "one" },
  { n: 2, word: "two" },
  { n: 3, word: "three" },
  { n: 4, word: "four" },
  { n: 5, word: "five" },
  { n: 6, word: "six" },
  { n: 7, word: "seven" },
  { n: 8, word: "eight" },
  { n: 9, word: "nine" },
  { n: 10, word: "ten" },
];

const GRID_X = 20;
const GRID_WIDTH = 420;
const COL_WIDTH = GRID_WIDTH / 11;
const BOX_SIZE = 30;

function colX(i: number) {
  return GRID_X + i * COL_WIDTH + (COL_WIDTH - BOX_SIZE) / 2;
}

// User feedback: nowhere in the app does a colour word actually get shown next to its real
// colour, and numbers 0-10 deserve the same direct digit-to-word pairing — so this diagram leads
// with two literal reference grids (real colour swatches, real digits) rather than the grammar
// rule. The colour swatches use their true hex values on both screen and print, since the actual
// colours are the content being taught here, not decorative chrome. The colour-order/number-
// plural grammar rule keeps its own smaller fork below, still grounded in the lesson's own
// commonMistakes. All chrome text kept to plain A1 words.
export function NumbersAndColoursDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Colours and Numbers
      </div>
      <svg viewBox="0 0 460 306" style={{ width: "100%", height: "auto", display: "block" }}>
        <text x="20" y="10" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>COLOURS</text>
        {COLOURS.map((c, i) => {
          const x = colX(i);
          return (
            <g key={c.name}>
              <rect
                x={x} y="16" width={BOX_SIZE} height={BOX_SIZE} rx="5"
                fill={c.hex}
                stroke={c.border ? "#9CA3AF" : "#1F2937"}
                strokeWidth={c.border ? "1.5" : "1"}
              />
              <text x={x + BOX_SIZE / 2} y="55" textAnchor="middle" fontSize="7.3" fill={ink}>{c.name}</text>
            </g>
          );
        })}

        <text x="20" y="72" fontSize="8" fontWeight="800" letterSpacing="0.04em" fill={caption}>NUMBERS</text>
        {NUMBERS.map((num, i) => {
          const x = colX(i);
          return (
            <g key={num.n}>
              <rect x={x} y="78" width={BOX_SIZE} height={BOX_SIZE} rx="5" fill={fill} stroke={accent} strokeWidth="1.5" />
              <text x={x + BOX_SIZE / 2} y="98" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>{num.n}</text>
              <text x={x + BOX_SIZE / 2} y="118" textAnchor="middle" fontSize="7.3" fill={ink}>{num.word}</text>
            </g>
          );
        })}

        <text x="230" y="136" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={caption}>watch the spelling: forty has no "u" (not "fourty")</text>

        <line x1="20" y1="148" x2="440" y2="148" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <rect x="20" y="158" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="117" y="176" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>COLOUR + NOUN</text>
        <text x="117" y="189" textAnchor="middle" fontSize="7.8" fill={caption}>never takes -s</text>
        <text x="117" y="202" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>a black bag</text>

        <rect x="245" y="158" width="195" height="52" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="342" y="176" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={accent}>NUMBER + NOUN + S</text>
        <text x="342" y="189" textAnchor="middle" fontSize="7.8" fill={caption}>2 or more? add -s</text>
        <text x="342" y="202" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>two red bags</text>

        <line x1="20" y1="222" x2="440" y2="222" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="242" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ a bag black · The sky is blues.</text>
        <text x="230" y="258" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ a black bag · The sky is blue.</text>

        <text x="230" y="276" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I have two brother. · How many student are there?</text>
        <text x="230" y="292" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I have two brothers. · How many students are there?</text>
      </svg>
    </div>
  );
}
