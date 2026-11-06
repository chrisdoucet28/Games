import { useEffect, useRef, useState } from "react";
import { TeamIcon } from "./TeamIcon";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  openClassSessionChannel, closeChannel, getDeviceId, PHONE_CAPABLE_GAME_IDS,
  type ClassSessionStatePayload,
  openAuctionChannel, openSpyChannel, openWhackChannel, openHotSeatChannel, openOrderUpChannel, openRaceTrackChannel, openHillChannel, openBountyBoardChannel, openRelayChannel, openRocketChannel,
  type AuctionStatePayload, type AuctionBetPayload, type AuctionCorrectionPayload, type SpyStatePayload, type SpyVoteActionPayload,
  type WhackStatePayload, type WhackTurnReportPayload,
  type HotSeatStatePayload, type HotSeatActionPayload,
  type OrderUpStatePayload, type OrderUpActionPayload,
  type RaceTrackStatePayload, type RaceTrackActionPayload,
  type HillStatePayload, type HillActionPayload,
  type BountyBoardStatePayload, type BountyBoardActionPayload,
  type RelayStatePayload, type RelayActionPayload,
  type RocketFuelStatePayload, type RocketFuelActionPayload,
} from "../../lib/liveSession";
import { PhoneAuctionView } from "../phone/PhoneAuctionView";
import { PhoneSpyView } from "../phone/PhoneSpyView";
import { PhoneWordWhackView } from "../phone/PhoneWordWhackView";
import { PhoneHotSeatView } from "../phone/PhoneHotSeatView";
import { PhoneOrderUpView } from "../phone/PhoneOrderUpView";
import { PhoneRaceTrackView } from "../phone/PhoneRaceTrackView";
import { PhoneKingOfHillView } from "../phone/PhoneKingOfHillView";
import { PhoneBountyBoardView } from "../phone/PhoneBountyBoardView";
import { PhoneRelayView } from "../phone/PhoneRelayView";
import { PhoneRocketFuelView } from "../phone/PhoneRocketFuelView";
import { GAME_COPY, type Game } from "../phone/PhoneJoinScreen";
import { useAuth } from "../../hooks/useAuth";
import { getMyClassLink, linkMyTeam, recordClassAttendance, type MyClass } from "../../lib/classMembership";
import { TEACHER_ID, TEACHER_COLOR } from "../../lib/soloOpponent";

type Props = { code: string };

type InnerStatePayload =
  | AuctionStatePayload | SpyStatePayload | WhackStatePayload | HotSeatStatePayload
  | OrderUpStatePayload | RaceTrackStatePayload | HillStatePayload | BountyBoardStatePayload
  | RelayStatePayload | RocketFuelStatePayload;

// Same threshold PhoneJoinScreen.tsx uses for its own per-game channel — here it watches the
// CLASS channel's own heartbeat instead. The inner per-game channel (opened/closed below as
// activeGame changes) deliberately has no timeout of its own: it's expected to go quiet between
// games, that's not a lost connection, it's the normal "nothing playable right now" state.
// Was 12s — too easy to trip from a normal brief screen-lock in a real classroom, and every trip
// used to dead-end at a "go to the homepage" link (see the auto-reload-on-visibility effect
// above and the reconnect button below, both added for the same real-class failure).
const STATE_TIMEOUT_MS = 20000;

// Deliberately a different key prefix than PhoneJoinScreen.tsx's own `classcade-phone-session:`
// — this claim is scoped to the whole class sitting (one stable code), not to one game's code, so
// it must never collide with (or be overwritten by) a per-game join happening on the same device.
const STORAGE_PREFIX = "classcade-class-session:";

type ClaimedSession = { code: string; teamId: string | number };

// Synthetic roster entry for Spy Among Us's teacher co-player (see the long comment where this is
// offered as a claim option below) — never actually present in classState.roster, since that's
// built from the real teams picked for today, so every display lookup against that roster needs
// this as an explicit fallback for TEACHER_ID or it silently renders blank for the teacher's own
// phone.
const TEACHER_ROSTER_ENTRY = { id: TEACHER_ID, name: "Teacher", color: TEACHER_COLOR, mascot: TEACHER_COLOR.emoji };

function loadClaimedTeamId(code: string): string | number | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + code);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClaimedSession;
    return parsed.code === code && parsed.teamId !== undefined ? parsed.teamId : null;
  } catch {
    return null;
  }
}

