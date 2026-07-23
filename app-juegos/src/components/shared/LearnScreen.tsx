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
const FOCUS_LABEL: Record<string, string> = { grammar: "Grammar", vocabulary: "Vocabulary", topic: "Topics" };

// Cross-reference LESSONS (the actual content) against TOPIC_OPTIONS (level/focus metadata) so
// adding a new lesson later is a one-line addition to lessons.ts — this list rebuilds itself.
const LESSON_TOPICS = Object.keys(LESSONS)
  .map(id => ({ id, lesson: LESSONS[id], meta: TOPIC_OPTIONS.find(o => o.value === id) }))
  .filter((t): t is { id: string; lesson: (typeof LESSONS)[string]; meta: NonNullable<typeof t.meta> } => Boolean(t.meta));

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
      <div style={{ minHeight: "100vh", background: "#F0F9FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <button
            onClick={filterTopicIds && visibleTopics.length === 1 ? onBack : () => setSelectedId(null)}
            style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px", fontFamily: theme.headingFont }}
          >
            {filterTopicIds && visibleTopics.length === 1 ? "← Back" : "← Back to Learn"}
          </button>

          <div style={{ background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "16px", padding: "24px" }}>
            <span style={{ background: LEVEL_COLOR[selected.meta.level ?? "A2"], color: "white", borderRadius: "999px", padding: "3px 12px", fontSize: "12px", fontWeight: "800" }}>{selected.meta.level}</span>
            <h2 style={{ fontSize: "26px", fontWeight: "900", color: theme.heroBg[0], margin: "10px 0 8px", fontFamily: theme.headingFont }}>{selected.lesson.title}</h2>
            <p style={{ color: "#4B5563", fontSize: "15px", lineHeight: 1.6, margin: "0 0 20px" }}>{selected.lesson.intro}</p>

            {selected.lesson.sections.map((section, i) => (
              <div key={i} style={{ marginBottom: "18px" }}>
                <div style={{ fontWeight: "800", color: theme.accentSolid, fontSize: "14px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{section.heading}</div>
                <ul style={{ margin: 0, paddingLeft: "20px", color: "#374151" }}>
                  {section.body.map((line, j) => (
                    <li key={j} style={{ marginBottom: "6px", lineHeight: 1.55, fontSize: "14px" }}>{line}</li>
                  ))}
                </ul>
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
    <div style={{ minHeight: "100vh", background: "#F0F9FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px", fontFamily: theme.headingFont }}>← Back</button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "900", color: theme.heroBg[0], margin: 0, fontFamily: theme.headingFont }}>
            {filterTopicIds ? "🎓 Learn: This Game's Topics" : "🎓 Learn"}
          </h2>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>
            {filterTopicIds ? "Grammar for the topics you picked for this game." : "Quick, no-fluff grammar explanations — the same rules the games actually test."}
          </p>
        </div>

        {visibleTopics.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6B7280", padding: "40px 0" }}>No lessons yet — check back soon.</div>
        ) : (
          byLevel.map(group => (
            <div key={group.level} style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ background: LEVEL_COLOR[group.level], color: "white", borderRadius: "999px", padding: "3px 12px", fontSize: "13px", fontWeight: "800" }}>{group.level}</span>
                <span style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: "700" }}>{group.topics.length} lesson{group.topics.length === 1 ? "" : "s"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "10px" }}>
                {group.topics.map(t => (
                  <button
                    key={t.id} onClick={() => setSelectedId(t.id)}
                    style={{ textAlign: "left", background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "12px", padding: "14px 16px", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    <div style={{ fontWeight: "800", color: theme.heroBg[0], fontSize: "14px", marginBottom: "4px", fontFamily: theme.headingFont }}>{t.lesson.title}</div>
                    <div style={{ color: "#9CA3AF", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.03em" }}>{FOCUS_LABEL[t.meta.focus ?? "grammar"]}</div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
