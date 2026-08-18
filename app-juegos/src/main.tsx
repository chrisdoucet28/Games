import React from 'react'
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
