import { useEffect, useState } from "react";
import { TeamIcon } from "../shared/TeamIcon";
import type { AuctionStatePayload, AuctionBetPayload } from "../../lib/liveSession";

type Props = {
  state: AuctionStatePayload;
  teamId: string | number;
  onBet: (payload: AuctionBetPayload) => void;
};

const BET_AMOUNTS = [25, 50, 100];

// The reveal itself stays a shared, whole-class moment on the projector — but each team also gets
// its own win/lose overlay on their phone the moment the teacher hits "Reveal Answer", mirroring
// the shared screen's own per-team result cards. It overlays the existing betting view rather than
// replacing it (nothing to hide at this point — the bet's already locked in) and disappears on its
// own once the teacher advances: `state.results` is only populated during "result"/"final" and
// gets cleared the instant nextRound() resets it server-side, so there's nothing to dismiss here.
export function PhoneAuctionView({ state, teamId, onBet }: Props) {
  const [vote, setVote] = useState<"true" | "false" | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  // A fresh lot means a fresh bet — reset local picks whenever the teacher's screen moves on.
  useEffect(() => {
    setVote(null);
    setAmount(null);
  }, [state.qi]);

  const bank = state.banks[String(teamId)] ?? 0;
  const team = state.roster.find(t => t.id === teamId);
  const locked = vote !== null && amount !== null;
  const myResult = state.results?.[String(teamId)];

  const pick = (nextVote: typeof vote, nextAmount: typeof amount) => {
    const finalVote = nextVote ?? vote;
    const finalAmount = nextAmount ?? amount;
    setVote(finalVote);
    setAmount(finalAmount);
    if (finalVote !== null && finalAmount !== null) {
      onBet({ teamId, vote: finalVote, amount: finalAmount });
    }
  };

  return (
    <div style={{
      minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "white",
      background: "radial-gradient(ellipse at 50% -10%,#6D28D9 0%,#2E1065 45%,#0F0524 100%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "900", fontSize: "16px" }}>
          <span style={{ fontSize: "22px" }}><TeamIcon team={team} size={22} /></span>
          {team?.name}
        </span>
        <span style={{ background: "rgba(253,224,71,0.15)", border: "1px solid #FCD34D55", color: "#FCD34D", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "800" }}>
          {bank} pts
        </span>
      </div>

      <div style={{ background: "linear-gradient(160deg,#3B0764,#1E1033)", border: "2px solid #FCD34D55", borderRadius: "16px", padding: "18px 16px", marginBottom: "18px", textAlign: "center" }}>
        <div style={{ fontSize: "11px", color: "#C4B5FD", fontWeight: "700", marginBottom: "6px" }}>🔨 Lot №{state.qi + 1}</div>
        <p style={{ fontSize: "17px", fontWeight: "800", fontStyle: "italic", margin: "0 0 8px", lineHeight: 1.5 }}>"{state.sentence}"</p>
        <p style={{ fontSize: "13px", color: "#C4B5FD", margin: 0 }}>
          Is this sentence <strong style={{ color: "#FCD34D" }}>correct</strong> or <strong style={{ color: "#F87171" }}>incorrect</strong>?
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
        <button onClick={() => pick("true", null)} style={{
          flex: 1, padding: "16px 4px", fontWeight: "800", fontSize: "16px", borderRadius: "12px", cursor: "pointer",
          border: "2px solid #22C55E", background: vote === "true" ? "#22C55E" : "rgba(255,255,255,0.06)", color: "white",
        }}>✅ TRUE</button>
        <button onClick={() => pick("false", null)} style={{
          flex: 1, padding: "16px 4px", fontWeight: "800", fontSize: "16px", borderRadius: "12px", cursor: "pointer",
          border: "2px solid #EF4444", background: vote === "false" ? "#EF4444" : "rgba(255,255,255,0.06)", color: "white",
        }}>❌ FALSE</button>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
        {BET_AMOUNTS.filter(amt => amt <= bank).map(amt => (
          <button key={amt} onClick={() => pick(null, amt)} style={{
            flex: "1 1 70px", padding: "12px 4px", fontWeight: "800", fontSize: "15px", borderRadius: "10px", cursor: "pointer",
            border: "2px solid #FCD34D", background: amount === amt ? "#FCD34D" : "rgba(255,255,255,0.06)",
            color: amount === amt ? "#150F00" : "#FCD34D",
          }}>{amt}</button>
        ))}
        <button onClick={() => pick(null, bank)} style={{
          flex: "1 1 70px", padding: "12px 4px", fontWeight: "800", fontSize: "14px", borderRadius: "10px", cursor: "pointer",
          border: "2px solid #FB923C", background: amount === bank ? "linear-gradient(135deg,#C2410C,#FB923C)" : "rgba(251,146,60,0.12)",
          color: amount === bank ? "white" : "#FDBA74",
        }}>🔥 ALL IN</button>
      </div>

      {locked && (
        <div style={{ textAlign: "center", background: "rgba(34,197,94,0.15)", border: "2px solid #22C55E", borderRadius: "12px", padding: "12px", fontWeight: "800", fontSize: "14px", color: "#4ADE80" }}>
          🔒 Locked in — {amount}pts on {vote === "true" ? "TRUE" : "FALSE"}. Look at the screen!
        </div>
      )}

      {myResult && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(5,3,15,0.82)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 50,
        }}>
          <div style={{
            width: "100%", maxWidth: "360px", textAlign: "center", borderRadius: "20px", padding: "26px 22px",
            background: myResult.won ? "linear-gradient(160deg,#052E16,#1E1033)" : "linear-gradient(160deg,#450A0A,#1E1033)",
            border: `3px solid ${myResult.won ? "#22C55E" : "#EF4444"}`,
            boxShadow: `0 0 40px ${myResult.won ? "#22C55E55" : "#EF444455"}`,
          }}>
            <div style={{ fontSize: "40px", marginBottom: "6px" }}>🔨</div>
            <div style={{
              display: "inline-block", fontWeight: "900", fontSize: "20px", letterSpacing: "0.05em",
              color: state.correct ? "#4ADE80" : "#F87171", border: `3px solid ${state.correct ? "#4ADE80" : "#F87171"}`,
              borderRadius: "8px", padding: "3px 16px", marginBottom: "12px",
            }}>
              {state.correct ? "SOLD! ✔" : "REJECTED! ✘"}
            </div>
            <div style={{ fontSize: "13px", color: "#D1D5DB", marginBottom: "14px" }}>
              You bet <strong>{myResult.amount}pts</strong> on <strong>{myResult.vote === "true" ? "TRUE ✅" : "FALSE ❌"}</strong> — the sentence was <strong>{state.correct ? "CORRECT" : "INCORRECT"}</strong>.
            </div>
            <div style={{ fontWeight: "900", fontSize: "32px", color: myResult.won ? "#4ADE80" : "#F87171", marginBottom: "4px" }}>
              {myResult.won ? `+${myResult.delta}` : `${myResult.delta}`}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "800", color: myResult.won ? "#86EFAC" : "#FCA5A5", marginBottom: "16px" }}>
              {myResult.won ? "Correct!" : "Wrong!"}
            </div>
            <div style={{ fontSize: "13px", color: "#FCD34D", fontWeight: "700" }}>{bank}pts in the bank</div>
          </div>
        </div>
      )}
    </div>
  );
}
