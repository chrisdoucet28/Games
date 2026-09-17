import { useEffect, useRef, useState } from "react";
import { TeamIcon } from "./TeamIcon";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  openClassSessionChannel, closeChannel, PHONE_CAPABLE_GAME_IDS,
  type ClassSessionStatePayload,
  openAuctionChannel, openSpyChannel, openWhackChannel, openHotSeatChannel, openOrderUpChannel, openRaceTrackChannel, openHillChannel, openBountyBoardChannel, openRelayChannel,
  type AuctionStatePayload, type AuctionBetPayload, type SpyStatePayload,
  type WhackStatePayload, type WhackTurnReportPayload,
  type HotSeatStatePayload, type HotSeatActionPayload,
  type OrderUpStatePayload, type OrderUpActionPayload,
  type RaceTrackStatePayload, type RaceTrackActionPayload,
  type HillStatePayload, type HillActionPayload,
  type BountyBoardStatePayload, type BountyBoardActionPayload,
  type RelayStatePayload, type RelayActionPayload,
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

type Props = { code: string };

type InnerStatePayload =
  | AuctionStatePayload | SpyStatePayload | WhackStatePayload | HotSeatStatePayload
  | OrderUpStatePayload | RaceTrackStatePayload | HillStatePayload | BountyBoardStatePayload
  | RelayStatePayload;

// Same threshold PhoneJoinScreen.tsx uses for its own per-game channel — here it watches the
// CLASS channel's own heartbeat instead. The inner per-game channel (opened/closed below as
// activeGame changes) deliberately has no timeout of its own: it's expected to go quiet between
// games, that's not a lost connection, it's the normal "nothing playable right now" state.
const STATE_TIMEOUT_MS = 12000;

// Deliberately a different key prefix than PhoneJoinScreen.tsx's own `classcade-phone-session:`
// — this claim is scoped to the whole class sitting (one stable code), not to one game's code, so
// it must never collide with (or be overwritten by) a per-game join happening on the same device.
const STORAGE_PREFIX = "classcade-class-session:";

type ClaimedSession = { code: string; teamId: string | number };

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

  useEffect(() => {
    const channel = openClassSessionChannel(code);
    classChannelRef.current = channel;

    channel.on("broadcast", { event: "state" }, ({ payload }) => {
      setClassState(payload as ClassSessionStatePayload);
      setLastClassStateAt(Date.now());
    });

    channel.subscribe(status => {
      // Re-announces this phone's claim on every (re)connect — covers a wifi drop reconnecting
      // cleanly without the student needing to re-tap their team, same as every per-game join.
      if (status === "SUBSCRIBED" && claimedTeamIdRef.current !== null) {
        channel.track({ teamId: claimedTeamIdRef.current });
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

  const connectionLost = lastClassStateAt === null
    ? nowTick - mountTimeRef.current > STATE_TIMEOUT_MS
    : nowTick - lastClassStateAt > STATE_TIMEOUT_MS;

  const handleClaim = (teamId: string | number) => {
    claimedTeamIdRef.current = teamId;
    setClaimedTeamId(teamId);
    saveClaimedTeamId(code, teamId);
    classChannelRef.current?.track({ teamId });
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
      if (status === "SUBSCRIBED") channel.track({ teamId: claimedTeamId });
    });

    return () => {
      closeChannel(channel);
      if (innerChannelRef.current === channel) innerChannelRef.current = null;
    };
  }, [activeGame, claimedTeamId, code]);

  const sendBet = (payload: AuctionBetPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "bet", payload });
  const sendTurnReport = (payload: WhackTurnReportPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "turnReport", payload });
  const sendHotSeatAction = (payload: HotSeatActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });
  const sendOrderUpAction = (payload: OrderUpActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });
  const sendRaceTrackAction = (payload: RaceTrackActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });
  const sendHillAction = (payload: HillActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });
  const sendBountyBoardAction = (payload: BountyBoardActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });
  const sendRelayAction = (payload: RelayActionPayload) => innerChannelRef.current?.send({ type: "broadcast", event: "action", payload });

  if (connectionLost) {
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>📡</div>
        <div style={{ fontWeight: "900", fontSize: "18px", marginBottom: "8px", color: "#FCD34D" }}>
          {lastClassStateAt === null ? "Couldn't find this class" : "Lost connection to your teacher's screen"}
        </div>
        <div style={{ color: "#93C5FD", fontSize: "14px", lineHeight: 1.6 }}>
          Code: <strong style={{ color: "white" }}>{code}</strong><br />
          Ask your teacher to check today's class check-in is still open, or for a new code.
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
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "36px", marginBottom: "6px" }}>🎒</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D", marginBottom: "18px" }}>Tap your team</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "360px" }}>
          {classState.roster.map(t => {
            const takenByOther = classState.connectedTeamIds.includes(t.id) && t.id !== claimedTeamIdRef.current;
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
        </div>
        <div style={{ color: "#93C5FD99", fontSize: "12px", marginTop: "18px", lineHeight: 1.6 }}>
          You'll only need to do this once — your phone will automatically follow along for the rest of class.
        </div>
      </div>
    );
  }

  const claimedTeam = classState.roster.find(t => t.id === claimedTeamId);

  // Nothing playable right now — either between games, or the active game has no phone mode at
  // all (see the confirmed design: no phone support is being added to those 8 games in this pass).
  if (activeGame === null || !PHONE_CAPABLE_GAME_IDS.has(activeGame) || !innerState) {
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "22px", marginBottom: "4px" }}><TeamIcon team={claimedTeam} size={22} /></div>
        <div style={{ fontWeight: "900", fontSize: "16px", marginBottom: "18px" }}>{claimedTeam?.name}</div>
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>📺</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D", marginBottom: "8px" }}>Watch the shared screen</div>
        <div style={{ color: "#93C5FD", fontSize: "14px", lineHeight: 1.6 }}>Nothing to do on your phone right now — it'll switch on its own the moment your teacher starts a phone-friendly game.</div>
      </div>
    );
  }

  if (activeGame === "spy") {
    return <PhoneSpyView state={innerState as SpyStatePayload} teamId={claimedTeamId} />;
  }
  if (activeGame === "whack") {
    return <PhoneWordWhackView state={innerState as WhackStatePayload} teamId={claimedTeamId} onTurnReport={sendTurnReport} />;
  }
  if (activeGame === "hotseat") {
    return <PhoneHotSeatView state={innerState as HotSeatStatePayload} teamId={claimedTeamId} onAction={sendHotSeatAction} />;
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
    return <PhoneRelayView state={innerState as RelayStatePayload} teamId={claimedTeamId} onAction={sendRelayAction} />;
  }
  return <PhoneAuctionView state={innerState as AuctionStatePayload} teamId={claimedTeamId} onBet={sendBet} />;
}
