import { useEffect } from "react";
import { LESSON_TOPICS, LEVEL_ORDER, LEVEL_COLOR, FOCUS_ORDER, FOCUS_LABEL } from "../../data/learnTopics";
import { setMetaDescription } from "../../lib/pageMeta";
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

  const byLevel = LEVEL_ORDER
    .map(level => ({ level, topics: LESSON_TOPICS.filter(t => t.meta.level === level) }))
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
        {byLevel.map(group => (
          <div key={group.level} style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ background: LEVEL_COLOR[group.level], color: "white", borderRadius: "999px", padding: "3px 12px", fontSize: "13px", fontWeight: "800" }}>{group.level}</span>
              <span style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: "700" }}>{group.topics.length} lesson{group.topics.length === 1 ? "" : "s"}</span>
            </div>
            {FOCUS_ORDER.filter(focus => group.topics.some(t => (t.meta.focus ?? "grammar") === focus)).map(focus => (
              <div key={focus} style={{ marginBottom: "16px" }}>
                <div style={{ color: "#6B7280", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>{FOCUS_LABEL[focus]}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "10px" }}>
                  {group.topics.filter(t => (t.meta.focus ?? "grammar") === focus).map(t => (
                    <a
                      key={t.id} href={`/learn/${t.id}`}
                      style={{ textAlign: "left", background: "white", border: "2px solid rgba(3,105,161,0.2)", borderRadius: "12px", padding: "14px 16px", textDecoration: "none", display: "block" }}
                    >
                      <div style={{ fontWeight: "800", color: "#0C1E3D", fontSize: "14px" }}>{t.lesson.title}</div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div style={{ textAlign: "center", background: "white", border: "2px solid rgba(3,105,161,0.2)", borderRadius: "16px", padding: "28px 20px", marginTop: "12px" }}>
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

        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "24px", color: "#0369A1", fontWeight: "700", textDecoration: "none" }}><Icon name="back" size={13} /> Back to ClassCade</a>
      </div>
    </div>
  );
}
