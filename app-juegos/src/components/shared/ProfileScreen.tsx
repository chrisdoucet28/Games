import { useEffect, useState } from "react";
import { getProfile, updateProfile, uploadAvatar, uploadOrgLogo, removeAvatar, removeOrgLogo } from "../../lib/profile";
import { THEMES, hexToRgba, type Theme } from "../../data/themes";
import { Icon } from "./Icon";

type Props = {
  onBack: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  isPaid: boolean;
  onUpgrade: () => void;
};

type BrandingKind = "avatar" | "logo";

// One upload slot (used for both the profile picture and the school logo) — preview, a file
// input disguised as a button, and a remove link that only appears once something's uploaded.
function BrandingSlot({ label, url, busy, onUpload, onRemove }: { label: string; url: string | null; busy: boolean; onUpload: (file: File) => void; onRemove: () => void }) {
  return (
    <div style={{ flex: "1 1 160px", textAlign: "center" }}>
      <div style={{ width: "100%", aspectRatio: "1", maxWidth: "120px", margin: "0 auto 8px", borderRadius: "12px", border: "2px solid #E5E7EB", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {url ? <img src={url} alt={label} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <Icon name="image" size={28} color="#D1D5DB" />}
      </div>
      <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: "700", marginBottom: "6px" }}>{label}</div>
      <label style={{ display: "inline-block", background: "#F0F9FF", border: "2px solid #93C5FD", borderRadius: "8px", padding: "5px 12px", fontSize: "12px", fontWeight: "700", color: "#1D4ED8", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
        {busy ? "…" : url ? "Replace" : "Upload"}
        <input
          type="file" accept="image/*" disabled={busy} style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
        />
      </label>
      {url && (
        <button type="button" onClick={onRemove} disabled={busy} style={{ display: "block", margin: "6px auto 0", background: "none", border: "none", color: "#9CA3AF", fontSize: "11px", fontWeight: "700", cursor: busy ? "default" : "pointer" }}>
          Remove
        </button>
      )}
    </div>
  );
}

export function ProfileScreen({ onBack, theme, onThemeChange, isPaid, onUpgrade }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState(theme.id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [orgLogoUrl, setOrgLogoUrl] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [brandingError, setBrandingError] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then(p => {
        setDisplayName(p.display_name ?? "");
        setSelectedThemeId(p.theme_id);
        setAvatarUrl(p.avatar_url);
        setOrgLogoUrl(p.org_logo_url);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Couldn't load your profile."))
      .finally(() => setLoading(false));
  }, []);

  // Branding uploads/removals save immediately on interaction (unlike name/theme, which wait for
  // the form's own Save button) — a file picker firing an instant upload is the expected pattern,
  // and bundling it into a separate "Save" click would just be one more step for no benefit.
  const handleBrandingUpload = async (kind: BrandingKind, file: File) => {
    setBrandingError(null);
    (kind === "avatar" ? setAvatarBusy : setLogoBusy)(true);
    try {
      const url = await (kind === "avatar" ? uploadAvatar(file) : uploadOrgLogo(file));
      (kind === "avatar" ? setAvatarUrl : setOrgLogoUrl)(url);
    } catch (err) {
      setBrandingError(err instanceof Error ? err.message : "Couldn't upload that image.");
    } finally {
      (kind === "avatar" ? setAvatarBusy : setLogoBusy)(false);
    }
  };

  const handleBrandingRemove = async (kind: BrandingKind) => {
    setBrandingError(null);
    (kind === "avatar" ? setAvatarBusy : setLogoBusy)(true);
    try {
      await (kind === "avatar" ? removeAvatar() : removeOrgLogo());
      (kind === "avatar" ? setAvatarUrl : setOrgLogoUrl)(null);
    } catch (err) {
      setBrandingError(err instanceof Error ? err.message : "Couldn't remove that image.");
    } finally {
      (kind === "avatar" ? setAvatarBusy : setLogoBusy)(false);
    }
  };

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
    <div style={{ minHeight: "100vh", background: "#F0F9FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "440px", margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="back" size={13} /> Back</button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "900", color: theme.heroBg[0], margin: 0, fontFamily: theme.headingFont, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><Icon name="person" size={26} /> My Profile</h2>
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
                        background: isSelected ? `linear-gradient(135deg,${t.accent[0]},${t.accent[1]})` : "#F0F9FF",
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

              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4B5563", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}><Icon name="palette" size={14} /> Branding</label>
              {!isPaid ? (
                <div style={{ background: "#F0F9FF", border: "2px dashed #93C5FD", borderRadius: "12px", padding: "14px", textAlign: "center", marginBottom: "20px" }}>
                  <div style={{ fontSize: "13px", color: "#374151", fontWeight: "700", marginBottom: "8px" }}>Upload a profile picture and your school's logo on the paid plan.</div>
                  <button
                    type="button" onClick={onUpgrade}
                    style={{ background: `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: "white", border: "none", borderRadius: "10px", padding: "8px 16px", fontWeight: "800", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Icon name="gem" size={14} /> Upgrade
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
                  <BrandingSlot label="Profile picture" url={avatarUrl} busy={avatarBusy} onUpload={f => handleBrandingUpload("avatar", f)} onRemove={() => handleBrandingRemove("avatar")} />
                  <BrandingSlot label="School / org logo" url={orgLogoUrl} busy={logoBusy} onUpload={f => handleBrandingUpload("logo", f)} onRemove={() => handleBrandingRemove("logo")} />
                </div>
              )}
              {brandingError && (
                <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "14px" }}>{brandingError}</div>
              )}
              {isPaid && (
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "20px" }}>Your logo appears on printed handouts and in the corner while you're using ClassCade.</div>
              )}

              {error && (
                <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "14px" }}>{error}</div>
              )}

              <button
                type="submit" disabled={saving}
                style={{ width: "100%", background: saved ? "#22C55E" : `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: "white", border: "none", borderRadius: "12px", padding: "12px", fontSize: "15px", fontWeight: "800", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: theme.headingFont, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                {saving ? "Saving…" : saved ? <><Icon name="check" size={15} /> Saved!</> : "Save"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
