import { useEffect, useState } from "react";
import { TeamIcon } from "./TeamIcon";
import type { SavedClass } from "../../types";
import { TEAM_COLORS, GAME_MODES, LEVELS_META, FREE_PLAN_LIMITS } from "../../data/constants";
import { listClasses, createClass } from "../../lib/classes";
import { hexToRgba, type Theme } from "../../data/themes";
import { Icon } from "./Icon";

const gameLabel = (gameId: string | null) => {
  if (!gameId) return "a game";
  return GAME_MODES.find(g => g.id === gameId)?.name ?? "an unavailable game";
};

type Props = {
  onBack: () => void;
  onResumeClass: (savedClass: SavedClass) => void;
  onStartWithClass: (savedClass: SavedClass) => void;
  onSkip: () => void;
  theme: Theme;
  isPaid: boolean;
  onUpgrade: () => void;
};

// Reached from Welcome's "Start a Game"/"Lesson Plans" buttons (authenticated teachers only —
// anonymous explorers skip straight past this, same as before, since they can't have any saved
// classes). The teacher picks which class this session is for before anything else, so a class
// with an unfinished game gets its own explicit "Resume" choice right here -- not just on My
// Classes, which a teacher using the app day-to-day may never think to open. Intentionally always
// shows the list (never auto-skips a single class) so the experience is the same and predictable
// whether a teacher has one class or several.
export function ChooseClassScreen({ onBack, onResumeClass, onStartWithClass, onSkip, theme, isPaid, onUpgrade }: Props) {
  const [classes, setClasses] = useState<SavedClass[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [newLevel, setNewLevel] = useState("all");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    listClasses()
      .then(setClasses)
      .catch(err => setError(err instanceof Error ? err.message : "Couldn't load your classes."));
  }, []);

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

  const atFreeLimit = !isPaid && classes !== null && classes.length >= FREE_PLAN_LIMITS.maxClasses;

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="back" size={13} /> Back</button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "26px", fontWeight: "900", color: theme.heroBg[0], margin: 0, fontFamily: theme.headingFont }}>Which class is this for?</h2>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>Pick a class to bring in its team roster — and pick up any unfinished game right where you left it.</p>
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" }}>{error}</div>
        )}

        {classes === null ? (
          <div style={{ textAlign: "center", color: "#6B7280", padding: "40px 0" }}>Loading your classes…</div>
        ) : (
          <>
            {classes.length === 0 && (
              <div style={{ textAlign: "center", color: "#6B7280", padding: "20px 0" }}>No classes yet — create one below, or skip and just play.</div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {classes.map(cls => (
                <div key={cls.id} style={{ background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "16px", padding: "16px 18px" }}>
                  <div style={{ fontWeight: "900", fontSize: "17px", color: "#1E1B4B", fontFamily: theme.headingFont }}>{cls.name}</div>
                  {(cls.school || cls.default_level) && (
                    <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: "600", marginTop: "2px" }}>
                      {cls.school && <><Icon name="school" size={12} /> {cls.school}</>}
                      {cls.school && cls.default_level && " · "}
                      {cls.default_level && <><Icon name="chart" size={12} /> {cls.default_level}</>}
                    </div>
                  )}

                  {cls.teams.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                      {cls.teams.map(t => (
                        <span key={t.id} style={{ background: t.color?.light ?? TEAM_COLORS[0].light, color: t.color?.dark ?? TEAM_COLORS[0].dark, borderRadius: "8px", padding: "4px 10px", fontSize: "12px", fontWeight: "700" }}>
                          <TeamIcon team={t} /> {t.name}: {t.score}
                        </span>
                      ))}
                    </div>
                  )}

                  {cls.in_progress && (
                    <div style={{ background: hexToRgba(theme.cta[0], 0.08), border: `1.5px dashed ${hexToRgba(theme.cta[0], 0.4)}`, borderRadius: "10px", padding: "8px 12px", marginTop: "10px", fontSize: "12.5px", color: "#374151", fontWeight: "700" }}>
                      You have an unfinished <b>{gameLabel(cls.selected_game)}</b> game here.
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                    {cls.in_progress ? (
                      <>
                        <button
                          onClick={() => onResumeClass(cls)}
                          style={{ background: `linear-gradient(135deg,${theme.cta[0]},${theme.cta[1]})`, color: "white", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          <Icon name="play" size={13} /> Resume {gameLabel(cls.selected_game)}
                        </button>
                        <button
                          onClick={() => onStartWithClass(cls)}
                          style={{ background: hexToRgba(theme.accentSolid, 0.12), color: theme.accentSolid, border: `2px solid ${hexToRgba(theme.accentSolid, 0.4)}`, borderRadius: "10px", padding: "10px 16px", fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          <Icon name="plus" size={12} /> Start New Game
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onStartWithClass(cls)}
                        style={{ background: `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: "white", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}
                      >
                        <Icon name="check" size={12} /> Use This Class
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Same free-tier nudge My Classes already shows at the class cap -- identical copy/
                behavior so it reads as one consistent upgrade message across the app, not two. */}
            {atFreeLimit ? (
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
          </>
        )}

        <div style={{ textAlign: "center" }}>
          <button onClick={onSkip} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "13px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
            Skip — just play without saving
          </button>
        </div>
      </div>
    </div>
  );
}
