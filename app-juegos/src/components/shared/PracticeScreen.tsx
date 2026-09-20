import { useEffect, useMemo, useState } from "react";
import { TOPIC_OPTIONS } from "../../data/topicOptions";
import { LEVELS_META } from "../../data/constants";
import { FOCUS_ORDER, FOCUS_LABEL } from "../../data/learnTopics";
import { getPracticeQuestions, type PracticeItem } from "../../lib/practiceContent";
import { setMetaDescription } from "../../lib/pageMeta";
import { PracticeQuizCard } from "./PracticeQuizCard";
import { Icon } from "./Icon";

// Public, no-login solo practice quiz — reachable at /practice, same pathname-check precedent as
// /learn (see App.tsx). Same visual family as PublicLearnIndexScreen.tsx/PrivacyPolicyScreen.tsx:
// fixed Sky/amber brand palette, not the per-teacher Theme system (a logged-out visitor has no
// teacher theme). No accounts, no backend — a session lives in React state only and resets on
// refresh; see the "Practice Mode" plan for why (no cross-device progress needed for v1).
const INK = "#0C1E3D";
const SKY = "#0369A1";
const BG = "#F0F9FF";

// A round is a short lesson check, not the topic's whole question bank (a single topic can hold
// well over 100 items) — the student picks 10, 15 or 25 and can always start another round.
const SESSION_LENGTHS = [10, 15, 25];
const DEFAULT_SESSION_LENGTH = 15;

const FOCUS_FILTERS = [{ id: "all", label: "All" }, ...FOCUS_ORDER.map(f => ({ id: f, label: FOCUS_LABEL[f] }))];
const TOPIC_LABEL_BY_ID: Record<string, string> = Object.fromEntries(TOPIC_OPTIONS.map(t => [t.value, t.label]));
const SELECTABLE_TOPICS = TOPIC_OPTIONS.filter(t => t.value !== "ai");

function scoreMessage(correct: number, total: number): string {
  if (total === 0) return "";
  const pct = correct / total;
  if (pct >= 0.9) return "Amazing work!";
  if (pct >= 0.7) return "Great job!";
  if (pct >= 0.5) return "Good effort — keep going!";
  return "Keep practicing, you've got this!";
}

export function PracticeScreen() {
  useEffect(() => {
    document.title = "Practice — Self-Check Quiz | ClassCade";
    setMetaDescription("Practice English grammar and vocabulary on your own with an instant self-check quiz — no account needed, works great on your phone.");
  }, []);

  const [screen, setScreen] = useState<"picker" | "quiz" | "summary">("picker");
  const [levelFilter, setLevelFilter] = useState("all");
  const [focusFilter, setFocusFilter] = useState("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sessionLength, setSessionLength] = useState(DEFAULT_SESSION_LENGTH);

  const [items, setItems] = useState<PracticeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const filteredTopics = useMemo(() => {
    return SELECTABLE_TOPICS.filter(t => (levelFilter === "all" || t.level === levelFilter) && (focusFilter === "all" || t.focus === focusFilter));
  }, [levelFilter, focusFilter]);

  const toggleTopic = (value: string) => {
    setSelectedTopics(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const startQuiz = async () => {
    setLoading(true);
    setScreen("quiz");
    // The pool is already shuffled (and interleaved across topics), so the first N is a fair random
    // sample — a session is a quick lesson check, not the topic's entire question bank.
    const pool = (await getPracticeQuestions(selectedTopics)).slice(0, sessionLength);
    setItems(pool);
    setCurrentIndex(0);
    setCorrectCount(0);
    setLoading(false);
  };

  const handleAnswered = (correct: boolean) => {
    if (correct) setCorrectCount(c => c + 1);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= items.length) {
      setScreen("summary");
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background: "linear-gradient(160deg,#0C1E3D 0%,#0369A1 45%,#0EA5E9 100%)", padding: "40px 20px 32px", textAlign: "center" }}>
        <Icon name="target" size={36} color="white" style={{ marginBottom: "8px" }} />
        <h1 style={{ color: "white", fontSize: "26px", fontWeight: "900", margin: 0 }}>Practice on Your Own</h1>
        <p style={{ color: "#BAE6FD", fontSize: "14px", maxWidth: "480px", margin: "10px auto 0", lineHeight: 1.6 }}>
          Pick a few topics and check yourself with an instant quiz — no account needed, works great
          on your phone.
        </p>
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 20px 100px" }}>
        {screen === "picker" && (
          <PracticePicker
            levelFilter={levelFilter} setLevelFilter={setLevelFilter}
            focusFilter={focusFilter} setFocusFilter={setFocusFilter}
            filteredTopics={filteredTopics}
            selectedTopics={selectedTopics} toggleTopic={toggleTopic}
            sessionLength={sessionLength} setSessionLength={setSessionLength}
            onStart={startQuiz}
          />
        )}

        {screen === "quiz" && (
          <PracticeQuiz
            loading={loading}
            items={items}
            currentIndex={currentIndex}
            correctCount={correctCount}
            onAnswered={handleAnswered}
            onNext={handleNext}
            onBackToPicker={() => setScreen("picker")}
          />
        )}

        {screen === "summary" && (
          <PracticeSummary
            correctCount={correctCount}
            total={items.length}
            onPracticeAgain={startQuiz}
            onChangeTopics={() => setScreen("picker")}
          />
        )}

        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "28px", color: SKY, fontWeight: "700", textDecoration: "none" }}>
          <Icon name="back" size={13} /> Back to ClassCade
        </a>
      </div>
    </div>
  );
}

