import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../lib/profile";
import { THEMES, hexToRgba, type Theme } from "../../data/themes";

type Props = {
  onBack: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};

export function ProfileScreen({ onBack, theme, onThemeChange }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState(theme.id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile()
      .then(p => {
        setDisplayName(p.display_name ?? "");
        setSelectedThemeId(p.theme_id);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Couldn't load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({ displayName: displayName.trim(), themeId: selectedThemeId });
      const newTheme = THEMES.find(t => t.id === selectedThemeId);
      if (newTheme) onThemeChange(newTheme);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "440px", margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px", fontFamily: theme.headingFont }}>← Back</button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "900", color: theme.heroBg[0], margin: 0, fontFamily: theme.headingFont }}>👤 My Profile</h2>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>Just the basics for now — more personalization is on the way.</p>
        </div>

        <div style={{ background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "16px", padding: "20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "#6B7280" }}>Loading…</div>
          ) : (
            <form onSubmit={handleSave}>
              <label style={{ display: "block", color: "#4B5563", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Display name</label>
              <input
                value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Ms. Doucet"
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: "12px", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, fontSize: "14px", marginBottom: "20px" }}
              />

              <label style={{ display: "block", color: "#4B5563", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>App color theme</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                {THEMES.map(t => {
                  const isSelected = selectedThemeId === t.id;
                  return (
                    <button
                      key={t.id} type="button" onClick={() => setSelectedThemeId(t.id)}
                      title={t.name}
                      style={{
                        flex: "1 1 80px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                        background: isSelected ? `linear-gradient(135deg,${t.accent[0]},${t.accent[1]})` : "#F8F7FF",
                        color: isSelected ? "white" : "#4B5563",
                        border: `2px solid ${isSelected ? t.accentSolid : "#E5E7EB"}`,
                        borderRadius: "12px", padding: "10px 6px", cursor: "pointer", fontWeight: "700", fontSize: "12px",
                        transition: "transform 0.15s ease", transform: isSelected ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>{t.emoji}</span>
                      {t.name}
                    </button>
                  );
                })}
              </div>

              {error && (
                <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "14px" }}>{error}</div>
              )}

              <button
                type="submit" disabled={saving}
                style={{ width: "100%", background: saved ? "#22C55E" : `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: "white", border: "none", borderRadius: "12px", padding: "12px", fontSize: "15px", fontWeight: "800", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: theme.headingFont }}
              >
                {saving ? "Saving…" : saved ? "✅ Saved!" : "Save"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
