import { useState, useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../types";
import { teamsGridCols, GAME_MODES } from "../../data/constants";
import { denseRank, medalForRank } from "../../utils/ranking";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { AUCTION_TUTORIAL_STEPS } from "../../data/tutorials/auction";

const GM = GAME_MODES.find(g => g.id === "auction")!;

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

const AMBIENT_BITS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 41) % 100,
  top: (i * 29) % 100,
  size: 10 + (i % 3) * 5,
  dur: 5 + (i % 5),
  delay: (i % 6) * 0.6,
  emoji: ["✨", "🪙", "💰", "⭐"][i % 4],
}));

const STYLE_TAG = (
  <style>{`
    @keyframes auctionDrift{0%{transform:translateY(0) rotate(0deg);opacity:0.15}50%{opacity:0.4}100%{transform:translateY(-30px) rotate(20deg);opacity:0.15}}
    @keyframes spotlightPulse{0%,100%{opacity:0.55}50%{opacity:0.85}}
    @keyframes gavelSwing{0%{transform:rotate(-50deg)}45%{transform:rotate(18deg)}62%{transform:rotate(-8deg)}80%{transform:rotate(4deg)}100%{transform:rotate(0deg)}}
    @keyframes stampSlam{0%{transform:scale(2.6) rotate(-14deg);opacity:0}45%{transform:scale(0.9) rotate(-8deg);opacity:1}65%{transform:scale(1.1) rotate(-9deg)}100%{transform:scale(1) rotate(-7deg);opacity:1}}
    @keyframes chipShimmer{0%,100%{filter:brightness(1)}50%{filter:brightness(1.3)}}
    @keyframes coinFall{0%{transform:translateY(-6px) rotate(0deg);opacity:1}100%{transform:translateY(64px) rotate(200deg);opacity:0}}
    @keyframes ribbonPop{0%{transform:rotate(35deg) scale(0)}70%{transform:rotate(35deg) scale(1.15)}100%{transform:rotate(35deg) scale(1)}}
    @keyframes cardIn{0%{opacity:0;transform:translateY(10px) scale(0.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
    .auction-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.08)}
    .auction-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
    .auction-allin:hover{box-shadow:0 0 14px #F9731688}
  `}</style>
);

function AmbientBackdrop() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {AMBIENT_BITS.map((b, i) => (
        <div key={i} style={{
          position: "absolute", left: `${b.left}%`, top: `${b.top}%`, fontSize: `${b.size}px`,
          animation: `auctionDrift ${b.dur}s ease-in-out infinite ${b.delay}s`,
        }}>{b.emoji}</div>
      ))}
    </div>
  );
}

function MascotAvatar({ mascot, color, size = 30 }: { mascot?: string; color: string; size?: number }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      width: `${size}px`, height: `${size}px`, borderRadius: "50%",
      background: `radial-gradient(circle at 35% 30%, ${color}66, #1E1033)`,
      border: `2px solid ${color}`, fontSize: `${size * 0.55}px`,
      boxShadow: `0 0 8px ${color}77`,
    }}>{mascot}</span>
  );
}

function ChipStack({ amount, max = 200 }: { amount: number; max?: number }) {
  const chipCount = amount <= 0 ? 0 : Math.min(6, Math.max(1, Math.ceil((amount / max) * 6)));
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {Array.from({ length: chipCount }).map((_, i) => (
        <div key={i} style={{
          width: "15px", height: "15px", borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #FDE68A, #D97706 70%, #92400E)",
          border: "1.5px solid #FCD34D", marginLeft: i === 0 ? 0 : "-7px", flexShrink: 0,
          boxShadow: "0 1px 2px rgba(0,0,0,0.5)", animation: `chipShimmer 2.2s ease-in-out infinite ${i * 0.15}s`,
        }} />
      ))}
    </div>
  );
}

