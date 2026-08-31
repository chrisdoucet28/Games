import { Icon } from "../components/shared/Icon";

// Split out from learnTopics.ts specifically because these two helpers need JSX/<Icon> — see that
// file's comment for why the plain-data exports and these render helpers can't share a module.

// Lesson content marks the key form in each line with **double asterisks** — render those as bold
// rather than asking every lesson to hand-roll its own <strong> markup.
export function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

// Every commonMistakes entry across all 118 lessons is hand-written as plain text with a literal
// "❌ wrong → ✅ right" pattern baked in (25k+ lines of content, not worth a data migration to
// change) — this splits on those two characters at render time and swaps in icons, leaving the
// surrounding text (and the content file itself) untouched. `tone` picks colored icons for normal
// on-screen display vs. near-black ones for the ink-economical print handout.
export function renderMistake(text: string, tone: "screen" | "print" = "screen") {
  const wrongColor = tone === "print" ? "#111827" : "#DC2626";
  const rightColor = tone === "print" ? "#111827" : "#16A34A";
  const parts = text.split(/(❌|✅)/g);
  return parts.map((part, i) => {
    if (part === "❌") return <Icon key={i} name="close" size={12} color={wrongColor} style={{ margin: "0 2px" }} />;
    if (part === "✅") return <Icon key={i} name="check" size={12} color={rightColor} style={{ margin: "0 2px" }} />;
    return <span key={i}>{part}</span>;
  });
}
