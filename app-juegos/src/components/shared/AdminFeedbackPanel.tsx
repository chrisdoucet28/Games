import { useMemo, useState } from "react";
import { ADMIN_COLORS as C } from "./adminColors";
import { GAME_MODES } from "../../data/constants";
import { TOPIC_OPTIONS } from "../../data/topicOptions";
import type { FeedbackRow, FeedbackStatus } from "../../lib/adminFeedback";
import { AdminAutoFixActivity } from "./AdminAutoFixActivity";
import { getArraySections, itemsMatch, primaryText } from "./AdminTopicBrowser";

type Tab = "all" | "flag" | "general" | "pattern";

export const gameLabel = (gameId: string | null) => {
  if (!gameId) return null;
  if (gameId === "lessonplan") return "Lesson Plan";
  // Not a game at all — FlagLessonButton.tsx (the Learn screen's own flag button) always submits
  // this literal id, with question_data shaped as { topicId, title } instead of { question, answer }.
  if (gameId === "learn") return "Learn";
  return GAME_MODES.find(g => g.id === gameId)?.name ?? gameId;
};

// Feedback rows have no fixed "review deadline" clock to render against — this is just a plain,
// coarse-grained relative label for the card list, not anything a teacher-facing screen needs
// precision for.
function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

// LessonGamesGenerator.tsx tags every question with sourceTopic (spySourceTopic for Spy Among Us/
// Zombie Siege's own content) before mixing selected topics together, precisely so a flagged
// question can be traced back here — without this, only the game mode was ever known, never which
// of the teacher's selected topics the flagged content actually came from.
function topicValue(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  return (typeof d.sourceTopic === "string" ? d.sourceTopic : null) ?? (typeof d.spySourceTopic === "string" ? d.spySourceTopic : null);
}
export function topicLabel(data: unknown): string | null {
  const value = topicValue(data);
  if (!value) return null;
  return TOPIC_OPTIONS.find(t => t.value === value)?.label ?? value;
}

export function formatQuestionData(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const question = typeof d.question === "string" ? d.question : null;
  const answer = typeof d.answer === "string" ? d.answer : null;
  if (question && answer) return `${question} → ${answer}`;
  if (question) return question;
  // FlagLessonButton.tsx's shape (game_id "learn") — no question/answer, just which lesson.
  const title = typeof d.title === "string" ? d.title : null;
  if (title) return `Lesson: ${title}`;
  return null;
}

// Fallback for a flag with no sourceTopic at all -- every flag submitted before that field started
// being recorded (see the previous fix's commit; confirmed against the live feedback table that
// this covers the entire existing backlog, not just a few rows). Rather than leaving those stuck at
// "Topic unknown" forever, this searches every topic's content for an item matching the flagged
// question's own text (the same itemsMatch() comparison AdminTopicBrowser uses to highlight a
// known topic's item) and reports back whichever topic actually contains it, if any.
async function findTopicByContent(questionData: unknown): Promise<string | null> {
  if (!questionData || typeof questionData !== "object") return null;
  const target = questionData as Record<string, unknown>;
  const { TOPIC_LIBRARY } = await import("../../data/topics");
  for (const [topicId, entry] of Object.entries(TOPIC_LIBRARY as Record<string, Record<string, unknown>>)) {
    for (const section of getArraySections(entry)) {
      const arr = entry[section] as unknown[];
      for (const item of arr) {
        if (itemsMatch(item as Record<string, unknown>, target)) return topicId;
      }
    }
  }
  return null;
}

function copyDetails(row: FeedbackRow) {
  const parts = [
    `Game: ${gameLabel(row.game_id) ?? "—"}`,
    `Topic: ${topicLabel(row.question_data) ?? "—"}`,
    ...(row.is_pattern_issue ? ["⚠ Flagged as a pattern issue, not just this one prompt"] : []),
    `Message: ${row.message}`,
  ];
  const q = formatQuestionData(row.question_data);
  if (q) parts.push(`Question: ${q}`);
  if (row.admin_note) parts.push(`Admin note: ${row.admin_note}`);
  navigator.clipboard.writeText(parts.join("\n")).catch(() => {});
}

const pillStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 800,
  padding: "6px 11px", borderRadius: 999, border: `1px solid ${C.border}`, color: C.inkDim,
};

