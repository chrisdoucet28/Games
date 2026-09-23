import { useMemo, useState } from "react";
import { ADMIN_COLORS as C } from "./adminColors";
import { TOPIC_OPTIONS } from "../../data/topicOptions";
import { LESSONS } from "../../data/lessons";
import { LEVEL_ORDER, LEVEL_COLOR, FOCUS_ORDER, FOCUS_LABEL, matchesTopicSearch } from "../../data/learnTopics";
import { AdminTopicBrowser } from "./AdminTopicBrowser";
import { AdminContentSuggestions } from "./AdminContentSuggestions";

// Purely client-side over data already bundled into the app (topicOptions.ts's lightweight
// metadata + lessons.ts) — deliberately never imports the full topics.ts (~25k lines / ~5MB of
// question content) just to show this list. See the Learn/game content parity rule in CLAUDE.md —
// this view exists to make that gap visible without running a script.
const REAL_TOPICS = TOPIC_OPTIONS.filter(t => t.level && t.focus);

export function AdminContentPanel() {
  const [level, setLevel] = useState<string>("all");
  const [focus, setFocus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  // Lessons that exist but point at a topic id no longer in TOPIC_OPTIONS — the other direction of
  // drift the per-row ✓/✗ column below can't show on its own.
  const orphanLessons = useMemo(() => {
    const topicValues = new Set(TOPIC_OPTIONS.map(t => t.value));
    return Object.keys(LESSONS).filter(id => !topicValues.has(id));
  }, []);

  const missingLessons = useMemo(() => REAL_TOPICS.filter(t => !LESSONS[t.value]), []);

  const filtered = useMemo(() => {
    return REAL_TOPICS.filter(t => {
      if (level !== "all" && t.level !== level) return false;
      if (focus !== "all" && t.focus !== focus) return false;
      if (!matchesTopicSearch(t.label, search)) return false;
      return true;
    }).sort((a, b) => {
      const la = LEVEL_ORDER.indexOf(a.level ?? "");
      const lb = LEVEL_ORDER.indexOf(b.level ?? "");
      if (la !== lb) return la - lb;
      const fa = FOCUS_ORDER.indexOf(a.focus ?? "");
      const fb = FOCUS_ORDER.indexOf(b.focus ?? "");
      if (fa !== fb) return fa - fb;
      return a.label.localeCompare(b.label);
    });
  }, [level, focus, search]);

  return (
    <>
      <AdminContentSuggestions />

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11.5, fontWeight: 800, padding: "6px 11px", borderRadius: 999, border: `1px solid ${C.border}`, color: C.inkDim }}>
          {REAL_TOPICS.length} topics
        </span>
        {missingLessons.length > 0 ? (
          <span style={{ fontSize: 11.5, fontWeight: 800, padding: "6px 11px", borderRadius: 999, border: "1px solid rgba(239,68,68,0.4)", color: "#FCA5A5", background: C.dangerBg }}>
            {missingLessons.length} missing a Learn lesson
          </span>
        ) : (
          <span style={{ fontSize: 11.5, fontWeight: 800, padding: "6px 11px", borderRadius: 999, border: "1px solid rgba(34,197,94,0.4)", color: "#86EFAC" }}>
            All topics have a Learn lesson
          </span>
        )}
        {orphanLessons.length > 0 && (
          <span style={{ fontSize: 11.5, fontWeight: 800, padding: "6px 11px", borderRadius: 999, border: "1px solid rgba(239,68,68,0.4)", color: "#FCA5A5", background: C.dangerBg }}>
            {orphanLessons.length} lesson{orphanLessons.length === 1 ? "" : "s"} with no matching topic ({orphanLessons.join(", ")})
          </span>
        )}
        <div style={{ flex: 1 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search topics…"
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 12px", fontSize: 12, color: C.ink, width: 200, fontFamily: "inherit" }}
        />
        <select
          value={level}
          onChange={e => setLevel(e.target.value)}
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 10px", fontSize: 12, color: C.ink, fontFamily: "inherit" }}
        >
          <option value="all">All levels</option>
          {LEVEL_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select
          value={focus}
          onChange={e => setFocus(e.target.value)}
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 10px", fontSize: 12, color: C.ink, fontFamily: "inherit" }}
        >
          <option value="all">All focuses</option>
          {FOCUS_ORDER.map(f => <option key={f} value={f}>{FOCUS_LABEL[f]}</option>)}
        </select>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 120px 90px 110px", padding: "10px 16px", fontSize: 10.5, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${C.border}` }}>
          <div>Topic</div><div>Level</div><div>Focus</div><div>Learn</div><div>Content</div>
        </div>
        {filtered.map(t => {
          const open = openTopic === t.value;
          return (
            <div key={t.value} style={{ borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 120px 90px 110px", padding: "10px 16px", fontSize: 12.5, fontWeight: 700, alignItems: "center" }}>
                <div style={{ color: C.ink }}>{t.label}</div>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: LEVEL_COLOR[t.level ?? ""] ?? C.inkDim, border: `1px solid ${LEVEL_COLOR[t.level ?? ""] ?? C.border}55`, borderRadius: 6, padding: "2px 7px" }}>
                    {t.level}
                  </span>
                </div>
                <div style={{ color: C.inkDim }}>{FOCUS_LABEL[t.focus ?? ""] ?? t.focus}</div>
                <div>{LESSONS[t.value] ? <span style={{ color: "#86EFAC" }}>✓ Yes</span> : <span style={{ color: "#FCA5A5" }}>✗ Missing</span>}</div>
                <div>
                  <button
                    onClick={() => setOpenTopic(open ? null : t.value)}
                    style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", background: open ? C.surface3 : C.surface2, color: open ? C.ink : C.inkDim, fontFamily: "inherit" }}
                  >
                    {open ? "Close" : "Browse"}
                  </button>
                </div>
              </div>
              {open && (
                <div style={{ padding: "0 16px 16px" }}>
                  <AdminTopicBrowser topicId={t.value} />
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ color: C.inkFaint, fontSize: 13, fontWeight: 700, textAlign: "center", padding: "30px 0" }}>No topics match.</div>
        )}
      </div>
    </>
  );
}