export function AuctionGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef }: GameProps) {
  const AUCTION_START = 200;
  const BET_AMOUNTS = [25, 50, 100];

  const [qi, setQi] = useState(0);
  const [phase, setPhase] = useState<"intro" | "betting" | "result" | "final">("intro");
  const [showHowTo, setShowHowTo] = useState(false);
  const [bets, setBets] = useState<Record<string | number, Bet>>({});
  const [resultMsg, setResultMsg] = useState<ResultMsg[]>([]);
  const [satOutLastRound, setSatOutLastRound] = useState<Set<string | number>>(new Set());
  // Wins tracked per team across the whole auction — resultMsg itself resets every round, so this
  // is the one thing that needs to survive to the final results screen.
  const [roundsWon, setRoundsWon] = useState<Record<string | number, number>>({});

  const [auctionBank, setAuctionBank] = useState<Record<string | number, number>>(() =>
    Object.fromEntries(teams.map(t => [t.id, AUCTION_START]))
  );

  const auctionBankRef = useRef(auctionBank);
  const hasFlushedBankRef = useRef(false);
  useEffect(() => { auctionBankRef.current = auctionBank; }, [auctionBank]);

  const flushBankToScores = useCallback(() => {
    if (hasFlushedBankRef.current) return;
    hasFlushedBankRef.current = true;
    teams.forEach(t => {
      const bank = auctionBankRef.current[t.id] ?? 0;
      if (bank > 0) onUpdateScore(t.id, bank);
    });
  }, [teams, onUpdateScore]);

  const flushAndEnd = useCallback(() => {
    flushBankToScores();
    if (forceFinalRef) forceFinalRef.current = null;
    onEnd();
  }, [flushBankToScores, forceFinalRef, onEnd]);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => {
      flushBankToScores();
      setPhase("final");
      return true;
    };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, flushBankToScores, phase]);

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
    setRoundsWon(prev => {
      const next = { ...prev };
      msgs.forEach(m => { if (m.won) next[m.teamId] = (next[m.teamId] ?? 0) + 1; });
      return next;
    });
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
      // Flush the bank into real scores now so the final screen's ranking reflects it, but don't
      // call onEnd yet — show this game's own results first, matching every other game's pattern.
      flushBankToScores();
      setPhase("final");
      return;
    }
    setQi(i => i + 1);
    setBets({});
    setResultMsg([]);
    setPhase("betting");
  };

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% -10%,#6D28D9 0%,#2E1065 45%,#0F0524 100%)",
  };

  // Tutorial mockup: src/data/tutorials/auction.tsx — update if this intro's rules text changes.
  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      <AmbientBackdrop />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ position: "relative", background: "linear-gradient(160deg,#3B0764,#1E1033)", border: "2px solid #FCD34D66", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "520px", margin: "0 auto 10px", boxShadow: "0 0 50px rgba(124,58,237,0.45)", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-70px", left: "50%", transform: "translateX(-50%)", width: "280px", height: "220px", background: "radial-gradient(ellipse at 50% 0%,rgba(253,224,71,0.28),transparent 70%)", animation: "spotlightPulse 3s ease-in-out infinite" }} />
          <div style={{ position: "relative", fontSize: "36px", marginBottom: "10px" }}>🔨</div>
          <div style={{ position: "relative", fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#FCD34D" }}>Sentence Auction</div>
          <div style={{ position: "relative", fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
            A sentence goes up for auction — <strong style={{ color: "#FCD34D" }}>correct or incorrect?</strong><br />
            Each team secretly picks their verdict and <strong style={{ color: "#FCD34D" }}>bets points</strong> on it.<br />
            Win your bet and keep the points. Lose and they're gone!<br />
            <strong style={{ color: "#FB923C" }}>All In</strong> for big risk — <strong>25pts minimum</strong> to stay safe.
          </div>
        </div>
        <div style={{ marginTop: "24px", marginBottom: "20px", fontSize: "14px", color: "#C4B5FD", fontWeight: "600" }}>
          Each team gets a <strong style={{ color: "#FCD34D" }}>200 pt auction bank</strong> — separate from your score. Bet wisely — your final bank total adds to your score!
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          {teams.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "8px", background: `linear-gradient(160deg,${t.color.dark}55,#1E1033)`, border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "8px 18px 8px 10px", fontWeight: "800", fontSize: "14px", color: "white" }}>
              <MascotAvatar mascot={t.mascot ?? t.color.emoji} color={t.color.bg} />
              {t.name}
            </div>
          ))}
        </div>
        <button onClick={() => setShowHowTo(true)} style={{ display: "block", margin: "0 auto 14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
          ❓ How to Play
        </button>
        {showHowTo && (
          <HowToPlayModal
            gameName={GM.name} gameIcon={GM.icon} accentColor={GM.color}
            steps={AUCTION_TUTORIAL_STEPS}
            onClose={() => setShowHowTo(false)}
          />
        )}
        <button onClick={() => setPhase("betting")} className="auction-btn" style={{ background: "linear-gradient(135deg,#78350F,#F7C948)", color: "#150F00", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(247,201,72,0.4)", transition: "transform 0.15s ease" }}>
          🔨 Start the Auction!
        </button>
      </div>
    </div>
  );

  if (phase === "final") {
    // Dense rank on final score (bank already flushed in) — a tie for the highest bank shows two
    // gold gavels instead of an arbitrary array-order winner.
    const ranking = denseRank(teams, t => t.score).sort((a, b) => b.value - a.value);
    const winners = ranking.filter(r => r.rank === 0);
    const isTie = winners.length > 1;
    const headline = isTie
      ? `${winners.map(w => w.item.name).join(" & ")} tied for the biggest bank!`
      : `${winners[0]?.item.name} walked away with the biggest bank!`;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <AmbientBackdrop />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "44px", marginBottom: "6px" }}>🔨</div>
          <div style={{ fontWeight: "900", fontSize: "22px", color: "#FCD34D", marginBottom: "16px" }}>{headline}</div>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "760px" }}>
            {ranking.map(({ item: t, rank, value }) => (
              <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#1E1033)`, border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "12px" }}>
                <div style={{ fontSize: "22px" }}>{medalForRank(rank)}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "4px" }}>
                  <MascotAvatar mascot={t.mascot ?? t.color.emoji} color={t.color.bg} size={24} />
                  <span style={{ fontWeight: "800", color: "white", fontSize: "14px" }}>{t.name}</span>
                </div>
                <div style={{ color: "#FCD34D", fontWeight: "900", fontSize: "16px", marginTop: "4px" }}>{value} pts</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "6px" }}>
                  <ChipStack amount={auctionBank[t.id] ?? 0} />
                  <span style={{ fontSize: "12px", color: "#FCD34D", fontWeight: "700" }}>{auctionBank[t.id] ?? 0} final bank</span>
                </div>
                <div style={{ fontSize: "11px", color: "#C4B5FD", fontWeight: "700", marginTop: "4px" }}>Won {roundsWon[t.id] ?? 0} of {questions.length} lots</div>
              </div>
            ))}
          </div>
          <button onClick={flushAndEnd} className="auction-btn" style={{ background: "linear-gradient(135deg,#78350F,#F7C948)", color: "#150F00", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}>🏁 End Game</button>
        </div>
      </div>
    );
  }

  return (
    <div style={arenaStyle}>
      <AmbientBackdrop />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ position: "relative", background: "linear-gradient(160deg,#3B0764,#1E1033)", border: "2px solid #FCD34D55", borderRadius: "18px", padding: "22px 24px", marginBottom: "18px", textAlign: "center", boxShadow: "0 0 40px rgba(124,58,237,0.35)", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "260px", height: "200px", background: "radial-gradient(ellipse at 50% 0%,rgba(253,224,71,0.22),transparent 70%)", animation: "spotlightPulse 3s ease-in-out infinite" }} />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ background: "rgba(253,224,71,0.15)", border: "1px solid #FCD34D55", color: "#FCD34D", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>🔨 Lot №{qi + 1} of {questions.length}</span>
            <span style={{ background: "rgba(255,255,255,0.12)", color: "white", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>🏛️ Sentence Auction</span>
          </div>
          <p style={{ position: "relative", fontSize: "clamp(16px,3vw,22px)", fontWeight: "800", color: "white", lineHeight: 1.5, margin: "0 0 8px", fontStyle: "italic" }}>
            "{s.sentence}"
          </p>
          <p style={{ position: "relative", color: "#C4B5FD", fontSize: "14px", margin: 0 }}>
            Is this sentence <strong style={{ color: "#FCD34D" }}>correct</strong> or <strong style={{ color: "#F87171" }}>incorrect</strong>?
          </p>
        </div>

        {phase === "betting" && (
          <div>
            <p style={{ textAlign: "center", fontWeight: "800", color: "#DDD6FE", fontSize: "15px", marginBottom: "14px" }}>Each team: choose TRUE or FALSE, then place your bet</p>
            <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "12px", marginBottom: "18px" }}>
              {teams.map(t => {
                const b = bets[t.id] || {};
                const broke = isBroke(t);

                if (broke) {
                  return (
                    <div key={t.id} style={{ position: "relative", background: "linear-gradient(160deg,#1F1B2E,#120E1E)", border: "3px solid #4B5563", borderRadius: "16px", padding: "14px", opacity: 0.85, textAlign: "center", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: "12px", right: "-32px", background: "#DC2626", color: "white", fontWeight: "900", fontSize: "10px", letterSpacing: "0.05em", padding: "3px 36px", transform: "rotate(35deg)", boxShadow: "0 2px 6px rgba(0,0,0,0.5)", animation: "ribbonPop 0.4s ease-out" }}>BANKRUPT</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "8px" }}>
                        <MascotAvatar mascot={t.mascot ?? t.color.emoji} color="#6B7280" />
                        <span style={{ fontWeight: "900", color: "#D1D5DB", fontSize: "15px" }}>{t.name}</span>
                      </div>
                      <div style={{ fontSize: "28px", marginBottom: "6px" }}>💸</div>
                      <div style={{ fontWeight: "800", color: "#9CA3AF", fontSize: "13px", marginBottom: "4px" }}>Sitting out this round</div>
                      <div style={{ fontWeight: "700", color: "#4ADE80", fontSize: "12px" }}>+25 pts revival next round!</div>
                    </div>
                  );
                }

                return (
                  <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}44,#150C28)`, border: `2px solid ${t.color.bg}`, borderRadius: "16px", padding: "14px", animation: "cardIn 0.3s ease-out", boxShadow: `0 0 14px ${t.color.bg}33` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "900", color: "white", fontSize: "15px" }}>
                        <MascotAvatar mascot={t.mascot ?? t.color.emoji} color={t.color.bg} />
                        {t.name}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ChipStack amount={auctionBank[t.id] ?? 0} />
                        <span style={{ fontSize: "12px", fontWeight: "800", color: "#FCD34D" }}>{auctionBank[t.id] ?? 0}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <button onClick={() => setBetField(t.id, "vote", "true")} className="auction-btn" style={{
                        flex: 1, padding: "8px 4px", fontWeight: "800", fontSize: "14px", border: `2px solid ${t.color.bg}`, borderRadius: "10px", cursor: "pointer", transition: "transform 0.15s ease",
                        background: b.vote === "true" ? "#22C55E" : "rgba(255,255,255,0.06)",
                        color: b.vote === "true" ? "white" : "#E5E7EB"
                      }}>✅ TRUE</button>
                      <button onClick={() => setBetField(t.id, "vote", "false")} className="auction-btn" style={{
                        flex: 1, padding: "8px 4px", fontWeight: "800", fontSize: "14px", border: `2px solid ${t.color.bg}`, borderRadius: "10px", cursor: "pointer", transition: "transform 0.15s ease",
                        background: b.vote === "false" ? "#EF4444" : "rgba(255,255,255,0.06)",
                        color: b.vote === "false" ? "white" : "#E5E7EB"
                      }}>❌ FALSE</button>
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {BET_AMOUNTS.filter(amt => amt <= (auctionBank[t.id] ?? 0)).map(amt => (
                        <button key={amt} onClick={() => setBetField(t.id, "amount", amt)} className="auction-btn" style={{
                          padding: "5px 10px", fontWeight: "700", fontSize: "13px", transition: "transform 0.15s ease",
                          border: `2px solid ${t.color.bg}`, borderRadius: "8px", cursor: "pointer",
                          background: b.amount === amt ? t.color.bg : "rgba(255,255,255,0.06)",
                          color: b.amount === amt ? "white" : "#E5E7EB"
                        }}>{amt}</button>
                      ))}
                      <button onClick={() => setBetField(t.id, "amount", auctionBank[t.id] ?? 0)} className="auction-btn auction-allin" style={{
                        padding: "5px 10px", fontWeight: "800", fontSize: "12px", transition: "transform 0.15s ease, box-shadow 0.15s ease",
                        border: `2px solid #FB923C`, borderRadius: "8px", cursor: "pointer",
                        background: b.amount === (auctionBank[t.id] ?? 0) ? "linear-gradient(135deg,#C2410C,#FB923C)" : "rgba(251,146,60,0.12)",
                        color: b.amount === (auctionBank[t.id] ?? 0) ? "white" : "#FDBA74"
                      }}>🔥 ALL IN</button>
                    </div>

                    {b.vote && b.amount && b.amount > 0 && (
                      <div style={{ marginTop: "8px", fontSize: "12px", fontWeight: "700", color: "#FCD34D", background: "rgba(0,0,0,0.25)", borderRadius: "8px", padding: "5px 8px" }}>
                        Betting {b.amount}pts on {b.vote === "true" ? "TRUE ✅" : "FALSE ❌"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center" }}>
              {activeTeams.length === 0 ? (
                <>
                  <p style={{ color: "#C4B5FD", fontSize: "13px", marginBottom: "8px" }}>All teams are out — proceed to next round!</p>
                  <button onClick={resolveRound} className="auction-btn" style={{
                    background: "linear-gradient(135deg,#4C1D95,#7C3AED)", color: "white", border: "none", borderRadius: "14px",
                    padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease"
                  }}>➡️ Skip to Revival Round</button>
                </>
              ) : (
                <>
                  <button onClick={resolveRound} disabled={!allBetsPlaced} className="auction-btn" style={{
                    background: allBetsPlaced ? "linear-gradient(135deg,#78350F,#F7C948)" : "#4B5563",
                    color: allBetsPlaced ? "#150F00" : "#9CA3AF", border: "none", borderRadius: "14px",
                    padding: "14px 36px", fontSize: "17px", fontWeight: "900", transition: "transform 0.15s ease",
                    cursor: allBetsPlaced ? "pointer" : "not-allowed"
                  }}>🔨 Reveal Answer</button>
                  {!allBetsPlaced && <p style={{ color: "#9CA3AF", fontSize: "13px", marginTop: "8px" }}>All active teams must pick TRUE/FALSE and a bet amount</p>}
                </>
              )}
            </div>
          </div>
        )}

        {phase === "result" && (
          <div key={qi}>
            <div style={{
              position: "relative", background: s.isCorrect ? "linear-gradient(160deg,#052E16,#0A0A18)" : "linear-gradient(160deg,#450A0A,#0A0A18)",
              border: `3px solid ${s.isCorrect ? "#22C55E" : "#EF4444"}`,
              borderRadius: "18px", padding: "18px 20px", textAlign: "center", marginBottom: "16px", overflow: "hidden",
              boxShadow: `0 0 30px ${s.isCorrect ? "#22C55E33" : "#EF444433"}`,
            }}>
              <div style={{ fontSize: "40px", display: "inline-block", transformOrigin: "80% 90%", animation: "gavelSwing 0.6s ease-out" }}>🔨</div>
              <div>
                <span style={{
                  display: "inline-block", fontWeight: "900", fontSize: "24px", letterSpacing: "0.06em",
                  color: s.isCorrect ? "#4ADE80" : "#F87171", border: `4px solid ${s.isCorrect ? "#4ADE80" : "#F87171"}`,
                  borderRadius: "8px", padding: "4px 20px", margin: "6px 0 12px",
                  animation: "stampSlam 0.5s cubic-bezier(.2,1.4,.6,1)",
                  textShadow: `0 0 12px ${s.isCorrect ? "#4ADE8088" : "#F8717188"}`,
                }}>
                  {s.isCorrect ? "SOLD! ✔" : "REJECTED! ✘"}
                </span>
              </div>
              <div style={{ fontWeight: "800", fontSize: "15px", color: "white", marginBottom: "6px" }}>
                This sentence is {s.isCorrect ? "CORRECT" : "INCORRECT"}
              </div>
              <p style={{ color: s.isCorrect ? "#86EFAC" : "#FCA5A5", fontSize: "15px", margin: 0, lineHeight: 1.5 }}>{s.explanation}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", marginBottom: "18px" }}>
              {resultMsg.map(r => {
                const t = teams.find(tm => tm.id === r.teamId);
                if (!t) return null;

                if (r.satOut) {
                  return (
                    <div key={r.teamId} style={{ background: "linear-gradient(160deg,#1F1B2E,#120E1E)", border: "3px solid #4B5563", borderRadius: "14px", padding: "12px", textAlign: "center", opacity: 0.85 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "6px" }}>
                        <MascotAvatar mascot={t.mascot ?? t.color.emoji} color="#6B7280" size={24} />
                        <span style={{ fontWeight: "900", fontSize: "15px", color: "#D1D5DB" }}>{t.name}</span>
                      </div>
                      <div style={{ fontSize: "22px", marginBottom: "4px" }}>💸</div>
                      <div style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: "700" }}>Sat out</div>
                      <div style={{ fontSize: "12px", color: "#4ADE80", fontWeight: "700", marginTop: "4px" }}>+25 pts next round!</div>
                    </div>
                  );
                }

                return (
                  <div key={r.teamId} style={{
                    position: "relative", overflow: "hidden",
                    background: r.won ? "linear-gradient(160deg,#052E16,#0A0A18)" : "linear-gradient(160deg,#450A0A,#0A0A18)",
                    border: `3px solid ${r.won ? "#22C55E" : "#EF4444"}`,
                    borderRadius: "14px", padding: "12px", textAlign: "center",
                  }}>
                    {r.won && Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{ position: "absolute", top: "6px", left: `${14 + i * 18}%`, fontSize: "13px", animation: `coinFall 0.9s ease-in ${i * 0.08}s both` }}>🪙</div>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "6px" }}>
                      <MascotAvatar mascot={t.mascot ?? t.color.emoji} color={t.color.bg} size={24} />
                      <span style={{ fontWeight: "900", fontSize: "15px", color: "white" }}>{t.name}</span>
                    </div>
                    <div style={{ fontSize: "13px", marginBottom: "6px", color: "#D1D5DB" }}>
                      Voted: <strong>{r.vote === "true" ? "TRUE ✅" : "FALSE ❌"}</strong> · Bet: <strong>{r.amount}pts</strong>
                    </div>
                    <div style={{ fontWeight: "900", fontSize: "22px", color: r.won ? "#4ADE80" : "#F87171" }}>
                      {r.won ? `+${r.delta}` : `${r.delta}`}
                    </div>
                    <div style={{ fontSize: "13px", color: r.won ? "#86EFAC" : "#FCA5A5", fontWeight: "700" }}>{r.won ? "Correct!" : "Wrong!"}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "6px" }}>
                      <ChipStack amount={auctionBank[r.teamId] ?? 0} />
                      <span style={{ fontSize: "12px", color: "#FCD34D", fontWeight: "700" }}>{auctionBank[r.teamId] ?? 0} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={nextRound} className="auction-btn" style={{
                background: "linear-gradient(135deg,#78350F,#F7C948)", color: "#150F00", border: "none",
                borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease"
              }}>{qi + 1 >= questions.length ? "🏆 See Final Results" : "➡️ Next Sentence"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
