import { useState } from "react";
import { getClassCoverage } from "../../lib/classMembership";
import { LESSON_TOPICS, LEVEL_ORDER, LEVEL_COLOR } from "../../data/learnTopics";
import { hexToRgba } from "../../data/themes";
import { Icon } from "./Icon";

// Shared by the teacher's ClassesScreen and the student's MyClassesSection -- a class's actual
// topic history, backed by the 20260930000000_class_topic_coverage migration (classes'
// selected_topics/level/focus columns only ever reflect whatever game is CURRENTLY in progress,
// cleared the moment it ends, so neither side had any persistent record of this before). Takes a
// plain accentColor rather than a Theme object since the student side deliberately doesn't use the
// per-teacher Theme system at all (see StudentHome's own comment on that).
type Props = {
  classId: string;
  accentColor: string;
  // Only passed on the student side -- lets each covered topic show whether this student has
  // personally finished it too. Omitted entirely on the teacher side, which has no "done" concept.
  doneIds?: Set<string>;
};

const TOPIC_BY_ID = new Map(LESSON_TOPICS.map(t => [t.id, t]));

export function ClassCoverageSummary({ classId, accentColor, doneIds }: Props) {
  const [open, setOpen] = useState(false);
  const [topicIds, setTopicIds] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // false = the database doesn't have this feature yet (an old migration set) -- hide the whole
  // thing instead of showing a broken toggle, same posture as ClassStudentsPanel's `available`.
  const [available, setAvailable] = useState(true);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (!next || topicIds !== null) return;
    setError(null);
    try {
      const rows = await getClassCoverage(classId);
      setTopicIds(rows.map(r => r.topicId));
    } catch (err) {
      setAvailable(false);
      setError(err instanceof Error ? err.message : "Couldn't load what's been covered.");
    }
  };

  if (!available && !open) return null;

  // A topic id recorded here but since removed from the library (renamed, deleted) is dropped
  // rather than shown as a broken entry -- same defensive posture as getSelectedTopicEntries.
  const known = (topicIds ?? []).map(id => TOPIC_BY_ID.get(id)).filter((t): t is NonNullable<ReturnType<typeof TOPIC_BY_ID.get>> => Boolean(t));
  const byLevel = LEVEL_ORDER.map(lv => ({ level: lv, topics: known.filter(t => t.meta.level === lv) })).filter(g => g.topics.length > 0);
  const doneCount = doneIds ? known.filter(t => doneIds.has(t.id)).length : null;
  const border = hexToRgba(accentColor, 0.25);

  return (
    <div style={{ marginTop: "12px", borderTop: `1px solid ${hexToRgba(accentColor, 0.15)}`, paddingTop: "10px" }}>
      <button
        type="button" onClick={handleOpen} aria-expanded={open}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", color: accentColor, fontWeight: 800, fontSize: "13px", fontFamily: "inherit" }}
      >
        <Icon name="chart" size={14} /> Topics Covered
        {topicIds !== null && (
          <span style={{ color: "#6B7280", fontWeight: 700 }}>
            · {topicIds.length}{doneCount !== null ? ` (you've finished ${doneCount})` : ""}
          </span>
        )}
        <span style={{ color: "#9CA3AF", fontSize: "11px" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ marginTop: "10px" }}>
          {error && <div role="alert" style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: "8px", padding: "8px 10px", fontSize: "12.5px" }}>{error}</div>}
          {topicIds === null && !error ? (
            <div style={{ fontSize: "12.5px", color: "#9CA3AF" }}>Loading…</div>
          ) : known.length === 0 ? (
            <div style={{ fontSize: "12.5px", color: "#9CA3AF" }}>Nothing recorded yet — this fills in automatically as games finish.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {byLevel.map(g => (
                <div key={g.level}>
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{ background: LEVEL_COLOR[g.level], color: "white", borderRadius: "999px", padding: "1px 10px", fontSize: "11px", fontWeight: 800 }}>{g.level}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {g.topics.map(t => {
                      const done = doneIds?.has(t.id) ?? false;
                      return (
                        <span key={t.id} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: done ? "#F0FDF4" : "#F9FAFB", border: `1px solid ${done ? "#BBF7D0" : border}`, borderRadius: "8px", padding: "4px 10px", fontSize: "12px", fontWeight: 700, color: "#374151" }}>
                          {done && <Icon name="check" size={10} color="#16A34A" />} {t.lesson.title}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Student side only (doneIds is only ever passed there) -- pools every covered topic
                  into one Practice round via PracticeScreen's ?topics= preselect. Self-check only,
                  same instant-feedback style Practice already has; no score is reported anywhere,
                  same as every other Practice round. */}
              {doneIds && (
                <a
                  href={`/practice?topics=${known.map(t => t.id).join(",")}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", background: accentColor, color: "white", borderRadius: "10px", padding: "8px 14px", fontSize: "12.5px", fontWeight: 800, textDecoration: "none" }}
                >
                  <Icon name="target" size={13} color="white" /> Practice everything covered
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