function clearClaimedTeamId(code: string) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + code);
  } catch {
    // Best-effort, same as saveClaimedTeamId.
  }
}

function saveClaimedTeamId(code: string, teamId: string | number) {
  try {
    localStorage.setItem(STORAGE_PREFIX + code, JSON.stringify({ code, teamId } satisfies ClaimedSession));
  } catch {
    // Best-effort — a phone in private/incognito mode just won't auto-rejoin on refresh.
  }
}

// The one place a game id gets turned into its own specific channel — every game's StatePayload
// broadcasts on the same "state" event name, so the inner effect below only ever needs ONE
// broadcast listener regardless of which game is currently active; only the OUTGOING action event
// name differs per game (see the send* wrappers near the bottom of this file).
function openChannelForGame(gameId: string, code: string): RealtimeChannel {
  switch (gameId) {
    case "spy": return openSpyChannel(code);
    case "whack": return openWhackChannel(code);
    case "hotseat": return openHotSeatChannel(code);
    case "orderup": return openOrderUpChannel(code);
    case "racetrack": return openRaceTrackChannel(code);
    case "hill": return openHillChannel(code);
    case "bounty": return openBountyBoardChannel(code);
    case "relay": return openRelayChannel(code);
    case "rocket": return openRocketChannel(code);
    default: return openAuctionChannel(code);
  }
}

