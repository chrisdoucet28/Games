import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  openAuctionChannel, openSpyChannel, openWhackChannel, closeChannel,
  type AuctionStatePayload, type AuctionBetPayload, type SpyStatePayload,
  type WhackStatePayload, type WhackTurnReportPayload,
} from "../../lib/liveSession";
import { PhoneAuctionView } from "./PhoneAuctionView";
import { PhoneSpyView } from "./PhoneSpyView";
import { PhoneWordWhackView } from "./PhoneWordWhackView";

type Game = "auction" | "spy" | "whack";
type Props = { code: string; game: Game };

// No state broadcast for this long means the teacher's tab is gone (refreshed, closed the game,
// or this code was never valid) — same threshold used for "still waiting on the very first one"
// and "was working, then went quiet mid-game".
const STATE_TIMEOUT_MS = 12000;

const STORAGE_PREFIX = "classcade-phone-session:";

type ClaimedSession = { code: string; teamId: string | number };

// The bits that differ between games sharing this one join/claim/lobby shell — everything else
// (claim grid, connection-lost timeout, localStorage rejoin) is identical in shape for both, since
// every game's roster/connectedTeamIds payload fields are the same.
const GAME_COPY: Record<Game, {
  joinEmoji: string;
  arenaBg: string;
  startingBody: string;
  endedEmoji: string;
  endedTitle: string;
  endedBody: string;
}> = {
  auction: {
    joinEmoji: "🔨",
    arenaBg: "radial-gradient(ellipse at 50% -10%,#6D28D9 0%,#2E1065 45%,#0F0524 100%)",
    startingBody: "Get ready — waiting for your teacher to start the auction…",
    endedEmoji: "🏆",
    endedTitle: "The auction has ended!",
    endedBody: "Thanks for playing — check the big screen for final results.",
  },
  spy: {
    joinEmoji: "🛸",
    arenaBg: "radial-gradient(ellipse at 50% -15%,#1E293B 0%,#0F172A 55%,#020617 100%)",
    startingBody: "Get ready — waiting for your teacher to start the mission…",
    endedEmoji: "🏆",
    endedTitle: "The mission has ended!",
    endedBody: "Thanks for playing — check the big screen for final results.",
  },
  whack: {
    joinEmoji: "🔨",
    arenaBg: "radial-gradient(ellipse at 50% -10%,#65A30D 0%,#365314 45%,#0F1A05 100%)",
    startingBody: "Get ready — waiting for your teacher to start the warm-up…",
    endedEmoji: "🏆",
    endedTitle: "The warm-up has ended!",
    endedBody: "Thanks for playing — check the big screen for final results.",
  },
};

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
    // Best-effort — a phone in private/incognito mode just won't auto-rejoin on refresh, no worse
    // off than not having this at all.
  }
}

