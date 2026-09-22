import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Clicking a password-reset email link signs the person in for real (a genuine `session`), the
  // same as clicking a sign-up confirmation link — without this flag, App.tsx's plain "session
  // exists → show the app" gate would drop them straight into the logged-in app with their OLD
  // password still active and no chance to actually set a new one. Supabase's client fires this
  // specific event only for a recovery-link session, never a normal sign-in.
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Called once the new password is successfully saved — hands control back to App.tsx's normal
  // session-based routing instead of staying parked on the reset-password screen forever.
  const clearPasswordRecovery = () => setPasswordRecovery(false);

  return { session, loading, passwordRecovery, clearPasswordRecovery };
}
