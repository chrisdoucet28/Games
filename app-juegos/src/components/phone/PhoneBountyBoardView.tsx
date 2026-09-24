import { useEffect, useState } from "react";
import { TeamIcon } from "../shared/TeamIcon";
import type { BountyBoardStatePayload, BountyBoardActionPayload } from "../../lib/liveSession";

type Props = {
  state: BountyBoardStatePayload;
  teamId: string | number;
  onAction: (payload: BountyBoardActionPayload) => void;
};

// Screen-authoritative, like PhoneOrderUpView — this view never judges anything itself, it just
// renders whatever the screen's latest broadcast says and forwards a submit/claim/fix tap back as
// a one-shot action.
export function PhoneBountyBoardView({ state, teamId, onAction }: Props) {
  const team = state.roster.find(t => t.id === teamId);
  // null = "nothing typed yet this round" (fall back to the server's own entry text, e.g. on
  // reconnect); a real string, including "", means the student has actually touched the box, so it
  // must never fall back to anything else. Caught live: this used to be `useState("")` with `||`
  // fallbacks, which (a) never reset between rounds, so a previous round's leftover draft answer
  // silently persisted into the next round's box, and (b) treated a deliberately-cleared "" as
  // falsy, snapping back to old submitted text the instant the student finished erasing it — so a
  // student who cleared the box to retype could end up submitting a stale answer from the round
  // before without ever meaning to.
  const [roundDraft, setRoundDraft] = useState<string | null>(null);
  useEffect(() => { setRoundDraft(null); }, [state.roundNumber]);
  // Keyed by bounty id — a team could in principle hold more than one fix draft across bounties
  // that opened up in quick succession.
  const [fixDrafts, setFixDrafts] = useState<Record<number, string>>({});

  const wrapStyle: React.CSSProperties = {
    minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "#78350F",
    background: "radial-gradient(ellipse at 50% -10%,#FEF3C7 0%,#FDF6E3 60%,#FFFFFF 100%)",
  };

  if (state.phase === "final") {
    return (
      <div style={{ ...wrapStyle, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>⭐</div>
        <div style={{ fontWeight: "900", fontSize: "20px", color: "#92400E" }}>The board is cleared!</div>
        <div style={{ color: "#78350F", fontSize: "14px", marginTop: "8px" }}>Check the big screen for final results.</div>
      </div>
    );
  }

  if (state.phase === "lobby") {
    return (
      <div style={{ ...wrapStyle, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "36px", marginBottom: "6px" }}><TeamIcon team={team} size={36} /></div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#92400E", marginBottom: "8px" }}>You're in as {team?.name}!</div>
        <div style={{ color: "#78350F", fontSize: "14px", lineHeight: 1.6 }}>Get ready — waiting for your teacher to open the board…</div>
      </div>
    );
  }

  const myEntry = state.roundEntries.find(e => e.teamId === teamId);
  const myOpenBounty = state.bounties.find(b => b.originalTeamId === teamId && !b.resolved);
  const myClaimedBounties = state.bounties.filter(b => b.claimedBy === teamId && !b.resolved);
  const openBounties = state.bounties.filter(b => b.claimedBy === undefined && b.excludedTeamId !== teamId && !b.resolved);

  return (
    <div style={wrapStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <span style={{ fontWeight: "900", fontSize: "15px" }}><TeamIcon team={team} /> {team?.name}</span>
        <span style={{ fontSize: "13px", fontWeight: "800", color: "#92400E" }}>{state.scores[String(teamId)] ?? 0} pts</span>
      </div>
      <div style={{ fontSize: "11px", fontWeight: "800", color: "#92400E", textAlign: "center", marginBottom: "4px" }}>Round {state.roundNumber + 1} of {state.totalRounds}</div>

      <div style={{ marginBottom: "18px" }}>
        <div style={{ fontSize: "12px", fontWeight: "800", color: "#92400E", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>This round's word</div>
        <div style={{ background: "white", border: "2px solid #D97706", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", fontWeight: "700", marginBottom: "10px" }}>{state.promptText}</div>

        {myOpenBounty && state.isSolo && myOpenBounty.claimedBy === undefined ? (
          // Solo: there's no other real team to steal it, only the CPU racing a countdown on the
          // big screen — this is the only place the human can claim their own bounty from, since
          // openBounties (below) deliberately excludes a team's own bounty for every OTHER mode.
          <div style={{ background: "#FEE2E2", border: "2px dashed #B91C1C", borderRadius: "10px", padding: "10px 12px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#7F1D1D", marginBottom: "8px" }}>
              Your sentence was wrong — the CPU is racing to steal it! Claim it before time runs out.
            </div>
            <button
              onClick={() => onAction({ teamId, action: "claimBounty", bountyId: myOpenBounty.id })}
              style={{ background: "linear-gradient(135deg,#991B1B,#B91C1C)", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "800", cursor: "pointer", width: "100%" }}
            >Claim it now!</button>
          </div>
        ) : myOpenBounty && state.isSolo ? (
          // Solo, already self-claimed — the CPU's countdown is paused while you're claimed (it
          // only resumes if the fix comes back wrong), and myClaimedBounties below already renders
          // the real fix-writing card, so this is just a pointer down to it, not a duplicate.
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#92400E", padding: "6px 0" }}>You claimed it — write your fix below.</div>
        ) : myOpenBounty ? (
          <div style={{ background: "#FEE2E2", border: "1px dashed #FCA5A5", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", fontWeight: "700", color: "#7F1D1D" }}>
            Your sentence was wrong — it's now an open bounty another team can claim.
          </div>
        ) : myEntry?.resolved ? (
          <div style={{ background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", fontWeight: "700", color: "#166534" }}>✅ Correct! Waiting for the round to finish.</div>
        ) : state.answerMode !== "typing" ? (
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#92400E", padding: "6px 0" }}>Write your sentence down, then tell it to your teacher — they'll post it on the board.</div>
        ) : (
          <>
            <textarea
              value={roundDraft ?? myEntry?.text ?? ""}
              onChange={e => setRoundDraft(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Type your sentence…"
              style={{ width: "100%", boxSizing: "border-box", border: "1px solid #FDE68A", borderRadius: "8px", padding: "6px 8px", fontSize: "13px", fontFamily: "inherit", resize: "vertical" }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "6px" }}>
              {myEntry?.submitted && (roundDraft ?? myEntry.text) === myEntry.text && <span style={{ fontSize: "11px", fontWeight: "800", color: "#22C55E" }}>✅ Submitted</span>}
              <button
                onClick={() => onAction({ teamId, action: "submitRound", text: (roundDraft ?? myEntry?.text ?? "").trim() })}
                disabled={(roundDraft ?? myEntry?.text ?? "").trim() === ""}
                style={{
                  background: (roundDraft ?? myEntry?.text ?? "").trim() === "" ? "#D1D5DB" : "linear-gradient(135deg,#92400E,#B45309)", color: "white", border: "none",
                  borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: "800",
                  cursor: (roundDraft ?? myEntry?.text ?? "").trim() === "" ? "not-allowed" : "pointer",
                }}
              >Submit</button>
            </div>
          </>
        )}
      </div>

      {myClaimedBounties.length > 0 && (
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#7F1D1D", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Bounties you're fixing</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {myClaimedBounties.map(b => {
              // Pre-filled with the wrong sentence itself (not blank) — a teacher's own live
              // feedback: fixing a bounty is almost always a small edit to what's already there
              // (swap one word, add "not"), so starting from the wrong text and letting the
              // student edit it in place is much faster than retyping the whole sentence from
              // scratch, and matches the same "give them something to build from" pattern already
              // used elsewhere (e.g. Minefield).
              const draftValue = fixDrafts[b.id] ?? b.fixText ?? b.wrongText;
              return (
                <div key={b.id} style={{ background: "white", border: "2px solid #B91C1C", borderRadius: "14px", padding: "10px 12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#B91C1C", marginBottom: "6px" }}>💰 {b.value} pts</div>
                  <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "6px 8px", fontSize: "12px", fontWeight: "700", color: "#7F1D1D", marginBottom: "8px" }}>“{b.wrongText}”</div>
                  {state.answerMode !== "typing" ? (
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#7F1D1D" }}>Write your fixed sentence down, then tell it to your teacher — they'll post it on the board.</div>
                  ) : (
                    <>
                      <textarea
                        value={draftValue}
                        onChange={e => setFixDrafts(prev => ({ ...prev, [b.id]: e.target.value }))}
                        maxLength={300}
                        rows={2}
                        placeholder="Type your fix…"
                        style={{ width: "100%", boxSizing: "border-box", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "6px 8px", fontSize: "13px", fontFamily: "inherit", resize: "vertical" }}
                      />
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "6px" }}>
                        {b.fixText === draftValue && draftValue !== "" && <span style={{ fontSize: "11px", fontWeight: "800", color: "#22C55E" }}>✅ Submitted</span>}
                        <button
                          onClick={() => onAction({ teamId, action: "submitBountyFix", bountyId: b.id, text: draftValue.trim() })}
                          disabled={draftValue.trim() === ""}
                          style={{
                            background: draftValue.trim() === "" ? "#D1D5DB" : "linear-gradient(135deg,#991B1B,#B91C1C)", color: "white", border: "none",
                            borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: "800",
                            cursor: draftValue.trim() === "" ? "not-allowed" : "pointer",
                          }}
                        >Submit fix</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ fontSize: "12px", fontWeight: "800", color: "#7F1D1D", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Open bounties — tap to claim</div>
      {openBounties.length === 0 ? (
        <div style={{ fontSize: "13px", color: "#92400E", opacity: 0.7, padding: "8px 0" }}>No open bounties right now.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {openBounties.map(b => (
            <button
              key={b.id}
              onClick={() => onAction({ teamId, action: "claimBounty", bountyId: b.id })}
              style={{ background: "white", border: "1.5px dashed #FCA5A5", borderRadius: "14px", padding: "10px 12px", textAlign: "left", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: "900", color: "#B91C1C" }}>💰 {b.value} pts</span>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#B91C1C" }}>Claim!</span>
              </div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#7F1D1D" }}>“{b.wrongText}”</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
