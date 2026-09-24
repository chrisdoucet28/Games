import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

// Real bug hit live 2026-09-22: PASSWORD_RECOVERY only ever FIRES once, at the exact moment
// Supabase's client consumes the recovery link's one-time token from the URL. A plain in-memory
// flag caught that fine on the first load, but the person then left the reset-password screen
// without finishing and came back later — a fresh page load, no new event to catch, just an
// already-valid session sitting in local storage that looked like any other login. This key makes
// "I'm mid-recovery, haven't set a new password yet" durable across that reload, exactly like
// Supabase's own session already is (same storage mechanism, same reason).
const PENDING_RECOVERY_KEY = "classcade-password-recovery-pending";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Clicking a password-reset email link signs the person in for real (a genuine `session`), the
  // same as clicking a sign-up confirmation link — without this flag, App.tsx's plain "session
  // exists → show the app" gate would drop them straight into the logged-in app with their OLD
  // password still active and no chance to actually set a new one.
  const [passwordRecovery, setPasswordRecovery] = useState(() => {
    try { return localStorage.getItem(PENDING_RECOVERY_KEY) === "1"; } catch { return false; }
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
        try { localStorage.setItem(PENDING_RECOVERY_KEY, "1"); } catch { /* private-mode/storage-blocked: falls back to in-memory-only for this load */ }
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Called once the new password is saved (or the person explicitly skips it, see
  // ResetPasswordScreen's own "skip for now" — this flag persisting is what makes an escape hatch
  // necessary in the first place, or someone who changes their mind would be stuck reseeing this
  // screen on every future visit with no way into the app at all) — hands control back to App.tsx's
  // normal session-based routing.
  const clearPasswordRecovery = () => {
    setPasswordRecovery(false);
    try { localStorage.removeItem(PENDING_RECOVERY_KEY); } catch { /* nothing to clean up if storage was never writable */ }
  };

  return { session, loading, passwordRecovery, clearPasswordRecovery };
}
