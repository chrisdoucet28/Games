import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App'
import './index.css' // Opcional, pero recomendado (ver punto 2)

// Only initializes when a DSN is actually configured — local dev without VITE_SENTRY_DSN set just
// runs without error reporting instead of Sentry logging a "DSN not set" warning on every load.
// tracePropagationTargets/enableLogs from the Sentry wizard's default snippet are left out: this
// app has no custom backend to correlate traces against (Supabase's own client instruments its
// own requests separately), and nothing calls Sentry's structured-logging API yet — both are easy
// to add later if they'd actually be used.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  });
}

// Catches render/lifecycle crashes that would otherwise white-screen the app mid-class with zero
// record of what happened — the actual point of adding Sentry here, not just background telemetry.
function ErrorFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '20px', textAlign: 'center', fontFamily: "'Segoe UI',system-ui,sans-serif", background: '#F0F9FF' }}>
      <div style={{ fontSize: '48px' }}>😵</div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E1B4B' }}>Something went wrong.</div>
      <div style={{ color: '#6B7280' }}>We've been notified — try reloading the page.</div>
      <button
        onClick={() => window.location.reload()}
        style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: '#4F46E5', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
      >
        Reload
      </button>
    </div>
  );
}

// Every page deploys automatically on push to main (see CLAUDE.md), each one hashing lazy-loaded
// chunks (React.lazy() + import(), e.g. LessonPlanScreen-*.js) under a new filename — a tab left
// open across a deploy, or one serving a cached index.html, still references the OLD hash, which
// no longer exists once the new build has overwritten it. Vite's build wraps every dynamic
// import() in a preload helper that fires this event on exactly that failure (a normal page
// navigation never touches it) — a hard reload re-fetches the current index.html, which points at
// whatever chunks actually exist now, which fixes it. Guarded by sessionStorage so a reload that
// doesn't actually help (offline, or a genuinely broken deploy) gives up after one try and falls
// through to the ErrorBoundary below instead of looping forever; the guard clears itself once the
// app's been up a little while, so a later, unrelated deploy can still trigger its own one reload.
//
// event.preventDefault() matters here: without it, Vite's preload helper re-throws the original
// error regardless of the reload() call below, which React.lazy's Suspense boundary (and Sentry's
// ErrorBoundary wrapping it) sees and reports BEFORE the reload actually takes effect — caught
// live in Sentry as a "Failed to fetch dynamically imported module" TypeError with no user-visible
// crash (the reload happens a moment later and the teacher never even notices), but still alerting
// as if it were an unhandled one. Calling it only while we're actually about to self-heal (the
// guard isn't set yet) keeps a genuine repeat failure — reload already tried once and didn't help —
// visible to Sentry/the ErrorBoundary instead of silently swallowing it forever.
const PRELOAD_RELOAD_KEY = 'cc-reloaded-after-preload-error';
window.addEventListener('vite:preloadError', (event) => {
  if (sessionStorage.getItem(PRELOAD_RELOAD_KEY)) return;
  event.preventDefault();
  sessionStorage.setItem(PRELOAD_RELOAD_KEY, '1');
  window.location.reload();
});
setTimeout(() => sessionStorage.removeItem(PRELOAD_RELOAD_KEY), 15000);

// The same stale-deploy problem above, but a step further down the chain than vite:preloadError
// catches. A browser's dynamic import() can reject for this exact reason with wording Vite's own
// preload helper doesn't recognize as "this one" — Chrome says "Failed to fetch dynamically
// imported module" (caught above), but Safari says "'text/html' is not a valid JavaScript MIME
// type for module script '...'" (the server's 404 fallback page served where a since-replaced
// chunk used to be, read as the wrong content type), and either can also surface one level higher,
// inside React.lazy's own bookkeeping, as "undefined is not an object (evaluating
// '...\._result\.default')" once the rejected import leaves React's lazy() wrapper in a bad state.
// Caught live in Sentry, twice, from the same teacher's Safari/Mac browser a week apart — both
// times during a window when this app had just been redeployed, both times never recovered on
// their own because this exact wording never reaches the vite:preloadError listener above. Since
// all of these are variants of literally the same "fetch whatever chunks exist right now" fix, the
// React ErrorBoundary fallback below reuses that same self-heal before ever showing the teacher an
// error screen — same one-shot sessionStorage guard, so the two mechanisms share a single retry
// budget rather than looping twice.
const STALE_DEPLOY_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /is not a valid javascript mime type/i,
  /_result\.default/,
];
function isStaleDeployError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return STALE_DEPLOY_PATTERNS.some(p => p.test(message));
}

// Mounted only for a recognized stale-deploy error — reloads once (sharing PRELOAD_RELOAD_KEY's
// guard with the vite:preloadError listener above) instead of showing the teacher an error card for
// something a single refresh already fixes. Side effect belongs in an effect, not render, same as
// anywhere else in this app.
function StaleDeployReload() {
  useEffect(() => {
    if (sessionStorage.getItem(PRELOAD_RELOAD_KEY)) return;
    sessionStorage.setItem(PRELOAD_RELOAD_KEY, '1');
    window.location.reload();
  }, []);
  return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={({ error }) => isStaleDeployError(error) ? <StaleDeployReload /> : <ErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
