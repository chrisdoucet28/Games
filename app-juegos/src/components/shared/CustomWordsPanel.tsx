import { useMemo, useState } from "react";
import { parseWordList, loadSavedWords, saveWords, clearSavedWords, MAX_WORDS, MAX_WORD_LENGTH } from "../../lib/customWords";
import { WORD_PACKS } from "../../data/wordPacks";

// The "Use my own words" box on the intro screen of every word-list game (Hot Seat, Word Relay, and
// any vocabulary game added later — see hooks/useWordDeck.ts for the game-side half). A teacher types
// or pastes words separated by commas / semicolons / new lines; the box shows what it understood
// before anything is applied, and only "Use these words" changes the game. The last list is
// remembered on this computer and pre-fills the box next time — never applied automatically.
// Suggested packs (data/wordPacks.ts) appear as one-tap chips whenever any exist.

type Theme = {
  // Text colour for headings/labels and the button outline on the game's dark arena.
  accent: string;
  // Solid fill for the main button (white text on it).
  accentSolid: string;
};

type Props = {
  theme: Theme;
  // Number of teams — only used for the "add a few more words" tip.
  teamCount: number;
  // Fewer words than this and the tip appears (Hot Seat cycles words all game; Relay deals one per team).
  tipBelow: number;
  // The list the game is currently playing, or null while it plays the topic's words.
  active: string[] | null;
  onApply: (words: string[]) => void;
  onReset: () => void;
};

export function CustomWordsPanel({ theme, teamCount, tipBelow, active, onApply, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => loadSavedWords() || (active ? active.join(", ") : ""));
  const parsed = useMemo(() => parseWordList(text), [text]);

  const boxStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)", border: `2px solid ${theme.accent}44`, borderRadius: "14px",
    padding: "14px", textAlign: "left", color: "white",
  };
  const smallBtn: React.CSSProperties = {
    background: "rgba(255,255,255,0.08)", color: theme.accent, border: `2px solid ${theme.accent}66`, borderRadius: "10px",
    padding: "7px 14px", fontSize: "13px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
  };

  const apply = () => {
    if (parsed.words.length === 0) return;
    saveWords(text);
    onApply(parsed.words);
    setOpen(false);
  };

  // Applied and collapsed: just a chip, with a way back in.
  if (active && !open) {
    return (
      <div style={{ ...boxStyle, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        <span style={{ fontWeight: 800, fontSize: "14px", color: theme.accent }}>✓ Playing with your own {active.length} word{active.length === 1 ? "" : "s"}</span>
        <span style={{ display: "inline-flex", gap: "8px" }}>
          <button type="button" onClick={() => setOpen(true)} style={smallBtn}>Edit</button>
          <button type="button" onClick={onReset} style={smallBtn}>Use topic words</button>
        </span>
      </div>
    );
  }

  if (!open) {
    return (
      <div style={{ marginBottom: "20px" }}>
        <button type="button" onClick={() => setOpen(true)} style={smallBtn}>Use my own words</button>
      </div>
    );
  }

  const tooFew = parsed.words.length > 0 && parsed.words.length < tipBelow;
  const notes = [
    parsed.duplicates > 0 ? `${parsed.duplicates} duplicate${parsed.duplicates === 1 ? "" : "s"} removed` : null,
    parsed.tooLong > 0 ? `${parsed.tooLong} too long (over ${MAX_WORD_LENGTH} characters), skipped` : null,
    parsed.capped ? `only the first ${MAX_WORDS} words are used` : null,
  ].filter((n): n is string => n !== null);

  return (
    <div style={{ ...boxStyle, marginBottom: "20px" }}>
      <label htmlFor="custom-words-input" style={{ display: "block", fontWeight: 900, fontSize: "15px", color: theme.accent, marginBottom: "4px" }}>
        Your own words
      </label>
      <div style={{ fontSize: "12.5px", opacity: 0.85, lineHeight: 1.5, marginBottom: "8px" }}>
        Type or paste them, separated by commas or new lines. Names and phrases are fine (e.g. "Taylor Swift", "look after").
      </div>

      {WORD_PACKS.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 800, opacity: 0.85 }}>Suggested packs:</span>
          {WORD_PACKS.map(p => (
            <button key={p.id} type="button" onClick={() => setText(p.words.join(", "))} style={{ ...smallBtn, padding: "4px 10px", fontSize: "12px" }}>
              {p.name}
            </button>
          ))}
        </div>
      )}

      <textarea
        id="custom-words-input" value={text} onChange={e => setText(e.target.value)} rows={5} maxLength={8000}
        placeholder="e.g. apple, look after, in charge of, Taylor Swift"
        style={{ width: "100%", boxSizing: "border-box", background: "rgba(0,0,0,0.35)", color: "white", border: `2px solid ${theme.accent}55`, borderRadius: "10px", padding: "10px 12px", fontSize: "15px", lineHeight: 1.5, fontFamily: "inherit", resize: "vertical" }}
      />

      <div role="status" style={{ marginTop: "8px", fontSize: "13px", lineHeight: 1.5 }}>
        <strong style={{ color: theme.accent }}>{parsed.words.length} word{parsed.words.length === 1 ? "" : "s"} ready</strong>
        {notes.length > 0 && <span style={{ opacity: 0.8 }}> · {notes.join(" · ")}</span>}
        {parsed.words.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
            {parsed.words.slice(0, 12).map(w => (
              <span key={w} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "999px", padding: "2px 10px", fontSize: "12px", fontWeight: 700 }}>{w}</span>
            ))}
            {parsed.words.length > 12 && <span style={{ fontSize: "12px", opacity: 0.75, padding: "2px 4px" }}>+{parsed.words.length - 12} more</span>}
          </div>
        )}
        {tooFew && (
          <div style={{ marginTop: "6px", color: "#FDE68A", fontSize: "12.5px" }}>
            Tip: with {teamCount} team{teamCount === 1 ? "" : "s"} it plays best with at least {tipBelow} words — a shorter list just repeats sooner.
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
        <button
          type="button" onClick={apply} disabled={parsed.words.length === 0}
          style={{ background: parsed.words.length === 0 ? "#475569" : theme.accentSolid, color: "white", border: "2px solid #1A1A2E", borderRadius: "10px", padding: "9px 18px", fontSize: "14px", fontWeight: 900, cursor: parsed.words.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >
          Use these words
        </button>
        <button type="button" onClick={() => { setOpen(false); if (active) onReset(); }} style={smallBtn}>
          {active ? "Back to topic words" : "Cancel"}
        </button>
        <button type="button" onClick={() => { clearSavedWords(); setText(""); }} style={{ ...smallBtn, marginLeft: "auto", opacity: 0.8 }}>
          Clear saved list
        </button>
      </div>
    </div>
  );
}
