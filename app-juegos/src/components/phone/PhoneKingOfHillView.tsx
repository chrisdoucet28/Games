import type { HillStatePayload, HillActionPayload } from "../../lib/liveSession";
import { TeamIcon } from "../shared/TeamIcon";
import { Icon, type IconName } from "../shared/Icon";

type Props = {
  state: HillStatePayload;
  teamId: string | number;
  onAction: (payload: HillActionPayload) => void;
};

// Teacher feedback (brainstorm): King of the Hill's phone was the thinnest of the games with a
// phone view at all — almost the whole game was "watch the big screen," even outside an actual
// duel, with no board, no score, and no turn indicator. ZoneBoard/ScoreRow (below) are now shown
// on every screen this view renders (lobby/final excepted), and the duel buzzer itself gained a
// "result" phase so a phone finally learns who actually won.
export function PhoneKingOfHillView({ state, teamId, onAction }: Props) {
  const team = state.roster.find(t => t.id === teamId);

  const wrapStyle: React.CSSProperties = {
    minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "white",
    background: "radial-gradient(ellipse at 50% -10%,#DB2777 0%,#831843 45%,#1F0A1F 100%)",
  };
  const centeredStyle: React.CSSProperties = { ...wrapStyle, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" };

  if (state.phase === "final") {
    return (
      <div style={centeredStyle}>
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>👑</div>
        <div style={{ fontWeight: "900", fontSize: "20px", color: "#FCD34D" }}>The game is over!</div>
        <div style={{ color: "#F9A8D4", fontSize: "14px", marginTop: "8px" }}>Check the big screen for final results.</div>
      </div>
    );
  }

  // "lobby" (not started yet) is already intercepted upstream in PhoneJoinScreen.tsx/
  // ClassJoinScreen.tsx by a generic "you're in as Team X" screen, same as every other phone-mode
  // game — never actually reached here.
  const inDuel = state.phase === "duel" && (teamId === state.attackerId || teamId === state.defenderId);
  const inResult = state.phase === "result" && !!state.duelResult && (teamId === state.duelResult.attackerId || teamId === state.duelResult.defenderId);

  return (
    <div style={wrapStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "900", fontSize: "16px", marginBottom: "14px" }}>
        <TeamIcon team={team} size={22} /> {team?.name}
      </div>

      <ScoreRow state={state} teamId={teamId} />
      <ZoneBoard state={state} teamId={teamId} />

      {state.phase === "idle" && (
        <div style={{
          textAlign: "center", marginTop: "14px", background: state.activeTeamId === teamId ? "rgba(34,197,94,0.15)" : "rgba(249,168,212,0.1)",
          border: `2px solid ${state.activeTeamId === teamId ? "#22C55E" : "#F9A8D4"}`, borderRadius: "12px", padding: "14px",
          fontWeight: "800", fontSize: "14px", color: state.activeTeamId === teamId ? "#4ADE80" : "#F9A8D4",
        }}>
          {state.activeTeamId === teamId
            ? "👑 Your turn — pick a zone on the big screen!"
            : `⏳ ${state.roster.find(t => t.id === state.activeTeamId)?.name ?? "Another team"} is picking a zone…`}
        </div>
      )}

      {state.phase === "duel" && !inDuel && (
        <div style={{ textAlign: "center", marginTop: "14px", background: "rgba(248,113,113,0.12)", border: "2px solid #F87171", borderRadius: "12px", padding: "14px", fontWeight: "800", fontSize: "14px", color: "#FCA5A5" }}>
          ⚔️ {state.roster.find(t => t.id === state.attackerId)?.name} is attacking {state.roster.find(t => t.id === state.defenderId)?.name}'s zone!
        </div>
      )}

      {state.phase === "duel" && inDuel && <DuelPanel state={state} teamId={teamId} onAction={onAction} />}

      {state.phase === "result" && state.duelResult && (
        <ResultPanel duelResult={state.duelResult} roster={state.roster} mine={inResult} />
      )}
    </div>
  );
}

function ScoreRow({ state, teamId }: { state: HillStatePayload; teamId: string | number }) {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
      {state.roster.map(t => {
        const mine = t.id === teamId;
        return (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: "5px", borderRadius: "10px", padding: "5px 10px",
            background: mine ? t.color.bg : "rgba(255,255,255,0.08)",
            border: mine ? "1.5px solid white" : "1.5px solid rgba(255,255,255,0.15)",
            fontSize: "12px", fontWeight: "800", color: "white",
          }}>
            <TeamIcon team={t} size={13} /> {state.scores[String(t.id)] ?? 0}
          </div>
        );
      })}
    </div>
  );
}

