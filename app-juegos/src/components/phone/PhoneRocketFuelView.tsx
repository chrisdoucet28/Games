import { useEffect, useState } from "react";
import type { RocketFuelStatePayload, RocketFuelActionPayload } from "../../lib/liveSession";
import { TeamIcon } from "../shared/TeamIcon";

type Props = {
  state: RocketFuelStatePayload;
  teamId: string | number;
  deviceId: string;
  onAction: (payload: RocketFuelActionPayload) => void;
};

// Screen-authoritative, like every other phone view — this never runs its own game logic, just
// renders whatever the screen's latest broadcast says and forwards a submission back as a
// one-shot action. Individual people, not one phone per team: every phone connected to the
// ACTIVE team works its own prompt independently and privately (promptByDevice is keyed by
// deviceId, a different prompt per phone, dealt out in parallel) — there's no guesser/describer
// split like Hot Seat, since nobody here needs to be shielded from seeing anything. Judging never
// happens on a phone; the teacher reviews every submission afterward on the big screen (see
// liveSession.ts's Rocket Fuel section), so this view's only job is prompt in, sentence out.
export function PhoneRocketFuelView({ state, teamId, deviceId, onAction }: Props) {
  const team = state.roster.find(t => t.id === teamId);
  const activeTeam = state.roster.find(t => t.id === state.activeTeamId);
  const myPrompt = state.promptByDevice[deviceId];

  const [draft, setDraft] = useState("");
  // The question text we last sent a submission for — lets the UI show a brief "sent!" state
  // instead of the input box while waiting for the screen to deal this device its next prompt,
  // and stops a double-tap from submitting the same prompt twice.
  const [pendingFor, setPendingFor] = useState<string | null>(null);

  useEffect(() => {
    // A genuinely new prompt arrived (different question text) — clear the draft and the pending
    // flag so the input box reopens fresh rather than carrying over the last prompt's leftovers.
    setDraft("");
    setPendingFor(null);
  }, [myPrompt?.question]);

  const wrapStyle: React.CSSProperties = {
    minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "white",
    background: "radial-gradient(ellipse at 50% 105%,#4338CA 0%,#1E1B4B 45%,#030014 100%)",
  };

  if (state.phase === "final") {
    return (
      <div style={{ ...wrapStyle, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>🚀</div>
        <div style={{ fontWeight: "900", fontSize: "20px", color: "#A5B4FC" }}>Thanks for playing!</div>
        <div style={{ color: "#C7D2FE", fontSize: "14px", marginTop: "8px" }}>Check the big screen for the launch!</div>
      </div>
    );
  }

  // A prompt is currently assigned to THIS phone — the one state that matters most, so it's
  // checked first regardless of anything else.
  if (myPrompt && pendingFor !== myPrompt.question) {
    const text = draft.trim();
    return (
      <div style={wrapStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <span style={{ fontWeight: "900", fontSize: "15px" }}><TeamIcon team={team} /> {team?.name}</span>
        </div>
        <div style={{ background: "linear-gradient(160deg,#1E1B4B,#0B0B2E)", border: "4px solid #4338CA", borderRadius: "22px", padding: "22px 16px", textAlign: "center", marginBottom: "16px", boxShadow: "0 0 30px rgba(67,56,202,0.35)" }}>
          <div style={{ color: "#A5B4FC", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", marginBottom: "10px" }}>Use this word in a sentence</div>
          <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: "16px", border: "3px solid #4338CA55", padding: "16px 10px", color: "#E0E7FF", fontWeight: "900", fontSize: "clamp(22px,8vw,32px)", lineHeight: 1.2, overflowWrap: "anywhere" }}>
            {myPrompt.question}
          </div>
        </div>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="Type your sentence…"
          style={{ width: "100%", boxSizing: "border-box", border: "2px solid #4338CA55", borderRadius: "12px", padding: "10px 12px", fontSize: "15px", fontFamily: "inherit", resize: "vertical", marginBottom: "12px" }}
        />
        <button
          onClick={() => { if (!text) return; onAction({ teamId, deviceId, action: "submit", text }); setPendingFor(myPrompt.question); }}
          disabled={!text}
          style={{
            width: "100%", background: !text ? "#4B5563" : "linear-gradient(135deg,#4338CA,#6366F1)", color: "white", border: "none",
            borderRadius: "14px", padding: "16px", fontSize: "16px", fontWeight: "900", cursor: !text ? "not-allowed" : "pointer",
          }}
        >
          Submit ⛽
        </button>
        <div style={{ textAlign: "center", color: "#C7D2FE99", fontSize: "11px", fontWeight: "600", marginTop: "10px" }}>
          Your teacher checks these after the turn — no rush, just do your best.
        </div>
      </div>
    );
  }

  // Just submitted, waiting for the screen to deal this device its next prompt.
  if (myPrompt && pendingFor === myPrompt.question) {
    return (
      <div style={{ ...wrapStyle, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>✅</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#A5B4FC", marginBottom: "8px" }}>Sent!</div>
        <div style={{ color: "#C7D2FE", fontSize: "13px" }}>Getting your next word…</div>
      </div>
    );
  }

  // No prompt assigned to this phone right now — either this team's turn just ended (being
  // reviewed), it's some other team's turn, or the game hasn't started yet.
  const forOwnTeam = team?.id === state.activeTeamId;
  return (
    <div style={{ ...wrapStyle, textAlign: "center" }}>
      <div style={{ fontSize: "22px", marginBottom: "4px" }}><TeamIcon team={team} size={22} /></div>
      <div style={{ fontWeight: "900", fontSize: "16px", marginBottom: "18px" }}>{team?.name}</div>
      <div style={{ fontSize: "36px", marginBottom: "8px" }}>{forOwnTeam ? "📋" : "🚀"}</div>
      <div style={{ fontWeight: "800", fontSize: "16px", color: "#A5B4FC", marginBottom: "18px" }}>
        {forOwnTeam
          ? "Nice work! Your teacher's checking your answers now."
          : activeTeam
            ? `${activeTeam.name} is at mission control!`
            : "Get ready — waiting for the game to start…"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "300px", margin: "0 auto" }}>
        {state.roster.map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: t.id === state.activeTeamId ? "rgba(165,180,252,0.15)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${t.id === state.activeTeamId ? "#A5B4FC" : "rgba(255,255,255,0.15)"}`, borderRadius: "10px", padding: "8px 12px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700" }}><TeamIcon team={t} /> {t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
