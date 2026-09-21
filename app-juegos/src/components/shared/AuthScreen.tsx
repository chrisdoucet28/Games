import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { ThemeAmbience } from "./ThemeAmbience";
import { MarketingLanding } from "./MarketingLanding";
import { Icon } from "./Icon";
import { peekPendingJoinCode } from "../../lib/pendingJoin";

type Mode = "sign-in" | "sign-up";

// Facebook/Instagram's in-app Android browser injects a script that crashes when Supabase's
// OAuth redirect (window.location.assign) fires mid-navigation — the injected script's own
// postMessage to its native WebView bridge throws once the page starts navigating away. Detecting
// it lets the Google button be swapped for a plain "open in your browser" nudge instead of a
// button that reliably breaks for anyone arriving from a shared Facebook/Instagram link. Email/
// password sign-in has no redirect step, so it's unaffected and stays as-is either way.
function isInAppBrowser(): boolean {
  return /FBAN|FBAV|Instagram/i.test(navigator.userAgent || "");
}

// Supabase's own error text is sometimes empty, a raw "{}", or aimed at developers ("Error sending
// confirmation email" as a 500). This turns whatever came back into something a teacher or student
// can act on; readable messages ("Invalid login credentials", "Password should be at least 6
// characters") pass through unchanged.
function friendlyAuthError(err: unknown, mode: Mode): string {
  const e = (err ?? {}) as { message?: unknown; status?: unknown; code?: unknown };
  const msg = typeof e.message === "string" ? e.message.trim() : "";
  const code = typeof e.code === "string" ? e.code : "";
  const status = typeof e.status === "number" ? e.status : 0;
  if (code === "over_email_send_rate_limit" || /rate limit/i.test(msg)) {
    return "Too many emails were requested. Please wait a few minutes and try again.";
  }
  if (/email not confirmed/i.test(msg)) {
    return "This email hasn't been confirmed yet. Check your inbox (and spam folder) for the confirmation link.";
  }
  if (mode === "sign-up" && (status >= 500 || code === "unexpected_failure" || /error sending/i.test(msg))) {
    return "We couldn't send your confirmation email right now. Please try again in a few minutes.";
  }
  if (!msg || msg.startsWith("{") || status >= 500) return "Something went wrong. Please try again in a moment.";
  return msg;
}

// A confirmation (or any email) link that can't be used comes back to the site as
// "#error=access_denied&error_code=otp_expired&…" in the address — most often because the link was
// already clicked once (it's single-use, and the first click already signed the person in) or is
// old. Supabase's sign-in handling ignores it, so without this the person just lands on the plain
// signed-out page with no idea what happened. Captured once when this file loads (before anything
// can tidy the address) and shown by the first AuthScreen that mounts.
function readLinkProblem(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  if (!params.get("error") && !params.get("error_code")) return null;
  return params.get("error_code") === "otp_expired"
    ? "That confirmation link was already used or has expired. If you've already confirmed your email, log in below. If not, sign up again and we'll send you a fresh link."
    : "That link didn't work. Try logging in below with your email and password.";
}
let pendingLinkProblem: string | null = readLinkProblem();

const FOOTER_LINKS = (
  <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginTop: "20px" }}>
    <a href="/learn" style={{ color: "#7DB8DB", fontSize: "12px", textDecoration: "none" }}>Learn Lessons</a>
    <a href="/about" style={{ color: "#7DB8DB", fontSize: "12px", textDecoration: "none" }}>Our Story</a>
    <a href="/privacy" style={{ color: "#7DB8DB", fontSize: "12px", textDecoration: "none" }}>Privacy Policy</a>
    <a href="/terms" style={{ color: "#7DB8DB", fontSize: "12px", textDecoration: "none" }}>Terms of Service</a>
  </div>
);