const btnPrimary: React.CSSProperties = {
  border: "none", borderRadius: 9, padding: "7px 13px", fontSize: 11.5, fontWeight: 800, cursor: "pointer",
  whiteSpace: "nowrap", fontFamily: "inherit", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white",
};
const btnSuccess: React.CSSProperties = {
  border: "none", borderRadius: 9, padding: "7px 13px", fontSize: 11.5, fontWeight: 800, cursor: "pointer",
  whiteSpace: "nowrap", fontFamily: "inherit", background: "linear-gradient(135deg,#22C55E,#16A34A)", color: "white",
};
const btnGhost: React.CSSProperties = {
  border: `1px solid ${C.border}`, borderRadius: 9, padding: "7px 13px", fontSize: 11.5, fontWeight: 800, cursor: "pointer",
  whiteSpace: "nowrap", fontFamily: "inherit", background: C.surface2, color: C.inkDim,
};
const btnFix: React.CSSProperties = {
  border: "1px solid rgba(59,130,246,0.4)", borderRadius: 9, padding: "7px 13px", fontSize: 11.5, fontWeight: 800, cursor: "pointer",
  whiteSpace: "nowrap", fontFamily: "inherit", background: "rgba(59,130,246,0.14)", color: "#93C5FD",
};

type Props = {
  rows: FeedbackRow[] | null;
  error: string | null;
  onSetStatus: (id: string, status: FeedbackStatus) => void;
  onSetPatternIssue: (id: string, isPatternIssue: boolean) => void;
  onSetAdminNote: (id: string, note: string) => void;
  // Jumps to Content & Topics, opens the flagged item's topic, and highlights/scrolls to the
  // exact matching item there (see AdminScreen.tsx/AdminContentPanel.tsx/AdminTopicBrowser.tsx).
  onFixTopic: (topicId: string, questionData: unknown) => void;
};