// The student-side "stay on one page all class period" multiplexer for a Class Check-In sitting
// (see LessonGamesGenerator.tsx's handleStartClassCheckIn). Unlike PhoneJoinScreen.tsx — which is
// architecturally locked to one game's channel for its whole mounted lifetime — this component
// owns TWO channels at once: the persistent class channel (opened once, for the whole sitting,
// telling this phone which game is active) and a swappable per-game channel (closed and reopened
// every time the teacher switches games), rendering whichever existing Phone<Game>View component
// matches, completely unmodified — this file only ever owns channel lifecycle and dispatch, never
// any per-game rendering logic of its own.
export function ClassJoinScreen({ code }: Props) {
  useEffect(() => {
    document.title = "Join Class - ClassCade";
  }, []);

  const arenaStyle: React.CSSProperties = {
    minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "24px 20px", textAlign: "center", fontFamily: "'Segoe UI',system-ui,sans-serif",
    background: "radial-gradient(ellipse at 50% -10%,#1E3A8A 0%,#0F172A 55%,#020617 100%)", color: "white",
  };

  // --- Class channel (persistent for the whole sitting) ---
  const classChannelRef = useRef<RealtimeChannel | null>(null);
  const claimedTeamIdRef = useRef<string | number | null>(loadClaimedTeamId(code));
  const [claimedTeamId, setClaimedTeamId] = useState<string | number | null>(claimedTeamIdRef.current);
  const [classState, setClassState] = useState<ClassSessionStatePayload | null>(null);
  const [lastClassStateAt, setLastClassStateAt] = useState<number | null>(null);
  const mountTimeRef = useRef(Date.now());
  const [nowTick, setNowTick] = useState(Date.now());

  // Mirrors lastClassStateAt for the visibility handler below, which needs a stable callback (added
  // once, never torn down/re-added) that still always reads the LATEST staleness — a state value
  // closed over at listener-registration time would stay frozen at whatever it was on mount.
  const lastClassStateAtRef = useRef<number | null>(null);

  useEffect(() => {
    const channel = openClassSessionChannel(code);
    classChannelRef.current = channel;

    channel.on("broadcast", { event: "state" }, ({ payload }) => {
      setClassState(payload as ClassSessionStatePayload);
      lastClassStateAtRef.current = Date.now();
      setLastClassStateAt(lastClassStateAtRef.current);
    });

    channel.subscribe(status => {
      // Re-announces this phone's claim on every (re)connect — covers a wifi drop reconnecting
      // cleanly without the student needing to re-tap their team, same as every per-game join.
      if (status === "SUBSCRIBED" && claimedTeamIdRef.current !== null) {
        channel.track({ teamId: claimedTeamIdRef.current, deviceId: getDeviceId() });
      }
    });

    return () => {
      closeChannel(channel);
      classChannelRef.current = null;
    };
  }, [code]);

  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // A locked/backgrounded phone's realtime connection doesn't reliably spring back to life the
  // instant the student looks at it again — mobile browsers suspend background tabs aggressively
  // enough that the channel can sit dead well past STATE_TIMEOUT_MS with nothing proactively
  // retrying. Without this, the student's first signal anything's wrong is the "Lost connection"
  // screen below, whose only way out used to be a dead-end link to the plain classcade.com
  // homepage — tapping it (a reasonable thing to do when told you're disconnected) is what was
  // actually sending students away from the game and losing their place, not anything about
  // sharing a device. A plain reload is the most reliable fix: it re-fetches this exact same join
  // URL in this exact same tab, so the team already claimed (saveClaimedTeamId, read at mount) and
  // this phone's own device id (sessionStorage, tab-scoped but untouched by a reload) both come
  // right back — same team, same spot in any per-device rotation, no re-claiming needed.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const staleSince = lastClassStateAtRef.current ?? mountTimeRef.current;
      if (Date.now() - staleSince > STATE_TIMEOUT_MS) window.location.reload();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const connectionLost = lastClassStateAt === null
    ? nowTick - mountTimeRef.current > STATE_TIMEOUT_MS
    : nowTick - lastClassStateAt > STATE_TIMEOUT_MS;

  const handleClaim = (teamId: string | number) => {
    claimedTeamIdRef.current = teamId;
    setClaimedTeamId(teamId);
    saveClaimedTeamId(code, teamId);
    classChannelRef.current?.track({ teamId, deviceId: getDeviceId() });
  };

  // --- Optional student account ---
  // Nothing in this block is ever required: a phone with no logged-in student skips all of it and
  // behaves exactly as before, and every call here fails silently. A logged-in student who is an
  // approved member of this class gets their saved team auto-picked, the team they pick remembered,
  // and today's check-in counted (see lib/classMembership.ts and the class_membership migration).
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const classId = classState?.classId ?? null;
  const [link, setLink] = useState<MyClass | null>(null);
  const [checkinCounted, setCheckinCounted] = useState(false);
  // Set when the student taps "Not your team? Change", so their remembered team isn't instantly re-picked.
  const suppressAutoClaimRef = useRef(false);
  const checkinDoneRef = useRef(false);
  const lastLinkAttemptRef = useRef<string | null>(null);

  useEffect(() => {
    setLink(null);
    if (!userId || !classId) return;
    let cancelled = false;
    getMyClassLink(classId).then(l => {
      if (cancelled) return;
      setLink(l);
      lastLinkAttemptRef.current = l?.team?.id ?? null;
    });
    return () => { cancelled = true; };
  }, [userId, classId]);

  // Auto-pick the remembered team, if it's in today's line-up.
  useEffect(() => {
    if (!link?.team || claimedTeamId !== null || !classState || suppressAutoClaimRef.current) return;
    const rememberedId = link.team.id;
    const match = classState.roster.find(t => t.rosterId === rememberedId);
    if (match) handleClaim(match.id);
  }, [link, claimedTeamId, classState]);

  // Once on a team: remember it on the account (when it changed) and count today's check-in.
  useEffect(() => {
    if (!link || !classId || claimedTeamId === null || !classState) return;
    const team = classState.roster.find(t => t.id === claimedTeamId);
    const rosterId = team?.rosterId ?? null;
    if (rosterId && rosterId !== lastLinkAttemptRef.current) {
      lastLinkAttemptRef.current = rosterId;
      linkMyTeam(classId, rosterId);
    }
    if (!checkinDoneRef.current) {
      checkinDoneRef.current = true;
      recordClassAttendance(classId).then(isNew => { if (isNew) setCheckinCounted(true); });
    }
  }, [link, classId, claimedTeamId, classState]);

  const handleChangeTeam = () => {
    suppressAutoClaimRef.current = true;
    claimedTeamIdRef.current = null;
    setClaimedTeamId(null);
    clearClaimedTeamId(code);
    classChannelRef.current?.untrack();
  };

  // --- Inner per-game channel (opened/closed every time activeGame changes) ---
  const innerChannelRef = useRef<RealtimeChannel | null>(null);
  const [innerState, setInnerState] = useState<InnerStatePayload | null>(null);
  const activeGame = classState?.activeGame ?? null;

  useEffect(() => {
    // Always reset first — never render a previous game's stale view while waiting for a new
    // channel's first broadcast, and nothing to open at all until a team's actually been claimed.
    setInnerState(null);
    if (claimedTeamId === null || activeGame === null || !PHONE_CAPABLE_GAME_IDS.has(activeGame)) return;

    const channel = openChannelForGame(activeGame, code);
    innerChannelRef.current = channel;
    channel.on("broadcast", { event: "state" }, ({ payload }) => setInnerState(payload as InnerStatePayload));
    channel.subscribe(status => {
      // The "auto-forward the remembered claim, zero user action" step — this is the entire
      // mechanism that lets a student never re-tap their team for the rest of the class period.
      if (status === "SUBSCRIBED") channel.track({ teamId: claimedTeamId, deviceId: getDeviceId() });
    });

    return () => {
      closeChannel(channel);
      if (innerChannelRef.current === channel) innerChannelRef.current = null;
    };
  }, [activeGame, claimedTeamId, code]);

  const sendBet = (payload: AuctionBetPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "bet", payload });
  const sendCorrection = (payload: AuctionCorrectionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "correction", payload });
  const sendSpyVote = (payload: SpyVoteActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });
  const sendTurnReport = (payload: WhackTurnReportPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "turnReport", payload });
  const sendHotSeatAction = (payload: HotSeatActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });
  const sendOrderUpAction = (payload: OrderUpActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });
  const sendRaceTrackAction = (payload: RaceTrackActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });
  const sendHillAction = (payload: HillActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });
  const sendBountyBoardAction = (payload: BountyBoardActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });
  const sendRelayAction = (payload: RelayActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });
  const sendRocketAction = (payload: RocketFuelActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });

  if (connectionLost) {
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>📡</div>
        <div style={{ fontWeight: "900", fontSize: "18px", marginBottom: "8px", color: "#FCD34D" }}>
          {lastClassStateAt === null ? "Couldn't find this class" : "Lost connection to your teacher's screen"}
        </div>
        <div style={{ color: "#93C5FD", fontSize: "14px", lineHeight: 1.6 }}>
          Code: <strong style={{ color: "white" }}>{code}</strong>
        </div>
        {/* Reloads this exact join URL in this exact tab — the already-claimed team and this
            phone's own device id both come right back (see the auto-reload-on-visibility effect
            above for the full reasoning), so this is "try again" for the overwhelmingly common
            case (teacher's session is actually still running). A dead-end link to the plain
            classcade.com homepage used to sit here — tapping it, a reasonable reaction to being
            told you're disconnected, was what actually sent students away and lost their place. */}
        <button
          onClick={() => window.location.reload()}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "20px", background: "#38BDF8", color: "#0F172A", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "900", cursor: "pointer" }}
        >
          🔄 Reconnect
        </button>
        <div style={{ color: "#93C5FD99", fontSize: "12px", marginTop: "14px", lineHeight: 1.6 }}>
          Still nothing? Ask your teacher to check today's class check-in is still open, or for a new code.
        </div>
      </div>
    );
  }

  if (!classState) {
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎒</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D" }}>Joining class {code}…</div>
        <div style={{ color: "#93C5FD", fontSize: "14px", marginTop: "8px" }}>Waiting for your teacher's screen</div>
      </div>
    );
  }

  if (claimedTeamId === null) {
    // Spy Among Us is the one game where a teacher can be a genuine second live participant with
    // their OWN private phone view (solo play requires it; a real 2-team game can opt it in) — see
    // SpyAmongUsGame.tsx's own teacherJoining/makeTeacherTeam. That synthetic "Teacher" entry only
    // ever existed in Spy's own per-game roster, which a phone used to connect to directly; now
    // that every "Play on Phones" tap promotes to this shared class-level session instead, this
    // class-level roster (built from the real teams picked for today, in LessonGamesGenerator.tsx's
    // sendClassSessionState) is the only thing a phone ever sees to claim from, and it has no idea
    // Spy's own teacher co-play feature exists — so the option silently disappeared. Showing it here
    // too (same id Spy's own roster uses) restores it: claiming "teacher" here just flows through to
    // Spy's own channel exactly as if the teacher had scanned Spy's own QR directly. Shown whenever
    // Spy is the active game, even for a team count where Spy wouldn't actually offer it (3+ real
    // teams) — tapping it then is a harmless dead end ("nothing to do on your phone"), far better
    // than the option being invisible in the 1-2 team case where it's actually needed.
    const showTeacherOption = classState.activeGame === "spy";
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "36px", marginBottom: "6px" }}>🎒</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D", marginBottom: "18px" }}>Tap your team</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "360px" }}>
          {/* Word Relay and Hot Seat are the two games where several phones genuinely share a team
              on purpose (each is one person — Relay's asker rotation, Hot Seat's guesser/describer
              split) — same exception PhoneJoinScreen.tsx's own lock already carves out. Every other
              game locks a team to whichever phone claimed it first, same as that per-game flow:
              without this, any phone (a different team's student, or just someone with the code)
              could tap an already-claimed team — including "Teacher" below — and see THAT team's
              own private state (Spy Among Us's secret role/prompt above all) for the rest of the
              sitting, not just this one game. */}
          {classState.roster.map(t => {
            const takenByOther = classState.activeGame !== "relay" && classState.activeGame !== "hotseat" && classState.activeGame !== "rocket" && classState.connectedTeamIds.includes(t.id) && t.id !== claimedTeamIdRef.current;
            return (
              <button
                key={t.id}
                onClick={() => !takenByOther && handleClaim(t.id)}
                disabled={takenByOther}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px",
                  borderRadius: "16px", border: `2px solid ${t.color.bg}`,
                  background: takenByOther ? "rgba(255,255,255,0.04)" : `linear-gradient(160deg,${t.color.dark}55,#1E1033)`,
                  color: "white", fontWeight: "800", fontSize: "16px", cursor: takenByOther ? "not-allowed" : "pointer",
                  opacity: takenByOther ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: "24px" }}><TeamIcon team={t} size={24} /></span>
                <span style={{ flex: 1, textAlign: "left" }}>{t.name}</span>
                {takenByOther && <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "700" }}>Already joined</span>}
              </button>
            );
          })}
          {showTeacherOption && (() => {
            const takenByOther = classState.connectedTeamIds.includes(TEACHER_ID) && TEACHER_ID !== claimedTeamIdRef.current;
            return (
              <button
                onClick={() => !takenByOther && handleClaim(TEACHER_ID)}
                disabled={takenByOther}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px",
                  borderRadius: "16px", border: `2px dashed ${TEACHER_COLOR.bg}`,
                  background: takenByOther ? "rgba(255,255,255,0.04)" : `linear-gradient(160deg,${TEACHER_COLOR.dark}55,#1E1033)`,
                  color: "white", fontWeight: "800", fontSize: "16px", cursor: takenByOther ? "not-allowed" : "pointer",
                  opacity: takenByOther ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: "24px" }}><TeamIcon team={TEACHER_ROSTER_ENTRY} size={24} /></span>
                <span style={{ flex: 1, textAlign: "left" }}>Teacher (playing too)</span>
                {takenByOther && <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "700" }}>Already joined</span>}
              </button>
            );
          })()}
        </div>
        <div style={{ color: "#93C5FD99", fontSize: "12px", marginTop: "18px", lineHeight: 1.6 }}>
          You'll only need to do this once — your phone will automatically follow along for the rest of class.
        </div>
        {link && (
          <div style={{ color: "#86EFAC", fontSize: "12px", marginTop: "8px", lineHeight: 1.5 }}>
            Signed in to your class — we'll remember your team for next time.
          </div>
        )}
      </div>
    );
  }

  const claimedTeam = classState.roster.find(t => t.id === claimedTeamId)
    ?? (claimedTeamId === TEACHER_ID ? TEACHER_ROSTER_ENTRY : undefined);

  // The "Teacher" claim option above is shown any time Spy is active, since this class-level
  // roster has no way to know Spy's own teacherJoining toggle state (see that option's own long
  // comment) — so it can be tapped in a round where Spy actually has nobody playing teacher (a
  // 2-team game whose "want the teacher to join in as a 3rd player?" toggle is off, or 3+ real
  // teams, where that toggle isn't even offered). Once Spy's own state arrives, its OWN roster is
  // the ground truth for whether "teacher" is really a seat in THIS round — falling through to
  // PhoneSpyView with a teamId it doesn't recognize would render a broken-looking blank role card
  // instead of the clear, actionable message this case gets instead.
  const teacherOptionInactive = claimedTeamId === TEACHER_ID && activeGame === "spy" && !!innerState
    && !innerState.roster.some(t => t.id === TEACHER_ID);

  // Nothing playable right now — either between games, the active game has no phone mode at all
  // (see the confirmed design: no phone support is being added to those 8 games in this pass), or
  // this phone claimed "Teacher" for a Spy round that isn't actually using it (see above).
  if (activeGame === null || !PHONE_CAPABLE_GAME_IDS.has(activeGame) || !innerState || teacherOptionInactive) {
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "22px", marginBottom: "4px" }}><TeamIcon team={claimedTeam} size={22} /></div>
        <div style={{ fontWeight: "900", fontSize: "16px", marginBottom: "18px" }}>{claimedTeam?.name}</div>
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>{teacherOptionInactive ? "🙅" : "📺"}</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D", marginBottom: "8px" }}>
          {teacherOptionInactive ? "The teacher isn't playing this round" : "Watch the shared screen"}
        </div>
        <div style={{ color: "#93C5FD", fontSize: "14px", lineHeight: 1.6 }}>
          {teacherOptionInactive
            ? "Ask your teacher to turn on \"teacher plays too\" on their screen, or pick a real team below instead."
            : "Nothing to do on your phone right now — it'll switch on its own the moment your teacher starts a phone-friendly game."}
        </div>
        {checkinCounted ? (
          <div style={{ marginTop: "16px", background: "rgba(134,239,172,0.12)", border: "1px solid rgba(134,239,172,0.4)", color: "#86EFAC", borderRadius: "12px", padding: "8px 14px", fontSize: "13px", fontWeight: 700 }}>
            ✓ Check-in counted today · +10 XP
          </div>
        ) : link ? (
          <div style={{ marginTop: "16px", color: "#86EFAC", fontSize: "12.5px" }}>Signed in — your team is saved to your account.</div>
        ) : null}
        <button
          onClick={handleChangeTeam}
          style={{ marginTop: "22px", background: "none", border: "none", color: "#93C5FD99", fontSize: "12px", textDecoration: "underline", cursor: "pointer" }}
        >
          Not your team? Change
        </button>
      </div>
    );
  }

  // The teacher hasn't actually started the game yet ("intro" for Auction, "lobby" for every
  // other phone-capable game — see PhoneJoinScreen.tsx's own copy of this same gate, which this
  // class-level flow was missing: it rendered straight into the per-game view the moment a game's
  // FIRST broadcast arrived, lobby or not). Nobody should see anything private — Spy Among Us's
  // secret topic/role above all, since that's the entire point of the game — before the whole
  // room starts together at the teacher's own signal.
  if (innerState.phase === "intro" || innerState.phase === "lobby") {
    const copy = GAME_COPY[activeGame as Game];
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "36px", marginBottom: "6px" }}>{claimedTeam ? <TeamIcon team={claimedTeam} size={36} /> : copy.joinEmoji}</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D", marginBottom: "8px" }}>You're in as {claimedTeam?.name}!</div>
        <div style={{ color: "#93C5FD", fontSize: "14px", lineHeight: 1.6 }}>{copy.startingBody}</div>
      </div>
    );
  }

  if (activeGame === "spy") {
    return <PhoneSpyView state={innerState as SpyStatePayload} teamId={claimedTeamId} onAction={sendSpyVote} />;
  }
  if (activeGame === "whack") {
    return <PhoneWordWhackView state={innerState as WhackStatePayload} teamId={claimedTeamId} deviceId={getDeviceId()} onTurnReport={sendTurnReport} />;
  }
  if (activeGame === "hotseat") {
    return <PhoneHotSeatView state={innerState as HotSeatStatePayload} teamId={claimedTeamId} deviceId={getDeviceId()} onAction={sendHotSeatAction} />;
  }
  if (activeGame === "orderup") {
    return <PhoneOrderUpView state={innerState as OrderUpStatePayload} teamId={claimedTeamId} onAction={sendOrderUpAction} />;
  }
  if (activeGame === "racetrack") {
    return <PhoneRaceTrackView state={innerState as RaceTrackStatePayload} teamId={claimedTeamId} onAction={sendRaceTrackAction} />;
  }
  if (activeGame === "hill") {
    return <PhoneKingOfHillView state={innerState as HillStatePayload} teamId={claimedTeamId} onAction={sendHillAction} />;
  }
  if (activeGame === "bounty") {
    return <PhoneBountyBoardView state={innerState as BountyBoardStatePayload} teamId={claimedTeamId} onAction={sendBountyBoardAction} />;
  }
  if (activeGame === "relay") {
    return <PhoneRelayView state={innerState as RelayStatePayload} teamId={claimedTeamId} deviceId={getDeviceId()} onAction={sendRelayAction} />;
  }
  if (activeGame === "rocket") {
    return <PhoneRocketFuelView state={innerState as RocketFuelStatePayload} teamId={claimedTeamId} deviceId={getDeviceId()} onAction={sendRocketAction} />;
  }
  return <PhoneAuctionView state={innerState as AuctionStatePayload} teamId={claimedTeamId} onBet={sendBet} onSubmitCorrection={sendCorrection} />;
}