export function AuthScreen() {
  // Starts on a plain public landing view — description + two buttons, no credential inputs
  // anywhere on it — rather than dropping straight into a login form. Google's OAuth branding
  // verification flags a homepage whose dominant visible content is credential input fields as
  // "behind a login page" even when descriptive text sits above them; the actual email/password
  // form (and the Google button) only renders once "Log In" or "Sign Up" is clicked below.
  // Someone arriving from a used/expired email link goes straight to the log-in form with the
  // explanation showing, instead of the marketing landing with no clue why they aren't signed in.
  // Someone who opened a teacher's class link ("/?joinClass=CODE") is told what to do next — the code
  // itself is already parked for the student home (lib/pendingJoin.ts).
  const [joiningClass] = useState(() => peekPendingJoinCode() !== null);
  const [notice, setNotice] = useState<string | null>(
    pendingLinkProblem ?? (joiningClass ? "You're joining a class. Log in, or sign up, with a student account to continue." : null)
  );
  const [showForm, setShowForm] = useState(pendingLinkProblem !== null || joiningClass);
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);
  // Set when a sign-up used an email that already has a confirmed account — the notice then offers
  // a one-tap switch to Log In.
  const [existingAccount, setExistingAccount] = useState(false);
  const [inAppBrowser] = useState(() => isInAppBrowser());

  useEffect(() => {
    document.title = !showForm ? "ClassCade" : mode === "sign-in" ? "Log In - ClassCade" : "Sign Up - ClassCade";
  }, [showForm, mode]);

  // Consumed once per page load: clear the error out of the address bar (a refresh shouldn't show
  // it again) and make sure a later logout → AuthScreen doesn't replay the old notice.
  useEffect(() => {
    if (pendingLinkProblem === null) return;
    pendingLinkProblem = null;
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  const openForm = (m: Mode) => {
    setMode(m);
    setError(null);
    setNotice(null);
    setExistingAccount(false);
    setConfirmSent(false);
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setExistingAccount(false);
    setLoading(true);
    try {
      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        // emailRedirectTo sends the confirmation link back to the site the person signed up on (same
        // as the Google button below) instead of always using the dashboard's Site URL — which also
        // means signing up on a preview/branch site doesn't land on the live one. Supabase falls back
        // to the Site URL if this origin isn't in the dashboard's Redirect URLs allow-list.
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (signUpError) throw signUpError;
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          // Supabase deliberately answers "success" for an email that already has an account (so
          // sign-up can't be used to probe who's registered) but sends no email — the only tell is
          // an empty identities list. Say so, instead of "check your email" for an email that never
          // comes.
          setExistingAccount(true);
          setNotice("You already have a ClassCade account with this email.");
        } else if (data.user && !data.session) {
          // A project with email confirmation on won't return a session yet — let the person know
          // to check their inbox instead of silently doing nothing.
          setConfirmSent(true);
        }
      }
    } catch (err) {
      setError(friendlyAuthError(err, mode));
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
    // Surfaces cleanly if the Google provider hasn't been configured in the Supabase dashboard yet,
    // instead of leaving the teacher looking at a dead button with no explanation.
    if (oauthError) setError(oauthError.message);
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", background: "linear-gradient(160deg,#0C1E3D 0%,#0369A1 45%,#0EA5E9 100%)", display: "flex", justifyContent: "center", padding: "32px 20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <ThemeAmbience themeId="sky" />
      <div style={{ maxWidth: showForm ? "420px" : "980px", width: "100%", position: "relative", zIndex: 1 }}>
        {!showForm ? (
          <MarketingLanding onSignUp={() => openForm("sign-up")} onLogIn={() => openForm("sign-in")} />
        ) : (
          <>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Icon name="joystick" size={48} color="#FCD34D" style={{ marginBottom: "8px", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }} />
            <h1 style={{ fontSize: "28px", fontWeight: "900", color: "white", margin: 0, letterSpacing: "-0.01em" }}>
              Class<span style={{ color: "#FCD34D" }}>Cade</span>
            </h1>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "20px", padding: "28px 24px", backdropFilter: "blur(8px)" }}>
            <button
              type="button" onClick={() => setShowForm(false)}
              style={{ background: "none", border: "none", color: "#7DB8DB", fontSize: "12px", fontWeight: "700", cursor: "pointer", padding: 0, marginBottom: "16px", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <Icon name="back" size={12} /> Back
            </button>

            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "4px" }}>
              {(["sign-in", "sign-up"] as Mode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null); setNotice(null); setExistingAccount(false); setConfirmSent(false); }}
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

            {notice && (
              <div role="status" style={{ background: "rgba(252,211,77,0.14)", border: "1px solid rgba(252,211,77,0.4)", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px", color: "#FDE68A", fontSize: "13.5px", lineHeight: 1.55 }}>
                {notice}
                {existingAccount && (
                  <>
                    <div style={{ marginTop: "4px", color: "#FEF3C7" }}>If you signed up with Google before, use the Continue with Google button below.</div>
                    <button
                      type="button"
                      onClick={() => { setMode("sign-in"); setNotice(null); setExistingAccount(false); setPassword(""); }}
                      style={{ marginTop: "10px", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", border: "none", borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}
                    >
                      Log in instead
                    </button>
                  </>
                )}
              </div>
            )}

            {confirmSent ? (
              <div style={{ color: "#BEF264", fontSize: "14px", lineHeight: 1.6, textAlign: "center", padding: "12px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontWeight: 800 }}>
                  <Icon name="check" size={16} /> Check your email
                </div>
                <div style={{ marginTop: "6px", color: "#D9F99D" }}>
                  We sent a confirmation link to <strong>{email}</strong>. Click it and you'll be signed straight in.
                </div>
                <div style={{ marginTop: "6px", fontSize: "12.5px", color: "#BAE6FD" }}>Can't find it? Check your spam folder.</div>
              </div>
            ) : (
              <form onSubmit={submit}>
                <label style={{ display: "block", color: "#BAE6FD", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Email</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.25)", color: "white", fontSize: "14px", marginBottom: "14px" }}
                />
                <label style={{ display: "block", color: "#BAE6FD", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Password</label>
                <input
                  type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.25)", color: "white", fontSize: "14px", marginBottom: "16px" }}
                />

                {error && (
                  <div style={{ color: "#FCA5A5", fontSize: "13px", marginBottom: "14px", lineHeight: 1.5 }}>{error}</div>
                )}

                <button
                  type="submit" disabled={loading}
                  style={{ width: "100%", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", border: "none", borderRadius: "12px", padding: "13px", fontSize: "15px", fontWeight: "900", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Please wait…" : mode === "sign-in" ? "Log In" : "Create Account"}
                </button>
              </form>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "18px 0" }}>
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
              <button
                type="button" onClick={signInWithGoogle}
                style={{ width: "100%", background: "white", color: "#1F2937", border: "none", borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <span aria-hidden="true" style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#4285F4", display: "inline-block" }} /> Continue with Google
              </button>
            )}
          </div>
          </>
        )}

        {FOOTER_LINKS}
      </div>
    </div>
  );
}
