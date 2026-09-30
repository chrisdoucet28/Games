import { useEffect, useState } from "react";
import { LESSON_TOPICS, LEVEL_ORDER, LEVEL_COLOR, FOCUS_ORDER, FOCUS_LABEL, matchesTopicSearch } from "../../data/learnTopics";
import { setMetaDescription } from "../../lib/pageMeta";
import { useStudentSession } from "../../hooks/useStudentSession";
import { getLessonsDone } from "../../lib/studentProgress";
import { Icon } from "./Icon";

// Public, no-login-required index of every Learn lesson — reachable at /learn, linked from the
// homepage and crawlable by Google (each card is a real <a href>, not a click handler, since
// that's how a crawler actually discovers the 118 child /learn/<id> pages from here). Same visual
// family as PrivacyPolicyScreen.tsx/TermsOfServiceScreen.tsx: fixed Sky/amber brand palette, not
// the per-teacher Theme system (a logged-out visitor has no teacher theme).
export function PublicLearnIndexScreen() {
  useEffect(() => {
    document.title = "Learn English — Free Grammar & Vocabulary Lessons | ClassCade";
    setMetaDescription("Free ESL lessons covering grammar, vocabulary, and themes from A1 to C1 — the same topics used in ClassCade's classroom games.");
  }, []);

  // Extra UI only for a signed-in student — everyone else (and Google) sees the page exactly as
  // before. The done-set is fetched once here and passed down, not per card.
  const { isStudent, loggedIn } = useStudentSession();
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!isStudent) return;
    getLessonsDone().then(m => setDoneIds(new Set(m.keys()))).catch(() => {});
  }, [isStudent]);

  // Starts empty so the very first render (what Google's crawler sees) still lists every lesson
  // as a real <a href> — see the file-level comment above. Filtering only narrows what a real
  // visitor sees after they type.
  const [searchTerm, setSearchTerm] = useState("");
  const searchedTopics = LESSON_TOPICS.filter(t => matchesTopicSearch(t.lesson.title, searchTerm));
  const byLevel = LEVEL_ORDER
    .map(level => ({ level, topics: searchedTopics.filter(t => t.meta.level === level) }))
    .filter(g => g.topics.length > 0);

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background: "linear-gradient(160deg,#0C1E3D 0%,#0369A1 45%,#0EA5E9 100%)", padding: "48px 20px 40px", textAlign: "center" }}>
        <Icon name="learn" size={40} color="white" style={{ marginBottom: "8px" }} />
        <h1 style={{ color: "white", fontSize: "28px", fontWeight: "900", margin: 0 }}>Learn English — Free Lessons</h1>
        <p style={{ color: "#BAE6FD", fontSize: "14px", maxWidth: "520px", margin: "10px auto 0", lineHeight: 1.6 }}>
          Quick, no-fluff explanations covering grammar, vocabulary, and themes from A1 to C1 — the
          same {LESSON_TOPICS.length} topics tested by{" "}
          <a href="/" style={{ color: "#FCD34D", fontWeight: "700" }}>ClassCade</a>'s classroom games.
        </p>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 20px 60px" }}>
        <div style={{ position: "relative", marginBottom: "24px" }}>
          <Icon name="search" size={15} color="#9CA3AF" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search lessons..."
            style={{
              width: "100%", boxSizing: "border-box", padding: "11px 40px 11px 38px",
              border: "2px solid rgba(3,105,161,0.2)", borderRadius: "12px", fontSize: "14px",
              fontWeight: "600", color: "#0C1E3D", outline: "none",
            }}
          />
          {searchTerm !== "" && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(3,105,161,0.12)", border: "none", borderRadius: "50%", width: "22px", height: "22px", color: "#0369A1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Icon name="close" size={10} />
            </button>
          )}
        </div>

        {byLevel.length === 0 && (
          <div style={{ textAlign: "center", color: "#6B7280", padding: "24px 0 40px" }}>No lessons match "{searchTerm.trim()}"</div>
        )}

        {byLevel.map(group => (
          <div key={group.level} style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ background: LEVEL_COLOR[group.level], color: "white", borderRadius: "999px", padding: "3px 12px", fontSize: "13px", fontWeight: "800" }}>{group.level}</span>
              <span style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: "700" }}>
                {isStudent
                  ? `${group.topics.filter(t => doneIds.has(t.id)).length}/${group.topics.length} finished`
                  : `${group.topics.length} lesson${group.topics.length === 1 ? "" : "s"}`}
              </span>
            </div>
            {FOCUS_ORDER.filter(focus => group.topics.some(t => (t.meta.focus ?? "grammar") === focus)).map(focus => (
              <div key={focus} style={{ marginBottom: "16px" }}>
                <div style={{ color: "#6B7280", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>{FOCUS_LABEL[focus]}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "10px" }}>
                  {group.topics.filter(t => (t.meta.focus ?? "grammar") === focus).map(t => (
                    <a
                      key={t.id} href={`/learn/${t.id}`}
                      style={{ position: "relative", textAlign: "left", background: doneIds.has(t.id) ? "#F0FDF4" : "white", border: `2px solid ${doneIds.has(t.id) ? "#86EFAC" : "rgba(3,105,161,0.2)"}`, borderRadius: "12px", padding: "14px 16px", textDecoration: "none", display: "block" }}
                    >
                      {doneIds.has(t.id) && (
                        <span title="Finished" style={{ position: "absolute", top: "8px", right: "8px", width: "20px", height: "20px", borderRadius: "50%", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon name="check" size={11} color="white" />
                        </span>
                      )}
                      <div style={{ fontWeight: "800", color: "#0C1E3D", fontSize: "14px", paddingRight: doneIds.has(t.id) ? "22px" : 0 }}>{t.lesson.title}</div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div style={{ textAlign: "center", background: "white", border: "2px solid rgba(3,105,161,0.2)", borderRadius: "16px", padding: "24px 20px", marginTop: "12px", marginBottom: "16px" }}>
          <div style={{ fontWeight: "900", fontSize: "16px", color: "#0C1E3D", marginBottom: "8px" }}>Ready to test yourself?</div>
          <p style={{ color: "#4B5563", fontSize: "13px", margin: "0 0 14px", lineHeight: 1.5 }}>
            {/* "no account needed" is only true -- and only worth saying -- to someone who
                doesn't have one yet, same reasoning as PracticeScreen's own picker intro. */}
            {loggedIn
              ? "Try a self-check practice quiz — pick a few topics and see how you do."
              : "Try a self-check practice quiz — pick a few topics and see how you do, no account needed."}
          </p>
          <a
            href="/practice"
            style={{ display: "inline-block", background: "#0369A1", color: "white", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "900", textDecoration: "none" }}
          >
            Try a Practice Quiz
          </a>
        </div>

        {/* Only pitched at someone who isn't already logged in -- a signed-in student or teacher
            has already signed up, so "Sign Up Free" makes no sense to show them. */}
        {!loggedIn && (
          <div style={{ textAlign: "center", background: "white", border: "2px solid rgba(3,105,161,0.2)", borderRadius: "16px", padding: "28px 20px" }}>
            <div style={{ fontWeight: "900", fontSize: "17px", color: "#0C1E3D", marginBottom: "8px" }}>Want to turn these into a classroom game?</div>
            <p style={{ color: "#4B5563", fontSize: "14px", margin: "0 0 16px", lineHeight: 1.5 }}>
              ClassCade pairs every one of these lessons with a competitive team game. Free to start, no
              credit card needed.
            </p>
            <a
              href="/"
              style={{ display: "inline-block", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "900", textDecoration: "none" }}
            >
              Sign Up Free
            </a>
          </div>
        )}

        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "24px", color: "#0369A1", fontWeight: "700", textDecoration: "none" }}><Icon name="back" size={13} /> {isStudent ? "Back to my progress" : "Back to ClassCade"}</a>
      </div>
    </div>
  );
}
