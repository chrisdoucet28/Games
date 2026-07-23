import { useState } from "react";
import { LESSONS } from "../../data/lessons";
import { TOPIC_OPTIONS } from "../../data/topics";
import { hexToRgba, type Theme } from "../../data/themes";

type Props = {
  onBack: () => void;
  theme: Theme;
  // When set, only lessons for these topic ids are shown (used when launching Learn
  // from the game-select screen, scoped to the topics chosen for that game).
  filterTopicIds?: string[];
};

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1"];
const LEVEL_COLOR: Record<string, string> = {
  A1: "#22C55E", A2: "#84CC16", B1: "#F59E0B", B2: "#F97316", C1: "#EF4444",
};
const FOCUS_ORDER = ["grammar", "vocabulary", "topic"];
const FOCUS_LABEL: Record<string, string> = { grammar: "Grammar", vocabulary: "Vocabulary", topic: "Topics" };

// Hides interactive chrome and reveals the ink-economical bulk-print block when the
// browser's print dialog is triggered — see the "learn-print-only" block below.
const PRINT_CSS = `
  @media print {
    .learn-no-print { display: none !important; }
    .learn-print-only { display: block !important; }
    .learn-print-bg { background: white !important; padding: 0 !important; }
  }
  .learn-print-only { display: none; }
`;

// Lesson content marks the key form in each line with **double asterisks** — render those as bold
// rather than asking every lesson to hand-roll its own <strong> markup.
function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

// Cross-reference LESSONS (the actual content) against TOPIC_OPTIONS (level/focus metadata) so
// adding a new lesson later is a one-line addition to lessons.ts — this list rebuilds itself.
const LESSON_TOPICS = Object.keys(LESSONS)
  .map(id => ({ id, lesson: LESSONS[id], meta: TOPIC_OPTIONS.find(o => o.value === id) }))
  .filter((t): t is { id: string; lesson: (typeof LESSONS)[string]; meta: NonNullable<typeof t.meta> } => Boolean(t.meta));

