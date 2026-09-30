import { useEffect, useState } from "react";
import { ADMIN_COLORS as C } from "./adminColors";
import {
  listContentSuggestions,
  setContentSuggestionStatus,
  setContentSuggestionAdminNote,
  type ContentSuggestion,
  type ContentSuggestionStatus,
} from "../../lib/adminContent";

function diffFields(original: unknown, proposed: unknown): { key: string; from: string; to: string }[] {
  if (!original || typeof original !== "object" || !proposed || typeof proposed !== "object") return [];
  const o = original as Record<string, unknown>;
  const p = proposed as Record<string, unknown>;
  const keys = new Set([...Object.keys(o), ...Object.keys(p)]);
  const changes: { key: string; from: string; to: string }[] = [];
  for (const key of keys) {
    const from = JSON.stringify(o[key]);
    const to = JSON.stringify(p[key]);
    if (from !== to) changes.push({ key, from: String(o[key] ?? ""), to: String(p[key] ?? "") });
  }
  return changes;
}

// Admin-only note editor, same idea as AdminFeedbackPanel's -- context a future Claude Code
// session (no memory of this triage) actually needs, since the app owner doesn't apply these
// himself.
function AdminNoteEditor({ row, onSave }: { row: ContentSuggestion; onSave: (note: string) => void }) {
  const [draft, setDraft] = useState(row.admin_note ?? "");
  const dirty = draft !== (row.admin_note ?? "");
  return (
    <div>
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="Admin note for whoever codes this (optional)…"
        rows={2}
        style={{ width: "100%", boxSizing: "border-box", background: "#0B1425", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 9px", fontSize: 12, color: C.ink, fontFamily: "inherit", resize: "vertical" }}
      />
      {dirty && (
        <button
          onClick={() => onSave(draft.trim())}
          style={{ marginTop: 6, border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 11px", fontSize: 11, fontWeight: 800, cursor: "pointer", background: C.surface2, color: C.inkDim, fontFamily: "inherit" }}
        >
          Save note
        </button>
      )}
    </div>
  );
}

// Nothing outside /admin ever reads content_suggestions — it's a personal draft queue, not a
// teacher-facing feature. "Queued" means the app owner has confirmed it's real and it's waiting
// for a Claude Code session to actually apply (the owner doesn't edit topics.ts himself); "Mark
// applied" only happens once that coding session has actually shipped it.
export function AdminContentSuggestions() {
  const [rows, setRows] = useState<ContentSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    listContentSuggestions()
      .then(setRows)
      .catch(err => setError(err instanceof Error ? err.message : "Couldn't load content suggestions."));
  };
  useEffect(refresh, []);

  const handleStatus = async (id: string, status: ContentSuggestionStatus) => {
    setRows(prev => prev?.map(r => (r.id === id ? { ...r, status } : r)) ?? prev);
    try {
      await setContentSuggestionStatus(id, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update that suggestion.");
      refresh();
    }
  };

  const handleAdminNote = async (id: string, note: string) => {
    setRows(prev => prev?.map(r => (r.id === id ? { ...r, admin_note: note || null } : r)) ?? prev);
    try {
      await setContentSuggestionAdminNote(id, note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that note.");
      refresh();
    }
  };

  if (error) return <div style={{ color: C.danger, fontSize: 13, fontWeight: 700 }}>{error}</div>;
  if (rows === null) return <div style={{ color: C.inkDim, fontSize: 13, fontWeight: 700 }}>Loading suggestions…</div>;
  if (rows.length === 0) return null;

  const pending = rows.filter(r => r.status === "new");
  const queued = rows.filter(r => r.status === "queued");
  const resolved = rows.filter(r => r.status === "applied" || r.status === "dismissed");

  const renderRow = (row: ContentSuggestion, variant: "new" | "queued") => {
    const changes = diffFields(row.original, row.proposed);
    return (
      <div key={row.id} style={{ background: "#0B1425", border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.warn }}>
          {row.topic_id} · {row.section}{row.item_index !== null ? ` #${row.item_index}` : ""}
        </div>
        {changes.length === 0 && <div style={{ fontSize: 12, color: C.inkFaint }}>No field changes — note only.</div>}
        {changes.map(c => (
          <div key={c.key} style={{ fontSize: 12, color: C.inkDim }}>
            <b style={{ color: C.inkFaint }}>{c.key}:</b>{" "}
            <span style={{ color: "#FCA5A5" }}>{c.from}</span> → <span style={{ color: "#86EFAC" }}>{c.to}</span>
          </div>
        ))}
        {row.note && <div style={{ fontSize: 12, color: C.ink, fontStyle: "italic" }}>"{row.note}"</div>}
        <AdminNoteEditor row={row} onSave={note => handleAdminNote(row.id, note)} />
        <div style={{ display: "flex", gap: 8 }}>
          {variant === "new" ? (
            <button
              onClick={() => handleStatus(row.id, "queued")}
              style={{ border: "none", borderRadius: 7, padding: "5px 11px", fontSize: 11, fontWeight: 800, cursor: "pointer", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", fontFamily: "inherit" }}
            >
              Queue for Claude
            </button>
          ) : (
            <button
              onClick={() => handleStatus(row.id, "applied")}
              style={{ border: "none", borderRadius: 7, padding: "5px 11px", fontSize: 11, fontWeight: 800, cursor: "pointer", background: "linear-gradient(135deg,#22C55E,#15803D)", color: "white", fontFamily: "inherit" }}
            >
              Mark applied
            </button>
          )}
          <button
            onClick={() => handleStatus(row.id, "dismissed")}
            style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 11px", fontSize: 11, fontWeight: 800, cursor: "pointer", background: C.surface2, color: C.inkDim, fontFamily: "inherit" }}
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>
        Content Suggestions
        {pending.length > 0 && <span style={{ color: C.warn }}> ({pending.length} new)</span>}
        {queued.length > 0 && <span style={{ color: "#FCD34D" }}> · {queued.length} queued</span>}
      </div>
      {pending.length === 0 && queued.length === 0 && <div style={{ color: C.inkFaint, fontSize: 12, fontWeight: 700 }}>No pending suggestions.</div>}
      {pending.map(row => renderRow(row, "new"))}
      {queued.map(row => renderRow(row, "queued"))}
      {resolved.length > 0 && (
        <div style={{ fontSize: 11, color: C.inkFaint, fontWeight: 700 }}>{resolved.length} resolved</div>
      )}
    </div>
  );
}
