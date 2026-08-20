import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import LessonGamesGenerator from './LessonGamesGenerator';
import { AuthScreen } from './components/shared/AuthScreen';
import { PhoneJoinScreen } from './components/phone/PhoneJoinScreen';
import { useAuth } from './hooks/useAuth';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { getProfile } from './lib/profile';
import { getSubscription, FREE_SUBSCRIPTION } from './lib/subscription';
import { DEFAULT_THEME, getTheme, type Theme } from './data/themes';
import { PlanIntroScreen } from './components/shared/PlanIntroScreen';
import { TESTING_BYPASS_PAYWALL } from './data/constants';

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

// Deliberately NOT position:fixed — an earlier version floated this over everything, which
// meant it sat on top of (and blocked) LessonGamesGenerator's own top-right button row (Save
// Progress/Fullscreen/End Game) whenever a game was in progress. A plain top strip in normal
// document flow just pushes the rest of the page down instead, so it can never overlap anything
// regardless of which screen is showing.
function StatusBadge({ children, action, onAction, theme }: { children: React.ReactNode; action: string; onAction: () => void; theme: Theme }) {
  return (
    <div
      // "learn-no-print" is a global class defined in LearnScreen.tsx's injected print
      // stylesheet — hides this bar (and anything else tagged with it) whenever a Learn
      // lesson is printed, since it's chrome, not part of the handout.
      className="learn-no-print"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px',
        background: theme.heroBg[0], padding: '6px 14px',
        fontFamily: "'Segoe UI',system-ui,sans-serif",
      }}
    >
      <span style={{ color: 'white', fontSize: '12px', fontWeight: 700, fontFamily: theme.headingFont }}>{children}</span>
      <button
        onClick={onAction}
        style={{
          background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none',
          borderRadius: '14px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          fontFamily: theme.headingFont,
        }}
      >
        {action}
      </button>
    </div>
  );
}

function App() {
  if (!isSupabaseConfigured) return <ConfigErrorScreen />;
  // Students joining a phone-controlled game (see AuctionGame.tsx / SpyAmongUsGame.tsx /
  // WordWhackGame.tsx's "Play on Phones" mode) have no teacher account — this has to branch
  // *before* AuthenticatedApp/useAuth ever runs, unlike the Stripe checkout-redirect param below
  // (which intentionally runs inside the authenticated tree). Deliberately not scrubbed from the
  // URL the way that one is: PhoneJoinScreen re-reads it on every mount, and it needs to survive a
  // phone-side refresh to auto-rejoin. `game` defaults to 'auction' so existing/already-shared
  // Auction join links (from before this param existed) keep working unchanged.
  const searchParams = new URLSearchParams(window.location.search);
  const joinCode = searchParams.get('join');
  const gameParam = searchParams.get('game');
  const joinGame = gameParam === 'spy' ? 'spy' : gameParam === 'whack' ? 'whack' : 'auction';
  if (joinCode) {
    return (
      <>
        <PhoneJoinScreen code={joinCode} game={joinGame} />
        <Analytics />
      </>
    );
  }
  return (
    <>
      <AuthenticatedApp />
      <Analytics />
    </>
  );
}

function AuthenticatedApp() {
  const { session, loading } = useAuth();
  // The single source of truth for the teacher's chosen accent theme — fetched here (not inside
  // LessonGamesGenerator) so the top status bar can use it too, not just the screens below it.
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  // Same pattern for billing state — defaults to the free tier until the real row loads (or
  // forever, for a teacher who's never subscribed), so every screen can read it immediately
  // without null-checking.
  const [subscription, setSubscription] = useState(FREE_SUBSCRIPTION);
  // Optimistic default of "already seen" so returning teachers keep the app's instant-load feel
  // (no blocking wait on the profile fetch below) — only a brand-new signup, whose real profile
  // row was just created with the column's false default, ever flips this to false and sees
  // PlanIntroScreen. One-time flash of the welcome screen for that case is an acceptable tradeoff.
  const [planIntroSeen, setPlanIntroSeen] = useState(true);
  // Stripe's checkout success/cancel URLs redirect back to "/?checkout=success|cancel" — read
  // that once on load, then strip it from the URL so a refresh doesn't re-trigger it.
  const [checkoutRedirect] = useState<'success' | 'cancel' | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get('checkout');
    if (value === 'success' || value === 'cancel') {
      window.history.replaceState({}, '', window.location.pathname);
      return value;
    }
    return null;
  });

  useEffect(() => {
    if (!session) return;
    getProfile().then(p => {
      setTheme(getTheme(p.theme_id));
      setPlanIntroSeen(p.has_completed_plan_intro);
    }).catch(() => {});
    getSubscription().then(setSubscription).catch(() => {});
  }, [session]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1E1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontFamily: "'Segoe UI',system-ui,sans-serif", fontSize: '16px' }}>Loading…</div>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  // See TESTING_BYPASS_PAYWALL's comment in data/constants.ts — skips the onboarding
  // plan-choice screen entirely while pre-launch testing is underway. The underlying
  // has_completed_plan_intro tracking is untouched, so real per-account behavior resumes
  // exactly as designed the moment this flag is switched off.
  if (!planIntroSeen && !TESTING_BYPASS_PAYWALL) {
    return (
      <div>
        <StatusBadge action="Log Out" onAction={() => supabase.auth.signOut()} theme={theme}>
          🟢 Logged in as {session.user.email}
        </StatusBadge>
        <PlanIntroScreen theme={theme} onSubscriptionChange={setSubscription} onDismiss={() => setPlanIntroSeen(true)} />
      </div>
    );
  }

  return (
    <div>
      <StatusBadge action="Log Out" onAction={() => supabase.auth.signOut()} theme={theme}>
        🟢 Logged in as {session.user.email}
      </StatusBadge>
      <LessonGamesGenerator
        theme={theme} onThemeChange={setTheme}
        subscription={subscription} onSubscriptionChange={setSubscription}
        checkoutRedirect={checkoutRedirect}
      />
    </div>
  );
}

export default App;