// Plain, ink-economical rendering of one lesson for the print handout — borders instead of
// colored fills, no theme colors, so it reads well on any printer (color or black & white).
function PrintableLesson({ t }: { t: (typeof LESSON_TOPICS)[number] }) {
  return (
    <div style={{ padding: "24px 4px 40px" }}>
      <span style={{ background: LEVEL_COLOR[t.meta.level ?? "A2"], color: "white", borderRadius: "999px", padding: "3px 12px", fontSize: "12px", fontWeight: "800" }}>{t.meta.level}</span>
      <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#111827", margin: "10px 0 8px" }}>{t.lesson.title}</h2>
      <p style={{ color: "#374151", fontSize: "14px", lineHeight: 1.6, margin: "0 0 18px" }}>{t.lesson.intro}</p>

      {t.lesson.sections.map((section, i) => (
        <div key={i} style={{ marginBottom: "16px" }}>
          <div style={{ fontWeight: "800", color: "#374151", fontSize: "13px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{section.heading}</div>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "#1F2937" }}>
            {section.body.map((line, j) => (
              <li key={j} style={{ marginBottom: "5px", lineHeight: 1.5, fontSize: "13px" }}>{renderBold(line)}</li>
            ))}
          </ul>
          {section.examples && section.examples.length > 0 && (
            <div style={{ border: "1px solid #D1D5DB", borderRadius: "6px", padding: "8px 12px", marginTop: "8px" }}>
              {section.examples.map((ex, j) => (
                <div key={j} style={{ fontSize: "12.5px", fontStyle: "italic", color: "#1F2937", lineHeight: 1.5, marginBottom: j < section.examples!.length - 1 ? "4px" : 0 }}>
                  {renderBold(ex)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {t.lesson.commonMistakes.length > 0 && (
        <div style={{ border: "1px solid #9CA3AF", borderRadius: "6px", padding: "10px 12px", marginTop: "8px" }}>
          <div style={{ fontWeight: "800", color: "#111827", fontSize: "12px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Common mistakes</div>
          {t.lesson.commonMistakes.map((m, i) => (
            <div key={i} style={{ fontSize: "12px", color: "#1F2937", marginBottom: i < t.lesson.commonMistakes.length - 1 ? "5px" : 0, lineHeight: 1.4 }}>{m}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LearnScreen({ onBack, theme, filterTopicIds }: Props) {
  const visibleTopics = filterTopicIds ? LESSON_TOPICS.filter(t => filterTopicIds.includes(t.id)) : LESSON_TOPICS;

  // If exactly one of the chosen topics has a lesson, jump straight to it — no need to
  // make the teacher pick from a list of one.
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    filterTopicIds && visibleTopics.length === 1 ? visibleTopics[0].id : null
  );
  const selected = selectedId ? visibleTopics.find(t => t.id === selectedId) ?? LESSON_TOPICS.find(t => t.id === selectedId) : null;

  if (selected) {
    return (
      <div className="learn-print-bg" style={{ minHeight: "100vh", background: "#F0F9FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
        <style>{PRINT_CSS}</style>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div className="learn-no-print" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={filterTopicIds && visibleTopics.length === 1 ? onBack : () => setSelectedId(null)}
              style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", fontFamily: theme.headingFont }}
            >
              {filterTopicIds && visibleTopics.length === 1 ? "← Back" : "← Back to Learn"}
            </button>
            <button
              onClick={() => window.print()}
              style={{ background: theme.accentSolid, border: "none", color: "white", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", fontFamily: theme.headingFont }}
            >
              🖨️ Print
            </button>
          </div>

          <div style={{ background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "16px", padding: "24px" }}>
            <span style={{ background: LEVEL_COLOR[selected.meta.level ?? "A2"], color: "white", borderRadius: "999px", padding: "3px 12px", fontSize: "12px", fontWeight: "800" }}>{selected.meta.level}</span>
            <h2 style={{ fontSize: "26px", fontWeight: "900", color: theme.heroBg[0], margin: "10px 0 8px", fontFamily: theme.headingFont }}>{selected.lesson.title}</h2>
            <p style={{ color: "#4B5563", fontSize: "15px", lineHeight: 1.6, margin: "0 0 20px" }}>{selected.lesson.intro}</p>

            {selected.lesson.sections.map((section, i) => (
              <div key={i} style={{ marginBottom: "18px" }}>
                <div style={{ fontWeight: "800", color: theme.accentSolid, fontSize: "14px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{section.heading}</div>
                <ul style={{ margin: 0, paddingLeft: "20px", color: "#374151" }}>
                  {section.body.map((line, j) => (
                    <li key={j} style={{ marginBottom: "6px", lineHeight: 1.55, fontSize: "14px" }}>{renderBold(line)}</li>
                  ))}
                </ul>

                {section.examples && section.examples.length > 0 && (
                  <div style={{ background: hexToRgba(theme.accentSolid, 0.06), borderLeft: `3px solid ${theme.accentSolid}`, borderRadius: "0 8px 8px 0", padding: "10px 14px", marginTop: "10px" }}>
                    {section.examples.map((ex, j) => (
                      <div key={j} style={{ fontSize: "13.5px", fontStyle: "italic", color: "#374151", lineHeight: 1.6, marginBottom: j < section.examples!.length - 1 ? "5px" : 0 }}>
                        {renderBold(ex)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {selected.lesson.commonMistakes.length > 0 && (
              <div style={{ background: "#FFF7ED", border: "2px solid #FDBA74", borderRadius: "12px", padding: "14px 16px", marginTop: "8px" }}>
                <div style={{ fontWeight: "800", color: "#9A3412", fontSize: "13px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Common mistakes</div>
                {selected.lesson.commonMistakes.map((m, i) => (
                  <div key={i} style={{ fontSize: "13px", color: "#7C2D12", marginBottom: i < selected.lesson.commonMistakes.length - 1 ? "6px" : 0, lineHeight: 1.5 }}>{m}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const byLevel = LEVEL_ORDER
    .map(level => ({ level, topics: visibleTopics.filter(t => t.meta.level === level) }))
    .filter(g => g.topics.length > 0);

  return (
    <div className="learn-print-bg" style={{ minHeight: "100vh", background: "#F0F9FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <style>{PRINT_CSS}</style>
      <div className={filterTopicIds ? "learn-no-print" : undefined} style={{ maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px", fontFamily: theme.headingFont }}>← Back</button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "900", color: theme.heroBg[0], margin: 0, fontFamily: theme.headingFont }}>
            {filterTopicIds ? "🎓 Learn: This Game's Topics" : "🎓 Learn"}
          </h2>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>
            {filterTopicIds ? "A quick refresher on the topics you picked for this game." : "Quick, no-fluff explanations — the same things the games actually test."}
          </p>
          {filterTopicIds && visibleTopics.length > 0 && (
            <button
              onClick={() => window.print()}
              style={{ background: theme.accentSolid, border: "none", color: "white", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", fontFamily: theme.headingFont, marginTop: "14px" }}
            >
              🖨️ Print handouts ({visibleTopics.length})
            </button>
          )}
        </div>

        {visibleTopics.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6B7280", padding: "40px 0" }}>No lessons yet — check back soon.</div>
        ) : (
          byLevel.map(group => (
            <div key={group.level} style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <span style={{ background: LEVEL_COLOR[group.level], color: "white", borderRadius: "999px", padding: "3px 12px", fontSize: "13px", fontWeight: "800" }}>{group.level}</span>
                <span style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: "700" }}>{group.topics.length} lesson{group.topics.length === 1 ? "" : "s"}</span>
              </div>
              {FOCUS_ORDER.filter(focus => group.topics.some(t => (t.meta.focus ?? "grammar") === focus)).map(focus => (
                <div key={focus} style={{ marginBottom: "16px" }}>
                  <div style={{ color: "#6B7280", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>{FOCUS_LABEL[focus]}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "10px" }}>
                    {group.topics.filter(t => (t.meta.focus ?? "grammar") === focus).map(t => (
                      <button
                        key={t.id} onClick={() => setSelectedId(t.id)}
                        style={{ textAlign: "left", background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "12px", padding: "14px 16px", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        <div style={{ fontWeight: "800", color: theme.heroBg[0], fontSize: "14px", fontFamily: theme.headingFont }}>{t.lesson.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {filterTopicIds && visibleTopics.length > 0 && (
        <div className="learn-print-only" style={{ maxWidth: "720px", margin: "0 auto" }}>
          {visibleTopics.map((t, i) => (
            <div key={t.id} style={{ pageBreakBefore: i === 0 ? undefined : "always" }}>
              <PrintableLesson t={t} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
