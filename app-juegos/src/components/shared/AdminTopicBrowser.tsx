import { useEffect, useState } from "react";
import { ADMIN_COLORS as C } from "./adminColors";
import { createContentSuggestion } from "../../lib/adminContent";

// The actual question/prompt content lives in topics.ts's TOPIC_LIBRARY, ~5MB of source code kept
// out of every static bundle on purpose (see topics.ts's own header + LessonGamesGenerator.tsx's
// startGame()) — loaded here via the same dynamic import() pattern, only once a topic is actually
// opened in this browser, not on /admin load.
type TopicEntry = Record<string, unknown>;

// Every array-valued content section a topic can have (see the TopicLibraryEntry type in
// LessonGamesGenerator.tsx) — deliberately a fixed, known list rather than iterating every key on
// the entry, so label/level/category metadata never gets rendered as if it were content. Any
// OTHER array-valued key not in this list still shows up (see extraArraySections below), just
// under its raw key name — a safety net for a future content type, not something to special-case
// ahead of time.
const ARRAY_SECTIONS = ["questions", "cardTasks", "auctionSentences", "spyRounds", "hotSeatWords", "hotPotatoPrompts", "halfSentences"];
const SECTION_LABELS: Record<string, string> = {
  questions: "Questions", cardTasks: "Card Tasks (speaking)", auctionSentences: "Auction Sentences",
  spyRounds: "Spy Rounds", hotSeatWords: "Hot Seat Words", hotPotatoPrompts: "Hot Potato Prompts",
  halfSentences: "Half Sentences", minefieldGrid: "Minefield Grid",
};
const KNOWN_META_KEYS = new Set(["label", "level", "category", "focus", "order", "minefieldGrid", ...ARRAY_SECTIONS]);

function itemSummary(item: Record<string, unknown>): string {
  // "prompt" is hotPotatoPrompts' own field name (HotPotatoGame.tsx reads .prompt, not
  // .question) despite the shared TopicLibraryEntry type calling it QuestionData[] like every
  // other question-shaped pool. "word" is hotSeatWords' own field name — both rendered as a raw
  // JSON dump here until this was added.
  let primary: string | null = null;
  for (const key of ["question", "task", "sentence", "starter", "crewmatePrompt", "prompt", "topic", "word"]) {
    if (typeof item[key] === "string") { primary = item[key] as string; break; }
  }
  if (primary === null) return JSON.stringify(item).slice(0, 100);
  // Vault Heist "rewrite sentences" items deliberately reuse the same short `question` fragment
  // across several `transform` variants (e.g. "'wear a uniform'" → obligation/no-obligation/
  // prohibition, each a genuinely different item with a different answer) — showing only
  // `question` made those look like exact duplicates instead of three distinct items. Appending
  // the answer (what actually differs between them) disambiguates without a special case just
  // for this one type, since it helps any other question-shaped item too.
  if (typeof item.answer === "string" && item.answer && item.answer !== primary) {
    primary += ` → ${item.answer}`;
  }
  return primary;
}

function valueToInputValue(v: unknown): string {
  if (Array.isArray(v)) return v.join(" | ");
  if (typeof v === "boolean") return v ? "true" : "false";
  if (v === null || v === undefined) return "";
  return String(v);
}

function inputValueToValue(original: unknown, raw: string): unknown {
  if (Array.isArray(original)) return raw.split("|").map(s => s.trim()).filter(Boolean);
  if (typeof original === "boolean") return raw.trim().toLowerCase() === "true";
  if (typeof original === "number") {
    const n = Number(raw);
    return Number.isNaN(n) ? original : n;
  }
  return raw;
}

const fieldLabelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 3, fontSize: 11, fontWeight: 700, color: C.inkFaint };
const fieldInputStyle: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: C.ink, fontFamily: "inherit" };

