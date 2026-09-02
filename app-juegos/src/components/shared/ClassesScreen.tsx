import { useEffect, useState } from "react";
import { TeamIcon } from "./TeamIcon";
import type { SavedClass } from "../../types";
import { TEAM_COLORS, GAME_MODES, LEVELS_META, FREE_PLAN_LIMITS } from "../../data/constants";
import { listClasses, createClass, deleteClass, setLeaderboardVisibility } from "../../lib/classes";
import { hexToRgba, type Theme } from "../../data/themes";
import { Icon } from "./Icon";

type Props = {
  onBack: () => void;
  onResumeClass: (savedClass: SavedClass) => void;
  onStartWithClass: (savedClass: SavedClass) => void;
  theme: Theme;
  isPaid: boolean;
  onUpgrade: () => void;
};

const gameLabel = (gameId: string | null) => GAME_MODES.find(g => g.id === gameId)?.name ?? gameId ?? "a game";

export function ClassesScreen({ onBack, onResumeClass, onStartWithClass, theme, isPaid, onUpgrade }: Props) {
  const [classes, setClasses] = useState<SavedClass[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [newLevel, setNewLevel] = useState("all");
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
      const created = await createClass(newName.trim(), newSchool.trim() || null, newLevel === "all" ? null : newLevel);
      setNewName("");
      setNewSchool("");
      setNewLevel("all");
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

  const handleToggleLeaderboard = async (cls: SavedClass) => {
    const nextHidden = !cls.hide_from_leaderboard;
    setClasses(prev => prev?.map(c => (c.id === cls.id ? { ...c, hide_from_leaderboard: nextHidden } : c)) ?? prev);
    try {
      await setLeaderboardVisibility(cls.id, nextHidden);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update Leaderboard visibility.");
      refresh();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="back" size={13} /> Back</button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "900", color: theme.heroBg[0], margin: 0, fontFamily: theme.headingFont, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><Icon name="books" size={26} /> My Classes</h2>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>Team scores carry over each time you return to a class. Pick one up where you left off, or start a fresh game with the same roster.</p>
        </div>

        {!isPaid && classes !== null && classes.length >= FREE_PLAN_LIMITS.maxClasses ? (
          <div style={{ background: "white", border: "2px dashed #93C5FD", borderRadius: "12px", padding: "16px", marginBottom: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "14px", color: "#374151", fontWeight: "700", marginBottom: "10px" }}>Free plan is limited to {FREE_PLAN_LIMITS.maxClasses} class. Upgrade for unlimited classes.</div>
            <button
              onClick={onUpgrade}
              style={{ background: `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: "white", border: "none", borderRadius: "12px", padding: "10px 20px", fontWeight: "800", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Icon name="gem" size={14} /> Upgrade
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input
              value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Tuesday B2 Advanced"
              style={{ flex: "2 1 200px", padding: "12px 14px", borderRadius: "12px", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, fontSize: "14px" }}
            />
            <input
              value={newSchool} onChange={e => setNewSchool(e.target.value)} placeholder="School (optional)"
              style={{ flex: "1 1 140px", padding: "12px 14px", borderRadius: "12px", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, fontSize: "14px" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", width: "100%" }}>
              <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "700", marginRight: "2px" }}>Level:</span>
              {LEVELS_META.map(l => (
                <button
                  key={l.id} type="button" onClick={() => setNewLevel(l.id)}
                  style={{
                    background: newLevel === l.id ? l.color : "white",
                    color: newLevel === l.id ? "white" : "#374151",
                    border: `2px solid ${newLevel === l.id ? l.color : hexToRgba(theme.accentSolid, 0.25)}`,
                    borderRadius: "8px", padding: "5px 10px", cursor: "pointer", fontWeight: "700", fontSize: "12px",
                  }}
                >
                  {l.id === "all" ? "Any" : l.id}
                </button>
              ))}
            </div>
            <button
              type="submit" disabled={creating || !newName.trim()}
              style={{ background: `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: "white", border: "none", borderRadius: "12px", padding: "12px 20px", fontWeight: "800", cursor: creating ? "default" : "pointer", opacity: creating || !newName.trim() ? 0.6 : 1, whiteSpace: "nowrap", fontFamily: theme.headingFont }}
            >
              + New Class
            </button>
          </form>
        )}

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
                    {(cls.school || cls.default_level) && (
                      <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: "600", marginTop: "2px" }}>
                        {cls.school && <><Icon name="school" size={12} /> {cls.school}</>}
                        {cls.school && cls.default_level && " · "}
                        {cls.default_level && <><Icon name="chart" size={12} /> {cls.default_level}</>}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => handleToggleLeaderboard(cls)}
                      title={cls.hide_from_leaderboard ? "Hidden from Leaderboard — click to show" : "Visible on Leaderboard — click to hide"}
                      style={{ background: "none", border: "none", color: cls.hide_from_leaderboard ? "#D1D5DB" : "#9CA3AF", cursor: "pointer", padding: "2px 4px", display: "inline-flex" }}
                    >
                      <Icon name={cls.hide_from_leaderboard ? "eyeOff" : "eye"} size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id)} title="Delete class"
                      style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", padding: "2px 4px", display: "inline-flex" }}
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>

                {cls.teams.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                    {cls.teams.map(t => (
                      <span key={t.id} style={{ background: t.color?.light ?? TEAM_COLORS[0].light, color: t.color?.dark ?? TEAM_COLORS[0].dark, borderRadius: "8px", padding: "4px 10px", fontSize: "12px", fontWeight: "700" }}>
                        <TeamIcon team={t} /> {t.name}: {t.score}
                      </span>
                    ))}
                  </div>
                )}
                {(() => {
                  // team_roster accumulates every team ever played under this class; `teams` is
                  // only whichever subset was active last session. A roster entry not in that
                  // subset (e.g. sat out the last game) still belongs on this card — just without
                  // a score to show, and visually muted so it doesn't read as part of that score.
                  const activeNames = new Set(cls.teams.map(t => t.name));
                  const benched = cls.team_roster.filter(r => !activeNames.has(r.name));
                  if (benched.length === 0) return null;
                  return (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginTop: cls.teams.length > 0 ? "6px" : "10px" }}>
                      <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "700" }}>Also saved:</span>
                      {benched.map(r => (
                        <span key={r.id} style={{ background: "#F9FAFB", color: "#9CA3AF", border: "1px dashed #D1D5DB", borderRadius: "8px", padding: "4px 10px", fontSize: "12px", fontWeight: "700" }}>
                          <TeamIcon team={r} /> {r.name}
                        </span>
                      ))}
                    </div>
                  );
                })()}

                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  {cls.in_progress && (
                    <button
                      onClick={() => onResumeClass(cls)}
                      style={{ background: `linear-gradient(135deg,${theme.cta[0]},${theme.cta[1]})`, color: "white", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <Icon name="play" size={13} /> Resume {gameLabel(cls.selected_game)}
                    </button>
                  )}
                  <button
                    onClick={() => onStartWithClass(cls)}
                    style={{ background: cls.in_progress ? hexToRgba(theme.accentSolid, 0.12) : `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: cls.in_progress ? theme.accentSolid : "white", border: cls.in_progress ? `2px solid ${hexToRgba(theme.accentSolid, 0.4)}` : "none", borderRadius: "10px", padding: "10px 16px", fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Icon name="plus" size={12} /> Start New Game
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
