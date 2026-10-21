import type { RaceTrackStatePayload, RaceTrackActionPayload, RaceTrackSpaceKind } from "../../lib/liveSession";
import { TeamIcon } from "../shared/TeamIcon";
import { Icon, type IconName } from "../shared/Icon";

type Props = {
  state: RaceTrackStatePayload;
  teamId: string | number;
  onAction: (payload: RaceTrackActionPayload) => void;
};

// Local label map for the broadcast's plain-string space kind — can't import SPACE_DEFS from
// RaceTrackGame.tsx (same reason PhoneOrderUpView re-implements ItemBadge locally instead), so
// this just needs the human-readable name, not the full def (color/icon already travel in the
// payload itself, see RaceTrackSpaceInfo).
const SPACE_LABELS: Record<RaceTrackSpaceKind, string> = {
  start: "Start", finish: "Finish", normal: "Normal", boost: "Boost", mud: "Mud",
  shortcut: "Shortcut", trap: "Trap", teleport: "Teleport", coin: "Coin", shield: "Shield",
  lucky: "Lucky", question: "Bonus Question",
};

// A team's own board state (coins/shields/powerups) — shown above the buzzer/space card on every
// screen except lobby/final, so a phone is more than a buzzer and a bare position number (teacher
// feedback: wanted to see the space landed on and the items/coins held, not just buzz).
function StatsBar({ state, teamId }: { state: RaceTrackStatePayload; teamId: string | number }) {
  const key = String(teamId);
  const coins = state.coinsByTeam[key] ?? 0;
  const shields = state.shieldsByTeam[key] ?? 0;
  const powerups = state.powerupsByTeam[key] ?? [];
  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "14px" }}>
      <div style={{ background: "rgba(251,191,36,0.15)", border: "1.5px solid #FBBF2466", borderRadius: "10px", padding: "5px 12px", fontSize: "12px", fontWeight: "800", color: "#FBBF24" }}>
        <Icon name="coin" size={12} /> {coins}
      </div>
      {shields > 0 && (
        <div style={{ background: "rgba(59,130,246,0.15)", border: "1.5px solid #3B82F666", borderRadius: "10px", padding: "5px 12px", fontSize: "12px", fontWeight: "800", color: "#93C5FD" }}>
          <Icon name="shield" size={12} /> ×{shields}
        </div>
      )}
      {powerups.length > 0 && (
        <div style={{ background: "rgba(124,58,237,0.15)", border: "1.5px solid #7C3AED66", borderRadius: "10px", padding: "5px 12px", fontSize: "12px", fontWeight: "800", color: "#C4B5FD" }}>
          <Icon name="rocket" size={12} /> {powerups.length} item{powerups.length === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}

// The Phone/Reconnect banner never carries the viewing team's own last effect for anyone else, so
// this only ever renders true for the team it actually happened to — see sendState's own comment
// in RaceTrackGame.tsx.
function EffectCard({ effect }: { effect: NonNullable<RaceTrackStatePayload["lastEffect"]> }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.06)",
      border: `2px solid ${effect.color}`, borderRadius: "14px", padding: "14px", marginBottom: "14px", textAlign: "left",
    }}>
      <div style={{ color: effect.color, flexShrink: 0 }}><Icon name={effect.icon as IconName} size={30} /></div>
      <div style={{ fontSize: "14px", fontWeight: "700", color: "#DDE8FF" }}>{effect.text}</div>
    </div>
  );
}

function SpaceTile({ space }: { space: RaceTrackStatePayload["spaceByTeam"][string] }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.08)",
      border: `2px solid ${space.color}`, borderRadius: "12px", padding: "8px 16px", marginTop: "8px",
    }}>
      {space.icon && <span style={{ color: space.color }}><Icon name={space.icon as IconName} size={18} /></span>}
      <span style={{ fontWeight: "800", fontSize: "14px", color: space.color }}>{SPACE_LABELS[space.kind]}</span>
    </div>
  );
}

