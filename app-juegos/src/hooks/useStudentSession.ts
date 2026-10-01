import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getProfile } from "../lib/profile";
import { isSupabaseConfigured } from "../lib/supabaseClient";

// For the public pages (/learn, /learn/<id>, /practice), which render before any auth code runs in
// App.tsx and must look exactly the same to a logged-out visitor (and to Google) as they always
// have. This never blocks rendering: `isStudent` is simply false until — and unless — a logged-in
// student is confirmed, and `ready` only says whether that answer is final yet.
export function useStudentSession(): { ready: boolean; isStudent: boolean; loggedIn: boolean } {
  const { session, loading } = useAuth();
  const userId = session?.user.id ?? null;
  const [role, setRole] = useState<"teacher" | "student" | null>(null);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured) {
      setRole(null);
      return;
    }
    let cancelled = false;
    getProfile()
      // `role` is undefined until the student_accounts migration exists — treated as a teacher.
      .then(p => { if (!cancelled) setRole(p.role ?? "teacher"); })
      .catch(() => { if (!cancelled) setRole("teacher"); });
    return () => { cancelled = true; };
  }, [userId]);

  return { ready: !loading && (!userId || role !== null), isStudent: role === "student", loggedIn: userId !== null };
}
