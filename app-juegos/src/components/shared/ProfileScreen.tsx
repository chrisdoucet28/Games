import { useEffect, useState } from "react";
import { getProfile, updateDisplayName } from "../../lib/profile";

type Props = {
  onBack: () => void;
};

export function ProfileScreen({ onBack }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile()
      .then(p => setDisplayName(p.display_name ?? ""))
      .catch(err => setError(err instanceof Error ? err.message : "Couldn't load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateDisplayName(displayName.trim());
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
        <button onClick={onBack} style={{ background: "none", border: "2px solid #6366F1", color: "#6366F1", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px" }}>← Back</button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "900", color: "#1E1B4B", margin: 0 }}>👤 My Profile</h2>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>Just the basics for now — more personalization is on the way.</p>
        </div>

        <div style={{ background: "white", border: "2px solid #E5E7EB", borderRadius: "16px", padding: "20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "#6B7280" }}>Loading…</div>
          ) : (
            <form onSubmit={handleSave}>
              <label style={{ display: "block", color: "#4B5563", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Display name</label>
              <input
                value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Ms. Doucet"
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: "12px", border: "2px solid #E5E7EB", fontSize: "14px", marginBottom: "16px" }}
              />

              {error && (
                <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "14px" }}>{error}</div>
              )}

              <button
                type="submit" disabled={saving}
                style={{ width: "100%", background: saved ? "#22C55E" : "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "white", border: "none", borderRadius: "12px", padding: "12px", fontSize: "15px", fontWeight: "800", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}
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
