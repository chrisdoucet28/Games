import { useState } from 'react';
import LessonGamesGenerator from './LessonGamesGenerator';
import { AuthScreen } from './components/shared/AuthScreen';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabaseClient';

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