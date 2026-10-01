// A teacher can share "https://…/?joinClass=CODE". A student opening it is usually logged out (or
// about to sign up), so the code is parked in sessionStorage the moment the site loads — the address
// is cleaned up — and picked up later by the student home's "Join a class" form, however many login
// or sign-up screens come in between. Best-effort only: private browsing just loses the prefill.
const KEY = "classcade-pending-join-code";

// Reads ?joinClass= once, stores it, and strips it from the address bar. Safe to call repeatedly.
export function capturePendingJoinCode(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("joinClass");
    if (raw) {
      const code = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 12);
      if (code) sessionStorage.setItem(KEY, code);
      params.delete("joinClass");
      const rest = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (rest ? `?${rest}` : "") + window.location.hash);
    }
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function peekPendingJoinCode(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearPendingJoinCode(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to do.
  }
}
