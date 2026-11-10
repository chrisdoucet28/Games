import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { friendlyAuthError } from "./AuthScreen";
import { Icon } from "./Icon";

type Mode = "sign-in" | "sign-up";

// Same in-app-browser check as AuthScreen.tsx (kept as its own tiny copy rather than importing a
// private helper across files — see that file's own comment for why it matters).
function isInAppBrowser(): boolean {
  return /FBAN|FBAV|Instagram/i.test(navigator.userAgent || "");
}

type Props = {
  // What the teacher was doing when they hit this — shown as the modal's subtitle so it's clear
  // WHY they're being asked, not just a generic "please log in". e.g. "to start this game" or
  // "to open My Classes".
  reason: string;
  onClose: () => void;
};

// The login moment for someone who's been exploring ClassCade anonymously (see App.tsx's
// `requireAuth`/`cameFromAnonymousExplore`) — everything up through picking a topic, setting up
// teams, and choosing a game works with no account at all; this is the ONE modal that appears the
// moment that exploration turns into something that needs to persist (starting a real game,
// opening My Classes/My Profile/Billing, saving teams to a class). Deliberately a small overlay
// over whatever screen triggered it (not a full-page swap like AuthScreen) — the already-configured
// setup behind it stays visible/dimmed, same shape as the live site this pattern was copied from:
// closing this modal without signing in just leaves the teacher back where they were, nothing lost.
//
// This duplicates (rather than reuses) AuthScreen.tsx's actual form JSX — that file is the main,
// heavily-tested entry point every existing teacher already logs in through, so it's left
// completely untouched here rather than risking a shared-component refactor of it. The two DO share
// the real logic that matters (friendlyAuthError's message cleanup, Supabase calls themselves);
// only the surrounding chrome (modal vs. full page, no marketing landing, no email-link/joining-
// class notices — none of those apply to someone who got here by playing with the app first) differs.
export function AuthPromptModal({ reason, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);
  const [existingAccount, setExistingAccount] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [inAppBrowser] = useState(() => isInAppBrowser());

  // Signing in/up itself doesn't need to do anything else here — App.tsx's own useAuth() picks up
  // the new session reactively and fires whatever action was queued (see requireAuth), then closes
  // this modal. This component only has to get the credential exchange right.
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExistingAccount(false);
    setLoading(true);
    try {
      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { marketing_opt_in: marketingOptIn } },
        });
        if (signUpError) throw signUpError;
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setExistingAccount(true);
        } else if (data.user && !data.session) {
          setConfirmSent(true);
        }
      }
    } catch (err) {
      setError(friendlyAuthError(err, mode));
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      if (resetError) throw resetError;
      setResetSent(true);
    } catch (err) {
      setError(friendlyAuthError(err, "reset"));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    // A Google redirect leaves this page entirely — on return, App.tsx's normal session gate takes
    // over and this modal is simply gone (not reopened), same end state as finishing email sign-in.
    if (oauthError) setError(oauthError.message);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(10,15,30,0.6)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "400px", background: "linear-gradient(160deg,#0C1E3D 0%,#0369A1 100%)",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: "20px", padding: "26px 24px",
          fontFamily: "'Segoe UI',system-ui,sans-serif", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon name="joystick" size={24} color="#FCD34D" />
            <span style={{ fontSize: "19px", fontWeight: "900", color: "white" }}>Class<span style={{ color: "#FCD34D" }}>Cade</span></span>
          </div>
          <button
            onClick={onClose} aria-label="Close" type="button"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "20px", lineHeight: 1, padding: "2px" }}
          >✕</button>
        </div>
        {!resetMode && (
          <p style={{ color: "#BAE6FD", fontSize: "13.5px", margin: "0 0 18px", lineHeight: 1.5 }}>
            Sign in {reason} — your setup here is still waiting when you're done.
          </p>
        )}

        {!resetMode && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "18px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "4px" }}>
            {(["sign-in", "sign-up"] as Mode[]).map(m => (
              <button
                key={m} type="button"
                onClick={() => { setMode(m); setError(null); setExistingAccount(false); setConfirmSent(false); }}
                style={{
                  flex: 1, padding: "10px", borderRadius: "9px", border: "none", cursor: "pointer",
                  fontWeight: "800", fontSize: "14px",
                  background: mode === m ? "linear-gradient(135deg,#F59E0B,#D97706)" : "transparent",
                  color: mode === m ? "white" : "#BAE6FD",
                }}
              >
                {m === "sign-in" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>
        )}

        {resetMode && (
          <div style={{ marginBottom: "18px" }}>
            <button
              type="button" onClick={() => { setResetMode(false); setResetSent(false); setError(null); }}
              style={{ background: "none", border: "none", color: "#7DB8DB", fontSize: "12px", fontWeight: "700", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}
            >
              <Icon name="back" size={12} /> Back to log in
            </button>
            <h2 style={{ color: "white", fontSize: "17px", fontWeight: 900, margin: "12px 0 4px" }}>Reset your password</h2>
            {!resetSent && <p style={{ color: "#BAE6FD", fontSize: "13px", lineHeight: 1.5, margin: 0 }}>Enter your email and we'll send you a link to set a new password.</p>}
          </div>
        )}

        {!resetMode && existingAccount && (
          <div role="status" style={{ background: "rgba(252,211,77,0.14)", border: "1px solid rgba(252,211,77,0.4)", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px", color: "#FDE68A", fontSize: "13px", lineHeight: 1.5 }}>
            You already have a ClassCade account with this email.
            <div style={{ marginTop: "4px", color: "#FEF3C7" }}>If you signed up with Google before, use the Continue with Google button below.</div>
            <button
              type="button"
              onClick={() => { setMode("sign-in"); setExistingAccount(false); setPassword(""); }}
              style={{ marginTop: "10px", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", border: "none", borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}
            >
              Log in instead
            </button>
          </div>
        )}

        {resetMode ? (
          resetSent ? (
            <div style={{ color: "#BEF264", fontSize: "14px", lineHeight: 1.6, textAlign: "center", padding: "10px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontWeight: 800 }}><Icon name="check" size={16} /> Check your email</div>
              <div style={{ marginTop: "6px", color: "#D9F99D" }}>If <strong>{email}</strong> has a ClassCade account, we sent a link to reset its password.</div>
            </div>
          ) : (
            <form onSubmit={submitReset}>
              <label style={{ display: "block", color: "#BAE6FD", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.25)", color: "white", fontSize: "14px", marginBottom: "16px" }}
              />
              {error && <div style={{ color: "#FCA5A5", fontSize: "13px", marginBottom: "14px", lineHeight: 1.5 }}>{error}</div>}
              <button type="submit" disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", border: "none", borderRadius: "12px", padding: "13px", fontSize: "15px", fontWeight: "900", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Please wait…" : "Send reset link"}
              </button>
            </form>
          )
        ) : confirmSent ? (
          <div style={{ color: "#BEF264", fontSize: "14px", lineHeight: 1.6, textAlign: "center", padding: "10px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontWeight: 800 }}><Icon name="check" size={16} /> Check your email</div>
            <div style={{ marginTop: "6px", color: "#D9F99D" }}>We sent a confirmation link to <strong>{email}</strong>. Click it and you'll be signed straight in — come back to this tab and your setup will still be here.</div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label style={{ display: "block", color: "#BAE6FD", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.25)", color: "white", fontSize: "14px", marginBottom: "14px" }}
            />
            <label style={{ display: "block", color: "#BAE6FD", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Password</label>
            <input
              type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.25)", color: "white", fontSize: "14px", marginBottom: mode === "sign-in" ? "8px" : "16px" }}
            />
            {mode === "sign-in" && (
              <div style={{ textAlign: "right", marginBottom: "16px" }}>
                <button type="button" onClick={() => { setResetMode(true); setResetSent(false); setError(null); setExistingAccount(false); }} style={{ background: "none", border: "none", color: "#7DB8DB", fontSize: "12.5px", fontWeight: "700", cursor: "pointer", padding: 0 }}>
                  Forgot password?
                </button>
              </div>
            )}
            {mode === "sign-up" && (
              <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", color: "#BAE6FD", fontSize: "12.5px", lineHeight: 1.45, marginBottom: "16px", cursor: "pointer" }}>
                <input type="checkbox" checked={marketingOptIn} onChange={e => setMarketingOptIn(e.target.checked)} style={{ marginTop: "2px", accentColor: "#F59E0B", flexShrink: 0 }} />
                <span>Send me occasional updates: new games, topics and free resources (about once a month). Unsubscribe anytime.</span>
              </label>
            )}
            {error && <div style={{ color: "#FCA5A5", fontSize: "13px", marginBottom: "14px", lineHeight: 1.5 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", border: "none", borderRadius: "12px", padding: "13px", fontSize: "15px", fontWeight: "900", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Please wait…" : mode === "sign-in" ? "Log In" : "Create Account"}
            </button>
          </form>
        )}

        {!resetMode && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.15)" }} />
              <span style={{ color: "#7DB8DB", fontSize: "12px" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.15)" }} />
            </div>
            {inAppBrowser ? (
              <div style={{ background: "rgba(252,165,165,0.12)", border: "1px solid rgba(252,165,165,0.35)", borderRadius: "12px", padding: "12px", color: "#FCA5A5", fontSize: "12.5px", lineHeight: 1.5, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <Icon name="warning" size={14} style={{ flexShrink: 0 }} />
                <span>Google sign-in doesn't work in Facebook/Instagram's built-in browser. Tap the ••• menu and choose "Open in Browser" first.</span>
              </div>
            ) : (
              <button type="button" onClick={signInWithGoogle} style={{ width: "100%", background: "white", color: "#1F2937", border: "none", borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span aria-hidden="true" style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#4285F4", display: "inline-block" }} /> Continue with Google
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
