import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import LessonGamesGenerator from './LessonGamesGenerator';
import { AuthScreen } from './components/shared/AuthScreen';
import { ResetPasswordScreen } from './components/shared/ResetPasswordScreen';
import { PhoneJoinScreen } from './components/phone/PhoneJoinScreen';
import { ClassJoinScreen } from './components/shared/ClassJoinScreen';
import { useAuth } from './hooks/useAuth';
import { capturePendingJoinCode } from './lib/pendingJoin';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { getProfile } from './lib/profile';
import { getSubscription, FREE_SUBSCRIPTION } from './lib/subscription';
import { DEFAULT_THEME, getTheme, type Theme } from './data/themes';
import { PlanIntroScreen } from './components/shared/PlanIntroScreen';
import { WelcomeIntroScreen } from './components/shared/WelcomeIntroScreen';
import { PrivacyPolicyScreen } from './components/shared/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from './components/shared/TermsOfServiceScreen';
import { OurStoryScreen } from './components/shared/OurStoryScreen';
import { PublicLearnIndexScreen } from './components/shared/PublicLearnIndexScreen';
import { PublicLearnLessonScreen } from './components/shared/PublicLearnLessonScreen';
import { PracticeScreen } from './components/shared/PracticeScreen';
import { RoleChooserScreen } from './components/shared/RoleChooserScreen';
import { StudentHome } from './components/student/StudentHome';
import { AdminScreen } from './components/shared/AdminScreen';
import { FREE_LAUNCH_ALL_PREMIUM } from './data/constants';
import { Icon } from './components/shared/Icon';
import { isMusicEnabled, setMusicEnabled, onMusicEnabledChange, stopMusic } from './lib/music';

function ConfigErrorScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#1E1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: '440px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '28px 24px', color: 'white' }}>
        <Icon name="warning" size={32} color="#FCD34D" style={{ marginBottom: '10px' }} />
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
function StatusBadge({ children, action, onAction, theme, isAdmin }: { children: React.ReactNode; action: string; onAction: () => void; theme: Theme; isAdmin?: boolean }) {
  // The one spot rendered on every logged-in screen, so it's the only place a persistent
  // background-music mute control can live — the per-game sound toggle in LessonGamesGenerator's
  // game header only covers the actual game screen, but music now plays everywhere.
  const [musicOn, setMusicOnState] = useState(isMusicEnabled);
  useEffect(() => onMusicEnabledChange(setMusicOnState), []);

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
      {isAdmin && (
        <button
          onClick={() => { window.location.pathname = '/admin'; }}
          title="Admin panel"
          style={{
            background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none',
            borderRadius: '14px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
            fontFamily: theme.headingFont,
          }}
        >
          Admin
        </button>
      )}
      <button
        onClick={() => setMusicEnabled(!musicOn)}
        title={musicOn ? 'Mute background music' : 'Unmute background music'}
        style={{
          background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none',
          borderRadius: '14px', padding: '6px 8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
        }}
      >
        <Icon name={musicOn ? 'musicOn' : 'musicOff'} size={13} />
      </button>
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
  // Public, static, no-auth-required legal pages — linked from the Google OAuth consent screen
  // (and generally required for a public app to have). No client-side router exists in this app
  // (every other screen is state-driven, not URL-driven), so this is a plain pathname check ahead
  // of everything else, same spirit as the ?join= check below but for a real path instead of a
  // query param. Vercel's vercel.json rewrites every path to "/", so these two components are what
  // actually make "/privacy" and "/terms" resolve to real content rather than the app shell.
  if (window.location.pathname === '/privacy') return <PrivacyPolicyScreen />;
  if (window.location.pathname === '/terms') return <TermsOfServiceScreen />;
  if (window.location.pathname === '/about') return <OurStoryScreen />;
  // Public, no-login Learn pages — same pathname-check pattern as the two above, so they render
  // (and are Google-indexable) with no dependency on Supabase/auth state. /learn/<id> is a prefix
  // match (not exact) so it can carry the topic id as the rest of the path; an id that doesn't
  // resolve to a real lesson is handled inside PublicLearnLessonScreen itself (a real "not found"
  // page, not a silent redirect).
  if (window.location.pathname === '/learn') return <PublicLearnIndexScreen />;
  if (window.location.pathname.startsWith('/learn/')) {
    return <PublicLearnLessonScreen topicId={window.location.pathname.slice('/learn/'.length)} />;
  }
  // Public, no-login solo practice quiz — same pathname-check pattern as /learn above, so it needs
  // no Supabase/auth state either. A single screen (no /practice/<id> sub-routes) since a practice
  // session isn't standalone shareable content the way a /learn/<id> lesson page is.
  if (window.location.pathname === '/practice') return <PracticeScreen />;
  if (!isSupabaseConfigured) return <ConfigErrorScreen />;
  const searchParams = new URLSearchParams(window.location.search);
  // A separate param (not `join=&game=class`) deliberately — `gameParam` below has a silent
  // fallback-to-Auction default for any unrecognized value (kept for old shared Auction links with
  // no `game` param at all), and a class-join shouldn't inherit that footgun. ClassJoinScreen also
  // has to dynamically swap which per-game channel it's driving over its lifetime, something
  // PhoneJoinScreen is architecturally locked against — a fundamentally different render target,
  // not just another value in that same ternary chain.
  const classJoinCode = searchParams.get('classJoin');
  if (classJoinCode) {
    return (
      <>
        <ClassJoinScreen code={classJoinCode} />
        <Analytics />
      </>
    );
  }
  // Students joining a phone-controlled game (see AuctionGame.tsx / SpyAmongUsGame.tsx /
  // WordWhackGame.tsx / HotSeatGame.tsx's "Play on Phones" mode) have no teacher account — this
  // has to branch *before* AuthenticatedApp/useAuth ever runs, unlike the Stripe checkout-redirect
  // param below (which intentionally runs inside the authenticated tree). Deliberately not
  // scrubbed from the URL the way that one is: PhoneJoinScreen re-reads it on every mount, and it
  // needs to survive a phone-side refresh to auto-rejoin. `game` defaults to 'auction' so existing/
  // already-shared Auction join links (from before this param existed) keep working unchanged.
  const joinCode = searchParams.get('join');
  const gameParam = searchParams.get('game');
  const joinGame = gameParam === 'spy' ? 'spy' : gameParam === 'whack' ? 'whack' : gameParam === 'hotseat' ? 'hotseat' : gameParam === 'orderup' ? 'orderup' : gameParam === 'racetrack' ? 'racetrack' : gameParam === 'hill' ? 'hill' : gameParam === 'bounty' ? 'bounty' : gameParam === 'relay' ? 'relay' : 'auction';
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
  const { session, loading, passwordRecovery, clearPasswordRecovery } = useAuth();
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
  // Set only when the welcome screen's "Explore Learn" button is used — passed through to
  // LessonGamesGenerator as a one-time initial-screen override, same idea as checkoutRedirect
  // below (both only ever matter on the very first render after this gate clears).
  const [initialScreen, setInitialScreen] = useState<'learn' | null>(null);
  // A teacher's shared class link ("/?joinClass=CODE"): parked in sessionStorage and stripped from the
  // address before any screen renders, so the code survives logging in or signing up and then
  // prefills the student home's "Join a class" form (see lib/pendingJoin.ts). Teachers ignore it.
  useState(() => capturePendingJoinCode());
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

  // Whether this account is a teacher or a student, and whether it has answered that question yet.
  // null = the profile hasn't loaded, so nothing role-specific renders (a student never gets a
  // flash of the teacher app). Keyed on the user id, not the session object, so a token refresh
  // doesn't put the loading splash back up. A profile with no role columns at all (a database
  // without the student_accounts migration) or a failed fetch both fall back to today's behavior:
  // an already-decided teacher.
  const userId = session?.user.id ?? null;
  const [roleInfo, setRoleInfo] = useState<{ role: 'teacher' | 'student'; chosen: boolean } | null>(null);
  // Gates the hidden /admin panel — true only for the app owner's own account (see the
  // admin_access migration). Fetched in the same getProfile() call as role/chosen above rather
  // than a second request; defaults to false on a database that doesn't have the column yet or on
  // a failed fetch, same defensive posture as roleInfo's own catch below.
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!userId) { setRoleInfo(null); setIsAdmin(false); return; }
    let cancelled = false;
    getProfile()
      .then(p => { if (!cancelled) { setRoleInfo({ role: p.role ?? 'teacher', chosen: p.role_chosen ?? true }); setIsAdmin(p.is_admin ?? false); } })
      .catch(() => { if (!cancelled) { setRoleInfo({ role: 'teacher', chosen: true }); setIsAdmin(false); } });
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (!session) {
      // Nothing else ever silences the music on its own here — the AuthScreen/MarketingLanding
      // shown below never calls into lib/music at all, so without this, music started while
      // logged in would just keep looping straight through a Log Out (or a session expiring).
      stopMusic();
      return;
    }
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

  // A recovery-link session — parked here before role/plan/app state matters at all, since the
  // point of this session is only to let them set a new password, not to use the app yet.
  if (passwordRecovery) {
    return <ResetPasswordScreen onDone={clearPasswordRecovery} />;
  }

  if (!roleInfo) {
    return (
      <div style={{ minHeight: '100vh', background: '#1E1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontFamily: "'Segoe UI',system-ui,sans-serif", fontSize: '16px' }}>Loading…</div>
      </div>
    );
  }

  // A hidden, non-linked route — falls through silently (no hint the route exists) for anyone
  // whose profile isn't flagged is_admin, same "just don't render it" gate as everywhere else here.
  if (window.location.pathname === '/admin' && isAdmin) {
    return <AdminScreen userEmail={session.user.email ?? null} onExit={() => { window.location.pathname = '/'; }} />;
  }

  // Both the one-time chooser and the student home get the same slim top bar (log out + music
  // mute) as the teacher app — a student never sees the teacher's welcome/plan screens.
  if (!roleInfo.chosen || roleInfo.role === 'student') {
    return (
      <div>
        <StatusBadge action="Log Out" onAction={() => supabase.auth.signOut()} theme={theme} isAdmin={isAdmin}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', display: 'inline-block', marginRight: '6px' }} />
          Logged in as {session.user.email}
        </StatusBadge>
        {!roleInfo.chosen ? (
          <RoleChooserScreen onChosen={role => setRoleInfo({ role, chosen: true })} />
        ) : (
          <StudentHome onSwitchToTeacher={() => window.location.reload()} />
        )}
      </div>
    );
  }

  // See FREE_LAUNCH_ALL_PREMIUM's comment in data/constants.ts — while it's on, this same
  // has_completed_plan_intro gate shows a lightweight "how this works" welcome screen instead of
  // the real plan-choice screen, since there's no billing decision to make right now. Swaps back
  // to PlanIntroScreen automatically once billing is turned on — no change needed here then.
  if (!planIntroSeen) {
    return (
      <div>
        <StatusBadge action="Log Out" onAction={() => supabase.auth.signOut()} theme={theme} isAdmin={isAdmin}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', display: 'inline-block', marginRight: '6px' }} />
          Logged in as {session.user.email}
        </StatusBadge>
        {FREE_LAUNCH_ALL_PREMIUM ? (
          <WelcomeIntroScreen theme={theme} onDismiss={goTo => { setInitialScreen(goTo ?? null); setPlanIntroSeen(true); }} />
        ) : (
          <PlanIntroScreen theme={theme} onSubscriptionChange={setSubscription} onDismiss={() => setPlanIntroSeen(true)} />
        )}
      </div>
    );
  }

  return (
    <div>
      <StatusBadge action="Log Out" onAction={() => supabase.auth.signOut()} theme={theme} isAdmin={isAdmin}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', display: 'inline-block', marginRight: '6px' }} />
        Logged in as {session.user.email}
      </StatusBadge>
      <LessonGamesGenerator
        theme={theme} onThemeChange={setTheme}
        subscription={subscription} onSubscriptionChange={setSubscription}
        checkoutRedirect={checkoutRedirect}
        initialScreen={initialScreen}
      />
    </div>
  );
}

export default App;