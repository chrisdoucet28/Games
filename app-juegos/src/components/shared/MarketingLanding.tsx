import { GAME_MODES } from "../../data/constants";
import { LESSON_TOPICS } from "../../data/learnTopics";
import { PPPDiagram } from "./PPPDiagram";

type Props = { onSignUp: () => void; onLogIn: () => void };

const realTopicCount = LESSON_TOPICS.length;

// A rounded "device frame" card — used to hold either a real screenshot (via <img>, once one is
// captured and dropped in public/screenshots/) or, until then, a tasteful illustrated mockup built
// from the app's own real data/colors so it reads as "the actual product" rather than stock art.
// Swap the `mockup` prop for `<img src="/screenshots/<name>.png" ... />` once real screenshots
// exist — the frame styling doesn't need to change.
function DeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "white", borderRadius: "16px", padding: "10px", boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
      border: "1px solid rgba(255,255,255,0.2)", maxWidth: "100%",
    }}>
      <div style={{ display: "flex", gap: "5px", padding: "0 4px 8px" }}>
        <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#EF4444" }} />
        <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#F59E0B" }} />
        <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#22C55E" }} />
      </div>
      <div style={{ borderRadius: "10px", overflow: "hidden", background: "#F0F9FF" }}>
        {children}
      </div>
    </div>
  );
}