// Mirrors the shared screen's own compass layout exactly (KingOfHillGame.tsx's renderZone grid:
// `<div/>North<div/>West Center East<div/>South<div/>`) — North/South/East/West/Center are fixed
// zone ids in both grammar and theme mode (only the label/icon differ), so this always lines up
// spatially with the real board regardless of which content flavor is active. A flat row-major
// grid in array order (the first version of this) didn't match the real board's layout at all.
function ZoneBoard({ state, teamId }: { state: HillStatePayload; teamId: string | number }) {
  const zoneById = (id: string) => state.zones.find(z => z.id === id);

  const renderCell = (id: string | null) => {
    const z = id ? zoneById(id) : undefined;
    if (!z) return <div key={id ?? Math.random()} />;
    const ownerId = state.owners[z.id];
    const owner = state.roster.find(t => t.id === ownerId);
    const isMine = ownerId === teamId;
    return (
      <div key={z.id} style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
        background: owner ? (isMine ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)") : "rgba(255,255,255,0.04)",
        border: `2px solid ${owner ? owner.color.bg : "rgba(249,168,212,0.3)"}`,
        borderRadius: "10px", padding: "8px 4px",
      }}>
        <span style={{ color: owner?.color.bg ?? "#F9A8D4" }}><Icon name={z.icon as IconName} size={16} /></span>
        <span style={{ fontSize: "10px", fontWeight: "800", color: "white" }}>{z.label}</span>
        <span style={{ fontSize: "9px", color: "#F9A8D488" }}>+{z.pts}</span>
        {owner ? (
          <span style={{ fontSize: "9px", fontWeight: "800", color: owner.color.bg }}>{owner.name}</span>
        ) : (
          <span style={{ fontSize: "9px", color: "#F9A8D488" }}>Free</span>
        )}
      </div>
    );
  };

  const hasCompassZones = ["North", "South", "East", "West", "Center"].every(id => zoneById(id));
  if (!hasCompassZones) {
    // Defensive fallback for any future zone set that isn't the compass layout — never silently
    // mis-arrange a board this view doesn't recognize the shape of.
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        {state.zones.map(z => renderCell(z.id))}
      </div>
    );
  }

  // The 4 corners (NE/NW/SE/SW) only exist in state.zones for larger team counts (see
  // KingOfHillGame.tsx's zonesForTeamCount) — renderCell already falls back to an empty cell
  // when an id isn't present, so a 2-team game's board renders identically to before.
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", maxWidth: state.zones.length > 5 ? "320px" : "280px", margin: "0 auto" }}>
      {renderCell("NW")}{renderCell("North")}{renderCell("NE")}
      {renderCell("West")}{renderCell("Center")}{renderCell("East")}
      {renderCell("SW")}{renderCell("South")}{renderCell("SE")}
    </div>
  );
}

function DuelPanel({ state, teamId, onAction }: { state: HillStatePayload; teamId: string | number; onAction: (payload: HillActionPayload) => void }) {
  if (state.buzzedTeamId === teamId) {
    return (
      <div style={{ textAlign: "center", marginTop: "18px" }}>
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>⚡</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FCD34D" }}>You buzzed in first!</div>
        <div style={{ color: "#F9A8D4", fontSize: "13px", marginTop: "6px" }}>Tell your teacher your answer.</div>
      </div>
    );
  }

  if (state.buzzedTeamId !== null) {
    const winner = state.roster.find(t => t.id === state.buzzedTeamId);
    return (
      <div style={{ textAlign: "center", marginTop: "18px" }}>
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>😔</div>
        <div style={{ fontWeight: "800", fontSize: "15px", color: "#F9A8D4" }}><TeamIcon team={winner} /> {winner?.name} buzzed in first.</div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "18px" }}>
      <div style={{ fontWeight: "800", fontSize: "14px", color: "#F9A8D4", marginBottom: "16px" }}>⚔️ Duel! Buzz in to answer first.</div>
      <button
        onClick={() => onAction({ teamId, action: "buzz", ts: Date.now() })}
        style={{
          width: "200px", height: "200px", borderRadius: "50%", margin: "0 auto",
          background: "radial-gradient(circle at 35% 30%,#F9A8D4,#DB2777)", color: "white",
          border: "6px solid #F9A8D4", boxShadow: "0 8px 30px rgba(219,39,119,0.6)",
          fontSize: "22px", fontWeight: "900", cursor: "pointer",
        }}
      >
        🔔<br />BUZZ!
      </button>
    </div>
  );
}

// Shown to every phone, not just the two teams that fought — a teacher feedback ask was telling a
// phone who won a duel afterward, and that's just as true for bystanders deciding whether to go
// after the same zone later as it is for the two participants.
function ResultPanel({ duelResult, roster, mine }: { duelResult: NonNullable<HillStatePayload["duelResult"]>; roster: HillStatePayload["roster"]; mine: boolean }) {
  const attacker = roster.find(t => t.id === duelResult.attackerId);
  const defender = roster.find(t => t.id === duelResult.defenderId);
  const winner = duelResult.winnerId !== null ? roster.find(t => t.id === duelResult.winnerId) : null;
  return (
    <div style={{
      textAlign: "center", marginTop: "14px",
      background: winner ? `linear-gradient(160deg,${winner.color.dark}55,#1F0A1F)` : "rgba(255,255,255,0.06)",
      border: `3px solid ${winner ? winner.color.bg : "#F9A8D455"}`, borderRadius: "14px", padding: "16px",
    }}>
      <div style={{ marginBottom: "6px" }}><Icon name={duelResult.reason === "neither" ? "handshake" : "crown"} size={30} /></div>
      {duelResult.reason === "attacker" && <div style={{ fontWeight: "900", fontSize: "15px", color: "white" }}>{attacker?.name} captured {duelResult.zoneId}! +30 pts</div>}
      {duelResult.reason === "defender" && <div style={{ fontWeight: "900", fontSize: "15px", color: "white" }}>{defender?.name} defended {duelResult.zoneId}! +20 bonus pts</div>}
      {duelResult.reason === "neither" && <div style={{ fontWeight: "900", fontSize: "15px", color: "white" }}>Neither wins — {duelResult.zoneId} stays with {defender?.name}!</div>}
      {mine && <div style={{ fontSize: "12px", color: "#F9A8D4", marginTop: "8px" }}>Waiting for the teacher to start the next turn…</div>}
    </div>
  );
}