export function PhoneJoinScreen({ code, game }: Props) {
  const copy = GAME_COPY[game];
  const arenaStyle: React.CSSProperties = {
    minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "24px 20px", textAlign: "center", fontFamily: "'Segoe UI',system-ui,sans-serif",
    background: copy.arenaBg, color: "white",
  };

  const channelRef = useRef<RealtimeChannel | null>(null);
  // A ref, not just the claimedTeamId state — the channel's subscribe callback fires again on
  // every reconnect and needs the *current* claim at that moment, not whatever it closed over
  // when the effect first ran.
  const claimedTeamIdRef = useRef<string | number | null>(loadClaimedTeamId(code));
  const [claimedTeamId, setClaimedTeamId] = useState<string | number | null>(claimedTeamIdRef.current);
  const [state, setState] = useState<AuctionStatePayload | SpyStatePayload | WhackStatePayload | null>(null);
  const [lastStateAt, setLastStateAt] = useState<number | null>(null);
  // Once true, stays true regardless of what happens to the connection afterward — a phone that
  // learns the game is over shouldn't ever fall back to "lost connection" messaging just because
  // the teacher's tab (and its channel) closes for good a moment later.
  const [gameEnded, setGameEnded] = useState(false);
  const mountTimeRef = useRef(Date.now());
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const channel = game === "spy" ? openSpyChannel(code) : game === "whack" ? openWhackChannel(code) : openAuctionChannel(code);
    channelRef.current = channel;

    channel.on("broadcast", { event: "state" }, ({ payload }) => {
      const statePayload = payload as AuctionStatePayload | SpyStatePayload | WhackStatePayload;
      setState(statePayload);
      setLastStateAt(Date.now());
      // Covers a phone that only joins/reconnects after the game already ended — it'll never see
      // the one-shot "ended" broadcast below, but every state broadcast from that point on
      // reports phase: "final" too.
      if (statePayload.phase === "final") setGameEnded(true);
    });

    channel.on("broadcast", { event: "ended" }, () => {
      setGameEnded(true);
    });

    channel.subscribe(status => {
      // Re-announces this phone's claim on every (re)connect, not just the first — covers a wifi
      // drop reconnecting cleanly without the student needing to re-tap their team.
      if (status === "SUBSCRIBED" && claimedTeamIdRef.current !== null) {
        channel.track({ teamId: claimedTeamIdRef.current });
      }
    });

    return () => {
      closeChannel(channel);
      channelRef.current = null;
    };
  }, [code, game]);

  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const connectionLost = lastStateAt === null
    ? nowTick - mountTimeRef.current > STATE_TIMEOUT_MS
    : nowTick - lastStateAt > STATE_TIMEOUT_MS;

  const handleClaim = (teamId: string | number) => {
    claimedTeamIdRef.current = teamId;
    setClaimedTeamId(teamId);
    saveClaimedTeamId(code, teamId);
    channelRef.current?.track({ teamId });
  };

  const sendBet = (payload: AuctionBetPayload) => {
    channelRef.current?.send({ type: "broadcast", event: "bet", payload });
  };

  const sendTurnReport = (payload: WhackTurnReportPayload) => {
    channelRef.current?.send({ type: "broadcast", event: "turnReport", payload });
  };

  if (gameEnded) {
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "44px", marginBottom: "12px" }}>{copy.endedEmoji}</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D", marginBottom: "8px" }}>{copy.endedTitle}</div>
        <div style={{ color: "#C4B5FD", fontSize: "14px", lineHeight: 1.6 }}>{copy.endedBody}</div>
      </div>
    );
  }

  if (connectionLost) {
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>📡</div>
        <div style={{ fontWeight: "900", fontSize: "18px", marginBottom: "8px", color: "#FCD34D" }}>
          {lastStateAt === null ? "Couldn't find this game" : "Lost connection to your teacher's screen"}
        </div>
        <div style={{ color: "#C4B5FD", fontSize: "14px", lineHeight: 1.6 }}>
          Code: <strong style={{ color: "white" }}>{code}</strong><br />
          Ask your teacher to check the game is still open, or for a new code.
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>{copy.joinEmoji}</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D" }}>Joining game {code}…</div>
        <div style={{ color: "#C4B5FD", fontSize: "14px", marginTop: "8px" }}>Waiting for your teacher's screen</div>
      </div>
    );
  }

  if (claimedTeamId === null) {
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "36px", marginBottom: "6px" }}>{copy.joinEmoji}</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D", marginBottom: "18px" }}>Tap your team</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "360px" }}>
          {state.roster.map(t => {
            const takenByOther = state.connectedTeamIds.includes(t.id) && t.id !== claimedTeamIdRef.current;
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
                <span style={{ fontSize: "24px" }}>{t.mascot ?? t.color.emoji}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{t.name}</span>
                {takenByOther && <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "700" }}>Already joined</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Claimed, but the teacher hasn't started the game yet ("intro" for Auction, "lobby" for Spy
  // Among Us and Word Whack — all mean "nothing to show yet") — nobody should see anything
  // private before the whole room starts at once.
  if (state.phase === "intro" || state.phase === "lobby") {
    const team = state.roster.find(t => t.id === claimedTeamId);
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "36px", marginBottom: "6px" }}>{team?.mascot ?? team?.color.emoji ?? copy.joinEmoji}</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D", marginBottom: "8px" }}>You're in as {team?.name}!</div>
        <div style={{ color: "#C4B5FD", fontSize: "14px", lineHeight: 1.6 }}>{copy.startingBody}</div>
      </div>
    );
  }

  if (game === "spy") {
    return <PhoneSpyView state={state as SpyStatePayload} teamId={claimedTeamId} />;
  }
  if (game === "whack") {
    return <PhoneWordWhackView state={state as WhackStatePayload} teamId={claimedTeamId} onTurnReport={sendTurnReport} />;
  }
  return <PhoneAuctionView state={state as AuctionStatePayload} teamId={claimedTeamId} onBet={sendBet} />;
}