function GameSelectMockup() {
  const preview = GAME_MODES.slice(0, 6);
  return (
    <div style={{ padding: "16px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg,#0369A1,#0EA5E9)", borderRadius: "10px", padding: "10px 14px", color: "white", fontSize: "11px", fontWeight: "800", marginBottom: "12px", textAlign: "center" }}>
        Past Simple · 🔴 Team Red 40 · 🔵 Team Blue 30
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
        {preview.map(g => (
          <div key={g.id} style={{ background: "white", border: `2px solid ${g.color}`, borderRadius: "10px", padding: "10px 6px", textAlign: "center" }}>
            <div style={{ fontSize: "20px" }}>{g.icon}</div>
            <div style={{ fontSize: "9px", fontWeight: "800", color: "#111827", marginTop: "2px" }}>{g.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LessonMockup() {
  return (
    <div style={{ padding: "18px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <span style={{ background: "#F59E0B", color: "white", borderRadius: "999px", padding: "2px 10px", fontSize: "9px", fontWeight: "800" }}>A2</span>
      <div style={{ fontSize: "15px", fontWeight: "900", color: "#0C1E3D", margin: "6px 0 4px" }}>Past Simple</div>
      <div style={{ fontSize: "10px", color: "#4B5563", lineHeight: 1.5, marginBottom: "10px" }}>
        Use the past simple to talk about finished actions at a specific time in the past.
      </div>
      <div style={{ background: "rgba(3,105,161,0.08)", borderLeft: "3px solid #0369A1", borderRadius: "0 6px 6px 0", padding: "6px 10px", fontSize: "10px", fontStyle: "italic", color: "#374151" }}>
        She <strong>visited</strong> her grandmother last weekend.
      </div>
    </div>
  );
}

function ScoreboardMockup() {
  const rows = [
    { color: "#EF4444", name: "Team Red", score: 90 },
    { color: "#3B82F6", name: "Team Blue", score: 70 },
  ];
  return (
    <div style={{ padding: "18px", fontFamily: "'Segoe UI',system-ui,sans-serif", textAlign: "center" }}>
      <div style={{ fontSize: "13px", fontWeight: "900", color: "#0C1E3D", marginBottom: "10px" }}>🏆 Final Scores</div>
      {rows.map(r => (
        <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", border: `2px solid ${r.color}`, borderRadius: "8px", padding: "6px 10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: r.color }}>{r.name}</span>
          <span style={{ fontSize: "13px", fontWeight: "900", color: "#111827" }}>{r.score}</span>
        </div>
      ))}
    </div>
  );
}

const HOW_IT_WORKS = [
  { n: 1, icon: "📊", title: "Pick a level & topic", body: "Filter by A1–C1 and grammar, vocabulary, or theme, then choose one or more topics for the class." },
  { n: 2, icon: "🎓", title: "Pre-teach with a Learn lesson", body: "Open the matching Learn lesson to introduce the language first — no separate prep, it's built from the exact same content." },
  { n: 3, icon: "🎮", title: "Play games left to right", body: "Start with low-pressure, no-speech games and move toward full spoken production as students get comfortable." },
  { n: 4, icon: "🏆", title: "Track scores & progress", body: "Save classes and teams so scores carry over between lessons — no setup lost between sessions." },
];

const FEATURES = [
  { icon: "🎮", title: "15 competitive games", body: `From silent judgment calls to full free conversation — ${GAME_MODES.length} team-based formats.` },
  { icon: "🎓", title: "A matching Learn lesson for every topic", body: `${realTopicCount}+ lessons, one for every game topic, free to browse without an account.` },
  { icon: "📚", title: "Classes & teams that save", body: "Set up a class once — teams, mascots, and scores carry over between lessons." },
  { icon: "📱", title: "Phone-controlled play modes", body: "Students buzz in, type answers, or claim tickets from their own phones for select games." },
  { icon: "🎨", title: "Accent themes", body: "Give the shared screen a look that fits your classroom, without touching any game's own identity." },
  { icon: "⚡", title: "Zero prep, ready in seconds", body: "No slides to build — pick a topic and a game, and you're playing." },
];

export function MarketingLanding({ onSignUp, onLogIn }: Props) {
  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "48px", marginBottom: "8px", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }}>🕹️</div>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "white", margin: 0, letterSpacing: "-0.01em" }}>
          Class<span style={{ color: "#FCD34D" }}>Cade</span>
        </h1>
        <p style={{ color: "#BAE6FD", fontSize: "14px", lineHeight: 1.6, margin: "10px 0 0" }}>
          A classroom game website built for English teachers. Pick a level and topic, then play
          one of {GAME_MODES.length} competitive team games — every one built around{" "}
          {realTopicCount}+ grammar, vocabulary, and theme topics, from A1 to C1. No prep, ready
          in seconds, with matching Learn lessons for every topic.
        </p>
      </div>

      <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "20px", padding: "28px 24px", backdropFilter: "blur(8px)", textAlign: "center" }}>
        <div style={{ color: "#BAE6FD", fontSize: "13px", fontWeight: "700", marginBottom: "16px" }}>
          ClassCade uses a free account (email or Google) so your classes, teams, and scores are saved between lessons.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            type="button" onClick={onSignUp}
            style={{ width: "100%", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", border: "none", borderRadius: "12px", padding: "13px", fontSize: "15px", fontWeight: "900", cursor: "pointer" }}
          >
            Sign Up Free
          </button>
          <button
            type="button" onClick={onLogIn}
            style={{ width: "100%", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "12px", padding: "13px", fontSize: "15px", fontWeight: "800", cursor: "pointer" }}
          >
            Log In
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", margin: "28px 0" }}>
        <div style={{ maxWidth: "300px", width: "100%" }}>
          <DeviceFrame><GameSelectMockup /></DeviceFrame>
        </div>
      </div>

      {/* How it works */}
      <Section title="How it works" subtitle="The actual teaching flow, not just an app tour.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px" }}>
          {HOW_IT_WORKS.map(s => (
            <div key={s.n} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", padding: "16px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#F59E0B", color: "white", fontSize: "12px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.n}</div>
                <div style={{ fontSize: "18px" }}>{s.icon}</div>
              </div>
              <div style={{ color: "white", fontWeight: "800", fontSize: "14px", marginBottom: "4px" }}>{s.title}</div>
              <div style={{ color: "#BAE6FD", fontSize: "12px", lineHeight: 1.5 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* PPP diagram */}
      <Section title="Ordered by how much speaking they ask for" subtitle="Pre-teach with a Learn lesson, then play left to right.">
        <PPPDiagram variant="full" />
      </Section>

      {/* Feature grid */}
      <Section title="What's included" subtitle="Everything below is free to start.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "14px" }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", padding: "16px 14px" }}>
              <div style={{ fontSize: "22px", marginBottom: "8px" }}>{f.icon}</div>
              <div style={{ color: "white", fontWeight: "800", fontSize: "14px", marginBottom: "4px" }}>{f.title}</div>
              <div style={{ color: "#BAE6FD", fontSize: "12px", lineHeight: 1.5 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Screenshot showcase */}
      <Section title="See it in action">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "20px", justifyItems: "center" }}>
          <DeviceFrame><LessonMockup /></DeviceFrame>
          <DeviceFrame><ScoreboardMockup /></DeviceFrame>
        </div>
      </Section>

      {/* Learn preview */}
      <Section title="🎓 Free Learn lessons" subtitle="No account needed to browse.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "10px", marginBottom: "16px" }}>
          {LESSON_TOPICS.slice(0, 6).map(t => (
            <a key={t.id} href={`/learn/${t.id}`} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "12px 14px", textDecoration: "none", display: "block" }}>
              <div style={{ color: "white", fontWeight: "800", fontSize: "13px" }}>{t.lesson.title}</div>
              <div style={{ color: "#7DB8DB", fontSize: "11px", marginTop: "2px" }}>{t.meta.level}</div>
            </a>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <a href="/learn" style={{ color: "#FCD34D", fontWeight: "800", fontSize: "13px", textDecoration: "none" }}>Browse all free lessons →</a>
        </div>
      </Section>

      {/* Final CTA */}
      <div style={{ textAlign: "center", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "20px", padding: "28px 24px", marginTop: "32px" }}>
        <div style={{ color: "white", fontWeight: "900", fontSize: "17px", marginBottom: "14px" }}>Ready to try it with your class?</div>
        <button
          type="button" onClick={onSignUp}
          style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", border: "none", borderRadius: "12px", padding: "13px 32px", fontSize: "15px", fontWeight: "900", cursor: "pointer" }}
        >
          Sign Up Free
        </button>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "40px" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "white", fontSize: "20px", fontWeight: "900", margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ color: "#7DB8DB", fontSize: "13px", margin: "6px 0 0" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