function EditItemForm({ topicId, section, itemIndex, item, onDone, onCancel }: {
  topicId: string; section: string; itemIndex: number | null; item: Record<string, unknown>;
  onDone: () => void; onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(item).map(([k, v]) => [k, valueToInputValue(v)]))
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const proposed: Record<string, unknown> = {};
      for (const [k, raw] of Object.entries(values)) proposed[k] = inputValueToValue(item[k], raw);
      await createContentSuggestion({ topicId, section, itemIndex, original: item, proposed, note });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that suggestion.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: "#0B1425", border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginTop: 6, display: "flex", flexDirection: "column", gap: 8 }}>
      {Object.entries(item).map(([key, original]) => (
        <label key={key} style={fieldLabelStyle}>
          {key}{Array.isArray(original) ? " (separate with |)" : ""}
          <input
            value={values[key] ?? ""}
            onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
            style={fieldInputStyle}
          />
        </label>
      ))}
      <label style={fieldLabelStyle}>
        Note (why / what's wrong)
        <input value={note} onChange={e => setNote(e.target.value)} style={fieldInputStyle} />
      </label>
      {error && <div style={{ color: C.danger, fontSize: 11.5, fontWeight: 700 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{ border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 11.5, fontWeight: 800, cursor: "pointer", background: "linear-gradient(135deg,#0EA5E9,#0369A1)", color: "white", fontFamily: "inherit" }}
        >
          {saving ? "Saving…" : "Save suggestion"}
        </button>
        <button
          onClick={onCancel}
          style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", fontSize: 11.5, fontWeight: 800, cursor: "pointer", background: "none", color: C.inkDim, fontFamily: "inherit" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// minefieldGrid is the one item shape where the "primary text" isn't the whole story — its two
// label arrays (the actual grid content teachers care about reviewing, see CLAUDE.md's Minefield
// rules) would otherwise stay invisible behind itemSummary()'s single-line pick, only showing up
// once someone opens the edit form and notices a joined-by-" | " string in a plain text input.
function MinefieldGridDetail({ item }: { item: Record<string, unknown> }) {
  const colLabels = Array.isArray(item.colLabels) ? (item.colLabels as unknown[]) : [];
  const rowLabels = Array.isArray(item.rowLabels) ? (item.rowLabels as unknown[]) : [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4, marginBottom: 6 }}>
      {typeof item.instructions === "string" && item.instructions && (
        <div style={{ fontSize: 11.5, color: C.inkDim, fontStyle: "italic" }}>{item.instructions}</div>
      )}
      <div style={{ fontSize: 11, color: C.inkFaint, fontWeight: 800 }}>Column Labels ({colLabels.length})</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {colLabels.map((label, i) => (
          <span key={i} style={{ fontSize: 11.5, color: C.ink, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 8px" }}>{String(label)}</span>
        ))}
      </div>
      <div style={{ fontSize: 11, color: C.inkFaint, fontWeight: 800 }}>Row Labels ({rowLabels.length})</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {rowLabels.map((label, i) => (
          <span key={i} style={{ fontSize: 11.5, color: C.ink, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 8px" }}>{String(label)}</span>
        ))}
      </div>
    </div>
  );
}

// spyRounds items carry TWO separate prompts (the crewmate's real content and the spy's decoy),
// only one of which (crewmatePrompt) itemSummary() can show on a single line — without this, the
// spy's whole prompt was invisible in the admin panel no matter which topic you opened, making it
// impossible to review the "is the spy caught by topic, not by a different tense" rule from
// CLAUDE.md.
function SpyRoundDetail({ item }: { item: Record<string, unknown> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4, marginBottom: 6 }}>
      <div>
        <div style={{ fontSize: 10.5, color: "#86EFAC", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Crewmate — {String(item.crewmateTopic ?? "")}
        </div>
        <div style={{ fontSize: 12.5, color: C.ink }}>{String(item.crewmatePrompt ?? "")}</div>
      </div>
      <div>
        <div style={{ fontSize: 10.5, color: "#FCA5A5", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Spy — {String(item.spyTopic ?? "")}
        </div>
        <div style={{ fontSize: 12.5, color: C.ink }}>{String(item.spyPrompt ?? "")}</div>
      </div>
      {typeof item.explanation === "string" && item.explanation && (
        <div style={{ fontSize: 11.5, color: C.inkDim, fontStyle: "italic" }}>{item.explanation}</div>
      )}
    </div>
  );
}

function ItemRow({ topicId, section, itemIndex, item }: { topicId: string; section: string; itemIndex: number | null; item: Record<string, unknown> }) {
  const [editing, setEditing] = useState(false);
  const [done, setDone] = useState(false);
  const isMinefieldGrid = Array.isArray(item.colLabels) || Array.isArray(item.rowLabels);
  const isSpyRound = typeof item.crewmatePrompt === "string" && typeof item.spyPrompt === "string";
  return (
    <div style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}>
      {isMinefieldGrid && <MinefieldGridDetail item={item} />}
      {isSpyRound && <SpyRoundDetail item={item} />}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, fontSize: 12.5, color: C.ink, fontWeight: 600 }}>{isMinefieldGrid || isSpyRound ? null : itemSummary(item)}</div>
        {done ? (
          <span style={{ fontSize: 11, fontWeight: 800, color: "#86EFAC", flexShrink: 0 }}>Suggested ✓</span>
        ) : (
          <button
            onClick={() => setEditing(v => !v)}
            style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", background: C.surface2, color: C.inkDim, fontFamily: "inherit", flexShrink: 0 }}
          >
            {editing ? "Close" : "Suggest edit"}
          </button>
        )}
      </div>
      {editing && !done && (
        <EditItemForm
          topicId={topicId} section={section} itemIndex={itemIndex} item={item}
          onDone={() => { setEditing(false); setDone(true); }}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}

function CollapsibleSection({ label, count, open, onToggle, children }: {
  label: string; count: number; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.inkFaint }}>{count} {open ? "▲" : "▼"}</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export function AdminTopicBrowser({ topicId }: { topicId: string }) {
  const [entry, setEntry] = useState<TopicEntry | null | "error">(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setEntry(null);
    setExpanded(new Set());
    import("../../data/topics")
      .then(m => {
        const lib = m.TOPIC_LIBRARY as Record<string, TopicEntry>;
        setEntry(lib[topicId] ?? "error");
      })
      .catch(() => setEntry("error"));
  }, [topicId]);

  if (entry === null) return <div style={{ color: C.inkDim, fontSize: 13, fontWeight: 700, padding: "10px 0" }}>Loading topic content…</div>;
  if (entry === "error") return <div style={{ color: C.danger, fontSize: 13, fontWeight: 700, padding: "10px 0" }}>Couldn't load that topic's content.</div>;

  const extraArraySections = Object.keys(entry).filter(k => !KNOWN_META_KEYS.has(k) && Array.isArray(entry[k]));
  const allArraySections = [...ARRAY_SECTIONS, ...extraArraySections].filter(s => Array.isArray(entry[s]) && (entry[s] as unknown[]).length > 0);
  const hasMinefield = entry.minefieldGrid != null && typeof entry.minefieldGrid === "object";

  const toggle = (section: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(section)) next.delete(section); else next.add(section);
    return next;
  });

  if (allArraySections.length === 0 && !hasMinefield) {
    return <div style={{ color: C.inkFaint, fontSize: 13, fontWeight: 700, padding: "10px 0" }}>No recognizable content sections on this topic.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {allArraySections.map(section => {
        const items = (entry[section] as unknown[]).map((item, i) => ({ item: item as Record<string, unknown>, i }));
        // "questions" is the one pool every game reads by filtering on its own `type` (Battleship
        // wants "correct grammar mistakes", Vault Heist wants "rewrite sentences", etc.) — the
        // SAME design every game already relies on, not a storage mistake. Flat-listing it here
        // read as a jumble of unrelated content types; grouping by that same `type` field mirrors
        // how the games themselves already split it.
        if (section === "questions") {
          const groups = new Map<string, { item: Record<string, unknown>; i: number }[]>();
          for (const entryItem of items) {
            const type = typeof entryItem.item.type === "string" && entryItem.item.type ? entryItem.item.type : "other";
            if (!groups.has(type)) groups.set(type, []);
            groups.get(type)!.push(entryItem);
          }
          return [...groups.entries()].map(([type, groupItems]) => {
            const key = `questions:${type}`;
            const label = `Questions — ${type[0].toUpperCase()}${type.slice(1)}`;
            return (
              <CollapsibleSection key={key} label={label} count={groupItems.length} open={expanded.has(key)} onToggle={() => toggle(key)}>
                {groupItems.map(({ item, i }) => (
                  <ItemRow key={i} topicId={topicId} section={section} itemIndex={i} item={item} />
                ))}
              </CollapsibleSection>
            );
          });
        }
        return (
          <CollapsibleSection key={section} label={SECTION_LABELS[section] ?? section} count={items.length} open={expanded.has(section)} onToggle={() => toggle(section)}>
            {items.map(({ item, i }) => (
              <ItemRow key={i} topicId={topicId} section={section} itemIndex={i} item={item} />
            ))}
          </CollapsibleSection>
        );
      })}
      {hasMinefield && (
        <CollapsibleSection label="Minefield Grid" count={1} open={expanded.has("minefieldGrid")} onToggle={() => toggle("minefieldGrid")}>
          <ItemRow topicId={topicId} section="minefieldGrid" itemIndex={null} item={entry.minefieldGrid as Record<string, unknown>} />
        </CollapsibleSection>
      )}
    </div>
  );
}
