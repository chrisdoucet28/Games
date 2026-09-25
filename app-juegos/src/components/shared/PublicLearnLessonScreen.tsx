import { useEffect, useState } from "react";
import { LESSON_TOPICS, FOCUS_LABEL, LEVEL_COLOR } from "../../data/learnTopics";
import { renderBold, renderMistake } from "../../data/learnTopicsRender";
import { setMetaDescription } from "../../lib/pageMeta";
import { useStudentSession } from "../../hooks/useStudentSession";
import { getLessonsDone, markLessonDone, unmarkLessonDone } from "../../lib/studentProgress";
import { Icon } from "./Icon";
import { TopicDiagram } from "./diagrams/GrammarDiagram";

type Props = { topicId: string };

// Public, no-login-required single-lesson page — reachable at /learn/<topicId>, one per topic id
// for Google to index individually. No print button and no FlagLessonButton here: both are
// authenticated-app affordances (print pulls the teacher's org logo via getProfile(); flagging
// inserts into a Supabase table whose anonymous-insert RLS behavior hasn't been verified, so it's
// deliberately omitted rather than assumed safe on a logged-out page).
export function PublicLearnLessonScreen({ topicId }: Props) {
  const topic = LESSON_TOPICS.find(t => t.id === topicId);

  useEffect(() => {
    if (topic) {
      const focusLabel = FOCUS_LABEL[topic.meta.focus ?? "grammar"];
      document.title = `${topic.lesson.title} — ${topic.meta.level} ${focusLabel} | ClassCade`;
      setMetaDescription(topic.lesson.intro);
    } else {
      document.title = "Lesson Not Found | ClassCade";
      setMetaDescription("This lesson could not be found. Browse the full ClassCade Learn library instead.");
    }
  }, [topic]);

  // Only a signed-in student ever sees anything extra — a logged-out visitor (and Google) get the
  // exact same page as always. `done` is null until the student's saved progress has loaded.
  const { isStudent } = useStudentSession();
  const [done, setDone] = useState<boolean | null>(null);
  const [progressError, setProgressError] = useState(false);
  useEffect(() => {
    if (!isStudent || !topic) return;
    getLessonsDone().then(m => setDone(m.has(topic.id))).catch(() => setDone(false));
  }, [isStudent, topic]);

  const toggleDone = async () => {
    if (!topic || done === null) return;
    const next = !done;
    setDone(next);
    setProgressError(false);
    try {
      if (next) await markLessonDone(topic.id);
      else await unmarkLessonDone(topic.id);
    } catch {
      setDone(!next);
      setProgressError(true);
    }
  };

  if (!topic) {
    return (
      <div style={{ minHeight: "100vh", background: "#F0F9FF", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
        <div style={{ background: "linear-gradient(160deg,#0C1E3D 0%,#0369A1 45%,#0EA5E9 100%)", padding: "40px 20px", textAlign: "center" }}>
          <Icon name="joystick" size={40} color="#FCD34D" style={{ marginBottom: "8px" }} />
          <h1 style={{ color: "white", fontSize: "22px", fontWeight: "900", margin: 0 }}>Lesson Not Found</h1>
        </div>
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "32px 20px 60px", textAlign: "center" }}>
          <p style={{ color: "#4B5563", fontSize: "15px", lineHeight: 1.6 }}>
            We couldn't find that lesson. Browse the full library instead.
          </p>
          <a href="/learn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "12px", color: "#0369A1", fontWeight: "700", textDecoration: "none" }}><Icon name="back" size={13} /> Back to Learn</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background: "linear-gradient(160deg,#0C1E3D 0%,#0369A1 45%,#0EA5E9 100%)", padding: "32px 20px", textAlign: "center" }}>
        <a href="/learn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#BAE6FD", fontSize: "12px", fontWeight: "700", textDecoration: "none" }}><Icon name="back" size={11} /> All Learn lessons</a>
        <Icon name="joystick" size={32} color="#FCD34D" style={{ margin: "10px 0 4px" }} />
        <div style={{ color: "#7DB8DB", fontSize: "13px", fontWeight: "700" }}>Class<span style={{ color: "#FCD34D" }}>Cade</span> Learn</div>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 20px 60px" }}>
        <div style={{ background: "white", border: "2px solid rgba(3,105,161,0.2)", borderRadius: "16px", padding: "24px" }}>
          <span style={{ background: LEVEL_COLOR[topic.meta.level ?? "A2"], color: "white", borderRadius: "999px", padding: "3px 12px", fontSize: "12px", fontWeight: "800" }}>{topic.meta.level}</span>
          <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0C1E3D", margin: "10px 0 8px" }}>{topic.lesson.title}</h1>
          <p style={{ color: "#4B5563", fontSize: "15px", lineHeight: 1.6, margin: "0 0 20px" }}>{topic.lesson.intro}</p>

          <TopicDiagram topicId={topic.id} variant="screen" accentColor="#0369A1" />

          {topic.lesson.sections.map((section, i) => (
            <div key={i} style={{ marginBottom: "18px" }}>
              <div style={{ fontWeight: "800", color: "#0369A1", fontSize: "14px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{section.heading}</div>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "#374151" }}>
                {section.body.map((line, j) => (
                  <li key={j} style={{ marginBottom: "6px", lineHeight: 1.55, fontSize: "14px" }}>{renderBold(line)}</li>
                ))}
              </ul>

              {section.examples && section.examples.length > 0 && (
                <div style={{ background: "rgba(3,105,161,0.06)", borderLeft: "3px solid #0369A1", borderRadius: "0 8px 8px 0", padding: "10px 14px", marginTop: "10px" }}>
                  {section.examples.map((ex, j) => (
                    <div key={j} style={{ fontSize: "13.5px", fontStyle: "italic", color: "#374151", lineHeight: 1.6, marginBottom: j < section.examples!.length - 1 ? "5px" : 0 }}>
                      {renderBold(ex)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {topic.lesson.commonMistakes.length > 0 && (
            <div style={{ background: "#FFF7ED", border: "2px solid #FDBA74", borderRadius: "12px", padding: "14px 16px", marginTop: "8px" }}>
              <div style={{ fontWeight: "800", color: "#9A3412", fontSize: "13px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Common mistakes</div>
              {topic.lesson.commonMistakes.map((m, i) => (
                <div key={i} style={{ fontSize: "13px", color: "#7C2D12", marginBottom: i < topic.lesson.commonMistakes.length - 1 ? "6px" : 0, lineHeight: 1.5 }}>{renderMistake(m)}</div>
              ))}
            </div>
          )}
        </div>

        {isStudent && (
          // Practice is the button now, Mark-finished a small link — swapped at the owner's request:
          // practicing a topic is the thing a student actually comes here to do next; marking a
          // lesson finished is bookkeeping, not the main action.
          <div style={{ textAlign: "center", background: "white", border: "2px solid rgba(3,105,161,0.2)", borderRadius: "16px", padding: "20px", marginTop: "20px" }}>
            <a
              href={`/practice?topic=${topic.id}`}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", minHeight: "48px", padding: "12px 26px",
                borderRadius: "12px", fontSize: "15px", fontWeight: "900", textDecoration: "none",
                background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", border: "2px solid #0C1E3D",
              }}
            >
              <Icon name="target" size={16} color="white" /> Practice this topic
            </a>
            <div style={{ marginTop: "12px" }}>
              <button
                onClick={toggleDone}
                disabled={done === null}
                style={{
                  background: "none", border: "none", padding: 0, fontFamily: "inherit",
                  color: done ? "#15803D" : "#0369A1", fontWeight: "800", fontSize: "13px", cursor: done === null ? "wait" : "pointer",
                  display: "inline-flex", alignItems: "center", gap: "5px",
                }}
              >
                {done ? <><Icon name="check" size={13} /> Lesson finished — tap to undo</> : "Mark lesson as finished"}
              </button>
              <span style={{ color: "#9CA3AF", margin: "0 10px" }}>·</span>
              <a href="/" style={{ color: "#0369A1", fontWeight: "800", fontSize: "13px", textDecoration: "none" }}>My progress</a>
              {progressError && <div role="alert" style={{ color: "#991B1B", fontSize: "12px", marginTop: "8px" }}>Couldn't save that — please try again.</div>}
            </div>
          </div>
        )}

        {!isStudent && (
        <div style={{ textAlign: "center", background: "white", border: "2px solid rgba(3,105,161,0.2)", borderRadius: "16px", padding: "24px 20px", marginTop: "20px" }}>
          <div style={{ fontWeight: "900", fontSize: "16px", color: "#0C1E3D", marginBottom: "8px" }}>Practice this with a classroom game</div>
          <p style={{ color: "#4B5563", fontSize: "13px", margin: "0 0 14px", lineHeight: 1.5 }}>
            ClassCade turns this exact lesson into a competitive team game. Free to start.
          </p>
          <a
            href="/"
            style={{ display: "inline-block", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", borderRadius: "12px", padding: "11px 24px", fontSize: "14px", fontWeight: "900", textDecoration: "none" }}
          >
            Sign Up Free
          </a>
        </div>
        )}
      </div>
    </div>
  );
}