interface PracticePickerProps {
  levelFilter: string; setLevelFilter: (v: string) => void;
  focusFilter: string; setFocusFilter: (v: string) => void;
  filteredTopics: typeof TOPIC_OPTIONS;
  selectedTopics: string[]; toggleTopic: (v: string) => void;
  sessionLength: number; setSessionLength: (n: number) => void;
  onStart: () => void;
}

function PracticePicker({ levelFilter, setLevelFilter, focusFilter, setFocusFilter, filteredTopics, selectedTopics, toggleTopic, sessionLength, setSessionLength, onStart }: PracticePickerProps) {
  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ color: "#6B7280", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Level</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {LEVELS_META.map(l => (
            <button key={l.id} onClick={() => setLevelFilter(l.id)} style={chipStyle(levelFilter === l.id, l.color)}>
              {l.id === "all" ? "All" : l.id}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ color: "#6B7280", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Focus</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {FOCUS_FILTERS.map(f => (
            <button key={f.id} onClick={() => setFocusFilter(f.id)} style={chipStyle(focusFilter === f.id, SKY)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ color: "#6B7280", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Questions per round</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {SESSION_LENGTHS.map(n => (
            <button key={n} onClick={() => setSessionLength(n)} style={chipStyle(sessionLength === n, SKY)}>{n}</button>
          ))}
        </div>
      </div>

      <div style={{ color: "#6B7280", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
        Topics ({filteredTopics.length})
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
        {filteredTopics.map(t => (
          <button key={t.value} onClick={() => toggleTopic(t.value)} style={chipStyle(selectedTopics.includes(t.value), "#F59E0B")}>
            {selectedTopics.includes(t.value) && <Icon name="check" size={11} color="white" style={{ marginRight: "5px" }} />}
            {t.label}
          </button>
        ))}
        {filteredTopics.length === 0 && (
          <p style={{ color: "#6B7280", fontSize: "13px" }}>No topics match this filter combination — try a different level or focus.</p>
        )}
      </div>

      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: "white", borderTop: `2px solid ${INK}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <span style={{ fontSize: "13px", fontWeight: 800, color: INK }}>{selectedTopics.length} selected</span>
        <button
          onClick={onStart}
          disabled={selectedTopics.length === 0}
          style={{
            background: selectedTopics.length === 0 ? "#D1D5DB" : "linear-gradient(135deg,#F59E0B,#D97706)",
            color: "white", border: `3px solid ${INK}`, borderRadius: "14px", padding: "13px 26px",
            fontSize: "15px", fontWeight: 900, cursor: selectedTopics.length === 0 ? "not-allowed" : "pointer", minHeight: "48px",
          }}
        >
          Start Practicing
        </button>
      </div>
    </div>
  );
}

function chipStyle(active: boolean, activeColor: string): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", background: active ? activeColor : "white",
    color: active ? "white" : INK, border: `2px solid ${active ? activeColor : "#E5E7EB"}`,
    borderRadius: "999px", padding: "9px 16px", fontSize: "13px", fontWeight: 800, cursor: "pointer", minHeight: "40px",
  };
}

interface PracticeQuizProps {
  loading: boolean;
  items: PracticeItem[];
  currentIndex: number;
  correctCount: number;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
  onBackToPicker: () => void;
}

function PracticeQuiz({ loading, items, currentIndex, correctCount, onAnswered, onNext, onBackToPicker }: PracticeQuizProps) {
  if (loading) {
    return <p style={{ textAlign: "center", color: "#6B7280", fontWeight: 700 }}>Loading questions…</p>;
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#6B7280", fontSize: "14px", marginBottom: "16px" }}>
          No practice questions found for those topics yet — try picking a few more.
        </p>
        <button onClick={onBackToPicker} style={{ background: SKY, color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>
          Choose Different Topics
        </button>
      </div>
    );
  }

  const current = items[currentIndex];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <button onClick={onBackToPicker} style={{ background: "none", border: "none", color: SKY, fontWeight: 800, fontSize: "13px", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}>
          <Icon name="back" size={12} /> Topics
        </button>
        <span style={{ fontSize: "13px", fontWeight: 800, color: "#6B7280" }}>Question {currentIndex + 1} of {items.length}</span>
      </div>
      <div style={{ height: "6px", background: "#E5E7EB", borderRadius: "999px", marginBottom: "20px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((currentIndex) / items.length) * 100}%`, background: "linear-gradient(90deg,#F59E0B,#D97706)" }} />
      </div>

      <PracticeQuizCard
        key={currentIndex}
        item={current}
        topicLabel={TOPIC_LABEL_BY_ID[current.sourceTopic] ?? current.sourceTopic}
        onAnswered={onAnswered}
        onNext={onNext}
      />

      <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: "12px", marginTop: "16px" }}>{correctCount} correct so far</p>
    </div>
  );
}

function PracticeSummary({ correctCount, total, onPracticeAgain, onChangeTopics }: { correctCount: number; total: number; onPracticeAgain: () => void; onChangeTopics: () => void }) {
  const pct = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  return (
    <div style={{ textAlign: "center", background: "white", border: `3px solid ${INK}`, borderRadius: "18px", boxShadow: `5px 5px 0 ${INK}`, padding: "32px 24px" }}>
      <Icon name="trophy" size={40} color="#F59E0B" style={{ marginBottom: "10px" }} />
      <div style={{ fontSize: "32px", fontWeight: 900, color: INK }}>{correctCount} / {total}</div>
      <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: 700, marginBottom: "6px" }}>{pct}% correct</div>
      <p style={{ fontSize: "16px", fontWeight: 800, color: SKY, margin: "10px 0 24px" }}>{scoreMessage(correctCount, total)}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button onClick={onPracticeAgain} style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", border: `3px solid ${INK}`, borderRadius: "14px", padding: "14px", fontSize: "15px", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", minHeight: "50px" }}>
          <Icon name="shuffle" size={16} color="white" /> Practice Again
        </button>
        <button onClick={onChangeTopics} style={{ background: "white", color: SKY, border: `2px solid ${SKY}`, borderRadius: "14px", padding: "14px", fontSize: "15px", fontWeight: 800, cursor: "pointer", minHeight: "50px" }}>
          Choose Different Topics
        </button>
      </div>
    </div>
  );
}
