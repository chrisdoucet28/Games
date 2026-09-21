import { useEffect, useMemo, useState } from "react";
import { LESSON_TOPICS, LEVEL_ORDER, LEVEL_COLOR } from "../../data/learnTopics";
import { BADGES, earnedBadgeIds, levelInfo, xpFromStats, type StudentStats } from "../../data/studentRewards";
import { getLessonsDone, getStudentStats } from "../../lib/studentProgress";
import { chooseRole } from "../../lib/profile";
import { Icon } from "../shared/Icon";
import { MyClassesSection } from "./MyClassesSection";

// What a logged-in student sees instead of the teacher app — their level, streak, badges and
// lesson progress, with two big doors into the public Learn and Practice pages (which recognise a
// signed-in student and record progress; see useStudentSession). Same fixed sky/amber brand
// palette as the other public-facing screens, not the per-teacher Theme system.
const INK = "#0C1E3D";
const SKY = "#0369A1";

const EMPTY_STATS: StudentStats = { lessonsDone: 0, rounds: 0, correctAnswers: 0, perfectRounds: 0, streakDays: 0, classCheckins: 0 };

export function StudentHome({ onSwitchToTeacher }: { onSwitchToTeacher: () => void }) {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [switchError, setSwitchError] = useState("");

  useEffect(() => {
    document.title = "My Progress | ClassCade";
    Promise.all([getStudentStats(), getLessonsDone()])
      .then(([s, lessons]) => { setStats(s); setDoneIds(new Set(lessons.keys())); })
      .catch(() => { setStats(EMPTY_STATS); setError("Couldn't load your progress just now — try refreshing in a moment."); });
  }, []);

  const level = useMemo(() => levelInfo(xpFromStats(stats ?? EMPTY_STATS)), [stats]);
  const earned = useMemo(() => new Set(earnedBadgeIds(stats ?? EMPTY_STATS)), [stats]);

  const byLevel = useMemo(() => LEVEL_ORDER.map(lv => {
    const topics = LESSON_TOPICS.filter(t => t.meta.level === lv);
    return { level: lv, total: topics.length, done: topics.filter(t => doneIds.has(t.id)).length };
  }).filter(g => g.total > 0), [doneIds]);

  const switchToTeacher = async () => {
    setSwitchError("");
    try {
      await chooseRole("teacher");
      onSwitchToTeacher();
    } catch (err) {
      setSwitchError(err instanceof Error ? err.message : "Couldn't switch — please try again.");
    }
  };

  const card: React.CSSProperties = { background: "white", border: `3px solid ${INK}`, borderRadius: "18px", boxShadow: `5px 5px 0 ${INK}`, padding: "18px" };
  const doorButton: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", borderRadius: "14px",
    padding: "14px", fontSize: "16px", fontWeight: 900, minHeight: "52px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background: "linear-gradient(160deg,#0C1E3D 0%,#0369A1 45%,#0EA5E9 100%)", padding: "32px 20px 28px", textAlign: "center" }}>
        <h1 style={{ color: "white", fontSize: "24px", fontWeight: 900, margin: 0 }}>Your Progress</h1>
        <p style={{ color: "#BAE6FD", fontSize: "13px", margin: "8px 0 0" }}>Finish lessons and practice to level up.</p>
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "22px 16px 60px", display: "flex", flexDirection: "column", gap: "18px" }}>
        {error && <div role="alert" style={{ background: "#FEF3C7", color: "#92400E", borderRadius: "10px", padding: "10px 12px", fontSize: "13px" }}>{error}</div>}

        <div style={card}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "28px", fontWeight: 900, color: INK }}>Level {level.level}</div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#6B7280" }}>{level.xp} XP</div>
          </div>
          <div style={{ height: "12px", background: "#E5E7EB", borderRadius: "999px", overflow: "hidden", margin: "10px 0 6px" }}>
            <div style={{ height: "100%", width: `${Math.round(level.progress * 100)}%`, background: "linear-gradient(90deg,#F59E0B,#D97706)" }} />
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 700 }}>{level.nextLevelAt - level.xp} XP to level {level.level + 1}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", fontSize: "14px", fontWeight: 800, color: (stats?.streakDays ?? 0) > 0 ? "#B45309" : "#9CA3AF" }}>
            <Icon name="flame" size={16} /> {stats?.streakDays ?? 0}-day streak
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px" }}>
          <a href="/practice" style={{ ...doorButton, background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", border: `3px solid ${INK}` }}>
            <Icon name="target" size={18} color="white" /> Practice quiz
          </a>
          <a href="/learn" style={{ ...doorButton, background: "white", color: SKY, border: `3px solid ${SKY}` }}>
            <Icon name="learn" size={18} /> Browse lessons
          </a>
        </div>

        <MyClassesSection cardStyle={card} />

        <div style={card}>
          <div style={{ fontWeight: 900, fontSize: "16px", color: INK, marginBottom: "12px" }}>Badges · {earned.size}/{BADGES.length}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: "10px" }}>
            {BADGES.map(b => {
              const has = earned.has(b.id);
              return (
                <div key={b.id} style={{ textAlign: "center", padding: "12px 8px", borderRadius: "12px", background: has ? "#FEF3C7" : "#F3F4F6", border: `2px solid ${has ? "#F59E0B" : "#E5E7EB"}`, opacity: has ? 1 : 0.7 }}>
                  <div style={{ color: has ? "#B45309" : "#9CA3AF", marginBottom: "4px" }}><Icon name={b.icon} size={26} /></div>
                  <div style={{ fontWeight: 800, fontSize: "13px", color: has ? INK : "#6B7280" }}>{b.name}</div>
                  <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px", lineHeight: 1.3 }}>{b.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontWeight: 900, fontSize: "16px", color: INK, marginBottom: "12px" }}>Lessons finished · {stats?.lessonsDone ?? 0}/{LESSON_TOPICS.length}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {byLevel.map(g => (
              <a key={g.level} href="/learn" style={{ textDecoration: "none", display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 800, color: INK, marginBottom: "4px" }}>
                  <span><span style={{ background: LEVEL_COLOR[g.level], color: "white", borderRadius: "999px", padding: "1px 10px", marginRight: "8px" }}>{g.level}</span></span>
                  <span>{g.done}/{g.total}</span>
                </div>
                <div style={{ height: "8px", background: "#E5E7EB", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(g.done / g.total) * 100}%`, background: LEVEL_COLOR[g.level] }} />
                </div>
              </a>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={switchToTeacher} style={{ background: "none", border: "none", color: "#6B7280", fontSize: "12px", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
            Actually, I'm a teacher — switch my account type
          </button>
          {switchError && <div role="alert" style={{ color: "#991B1B", fontSize: "12px", marginTop: "6px" }}>{switchError}</div>}
        </div>
      </div>
    </div>
  );
}
