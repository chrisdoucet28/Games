import { useEffect, useState } from "react";
import type { SavedClass } from "../../types";
import { TEAM_COLORS, GAME_MODES } from "../../data/constants";
import { listClasses, createClass, deleteClass } from "../../lib/classes";
import { hexToRgba, type Theme } from "../../data/themes";

type Props = {
  onBack: () => void;
  onResumeClass: (savedClass: SavedClass) => void;
  onStartWithClass: (savedClass: SavedClass) => void;
  theme: Theme;
};

const gameLabel = (gameId: string | null) => GAME_MODES.find(g => g.id === gameId)?.name ?? gameId ?? "a game";

export function ClassesScreen({ onBack, onResumeClass, onStartWithClass, theme }: Props) {
  const [classes, setClasses] = useState<SavedClass[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [creating, setCreating] = useState(false);

  const refresh = () => {
    listClasses()
      .then(setClasses)
      .catch(err => setError(err instanceof Error ? err.message : "Couldn't load your classes."));
  };

  useEffect(refresh, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const created = await createClass(newName.trim(), newSchool.trim() || null);
      setNewName("");
      setNewSchool("");
      setClasses(prev => (prev ? [created, ...prev] : [created]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the class.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setClasses(prev => prev?.filter(c => c.id !== id) ?? prev);
    try {
      await deleteClass(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete the class.");
      refresh();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px", fontFamily: theme.headingFont }}>← Back</button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "900", color: theme.heroBg[0], margin: 0, fontFamily: theme.headingFont }}>📚 My Classes</h2>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>Team scores carry over each time you return to a class. Pick one up where you left off, or start a fresh game with the same roster.</p>
        </div>

        <form onSubmit={handleCreate} style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          <input
            value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Tuesday B2 Advanced"
            style={{ flex: "2 1 200px", padding: "12px 14px", borderRadius: "12px", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, fontSize: "14px" }}
          />
          <input
            value={newSchool} onChange={e => setNewSchool(e.target.value)} placeholder="School (optional)"
            style={{ flex: "1 1 140px", padding: "12px 14px", borderRadius: "12px", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, fontSize: "14px" }}
          />
          <button
            type="submit" disabled={creating || !newName.trim()}
            style={{ background: `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: "white", border: "none", borderRadius: "12px", padding: "12px 20px", fontWeight: "800", cursor: creating ? "default" : "pointer", opacity: creating || !newName.trim() ? 0.6 : 1, whiteSpace: "nowrap", fontFamily: theme.headingFont }}
          >
            + New Class
          </button>
        </form>

        {error && (
          <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" }}>{error}</div>
        )}

        {classes === null ? (
          <div style={{ textAlign: "center", color: "#6B7280", padding: "40px 0" }}>Loading your classes…</div>
        ) : classes.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6B7280", padding: "40px 0" }}>No classes yet — create one above to get started.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {classes.map(cls => (
              <div key={cls.id} style={{ background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "16px", padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div>
                    <div style={{ fontWeight: "900", fontSize: "17px", color: "#1E1B4B", fontFamily: theme.headingFont }}>{cls.name}</div>
                    {cls.school && <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: "600", marginTop: "2px" }}>🏫 {cls.school}</div>}
                  </div>
                  <button
                    onClick={() => handleDelete(cls.id)} title="Delete class"
                    style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "14px", padding: "2px 4px" }}
                  >
                    🗑️
                  </button>
                </div>

                {cls.teams.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "10px 0" }}>
                    {cls.teams.map(t => (
                      <span key={t.id} style={{ background: t.color?.light ?? TEAM_COLORS[0].light, color: t.color?.dark ?? TEAM_COLORS[0].dark, borderRadius: "8px", padding: "4px 10px", fontSize: "12px", fontWeight: "700" }}>
                        {t.mascot ?? t.color?.emoji} {t.name}: {t.score}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  {cls.in_progress && (
                    <button
                      onClick={() => onResumeClass(cls)}
                      style={{ background: `linear-gradient(135deg,${theme.cta[0]},${theme.cta[1]})`, color: "white", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: theme.headingFont }}
                    >
                      ▶️ Resume {gameLabel(cls.selected_game)}
                    </button>
                  )}
                  <button
                    onClick={() => onStartWithClass(cls)}
                    style={{ background: cls.in_progress ? hexToRgba(theme.accentSolid, 0.12) : `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: cls.in_progress ? theme.accentSolid : "white", border: cls.in_progress ? `2px solid ${hexToRgba(theme.accentSolid, 0.4)}` : "none", borderRadius: "10px", padding: "10px 16px", fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: theme.headingFont }}
                  >
                    🆕 Start New Game
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
