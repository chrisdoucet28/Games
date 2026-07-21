import { useState } from 'react';
import LessonGamesGenerator from './LessonGamesGenerator';
import { AuthScreen } from './components/shared/AuthScreen';
import { useAuth } from './hooks/useAuth';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

function ConfigErrorScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#1E1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: '440px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '28px 24px', color: 'white' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚠️</div>
        <h2 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 900 }}>Missing configuration</h2>
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#C4B5FD', margin: 0 }}>
          This deployment is missing <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 5px', borderRadius: '4px' }}>VITE_SUPABASE_URL</code> and/or{' '}
          <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 5px', borderRadius: '4px' }}>VITE_SUPABASE_ANON_KEY</code>.
          Add them in your hosting provider's environment variable settings, then redeploy — adding
          them alone isn't enough, since these values are baked in at build time.
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ children, action, onAction }: { children: React.ReactNode; action: string; onAction: () => void }) {
  return (
    <div style={{
      position: 'fixed', top: '10px', right: '10px', zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: '8px',
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '20px', padding: '6px 8px 6px 14px',
      fontFamily: "'Segoe UI',system-ui,sans-serif",
    }}>
      <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>{children}</span>
      <button
        onClick={onAction}
        style={{
          background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none',
          borderRadius: '14px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
        }}
      >
        {action}
      </button>
    </div>
  );
}

function App() {
  if (!isSupabaseConfigured) return <ConfigErrorScreen />;
  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const { session, loading } = useAuth();
  // A temporary escape hatch for testing while auth is still being verified — not tied to any
  // real account, so nothing typed here can ever be saved. Resets on refresh (no persistence),
  // and should go away once login is reliably working end to end.
  const [guestMode, setGuestMode] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1E1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontFamily: "'Segoe UI',system-ui,sans-serif", fontSize: '16px' }}>Loading…</div>
      </div>
    );
  }

  if (!session && !guestMode) {
    return <AuthScreen onSkip={() => setGuestMode(true)} />;
  }

  return (
    <div>
      {session ? (
        <StatusBadge action="Log Out" onAction={() => supabase.auth.signOut()}>
          🟢 Logged in as {session.user.email}
        </StatusBadge>
      ) : (
        <StatusBadge action="Log In" onAction={() => setGuestMode(false)}>
          ⚠️ Guest mode — nothing will be saved
        </StatusBadge>
      )}
      <LessonGamesGenerator />
    </div>
  );
}

export default App;