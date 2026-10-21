import type { SpyStatePayload, SpyVoteActionPayload } from "../../lib/liveSession";
import { TeamIcon } from "../shared/TeamIcon";
import { Icon } from "../shared/Icon";

type Props = {
  state: SpyStatePayload;
  teamId: string | number;
  onAction: (payload: SpyVoteActionPayload) => void;
};

// Vote-casting during "vote" and the rich reveal card during "reveal" are the two exceptions to
// the file header's old "read-only" note — see SpyVoteActionPayload/SpyRevealInfo in
// liveSession.ts for why. Everything else here (role card, speaking order, spy-guess/1v1
// fallbacks) is still pure display, same as before.
export function PhoneSpyView({ state, teamId, onAction }: Props) {
  const team = state.roster.find(t => t.id === teamId);
  const role = state.roles[String(teamId)];

  // "speak" (group mode) and "speak-2p" (solo/1v1) both track their own turn the same way —
  // state.speakOrder/state.speakIdx already point at whichever ruleset's data sendState() chose.
  const isSpeakPhase = state.phase === "speak" || state.phase === "speak-2p";
  const speakerIdx = state.speakOrder.indexOf(teamId);
  const isMyTurn = isSpeakPhase && state.speakOrder[state.speakIdx] === teamId;
  const hasSpoken = isSpeakPhase && speakerIdx !== -1 && speakerIdx < state.speakIdx;
  const currentSpeaker = isSpeakPhase ? state.roster.find(t => t.id === state.speakOrder[state.speakIdx]) : undefined;

  // Once a team has had its turn, hide the role card — the ask was "keep the prompt up until
  // they finish speaking," which implies it's fine (and a nice fairness nudge against quietly
  // re-checking wording after the fact) to hide it once they're done.
  const showRoleCard = !hasSpoken && state.phase !== "vote" && state.phase !== "reveal";

  // "peek" is never broadcast in phone mode (every team, including a solo session's teacher
  // stand-in, gets its role privately via this same phone view instead — see
  // enterRoundStartPhase in SpyAmongUsGame.tsx), so there's no status line for it here.
  let statusLine = "";
  if (state.phase === "discuss") statusLine = "💬 Discuss as a group — look at your card, get ready to speak.";
  else if (state.phase === "order-roll") statusLine = "🎲 Rolling for speaking order…";
  else if (isMyTurn) statusLine = "🎙️ Your turn — speak now!";
  else if (hasSpoken) statusLine = "✅ You've spoken — listening to the rest of the crew…";
  else if (isSpeakPhase) statusLine = `⏳ Waiting your turn — ${currentSpeaker?.name ?? "the next speaker"} is speaking now.`;
  else if (state.phase === "spy-guess" || state.phase === "guess-2p" || state.phase === "reveal-2p") {
    statusLine = "👀 Look at the big screen!";
  }

  const isSpy = role?.role === "spy";

  return (
    <div style={{
      minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "white",
      background: "radial-gradient(ellipse at 50% -15%,#1E293B 0%,#0F172A 55%,#020617 100%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "900", fontSize: "16px", marginBottom: "16px" }}>
        <span style={{ fontSize: "22px" }}><TeamIcon team={team} size={22} /></span>
        {team?.name}
      </div>

      {showRoleCard && role && (
        <div style={{
          background: isSpy ? "linear-gradient(135deg,#7F1D1D,#450A0A)" : "linear-gradient(135deg,#1E3A8A,#1D4ED8)",
          border: isSpy ? "2px solid #EF4444" : "2px solid #60A5FA",
          borderRadius: "16px", padding: "20px", marginBottom: "16px", textAlign: "center",
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>{isSpy ? "🕵️" : "👨‍🚀"}</div>
          <div style={{ fontWeight: "900", fontSize: "18px", marginBottom: "10px" }}>
            {isSpy ? "You are the SPY!" : "You are a CREWMATE"}
          </div>
          <div style={{
            background: "rgba(0,0,0,0.25)", borderRadius: "12px", padding: "14px",
            fontSize: "15px", lineHeight: 1.6, fontWeight: "700",
          }}>
            {role.prompt}
          </div>
          {isSpy && (
            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "10px" }}>
              Blend in and try to guess the real topic if you get caught.
            </div>
          )}
        </div>
      )}

      {state.phase === "vote" && (
        <VotePanel state={state} teamId={teamId} onAction={onAction} />
      )}

      {state.phase === "reveal" && state.reveal && (
        <RevealPanel reveal={state.reveal} roster={state.roster} votes={state.votes} />
      )}

      {statusLine && (
        <div style={{
          textAlign: "center", background: isMyTurn ? "rgba(34,197,94,0.15)" : "rgba(56,189,248,0.1)",
          border: `2px solid ${isMyTurn ? "#22C55E" : "#38BDF8"}`, borderRadius: "12px", padding: "14px",
          fontWeight: "800", fontSize: "14px", color: isMyTurn ? "#4ADE80" : "#7DD3FC",
        }}>
          {statusLine}
        </div>
      )}
    </div>
  );
}

// Every team votes, including the spy themselves (blending in means voting too) — the suspect
// list excludes only the voter's own team, matching the shared screen's identical exclusion.
// Tapping a suspect sends the vote immediately and can be changed freely right up until the
// teacher counts the votes, same as tapping it in on the screen always could.
function VotePanel({ state, teamId, onAction }: { state: SpyStatePayload; teamId: string | number; onAction: (payload: SpyVoteActionPayload) => void }) {
  const myVote = state.votes[String(teamId)];
  const votedCount = state.roster.filter(t => state.votes[String(t.id)] !== undefined).length;
  const suspects = state.roster.filter(t => t.id !== teamId);

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ textAlign: "center", fontWeight: "800", fontSize: "15px", color: "#E2E8F0", marginBottom: "4px" }}>
        Who's the spy?
      </div>
      <div style={{ textAlign: "center", fontSize: "12px", color: "#64748B", marginBottom: "14px" }}>
        {votedCount} of {state.roster.length} teams have voted
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {suspects.map(suspect => {
          const picked = myVote === suspect.id;
          return (
            <button
              key={suspect.id}
              onClick={() => onAction({ teamId, suspectId: suspect.id })}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: picked ? suspect.color.bg : "rgba(255,255,255,0.06)",
                color: picked ? "white" : "#E2E8F0",
                border: `2px solid ${picked ? suspect.color.bg : "rgba(255,255,255,0.15)"}`,
                borderRadius: "12px", padding: "14px 16px",
                fontWeight: "800", fontSize: "15px", cursor: "pointer",
              }}
            >
              <TeamIcon team={suspect} size={20} /> {suspect.name}
              {picked && <Icon name="check" size={16} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Mirrors SpyAmongUsGame.tsx's own "reveal" phase JSX — spy identity, both prompts, the
// explanation, the spy's own topic guess if the vote caught them, and every team's vote.
function RevealPanel({ reveal, roster, votes }: { reveal: NonNullable<SpyStatePayload["reveal"]>; roster: SpyStatePayload["roster"]; votes: SpyStatePayload["votes"] }) {
  const spyTeam = roster.find(t => t.id === reveal.spyTeamId);
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ textAlign: "center", marginBottom: "14px" }}>
        <div style={{ marginBottom: "6px" }}><Icon name="search" size={32} /></div>
        <div style={{ fontWeight: "900", fontSize: "17px", color: "#FCA5A5" }}>
          {spyTeam?.name ?? "?"} was the Spy!
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
        <div style={{ background: "#1E3A8A", border: "2px solid #1A1A2E", borderRadius: "12px", padding: "12px" }}>
          <div style={{ fontWeight: "800", fontSize: "11px", color: "#93C5FD", marginBottom: "6px" }}>CREWMATE TOPIC</div>
          <div style={{ fontWeight: "900", fontSize: "14px", color: "white", marginBottom: "6px" }}>{reveal.crewmateTopic}</div>
          <div style={{ fontSize: "12px", color: "#CBD5E1", lineHeight: 1.4, fontStyle: "italic" }}>"{reveal.crewmatePrompt}"</div>
        </div>
        <div style={{ background: "#7F1D1D", border: "2px solid #1A1A2E", borderRadius: "12px", padding: "12px" }}>
          <div style={{ fontWeight: "800", fontSize: "11px", color: "#FCA5A5", marginBottom: "6px" }}>SPY TOPIC</div>
          <div style={{ fontWeight: "900", fontSize: "14px", color: "white", marginBottom: "6px" }}>{reveal.spyTopic}</div>
          <div style={{ fontSize: "12px", color: "#FECACA", lineHeight: 1.4, fontStyle: "italic" }}>"{reveal.spyPrompt}"</div>
        </div>
      </div>

      {reveal.explanation && (
        <div style={{ background: "rgba(56,189,248,0.1)", border: "2px solid #1A1A2E", borderRadius: "12px", padding: "12px", marginBottom: "12px" }}>
          <div style={{ fontWeight: "800", fontSize: "12px", color: "#7DD3FC", marginBottom: "4px" }}>The difference</div>
          <div style={{ color: "#E2E8F0", fontSize: "13px" }}>{reveal.explanation}</div>
        </div>
      )}

      {reveal.spyGuess && (
        <div style={{
          background: reveal.spyGuess === reveal.crewmateTopic ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
          border: `2px solid ${reveal.spyGuess === reveal.crewmateTopic ? "#EF4444" : "#22C55E"}`,
          borderRadius: "12px", padding: "12px", marginBottom: "12px", textAlign: "center",
        }}>
          {reveal.spyGuess === reveal.crewmateTopic ? (
            <div style={{ fontWeight: "900", color: "#FCA5A5", fontSize: "13px" }}>
              {spyTeam?.name} guessed "{reveal.spyGuess}" - correct! Spy earns +60 pts.
            </div>
          ) : (
            <div style={{ fontWeight: "900", color: "#86EFAC", fontSize: "13px" }}>
              {spyTeam?.name} guessed "{reveal.spyGuess}" - wrong! Crewmates win +80 pts each.
            </div>
          )}
        </div>
      )}

      <div style={{ background: "rgba(255,255,255,0.05)", border: "2px solid #1A1A2E", borderRadius: "12px", padding: "12px" }}>
        <div style={{ fontWeight: "800", fontSize: "12px", color: "#94A3B8", marginBottom: "8px" }}>Vote results:</div>
        {roster.map(team => {
          const accused = roster.find(candidate => candidate.id === votes[String(team.id)]);
          const correct = votes[String(team.id)] === reveal.spyTeamId;
          return (
            <div key={team.id} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", fontSize: "12px" }}>
              <span style={{ fontWeight: "700", color: "white" }}>{team.name}:</span>
              <span style={{ color: correct ? "#4ADE80" : "#F87171", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Icon name={correct ? "check" : "close"} size={10} /> voted {accused?.name ?? "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