// The simplest phone view of the six games — no question text, no ticket board, no typing.
// Everyone's already looking at the one shared screen; a phone's only job is to be a personal,
// low-latency buzz button. Screen-authoritative like every other phone-mode game: this view never
// decides who buzzed in first, it just renders the screen's latest broadcast and forwards a tap.
export function PhoneRaceTrackView({ state, teamId, onAction }: Props) {
  const team = state.roster.find(t => t.id === teamId);
  const mySpace = state.spaceByTeam[String(teamId)];
  const myEffect = state.lastEffect && state.lastEffect.teamId === teamId ? state.lastEffect : null;

  const wrapStyle: React.CSSProperties = {
    minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "white",
    background: "radial-gradient(ellipse at 40% 40%,#0E2040 0%,#060E1C 100%)",
    display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center",
  };

  if (state.phase === "final") {
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>🏁</div>
        <div style={{ fontWeight: "900", fontSize: "20px", color: "#F7C948" }}>The race is over!</div>
        <div style={{ color: "#93C5FD", fontSize: "14px", marginTop: "8px" }}>Check the big screen for final results.</div>
      </div>
    );
  }

  if (state.phase === "lobby") {
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: "36px", marginBottom: "6px" }}><TeamIcon team={team} size={36} /></div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#F87171", marginBottom: "8px" }}>You're in as {team?.name}!</div>
        <div style={{ color: "#93C5FD", fontSize: "14px", lineHeight: 1.6 }}>Get ready — waiting for your teacher to start the race…</div>
      </div>
    );
  }

  if (state.phase === "interlude") {
    return (
      <div style={wrapStyle}>
        <StatsBar state={state} teamId={teamId} />
        {myEffect ? (
          <EffectCard effect={myEffect} />
        ) : (
          <>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>🎲</div>
            <div style={{ fontWeight: "800", fontSize: "16px", color: "#93C5FD" }}>Racing… watch the big screen!</div>
          </>
        )}
        {mySpace && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "#5A7399", fontWeight: "700" }}>Your space</div>
            <SpaceTile space={mySpace} />
          </div>
        )}
      </div>
    );
  }

  // phase === "task"
  if (state.buzzedTeamId === teamId) {
    return (
      <div style={wrapStyle}>
        <StatsBar state={state} teamId={teamId} />
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>⚡</div>
        <div style={{ fontWeight: "900", fontSize: "19px", color: "#F7C948" }}>You buzzed in first!</div>
        <div style={{ color: "#93C5FD", fontSize: "14px", marginTop: "8px" }}>Tell your teacher your answer.</div>
      </div>
    );
  }

  if (state.buzzedTeamId !== null) {
    const winner = state.roster.find(t => t.id === state.buzzedTeamId);
    return (
      <div style={wrapStyle}>
        <StatsBar state={state} teamId={teamId} />
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>😔</div>
        <div style={{ fontWeight: "800", fontSize: "16px", color: "#93C5FD" }}><TeamIcon team={winner} /> {winner?.name} buzzed in first.</div>
        <div style={{ color: "#5A7399", fontSize: "13px", marginTop: "8px" }}>Wait for the next question.</div>
      </div>
    );
  }

  if (state.rejectedTeamIds.includes(teamId)) {
    return (
      <div style={wrapStyle}>
        <StatsBar state={state} teamId={teamId} />
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>❌</div>
        <div style={{ fontWeight: "800", fontSize: "16px", color: "#93C5FD" }}>You already tried this question.</div>
        <div style={{ color: "#5A7399", fontSize: "13px", marginTop: "8px" }}>Wait for the next one.</div>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <StatsBar state={state} teamId={teamId} />
      <button
        onClick={() => onAction({ teamId, action: "buzz", ts: Date.now() })}
        style={{
          width: "220px", height: "220px", borderRadius: "50%", margin: "0 auto",
          background: "radial-gradient(circle at 35% 30%,#F87171,#B91C1C)", color: "white",
          border: "6px solid #FCA5A5", boxShadow: "0 8px 30px rgba(239,68,68,0.6)",
          fontSize: "24px", fontWeight: "900", cursor: "pointer",
        }}
      >
        🔔<br />BUZZ!
      </button>
      <div style={{ color: "#93C5FD", fontSize: "13px", marginTop: "18px" }}><TeamIcon team={team} /> {team?.name}</div>
    </div>
  );
}
