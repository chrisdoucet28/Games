import type { RelayStatePayload, RelayActionPayload } from "../../lib/liveSession";
import { TeamIcon } from "../shared/TeamIcon";

type Props = {
  state: RelayStatePayload;
  teamId: string | number;
  deviceId: string;
  onAction: (payload: RelayActionPayload) => void;
};

// Screen-authoritative, like PhoneBountyBoardView — this view never runs any game logic of its own,
// it renders whatever the screen's latest broadcast says and forwards taps back as one-shot
// actions. Each phone is one PERSON: the asker sees no word at all (they have to ask questions to
// find it out), the "answerer" phones see the word and hold the controls, everyone else just
// follows along. Which role a phone has is decided entirely by the screen (askerDeviceId /
// answererDeviceIds) — this file only compares those ids against its own deviceId.
export function PhoneRelayView({ state, teamId, deviceId, onAction }: Props) {
  const team = state.roster.find(t => t.id === teamId);
  const teamKey = String(teamId);

  const wrapStyle: React.CSSProperties = {
    minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "white",
    background: "radial-gradient(ellipse at 50% 105%,#0D9488 0%,#134E4A 45%,#042F2E 100%)",
  };
  const bigButton = (bg: string): React.CSSProperties => ({
    background: bg, color: "white", border: "none", borderRadius: "14px", padding: "18px", fontSize: "18px",
    fontWeight: "900", cursor: "pointer", width: "100%",
  });

  if (state.phase === "final") {
    return (
      <div style={{ ...wrapStyle, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>🏁</div>
        <div style={{ fontWeight: "900", fontSize: "20px", color: "#5EEAD4" }}>That's a wrap!</div>
        <div style={{ color: "#99F6E4", fontSize: "14px", marginTop: "8px" }}>Check the big screen for final results.</div>
      </div>
    );
  }

  const amActiveTeam = state.activeTeamId === teamId;
  const iAmAsker = state.askerDeviceId === deviceId;
  const iAmAnswerer = state.answererDeviceIds.includes(deviceId);
  const activeTeam = state.roster.find(t => t.id === state.activeTeamId);
  const queue = state.askerQueueByTeam[teamKey] ?? [];
  const placeInLine = queue.indexOf(deviceId);
  const questionsLeft = state.questionsLeftByTeam[teamKey] ?? 0;
  const send = (action: RelayActionPayload["action"]) => onAction({ teamId, deviceId, action });

  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
      <span style={{ fontWeight: "900", fontSize: "15px" }}><TeamIcon team={team} /> {team?.name}</span>
      <span style={{ fontSize: "13px", fontWeight: "800", color: "#5EEAD4" }}>{state.wordsByTeam[teamKey] ?? 0} words · {questionsLeft} questions left</span>
    </div>
  );

  const scoreboard = (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "300px", margin: "18px auto 0" }}>
      {state.roster.map(t => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: t.id === state.activeTeamId ? "rgba(94,234,212,0.15)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${t.id === state.activeTeamId ? "#5EEAD4" : "rgba(255,255,255,0.15)"}`, borderRadius: "10px", padding: "8px 12px" }}>
          <span style={{ fontSize: "13px", fontWeight: "700" }}><TeamIcon team={t} /> {t.name}</span>
          <span style={{ fontSize: "13px", fontWeight: "800", color: "#5EEAD4" }}>{state.wordsByTeam[String(t.id)] ?? 0} words</span>
        </div>
      ))}
    </div>
  );

  // A phone from another team can still be an answerer — when the asking team has no other phone
  // of its own, the screen pulls everyone else's phones in so the game never stalls.
  const answeringForOtherTeam = !amActiveTeam && iAmAnswerer;

  // Someone else's turn — nothing to do but follow along.
  if (!amActiveTeam && !iAmAnswerer) {
    const justGuessed = state.phase === "reveal";
    return (
      <div style={{ ...wrapStyle, textAlign: "center" }}>
        {header}
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>{justGuessed ? "🎉" : "👀"}</div>
        <div style={{ fontWeight: "800", fontSize: "16px", color: "#5EEAD4" }}>
          {activeTeam ? (justGuessed ? `${activeTeam.name} guessed their word!` : `${activeTeam.name} is asking questions…`) : "Get ready — waiting for the game to start…"}
        </div>
        {scoreboard}
      </div>
    );
  }

  // The word just got guessed — the whole guessing team sees it. The asker slot has already moved
  // on, so whoever is now the asker is told they're next.
  if (state.phase === "reveal") {
    return (
      <div style={wrapStyle}>
        {header}
        <div style={{ textAlign: "center", background: "linear-gradient(160deg,#022C22,#031F19)", border: "4px solid #22C55E", borderRadius: "22px", padding: "22px 16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "34px", marginBottom: "6px" }}>🎉</div>
          <div style={{ color: "#5EEAD4", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>{answeringForOtherTeam ? `${activeTeam?.name ?? "A team"} guessed it!` : "Your team guessed it!"}</div>
          <div style={{ fontWeight: "900", fontSize: "clamp(26px,8vw,40px)", color: "#F0FDFA", overflowWrap: "anywhere" }}>{state.currentWord}</div>
          <div style={{ marginTop: "12px", fontSize: "14px", fontWeight: "800", color: "#99F6E4" }}>
            {iAmAsker ? "You're up next — get ready to ask!" : answeringForOtherTeam ? "They swap in someone new next turn." : "Time to swap — a teammate takes over!"}
          </div>
        </div>
        {iAmAnswerer && <button onClick={() => send("next")} style={bigButton("linear-gradient(135deg,#0D9488,#14B8A6)")}>Next team →</button>}
      </div>
    );
  }

  // Between turns (only happens when a team plays without phones, or right after a resume) — the
  // word isn't live yet, so nothing to hold or press.
  if (state.phase === "ready") {
    return (
      <div style={{ ...wrapStyle, textAlign: "center" }}>
        {header}
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>🙋</div>
        <div style={{ fontWeight: "800", fontSize: "16px", color: "#5EEAD4" }}>
          {iAmAsker ? "You're up next — get ready to ask!" : "Get ready — your team's asker is stepping up."}
        </div>
      </div>
    );
  }

  // Their team's turn, and they're the one asking.
  if (iAmAsker) {
    return (
      <div style={{ ...wrapStyle, textAlign: "center" }}>
        {header}
        <div style={{ background: "linear-gradient(160deg,#022C22,#031F19)", border: "4px solid #0D9488", borderRadius: "22px", padding: "28px 16px", boxShadow: "0 0 30px rgba(13,148,136,0.35)" }}>
          <div style={{ fontSize: "44px", marginBottom: "8px" }}>🙋</div>
          <div style={{ fontWeight: "900", fontSize: "22px", color: "#5EEAD4", marginBottom: "10px" }}>You're up!</div>
          <div style={{ fontSize: "15px", lineHeight: 1.6, color: "#CCFBF1", fontWeight: "600" }}>
            Walk to the front and ask <strong>one yes/no question</strong> — or take a guess — to find out your team's word. Don't look at anyone's phone!
          </div>
        </div>
        <div style={{ marginTop: "14px", fontSize: "13px", fontWeight: "700", color: "#99F6E4" }}>Someone who knows the word will answer yes or no.</div>
      </div>
    );
  }

  // Their team's turn, and they hold the word.
  if (iAmAnswerer) {
    return (
      <div style={wrapStyle}>
        {header}
        <div style={{ textAlign: "center", fontSize: "12px", color: "#99F6E4", fontWeight: "700", marginBottom: "10px" }}>
          {answeringForOtherTeam
            ? `${activeTeam?.name ?? "The asking team"} has no other phone — you're answering for them. Say yes or no, but don't say the word!`
            : "Answer the asker's question with yes or no — don't say the word!"}
        </div>
        <div style={{ background: "linear-gradient(160deg,#022C22,#031F19)", border: "4px solid #0D9488", borderRadius: "22px", padding: "22px 16px", textAlign: "center", marginBottom: "16px", boxShadow: "0 0 30px rgba(13,148,136,0.35)" }}>
          <div style={{ color: "#5EEAD4", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", marginBottom: "10px" }}>The word is</div>
          <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: "16px", border: "3px solid #14B8A655", padding: "20px 10px", color: "#F0FDFA", fontWeight: "900", fontSize: "clamp(28px,9vw,44px)", lineHeight: 1.1, minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center", overflowWrap: "anywhere" }}>
            {state.currentWord}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={() => send("guessed")} style={bigButton("linear-gradient(135deg,#15803D,#22C55E)")}>They guessed it! ✅</button>
          <button onClick={() => send("missed")} style={{ ...bigButton("rgba(0,0,0,0.3)"), color: "#5EEAD4", border: "3px solid #14B8A6", padding: "14px", fontSize: "15px" }}>Not yet → next team</button>
          <button onClick={() => send("changeWord")} style={{ background: "none", border: "none", color: "#99F6E499", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>Change this word</button>
        </div>
      </div>
    );
  }

  // On the asking team, but neither asker nor answerer (e.g. a spectating teammate when another
  // team's phones were pulled in as answerers) — just follow along.
  return (
    <div style={{ ...wrapStyle, textAlign: "center" }}>
      {header}
      <div style={{ fontSize: "36px", marginBottom: "8px" }}>📣</div>
      <div style={{ fontWeight: "800", fontSize: "16px", color: "#5EEAD4" }}>Your team is asking questions!</div>
      {placeInLine > 0 && <div style={{ marginTop: "8px", fontSize: "14px", fontWeight: "700", color: "#99F6E4" }}>You're #{placeInLine + 1} in line to ask.</div>}
      {scoreboard}
    </div>
  );
}
