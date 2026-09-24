import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { ThemeAmbience } from "./ThemeAmbience";
import { Icon } from "./Icon";
import { friendlyAuthError } from "./AuthScreen";

// Shown instead of the normal logged-in app whenever useAuth reports `passwordRecovery` — i.e. the
// person arrived by clicking a "reset your password" email link, which signs them in for real but
// with the OLD password still active until they set a new one here. `onDone` clears that flag once
// the new password is saved, handing control back to App.tsx's normal session-based routing — no
// separate sign-in step needed, since they already hold a live (just-refreshed) session.
export function ResetPasswordScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
    } catch (err) {
      setError(friendlyAuthError(err, "reset"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", background: "linear-gradient(160deg,#0C1E3D 0%,#0369A1 45%,#0EA5E9 100%)", display: "flex", justifyContent: "center", padding: "32px 20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <ThemeAmbience themeId="sky" />
      <div style={{ maxWidth: "420px", width: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Icon name="lock" size={44} color="#FCD34D" style={{ marginBottom: "8px", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }} />
          <h1 style={{ fontSize: "24px", fontWeight: "900", color: "white", margin: 0, letterSpacing: "-0.01em" }}>
            {done ? "Password updated!" : "Set a new password"}
          </h1>
        </div>
        <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "20px", padding: "28px 24px", backdropFilter: "blur(8px)" }}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#BEF264", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontWeight: 800 }}>
                  <Icon name="check" size={16} /> All set
                </div>
                <div style={{ marginTop: "6px", color: "#D9F99D" }}>Your password has been changed. You're already signed in.</div>
              </div>
              <button
                type="button" onClick={onDone}
                style={{ width: "100%", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", border: "none", borderRadius: "12px", padding: "13px", fontSize: "15px", fontWeight: "900", cursor: "pointer" }}
              >
                Continue to ClassCade
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p style={{ color: "#BAE6FD", fontSize: "13px", lineHeight: 1.5, margin: "0 0 18px" }}>Choose a new password for your account.</p>
              <label style={{ display: "block", color: "#BAE6FD", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>New password</label>
              <input
                type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="new-password" autoFocus
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.25)", color: "white", fontSize: "14px", marginBottom: "14px" }}
              />
              <label style={{ display: "block", color: "#BAE6FD", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Confirm password</label>
              <input
                type="password" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.25)", color: "white", fontSize: "14px", marginBottom: "16px" }}
              />

              {error && (
                <div style={{ color: "#FCA5A5", fontSize: "13px", marginBottom: "14px", lineHeight: 1.5 }}>{error}</div>
              )}

              <button
                type="submit" disabled={loading}
                style={{ width: "100%", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", border: "none", borderRadius: "12px", padding: "13px", fontSize: "15px", fontWeight: "900", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Please wait…" : "Set new password"}
              </button>

              {/* The "mid-recovery" flag this screen gates on now survives a reload (see useAuth.ts)
                  — without a way to bail out here, changing your mind and closing this screen would
                  mean reseeing it, stuck, on every future visit with no path into the app at all. */}
              <button
                type="button" onClick={onDone}
                style={{ display: "block", width: "100%", textAlign: "center", background: "none", border: "none", color: "#7DB8DB", fontSize: "12.5px", fontWeight: "700", cursor: "pointer", padding: 0, marginTop: "14px" }}
              >
                Skip for now, keep my current password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
