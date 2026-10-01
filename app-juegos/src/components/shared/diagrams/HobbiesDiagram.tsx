import { hexToRgba } from "../../../data/themes";
import { Icon } from "../Icon";

// Three of the lesson's seven commonMistakes are the same play/do/go triple mix-up, so that
// three-way split is the whole diagram (mirroring the Likes & Dislikes three-box layout), each
// box grounded with its own "(not ...)" note pulled straight from that exact mistake. The
// remaining four mistakes (go+gerund, singular/plural hobby, "am interested") go in the footer.
// All chrome text kept to plain A1 words.
export function HobbiesDiagram({ variant, accentColor = "#2563EB" }: { variant: "screen" | "print"; accentColor?: string }) {
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
        Play, do, or go?
      </div>
      <svg viewBox="0 0 460 208" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="16" width="140" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="80" y="34" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>PLAY</text>
        <text x="80" y="48" textAnchor="middle" fontSize="7.5" fill={caption}>sports, games, instruments</text>
        <text x="80" y="64" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>She plays tennis.</text>
        <text x="80" y="78" textAnchor="middle" fontSize="7.3" fontStyle="italic" fill={caption}>(not "does tennis")</text>

        <rect x="160" y="16" width="140" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="230" y="34" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>DO</text>
        <text x="230" y="48" textAnchor="middle" fontSize="7.5" fill={caption}>exercise, martial arts</text>
        <text x="230" y="64" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>He does karate.</text>
        <text x="230" y="78" textAnchor="middle" fontSize="7.3" fontStyle="italic" fill={caption}>(not "plays karate")</text>

        <rect x="310" y="16" width="140" height="90" rx="8" fill={fill} stroke={accent} strokeWidth="2" />
        <text x="380" y="34" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={accent}>GO</text>
        <text x="380" y="48" textAnchor="middle" fontSize="7.5" fill={caption}>outdoor -ing activities</text>
        <text x="380" y="64" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill={ink}>They go swimming.</text>
        <text x="380" y="78" textAnchor="middle" fontSize="7.3" fontStyle="italic" fill={caption}>(not "do cycling")</text>

        <line x1="20" y1="118" x2="440" y2="118" stroke={caption} strokeWidth="1" strokeDasharray="2 4" />

        <text x="230" y="138" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I go to hike every weekend. · His hobby are collecting stamps.</text>
        <text x="230" y="154" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I go hiking every weekend. · His hobby is collecting stamps.</text>

        <text x="230" y="172" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={wrong}>✗ I interested in learning languages. · What is your hobbies?</text>
        <text x="230" y="188" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={right}>✓ I am interested in learning languages. · What are your hobbies?</text>
      </svg>
    </div>
  );
}