// Admin-only note editor -- a teacher never sees this field. It exists so the app owner (who
// triages here but doesn't write the code himself) can leave context a future Claude Code session
// with no memory of this review actually needs, instead of a bare status having to carry that.
function AdminNoteEditor({ row, onSave }: { row: FeedbackRow; onSave: (note: string) => void }) {
  const [draft, setDraft] = useState(row.admin_note ?? "");
  const dirty = draft !== (row.admin_note ?? "");
  return (
    <div style={{ marginTop: 8 }}>
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="Admin note for whoever codes this (optional)…"
        rows={2}
        style={{ width: "100%", boxSizing: "border-box", background: "#0B1425", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 9px", fontSize: 12, color: C.ink, fontFamily: "inherit", resize: "vertical" }}
      />
      {dirty && (
        <button style={{ ...btnGhost, marginTop: 6, padding: "5px 11px" }} onClick={() => onSave(draft.trim())}>Save note</button>
      )}
    </div>
  );
}

export function AdminFeedbackPanel({ rows, error, onSetStatus, onSetPatternIssue, onSetAdminNote, onFixTopic }: Props) {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Per-row state for the "Find in content" fallback (findTopicByContent) -- "busy" while
  // scanning, "notfound" once a full scan comes back with nothing to show that outcome distinctly
  // from a row that's simply never been searched yet.
  const [searchState, setSearchState] = useState<Record<string, "busy" | "notfound" | undefined>>({});

  const handleFindInContent = async (row: FeedbackRow) => {
    setSearchState(prev => ({ ...prev, [row.id]: "busy" }));
    const foundTopicId = await findTopicByContent(row.question_data);
    if (foundTopicId) {
      setSearchState(prev => { const next = { ...prev }; delete next[row.id]; return next; });
      onFixTopic(foundTopicId, row.question_data);
    } else {
      setSearchState(prev => ({ ...prev, [row.id]: "notfound" }));
    }
  };

  const counts = useMemo(() => {
    const all = rows ?? [];
    return {
      all: all.length,
      flag: all.filter(r => r.kind === "flag").length,
      general: all.filter(r => r.kind === "general").length,
      pattern: all.filter(r => r.is_pattern_issue).length,
      newCount: all.filter(r => r.status === "new").length,
      queuedCount: all.filter(r => r.status === "queued").length,
      doneCount: all.filter(r => r.status === "done").length,
      dismissedCount: all.filter(r => r.status === "dismissed").length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const all = rows ?? [];
    const term = search.trim().toLowerCase();
    return all.filter(r => {
      if (tab === "pattern" ? !r.is_pattern_issue : tab !== "all" && r.kind !== tab) return false;
      if (!term) return true;
      const haystack = [r.message, gameLabel(r.game_id) ?? "", topicLabel(r.question_data) ?? "", r.display_name ?? "", formatQuestionData(r.question_data) ?? ""].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [rows, tab, search]);

  // Pattern-flagged items surface first within each open section -- they're a signal about the
  // topic as a whole, worth a look before routine one-off flags. Array.prototype.sort is stable,
  // so relative order (already created_at desc from listFeedback) is otherwise preserved.
  const byPatternFirst = (a: FeedbackRow, b: FeedbackRow) => Number(b.is_pattern_issue) - Number(a.is_pattern_issue);
  const newRows = filtered.filter(r => r.status === "new").sort(byPatternFirst);
  const queuedRows = filtered.filter(r => r.status === "queued").sort(byPatternFirst);
  const resolvedRows = filtered.filter(r => r.status === "done" || r.status === "dismissed");

  if (error) {
    return <div style={{ color: C.danger, fontSize: 13, fontWeight: 700 }}>{error}</div>;
  }
  if (rows === null) {
    return <div style={{ color: C.inkDim, fontSize: 13, fontWeight: 700 }}>Loading feedback…</div>;
  }

  const renderRow = (row: FeedbackRow, variant: "new" | "queued") => {
    const q = formatQuestionData(row.question_data);
    const topicId = topicValue(row.question_data);
    const topic = topicLabel(row.question_data);
    const canSearchContent = Boolean(!topicId && row.question_data && typeof row.question_data === "object" && primaryText(row.question_data as Record<string, unknown>) !== null);
    return (
      <div
        key={row.id}
        style={{
          background: row.is_pattern_issue ? "linear-gradient(180deg,rgba(139,92,246,0.08),transparent 40%)" : variant === "queued" ? "linear-gradient(180deg,rgba(245,158,11,0.06),transparent 40%)" : "linear-gradient(180deg,rgba(239,68,68,0.05),transparent 40%)",
          border: `1px solid ${row.is_pattern_issue ? "rgba(139,92,246,0.45)" : variant === "queued" ? "rgba(245,158,11,0.35)" : "rgba(239,68,68,0.35)"}`,
          borderRadius: 13, padding: "14px 16px", display: "flex", gap: 14,
        }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.12)" }}>
          {row.kind === "flag" ? "🚩" : "💬"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
            <button
              onClick={() => onSetPatternIssue(row.id, !row.is_pattern_issue)}
              title={row.is_pattern_issue ? "Unmark as a pattern issue" : "Mark this as a pattern affecting the whole topic/pool, not just this one prompt"}
              style={{
                fontSize: 10.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", borderRadius: 6, padding: "2px 7px",
                color: row.is_pattern_issue ? "#C4B5FD" : C.inkFaint,
                background: row.is_pattern_issue ? "rgba(139,92,246,0.16)" : "transparent",
                border: `1px solid ${row.is_pattern_issue ? "rgba(139,92,246,0.45)" : C.border}`,
              }}
            >
              ⚠ {row.is_pattern_issue ? "Pattern issue" : "Mark as pattern"}
            </button>
            {gameLabel(row.game_id) && (
              <span style={{ fontSize: 10.5, fontWeight: 800, color: C.warn, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 6, padding: "2px 7px" }}>
                {gameLabel(row.game_id)}
              </span>
            )}
            {topic ? (
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#93C5FD", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 6, padding: "2px 7px" }}>
                {topic}
              </span>
            ) : row.kind === "flag" && (
              // No sourceTopic on this row -- either a topic later removed from TOPIC_OPTIONS,
              // or content type this game doesn't tag (Minefield has no per-question content at
              // all to tag). Surfaced rather than just omitted, so it reads as "unknown", not
              // "this game has no topic concept."
              <span style={{ fontSize: 10.5, fontWeight: 700, color: C.inkFaint, fontStyle: "italic" }}>Topic unknown</span>
            )}
            <span style={{ fontSize: 11.5, color: C.inkDim, fontWeight: 700 }}>{row.display_name ?? "Unknown teacher"}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.inkFaint }} />
            <span style={{ fontSize: 11.5, color: C.inkFaint, fontWeight: 600 }}>{relativeTime(row.created_at)}</span>
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, margin: "0 0 7px", lineHeight: 1.4 }}>"{row.message}"</p>
          {q && <div style={{ background: "#0B1425", border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 11px", fontSize: 12, color: C.inkDim, lineHeight: 1.6 }}>{q}</div>}
          <AdminNoteEditor row={row} onSave={note => onSetAdminNote(row.id, note)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, flexShrink: 0, justifyContent: "center" }}>
          {topicId && (
            <button style={btnFix} onClick={() => onFixTopic(topicId, row.question_data)}>Fix this</button>
          )}
          {canSearchContent && (
            <button
              style={btnFix}
              disabled={searchState[row.id] === "busy"}
              onClick={() => handleFindInContent(row)}
            >
              {searchState[row.id] === "busy" ? "Searching…" : searchState[row.id] === "notfound" ? "Not found — try again?" : "Find in content"}
            </button>
          )}
          {variant === "new" ? (
            <button style={btnPrimary} onClick={() => onSetStatus(row.id, "queued")}>Queue for Claude</button>
          ) : (
            <button style={btnSuccess} onClick={() => onSetStatus(row.id, "done")}>Mark done</button>
          )}
          <button style={btnGhost} onClick={() => onSetStatus(row.id, "dismissed")}>Dismiss</button>
          <button
            style={btnGhost}
            onClick={() => {
              copyDetails(row);
              setCopiedId(row.id);
              setTimeout(() => setCopiedId(prev => (prev === row.id ? null : prev)), 1500);
            }}
          >
            {copiedId === row.id ? "Copied!" : "Copy details"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <AdminAutoFixActivity />

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ ...pillStyle, background: C.dangerBg, borderColor: "rgba(239,68,68,0.4)", color: "#FCA5A5" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
          {counts.newCount} new
        </span>
        <span style={{ ...pillStyle, background: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.4)", color: "#FCD34D" }}>
          {counts.queuedCount} queued for Claude
        </span>
        <span style={pillStyle}>{counts.doneCount} done</span>
        <span style={pillStyle}>{counts.dismissedCount} dismissed</span>
        <div style={{ flex: 1 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search feedback…"
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 12px", fontSize: 12, color: C.ink, width: 200, fontFamily: "inherit" }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "flag", "general", "pattern"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 14px", borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                color: tab === t ? (t === "pattern" ? "#C4B5FD" : C.ink) : C.inkDim,
                background: tab === t ? (t === "pattern" ? "rgba(139,92,246,0.14)" : C.surface2) : "none",
                border: `1px solid ${tab === t ? (t === "pattern" ? "rgba(139,92,246,0.4)" : C.border) : "transparent"}`,
              }}
            >
              {t === "all" ? "All" : t === "flag" ? "Flags" : t === "general" ? "General" : "Patterns"}{" "}
              <span style={{ opacity: 0.7, fontWeight: 700, marginLeft: 3 }}>{counts[t]}</span>
            </button>
          ))}
        </div>
      </div>

      {newRows.length > 0 && (
        <div style={{ fontSize: 11, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 -2px", display: "flex", alignItems: "center", gap: 8 }}>
          New — needs a look<div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
      )}
      {newRows.map(row => renderRow(row, "new"))}

      {queuedRows.length > 0 && (
        <div style={{ fontSize: 11, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 -2px", display: "flex", alignItems: "center", gap: 8 }}>
          Queued — waiting on a Claude session<div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
      )}
      {queuedRows.map(row => renderRow(row, "queued"))}

      {resolvedRows.length > 0 && (
        <div style={{ fontSize: 11, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 -2px", display: "flex", alignItems: "center", gap: 8 }}>
          Resolved<div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
      )}
      {resolvedRows.map(row => (
        <div key={row.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, opacity: 0.75 }}>
          <div style={{
            width: 18, height: 18, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0,
            background: row.status === "done" ? "#12241C" : "#241414",
            border: `1px solid ${row.status === "done" ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.3)"}`,
            color: row.status === "done" ? C.success : C.inkFaint,
          }}>
            {row.status === "done" ? "✓" : "✕"}
          </div>
          <div style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: C.inkDim }}>
            {gameLabel(row.game_id) ?? (row.kind === "general" ? "General" : "Feedback")} — <b style={{ color: C.ink, fontWeight: 800 }}>"{row.message}"</b>
            <span style={{ marginLeft: 8, fontWeight: 800, color: row.status === "done" ? C.success : C.inkFaint, fontSize: 11 }}>
              {row.status === "done" ? "Done" : "Dismissed"}
            </span>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ color: C.inkFaint, fontSize: 13, fontWeight: 700, textAlign: "center", padding: "40px 0" }}>Nothing here.</div>
      )}
    </>
  );
}
