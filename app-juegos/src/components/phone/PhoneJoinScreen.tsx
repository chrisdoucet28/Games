import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { openAuctionChannel, closeAuctionChannel, type AuctionStatePayload, type AuctionBetPayload } from "../../lib/liveSession";
import { PhoneAuctionView } from "./PhoneAuctionView";

type Props = { code: string };

// No state broadcast for this long means the teacher's tab is gone (refreshed, closed the game,
// or this code was never valid) — same threshold used for "still waiting on the very first one"
// and "was working, then went quiet mid-game".
const STATE_TIMEOUT_MS = 12000;

const STORAGE_PREFIX = "classcade-phone-session:";

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
    // Best-effort — a phone in private/incognito mode just won't auto-rejoin on refresh, no worse
    // off than not having this at all.
  }
}

const arenaStyle: React.CSSProperties = {
  minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  padding: "24px 20px", textAlign: "center", fontFamily: "'Segoe UI',system-ui,sans-serif",
  background: "radial-gradient(ellipse at 50% -10%,#6D28D9 0%,#2E1065 45%,#0F0524 100%)", color: "white",
};

export function PhoneJoinScreen({ code }: Props) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  // A ref, not just the claimedTeamId state — the channel's subscribe callback fires again on
  // every reconnect and needs the *current* claim at that moment, not whatever it closed over
  // when the effect first ran.
  const claimedTeamIdRef = useRef<string | number | null>(loadClaimedTeamId(code));
  const [claimedTeamId, setClaimedTeamId] = useState<string | number | null>(claimedTeamIdRef.current);
  const [state, setState] = useState<AuctionStatePayload | null>(null);
  const [lastStateAt, setLastStateAt] = useState<number | null>(null);
  const mountTimeRef = useRef(Date.now());
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const channel = openAuctionChannel(code);
    channelRef.current = channel;

    channel.on("broadcast", { event: "state" }, ({ payload }) => {
      setState(payload as AuctionStatePayload);
      setLastStateAt(Date.now());
    });

    channel.subscribe(status => {
      // Re-announces this phone's claim on every (re)connect, not just the first — covers a wifi
      // drop reconnecting cleanly without the student needing to re-tap their team.
      if (status === "SUBSCRIBED" && claimedTeamIdRef.current !== null) {
        channel.track({ teamId: claimedTeamIdRef.current });
      }
    });

    return () => {
      closeAuctionChannel(channel);
      channelRef.current = null;
    };
  }, [code]);

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
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔨</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D" }}>Joining game {code}…</div>
        <div style={{ color: "#C4B5FD", fontSize: "14px", marginTop: "8px" }}>Waiting for your teacher's screen</div>
      </div>
    );
  }

  if (claimedTeamId === null) {
    return (
      <div style={arenaStyle}>
        <div style={{ fontSize: "36px", marginBottom: "6px" }}>🔨</div>
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

  return <PhoneAuctionView state={state} teamId={claimedTeamId} onBet={sendBet} />;
}
