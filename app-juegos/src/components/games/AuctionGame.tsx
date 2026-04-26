import { useState, useEffect, useRef, useCallback } from "react";
import type{ GameProps } from "../../types";
import { teamsGridCols } from "../../data/constants";

interface Bet {
  amount?: number;
  vote?: "true" | "false";
}

interface ResultMsg {
  teamId: string | number;
  won: boolean;
  delta: number;
  vote: string | null;
  amount: number;
  satOut: boolean;
}

export function AuctionGame({ questions, teams, onUpdateScore, onEnd, earlyEndRef }: GameProps) {
  const AUCTION_START = 200;
  const BET_AMOUNTS = [25, 50, 100];

  const [qi, setQi] = useState(0);
  const [phase, setPhase] = useState<"intro" | "betting" | "result">("intro");
  const [bets, setBets] = useState<Record<string | number, Bet>>({});
  const [resultMsg, setResultMsg] = useState<ResultMsg[]>([]);
  const [satOutLastRound, setSatOutLastRound] = useState<Set<string | number>>(new Set());

  const [auctionBank, setAuctionBank] = useState<Record<string | number, number>>(() =>
    Object.fromEntries(teams.map(t => [t.id, AUCTION_START]))
  );

  const auctionBankRef = useRef(auctionBank);
  useEffect(() => { auctionBankRef.current = auctionBank; }, [auctionBank]);

  const flushAndEnd = useCallback(() => {
    teams.forEach(t => {
      const bank = auctionBankRef.current[t.id] ?? 0;
      if (bank > 0) onUpdateScore(t.id, bank);
    });
    onEnd();
  }, [teams, onUpdateScore, onEnd]);

  useEffect(() => {
    if (earlyEndRef) {
      earlyEndRef.current = () => {
        teams.forEach(t => {
          const bank = auctionBankRef.current[t.id] ?? 0;
          if (bank > 0) onUpdateScore(t.id, bank);
        });
      };
    }
    return () => { if (earlyEndRef) earlyEndRef.current = null; };
  }, [earlyEndRef, teams, onUpdateScore]);

  const s = questions[qi];
  if (!s) return null;

  const setBetField = (teamId: string | number, field: keyof Bet, value: any) => {
    setBets(b => ({ ...b, [teamId]: { ...(b[teamId] || {}), [field]: value } }));
  };

  const isBroke = (t: any) => (auctionBank[t.id] ?? 0) <= 0;
  const activeTeams = teams.filter(t => !isBroke(t));

  const allBetsPlaced = activeTeams.every(t => {
    const b = bets[t.id];
    return b && b.amount && b.amount > 0 && (b.vote === "true" || b.vote === "false");
  });

  const resolveRound = () => {
    const msgs: ResultMsg[] = [];
    const brokeThisRound = new Set<string | number>();
    const newBank = { ...auctionBank };

    teams.forEach(t => {
      if (isBroke(t)) {
        brokeThisRound.add(t.id);
        msgs.push({ teamId: t.id, won: false, delta: 0, vote: null, amount: 0, satOut: true });
        return;
      }
      const b = bets[t.id] || {};
      const amount = b.amount || 0;
      const votedCorrect = b.vote === "true";
      const wasCorrect = !!s.isCorrect;
      const won = votedCorrect === wasCorrect;
      const delta = won ? amount : -amount;
      newBank[t.id] = Math.max(0, (newBank[t.id] ?? 0) + delta);
      msgs.push({ teamId: t.id, won, delta, vote: b.vote || null, amount, satOut: false });
    });

    setAuctionBank(newBank);
    setSatOutLastRound(brokeThisRound);
    setResultMsg(msgs);
    setPhase("result");
  };

  const nextRound = () => {
    if (satOutLastRound.size > 0) {
      setAuctionBank(prev => {
        const next = { ...prev };
        satOutLastRound.forEach(id => { next[id] = (next[id] ?? 0) + 25; });
        return next;
      });
    }

    if (qi + 1 >= questions.length) {
      flushAndEnd();
      return;
    }
    setQi(i => i + 1);
    setBets({});
    setResultMsg([]);
    setPhase("betting");
  };

  if (phase === "intro") return (
    <div style={{ textAlign: "center" }}>
      <div style={{ background: "linear-gradient(135deg,#4C1D95,#7C3AED)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", position: "relative", color: "white", maxWidth: "520px", margin: "0 auto 10px" }}>
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏛️</div>
        <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>Sentence Auction</div>
        <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
          A sentence appears on screen — <strong>correct or incorrect?</strong><br />
          Each team secretly picks their verdict and <strong>bets points</strong> on it.<br />
          Win your bet and keep the points. Lose and they're gone!<br />
          <strong>All In</strong> for big risk — <strong>25pts minimum</strong> to stay safe.
        </div>
        <div style={{ position: "absolute", bottom: "-14px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "14px solid #7C3AED" }} />
      </div>
      <div style={{ marginTop: "24px", marginBottom: "20px", fontSize: "14px", color: "#6B7280", fontWeight: "600" }}>
        Each team gets a <strong>200 pt auction bank</strong> — separate from your score. Bet wisely — your final bank total adds to your score!
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
        {teams.map(t => (
          <div key={t.id} style={{ background: t.color.light, border: `3px solid ${t.color.bg}`, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: t.color.dark }}>
            {t.color.emoji} {t.name}
          </div>
        ))}
      </div>
      <button onClick={() => setPhase("betting")} style={{ background: "linear-gradient(135deg,#4C1D95,#7C3AED)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(124,58,237,0.4)" }}>
        🏛️ Start the Auction!
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ background: "#4C1D95", borderRadius: "18px", padding: "20px 24px", marginBottom: "18px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>Sentence {qi + 1} of {questions.length}</span>
          <span style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>🏛️ Sentence Auction</span>
        </div>
        <p style={{ fontSize: "clamp(16px,3vw,22px)", fontWeight: "800", color: "white", lineHeight: 1.5, margin: "0 0 8px", fontStyle: "italic" }}>
          "{s.sentence}"
        </p>
        <p style={{ color: "#C4B5FD", fontSize: "14px", margin: 0 }}>
          Is this sentence <strong style={{ color: "#FCD34D" }}>correct</strong> or <strong style={{ color: "#F87171" }}>incorrect</strong>?
        </p>
      </div>

      {phase === "betting" && (
        <div>
          <p style={{ textAlign: "center", fontWeight: "800", color: "#374151", fontSize: "15px", marginBottom: "14px" }}>Each team: choose TRUE or FALSE, then place your bet</p>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "12px", marginBottom: "18px" }}>
            {teams.map(t => {
              const b = bets[t.id] || {};
              const broke = isBroke(t);
              
              if (broke) {
                return (
                  <div key={t.id} style={{ background: "#F3F4F6", border: `3px solid #D1D5DB`, borderRadius: "16px", padding: "14px", opacity: 0.75, textAlign: "center" }}>
                    <div style={{ fontWeight: "900", color: "#6B7280", fontSize: "15px", marginBottom: "8px" }}>{t.name} — 0 auction pts</div>
                    <div style={{ fontSize: "28px", marginBottom: "6px" }}>💸</div>
                    <div style={{ fontWeight: "800", color: "#6B7280", fontSize: "13px", marginBottom: "4px" }}>Sitting out this round</div>
                    <div style={{ fontWeight: "700", color: "#22C55E", fontSize: "12px" }}>+25 pts revival next round!</div>
                  </div>
                );
              }

              return (
                <div key={t.id} style={{ background: t.color.light, border: `3px solid ${t.color.bg}`, borderRadius: "16px", padding: "14px" }}>
                  <div style={{ fontWeight: "900", color: t.color.dark, fontSize: "15px", marginBottom: "10px" }}>{t.name} — {auctionBank[t.id] ?? 0} auction pts</div>

                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <button onClick={() => setBetField(t.id, "vote", "true")} style={{
                      flex: 1, padding: "8px 4px", fontWeight: "800", fontSize: "14px", border: `2px solid ${t.color.bg}`, borderRadius: "10px", cursor: "pointer",
                      background: b.vote === "true" ? "#22C55E" : "white",
                      color: b.vote === "true" ? "white" : t.color.dark
                    }}>✅ TRUE</button>
                    <button onClick={() => setBetField(t.id, "vote", "false")} style={{
                      flex: 1, padding: "8px 4px", fontWeight: "800", fontSize: "14px", border: `2px solid ${t.color.bg}`, borderRadius: "10px", cursor: "pointer",
                      background: b.vote === "false" ? "#EF4444" : "white",
                      color: b.vote === "false" ? "white" : t.color.dark
                    }}>❌ FALSE</button>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {BET_AMOUNTS.filter(amt => amt <= (auctionBank[t.id] ?? 0)).map(amt => (
                      <button key={amt} onClick={() => setBetField(t.id, "amount", amt)} style={{
                        padding: "5px 10px", fontWeight: "700", fontSize: "13px",
                        border: `2px solid ${t.color.bg}`, borderRadius: "8px", cursor: "pointer",
                        background: b.amount === amt ? t.color.bg : "white",
                        color: b.amount === amt ? "white" : t.color.dark
                      }}>{amt}</button>
                    ))}
                    <button onClick={() => setBetField(t.id, "amount", auctionBank[t.id] ?? 0)} style={{
                      padding: "5px 10px", fontWeight: "700", fontSize: "12px",
                      border: `2px solid ${t.color.bg}`, borderRadius: "8px", cursor: "pointer",
                      background: b.amount === (auctionBank[t.id] ?? 0) ? t.color.bg : "white",
                      color: b.amount === (auctionBank[t.id] ?? 0) ? "white" : t.color.dark
                    }}>ALL IN</button>
                  </div>

                  {b.vote && b.amount && b.amount > 0 && (
                    <div style={{ marginTop: "8px", fontSize: "12px", fontWeight: "700", color: t.color.dark, background: "rgba(0,0,0,0.06)", borderRadius: "8px", padding: "5px 8px" }}>
                      Betting {b.amount}pts on {b.vote === "true" ? "TRUE ✅" : "FALSE ❌"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={resolveRound} disabled={!allBetsPlaced} style={{
              background: allBetsPlaced ? "#7C3AED" : "#D1D5DB",
              color: "white", border: "none", borderRadius: "14px",
              padding: "14px 36px", fontSize: "17px", fontWeight: "900",
              cursor: allBetsPlaced ? "pointer" : "not-allowed"
            }}>🔔 Reveal Answer</button>
            {!allBetsPlaced && <p style={{ color: "#9CA3AF", fontSize: "13px", marginTop: "8px" }}>
              {activeTeams.length === 0 ? "All teams are out — proceed to next round!" : "All active teams must pick TRUE/FALSE and a bet amount"}
            </p>}
            {activeTeams.length === 0 && (
              <button onClick={resolveRound} style={{
                background: "#6366F1", color: "white", border: "none", borderRadius: "14px",
                padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", marginTop: "8px"
              }}>➡️ Skip to Revival Round</button>
            )}
          </div>
        </div>
      )}

      {phase === "result" && (
        <div>
          <div style={{
            background: s.isCorrect ? "#ECFDF5" : "#FEF2F2",
            border: `3px solid ${s.isCorrect ? "#22C55E" : "#EF4444"}`,
            borderRadius: "16px", padding: "16px 20px", textAlign: "center", marginBottom: "16px"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "6px" }}>{s.isCorrect ? "✅" : "❌"}</div>
            <div style={{ fontWeight: "900", fontSize: "20px", color: s.isCorrect ? "#14532D" : "#991B1B", marginBottom: "8px" }}>
              This sentence is {s.isCorrect ? "CORRECT" : "INCORRECT"}
            </div>
            <p style={{ color: s.isCorrect ? "#166534" : "#B91C1C", fontSize: "15px", margin: 0, lineHeight: 1.5 }}>{s.explanation}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", marginBottom: "18px" }}>
            {resultMsg.map(r => {
              const t = teams.find(tm => tm.id === r.teamId);
              if (!t) return null;
              
              if (r.satOut) {
                return (
                  <div key={r.teamId} style={{ background: "#F3F4F6", border: "3px solid #D1D5DB", borderRadius: "14px", padding: "12px", textAlign: "center", opacity: 0.75 }}>
                    <div style={{ fontWeight: "900", fontSize: "15px", color: "#6B7280", marginBottom: "6px" }}>{t.name}</div>
                    <div style={{ fontSize: "22px", marginBottom: "4px" }}>💸</div>
                    <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: "700" }}>Sat out</div>
                    <div style={{ fontSize: "12px", color: "#22C55E", fontWeight: "700", marginTop: "4px" }}>+25 pts next round!</div>
                  </div>
                );
              }
              
              return (
                <div key={r.teamId} style={{
                  background: r.won ? "#ECFDF5" : "#FEF2F2",
                  border: `3px solid ${r.won ? "#22C55E" : "#EF4444"}`,
                  borderRadius: "14px", padding: "12px", textAlign: "center"
                }}>
                  <div style={{ fontWeight: "900", fontSize: "15px", color: t.color.dark, marginBottom: "6px" }}>{t.name}</div>
                  <div style={{ fontSize: "13px", marginBottom: "6px", color: "#374151" }}>
                    Voted: <strong>{r.vote === "true" ? "TRUE ✅" : "FALSE ❌"}</strong> · Bet: <strong>{r.amount}pts</strong>
                  </div>
                  <div style={{ fontWeight: "900", fontSize: "22px", color: r.won ? "#14532D" : "#991B1B" }}>
                    {r.won ? `+${r.delta}` : `${r.delta}`}
                  </div>
                  <div style={{ fontSize: "13px", color: r.won ? "#166534" : "#B91C1C", fontWeight: "700" }}>{r.won ? "Correct!" : "Wrong!"}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: "700", marginTop: "4px" }}>Bank: {auctionBank[r.teamId] ?? 0} pts</div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center" }}>
            <button onClick={nextRound} style={{
              background: "#7C3AED", color: "white", border: "none",
              borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer"
            }}>{qi + 1 >= questions.length ? "🏁 End Game" : "➡️ Next Sentence"}</button>
          </div>
        </div>
      )}
    </div>
  );
}