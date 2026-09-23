import { useMemo, useState } from "react";
import { ADMIN_COLORS as C } from "./adminColors";
import { GAME_MODES } from "../../data/constants";
import type { FeedbackRow } from "../../lib/adminFeedback";

type Tab = "all" | "flag" | "general";

const gameLabel = (gameId: string | null) => {
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

function formatQuestionData(data: unknown): string | null {
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

function copyDetails(row: FeedbackRow) {
  const parts = [
    `Game: ${gameLabel(row.game_id) ?? "—"}`,
    `Message: ${row.message}`,
  ];
  const q = formatQuestionData(row.question_data);
  if (q) parts.push(`Question: ${q}`);
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
const btnGhost: React.CSSProperties = {
  border: `1px solid ${C.border}`, borderRadius: 9, padding: "7px 13px", fontSize: 11.5, fontWeight: 800, cursor: "pointer",
  whiteSpace: "nowrap", fontFamily: "inherit", background: C.surface2, color: C.inkDim,
};

type Props = {
  rows: FeedbackRow[] | null;
  error: string | null;
  onMarkReviewed: (id: string) => void;
};

export function AdminFeedbackPanel({ rows, error, onMarkReviewed }: Props) {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const all = rows ?? [];
    return {
      all: all.length,
      flag: all.filter(r => r.kind === "flag").length,
      general: all.filter(r => r.kind === "general").length,
      newCount: all.filter(r => r.status === "new").length,
      reviewedFlags: all.filter(r => r.kind === "flag" && r.status === "reviewed").length,
      reviewedGeneral: all.filter(r => r.kind === "general" && r.status === "reviewed").length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const all = rows ?? [];
    const term = search.trim().toLowerCase();
    return all.filter(r => {
      if (tab !== "all" && r.kind !== tab) return false;
      if (!term) return true;
      const haystack = [r.message, gameLabel(r.game_id) ?? "", r.display_name ?? "", formatQuestionData(r.question_data) ?? ""].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [rows, tab, search]);

  const newRows = filtered.filter(r => r.status === "new");
  const reviewedRows = filtered.filter(r => r.status === "reviewed");

  if (error) {
    return <div style={{ color: C.danger, fontSize: 13, fontWeight: 700 }}>{error}</div>;
  }
  if (rows === null) {
    return <div style={{ color: C.inkDim, fontSize: 13, fontWeight: 700 }}>Loading feedback…</div>;
  }

  return (
    <>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ ...pillStyle, background: C.dangerBg, borderColor: "rgba(239,68,68,0.4)", color: "#FCA5A5" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
          {counts.newCount} new, unreviewed
        </span>
        <span style={pillStyle}>{counts.reviewedFlags} flags reviewed</span>
        <span style={pillStyle}>{counts.reviewedGeneral} general reviewed</span>
        <div style={{ flex: 1 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search feedback…"
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 12px", fontSize: 12, color: C.ink, width: 200, fontFamily: "inherit" }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "flag", "general"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 14px", borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                color: tab === t ? C.ink : C.inkDim,
                background: tab === t ? C.surface2 : "none",
                border: `1px solid ${tab === t ? C.border : "transparent"}`,
              }}
            >
              {t === "all" ? "All" : t === "flag" ? "Flags" : "General"}{" "}
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
      {newRows.map(row => {
        const q = formatQuestionData(row.question_data);
        return (
          <div key={row.id} style={{ background: "linear-gradient(180deg,rgba(239,68,68,0.05),transparent 40%)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 13, padding: "14px 16px", display: "flex", gap: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.12)" }}>
              {row.kind === "flag" ? "🚩" : "💬"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                {gameLabel(row.game_id) && (
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: C.warn, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 6, padding: "2px 7px" }}>
                    {gameLabel(row.game_id)}
                  </span>
                )}
                <span style={{ fontSize: 11.5, color: C.inkDim, fontWeight: 700 }}>{row.display_name ?? "Unknown teacher"}</span>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.inkFaint }} />
                <span style={{ fontSize: 11.5, color: C.inkFaint, fontWeight: 600 }}>{relativeTime(row.created_at)}</span>
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, margin: "0 0 7px", lineHeight: 1.4 }}>"{row.message}"</p>
              {q && <div style={{ background: "#0B1425", border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 11px", fontSize: 12, color: C.inkDim, lineHeight: 1.6 }}>{q}</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, flexShrink: 0, justifyContent: "center" }}>
              <button style={btnPrimary} onClick={() => onMarkReviewed(row.id)}>Mark reviewed</button>
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
      })}

      {reviewedRows.length > 0 && (
        <div style={{ fontSize: 11, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 -2px", display: "flex", alignItems: "center", gap: 8 }}>
          Reviewed<div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
      )}
      {reviewedRows.map(row => (
        <div key={row.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, opacity: 0.75 }}>
          <div style={{ width: 18, height: 18, borderRadius: 6, background: "#12241C", border: "1px solid rgba(34,197,94,0.4)", color: C.success, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }}>✓</div>
          <div style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: C.inkDim }}>
            {gameLabel(row.game_id) ?? (row.kind === "general" ? "General" : "Feedback")} — <b style={{ color: C.ink, fontWeight: 800 }}>"{row.message}"</b>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ color: C.inkFaint, fontSize: 13, fontWeight: 700, textAlign: "center", padding: "40px 0" }}>Nothing here.</div>
      )}
    </>
  );
}
