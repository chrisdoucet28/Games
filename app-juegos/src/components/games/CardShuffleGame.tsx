import { useState, useRef, useCallback, useEffect } from "react";
import type { GameProps } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { teamsGridCols } from "../../data/constants";
import { denseRank, medalForRank } from "../../utils/ranking";

const AMBIENT_BITS = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 29) % 90,
  size: 14 + (i % 4) * 4,
  dur: 5 + (i % 5),
  delay: (i % 6) * 0.5,
  emoji: ["🎈", "🎪", "🎟️", "🍿", "✨", "🎊"][i % 6],
}));

const STYLE_TAG = (
  <style>{`
    @keyframes csDrift{0%{transform:translateY(0) rotate(0deg);opacity:0.18}50%{opacity:0.4}100%{transform:translateY(-44px) rotate(14deg);opacity:0.18}}
    @keyframes csSpotlightSweep{0%{transform:rotate(-38deg)}50%{transform:rotate(38deg)}100%{transform:rotate(-38deg)}}
    @keyframes csMarquee{0%,100%{opacity:0.55}50%{opacity:1}}
    @keyframes csStarPulse{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.12);filter:brightness(1.3)}}
    @keyframes csRevealPop{0%{transform:scale(0.85);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
    .cs-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.1)}
    .cs-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
    .cs-card:hover{filter:brightness(1.1)}
  `}</style>
);

function AmbientBackdrop() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {AMBIENT_BITS.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: `${b.left}%`, top: `${b.top}%`, fontSize: `${b.size}px`, animation: `csDrift ${b.dur}s ease-in-out infinite ${b.delay}s` }}>{b.emoji}</div>
      ))}
    </div>
  );
}

function SpotlightBackdrop() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", display: "flex", justifyContent: "center" }}>
      <div style={{
        position: "absolute", top: "-120px", left: "50%", width: "10px", height: "480px", transformOrigin: "top center",
        background: "linear-gradient(180deg,rgba(253,224,71,0.28),transparent 75%)",
        clipPath: "polygon(48% 0%, 52% 0%, 100% 100%, 0% 100%)",
        animation: "csSpotlightSweep 6s ease-in-out infinite",
      }} />
    </div>
  );
}

// Diagonal big-top canvas stripes — a subtle, low-opacity texture layer.
const TENT_STRIPES: React.CSSProperties = {
  position: "absolute", inset: 0, pointerEvents: "none",
  background: "repeating-linear-gradient(115deg, rgba(255,251,235,0.05) 0px, rgba(255,251,235,0.05) 26px, transparent 26px, transparent 52px)",
};

// What "Save & Exit" snapshots and "Resume" restores — which round we're on and the running
// per-team tallies (star hits, correct answers) that carry the final results screen. Deliberately
// excludes in-round card positions/picks: resuming redraws a fresh set of cards for the same
// round and starts it from "preview", rather than trying to replay a shuffle/pick in progress.
type CardShuffleSnapshot = {
  roundCount: number;
  starHitsByTeam: Record<string | number, number>;
  correctByTeam: Record<string | number, number>;
};

function validateCardShuffleSnapshot(raw: unknown): CardShuffleSnapshot | undefined {
  const s = raw as Partial<CardShuffleSnapshot> | null | undefined;
  if (!s || typeof s.roundCount !== "number" || s.roundCount < 0) return undefined;
  return { roundCount: s.roundCount, starHitsByTeam: s.starHitsByTeam ?? {}, correctByTeam: s.correctByTeam ?? {} };
}

export function CardShuffleGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState }: GameProps) {
  const resumed = useRef(validateCardShuffleSnapshot(initialGameState)).current;
  const TURN_SECONDS = 25;
  const NUM_CARDS = 4;
  const CARD_W = 130;
  const CARD_H = 170;
  const COL_GAP = 18;
  const ROW_GAP = 18;
  const slotPos = (slot: number) => ({ x: (slot % 2) * (CARD_W + COL_GAP), y: Math.floor(slot / 2) * (CARD_H + ROW_GAP) });
  const GRID_W = 2 * CARD_W + COL_GAP;
  const GRID_H = 2 * CARD_H + ROW_GAP;

  const shuffledQs = useRef([...questions].sort(() => Math.random() - 0.5)).current;

  const buildRound = useCallback((roundIdx: number) => {
    const start = roundIdx * NUM_CARDS;
    const pool = Array.from({ length: NUM_CARDS }, (_, i) => shuffledQs[(start + i) % shuffledQs.length]);
    const starIdx = Math.floor(Math.random() * NUM_CARDS);
    return pool.map((q, i) => ({ cid: i, isStar: i === starIdx, task: q.task || q.question || q.word || String(q) }));
  }, [shuffledQs]);

  const [roundCount, setRoundCount] = useState(() => resumed?.roundCount ?? 0);
  const [cards, setCards] = useState(() => buildRound(resumed?.roundCount ?? 0));
  const [cardSlots, setCardSlots] = useState([0, 1, 2, 3]);
  const [cardPos, setCardPos] = useState(() => [0, 1, 2, 3].map(slotPos));
  // A resumed game skips the intro and drops straight into "preview" for a freshly-drawn round.
  const [phase, setPhase] = useState<"intro" | "preview" | "shuffling" | "picking" | "answering" | "reveal" | "final">(() => resumed ? "preview" : "intro");

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => { setPhase("final"); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase]);

  const [teamPicks, setTeamPicks] = useState<Record<string | number, { cardIdx: number, slot: number, correct: boolean }>>({});
  // Running per-team tallies across every round — teamPicks itself resets each round, so this is
  // what needs to survive to the final results screen.
  const [starHitsByTeam, setStarHitsByTeam] = useState<Record<string | number, number>>(() => resumed?.starHitsByTeam ?? {});
  const [correctByTeam, setCorrectByTeam] = useState<Record<string | number, number>>(() => resumed?.correctByTeam ?? {});

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): CardShuffleSnapshot => ({ roundCount, starHitsByTeam, correctByTeam });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, roundCount, starHitsByTeam, correctByTeam]);

  const [answeringTeamIdx, setAnsweringTeamIdx] = useState(0);
  const [showAns, setShowAns] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const slotsRef = useRef([0, 1, 2, 3]);

  const slotToCard = (slot: number) => slotsRef.current.findIndex(s => s === slot);

  const animateSwap = (cA: number, cB: number, duration: number) => new Promise<void>(resolve => {
    const posA = slotPos(slotsRef.current[cB]);
    const posB = slotPos(slotsRef.current[cA]);
    setTransitioning(true);
    setCardPos(prev => {
      const next = [...prev];
      next[cA] = posA;
      next[cB] = posB;
      return next;
    });
    setTimeout(() => {
      const newSlots = [...slotsRef.current];
      [newSlots[cA], newSlots[cB]] = [newSlots[cB], newSlots[cA]];
      slotsRef.current = newSlots;
      setCardSlots([...newSlots]);
      setTransitioning(false);
      resolve();
    }, duration);
  });

  const buildShuffleSequence = () => {
    const allPairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
    const rng = () => Math.random();
    const style = Math.floor(rng() * 4);
    let slowCount, medCount, fastCount, blurCount;
    if (style === 0) { slowCount = 3; medCount = 4; fastCount = 5; blurCount = 7; }
    else if (style === 1) { slowCount = 2; medCount = 3; fastCount = 7; blurCount = 8; }
    else if (style === 2) { slowCount = 4; medCount = 5; fastCount = 4; blurCount = 6; }
    else { slowCount = 3; medCount = 6; fastCount = 6; blurCount = 5; }

    const pickPair = (exclude: number[] | null) => {
      const choices = allPairs.filter(p => !exclude || !(p[0] === exclude[0] && p[1] === exclude[1]));
      return choices[Math.floor(rng() * choices.length)];
    };

    const maybeCycle = (count: number, dur: number) => {
      const seq: number[][] = [], durs: number[] = [];
      let last: number[] | null = null;
      for (let i = 0; i < count; i++) {
        if (rng() < 0.3 && i < count - 1) {
          const p1 = pickPair(last);
          const p2 = pickPair(p1);
          seq.push(p1, p2); durs.push(dur, dur); i++; last = p2;
        } else {
          const p = pickPair(last); seq.push(p); durs.push(dur); last = p;
        }
      }
      return { seq, durs };
    };

    const slow = maybeCycle(slowCount, 620);
    const medium = maybeCycle(medCount, 370);
    const fast = maybeCycle(fastCount, 170);
    const blur = maybeCycle(blurCount, 95);

    const addBurst = rng() < 0.5;
    const burstPos = Math.floor(rng() * medium.seq.length);

    const seq = [...slow.seq, ...medium.seq, ...fast.seq, ...blur.seq];
    const dur = [...slow.durs, ...medium.durs, ...fast.durs, ...blur.durs];
    const pauseAfter = [...slow.durs.map(d => d >= 500), ...medium.durs.map((_, i) => addBurst && i === burstPos), ...fast.durs.map(() => false), ...blur.durs.map(() => false)];

    return { seq, dur, pauseAfter };
  };

  const runShuffle = async () => {
    setPhase("shuffling");
    slotsRef.current = [0, 1, 2, 3];
    setCardSlots([0, 1, 2, 3]);
    setCardPos([0, 1, 2, 3].map(slotPos));
    await new Promise(r => setTimeout(r, 500));
    const { seq, dur, pauseAfter } = buildShuffleSequence();
    for (let i = 0; i < seq.length; i++) {
      const [cA, cB] = seq[i];
      await animateSwap(cA, cB, dur[i]);
      if (pauseAfter[i]) await new Promise(r => setTimeout(r, 90 + Math.random() * 80));
    }
    setPhase("picking");
    setAnsweringTeamIdx(0);
  };

  const advanceAnsweringTeam = useCallback(() => {
    const nextIdx = answeringTeamIdx + 1;
    if (nextIdx >= teams.length) setPhase("reveal");
    else { setAnsweringTeamIdx(nextIdx); setShowAns(false); }
  }, [answeringTeamIdx, teams.length]);

  const { timeLeft, stop, reset: resetTimer } = useTurnTimer(TURN_SECONDS, phase === "picking", () => advanceAnsweringTeam(), answeringTeamIdx);

  const pickSlot = (slot: number) => {
    const currentTeam = teams[answeringTeamIdx];
    if (phase !== "picking" || teamPicks[currentTeam.id]) return;
    const cardIdx = slotToCard(slot);
    stop();
    setTeamPicks(p => ({ ...p, [currentTeam.id]: { cardIdx, slot, correct: false } }));
    setPhase("answering");
  };

  const resolveAnswer = (correct: boolean) => {
    const currentTeam = teams[answeringTeamIdx];
    setTeamPicks(p => ({ ...p, [currentTeam.id]: { ...p[currentTeam.id], correct } }));
    setShowAns(false);
    const nextIdx = answeringTeamIdx + 1;
    if (nextIdx >= teams.length) setPhase("reveal");
    else { setAnsweringTeamIdx(nextIdx); setPhase("picking"); resetTimer(); }
  };

  const hasScored = useRef(false);
  useEffect(() => {
    if (phase !== "reveal" || hasScored.current) return;
    hasScored.current = true;
    teams.forEach(t => {
      const pick = teamPicks[t.id];
      if (!pick) return;
      if (cards[pick.cardIdx]?.isStar && pick.correct) {
        onUpdateScore(t.id, 120);
        setStarHitsByTeam(prev => ({ ...prev, [t.id]: (prev[t.id] ?? 0) + 1 }));
        setCorrectByTeam(prev => ({ ...prev, [t.id]: (prev[t.id] ?? 0) + 1 }));
      } else if (!cards[pick.cardIdx]?.isStar && pick.correct) {
        onUpdateScore(t.id, 30);
        setCorrectByTeam(prev => ({ ...prev, [t.id]: (prev[t.id] ?? 0) + 1 }));
      }
    });
  }, [phase, teams, teamPicks, cards, onUpdateScore]);

  useEffect(() => { if (phase === "preview") hasScored.current = false; }, [phase]);

  // Caps at 5 rounds, or fewer if there isn't enough content for 5 — matches the "Round X/Y"
  // display below exactly, so the game actually ends when that counter says it should.
  const maxRounds = Math.min(5, Math.floor(questions.length / NUM_CARDS)) || 5;

  const nextRound = () => {
    const next = roundCount + 1;
    if (next >= maxRounds) { setPhase("final"); return; }
    const newCards = buildRound(next);
    setCards(newCards);
    slotsRef.current = [0, 1, 2, 3];
    setCardSlots([0, 1, 2, 3]);
    setCardPos([0, 1, 2, 3].map(slotPos));
    setTeamPicks({});
    setAnsweringTeamIdx(0);
    setShowAns(false);
    setRoundCount(next);
    setPhase("preview");
  };

  const currentTeam = teams[answeringTeamIdx];
  const myPickSlot = phase === "answering" ? teamPicks[currentTeam?.id]?.slot : undefined;
  const pickedCard = myPickSlot !== undefined ? cards[slotToCard(myPickSlot)] : null;

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% -10%,#DC2626 0%,#7F1D1D 48%,#2A0505 100%)",
  };

  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      <AmbientBackdrop />
      <div style={TENT_STRIPES} />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(160deg,#991B1B,#450A0A)", border: "2px solid #FCD34D66", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "540px", margin: "0 auto 10px", boxShadow: "0 0 50px rgba(220,38,38,0.45)" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🎪</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#FCD34D" }}>Card Shuffle</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
            Roll up, roll up! Four cards take the stage — one hides a lucky <strong style={{ color: "#FCD34D" }}>⭐ star</strong>. Remember which one!<br />
            The ringmaster <strong style={{ color: "#FCD34D" }}>shuffles fast</strong> — keep your eyes on the star card if you can!<br />
            Each team picks a card and performs a <strong style={{ color: "#FCD34D" }}>speaking task</strong> for the crowd.<br />
            Land on the star card = <strong style={{ color: "#FCD34D" }}>120 pts</strong>. Any other card = <strong>30 pts</strong>.
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          {teams.map(t => (<div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#450A0A)`, border: "3px solid " + t.color.bg, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: "white" }}>{t.color.emoji} {t.name}</div>))}
        </div>
        <button onClick={() => setPhase("preview")} className="cs-btn" style={{ background: "linear-gradient(135deg,#B91C1C,#FCD34D)", color: "#450A0A", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(252,211,77,0.4)", transition: "transform 0.15s ease" }}>
          🎪 Step Right Up!
        </button>
      </div>
    </div>
  );

  if (phase === "final") {
    // Dense rank on final score — two teams tied for top billing both get gold instead of an
    // arbitrary array-order winner.
    const ranking = denseRank(teams, t => t.score).sort((a, b) => b.value - a.value);
    const winners = ranking.filter(r => r.rank === 0);
    const isTie = winners.length > 1;
    const headline = isTie
      ? `${winners.map(w => w.item.name).join(" & ")} tied for the star of the show!`
      : `${winners[0]?.item.name} stole the show!`;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <AmbientBackdrop />
        <div style={TENT_STRIPES} />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "44px", marginBottom: "6px" }}>🎪</div>
          <div style={{ fontWeight: "900", fontSize: "22px", color: "#FCD34D", marginBottom: "16px" }}>{headline}</div>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "760px" }}>
            {ranking.map(({ item: t, rank, value }) => (
              <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#450A0A)`, border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "12px" }}>
                <div style={{ fontSize: "22px" }}>{medalForRank(rank)}</div>
                <div style={{ fontWeight: "800", color: "white", fontSize: "14px", marginTop: "4px" }}>{t.color.emoji} {t.name}</div>
                <div style={{ color: "#FCD34D", fontWeight: "900", fontSize: "16px", marginTop: "4px" }}>{value} pts</div>
                <div style={{ fontSize: "11px", color: "#FEF3C7", fontWeight: "700", marginTop: "4px" }}>{correctByTeam[t.id] ?? 0} correct · ⭐ {starHitsByTeam[t.id] ?? 0} star{(starHitsByTeam[t.id] ?? 0) === 1 ? "" : "s"}</div>
              </div>
            ))}
          </div>
          <button onClick={onEnd} className="cs-btn" style={{ background: "linear-gradient(135deg,#B91C1C,#FCD34D)", color: "#450A0A", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "16px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 20px rgba(252,211,77,0.4)", transition: "transform 0.15s ease" }}>🏁 End Game</button>
        </div>
      </div>
    );
  }

  return (
    <div style={arenaStyle}>
      <AmbientBackdrop />
      <div style={TENT_STRIPES} />
      {(phase === "shuffling" || phase === "preview") && <SpotlightBackdrop />}
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(90deg,#991B1B,#B91C1C)", border: "1.5px solid #FCD34D55", borderRadius: "14px", padding: "10px 16px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", boxShadow: "0 4px 18px rgba(153,27,27,0.5)" }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
            🎪 Round {roundCount + 1}/{maxRounds} —{" "}
            {phase === "preview" && "⭐ Remember which card is the star — then we shuffle!"}
            {phase === "shuffling" && "👀 Watch carefully — track the star!"}
            {phase === "picking" && `${currentTeam.name} — step right up and pick a card!`}
            {phase === "answering" && `${currentTeam.name} — the crowd awaits your performance!`}
            {phase === "reveal" && "🥁 Ta-da! Time for the big reveal!"}
          </span>
          {phase === "picking" && <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS} />}
        </div>

        <div style={{ position: "relative", height: `${GRID_H}px`, width: `${GRID_W}px`, margin: "0 auto", marginBottom: "16px" }}>
          {cards.map((card, cardIdx) => {
            const pos = cardPos[cardIdx];
            const slot = cardSlots[cardIdx];
            const isPickedSlot = myPickSlot === slot || (phase === "reveal" && teams.some(t => teamPicks[t.id]?.slot === slot));
            const pickerTeams = phase === "reveal" ? teams.filter(t => teamPicks[t.id]?.slot === slot) : [];
            const transitionMs = transitioning ? (phase === "shuffling" ? 75 : 130) : 340;
            const revealed = phase === "reveal";

            return (
              <div key={card.cid} style={{ position: "absolute", top: `${pos.y}px`, left: `${pos.x}px`, width: `${CARD_W}px`, height: `${CARD_H}px`, transition: `left ${transitionMs}ms ease-in-out, top ${transitionMs}ms ease-in-out`, zIndex: isPickedSlot ? 2 : 1 }}>
                <div
                  onClick={() => phase === "picking" && !transitioning && pickSlot(slot)}
                  className="cs-card"
                  style={{
                    width: "100%", height: "100%", borderRadius: "14px",
                    background: revealed ? (card.isStar ? "linear-gradient(160deg,#FDE68A,#F59E0B)" : "linear-gradient(160deg,#FFFBEB,#FEF3C7)") : "radial-gradient(circle at 50% 35%,#DC2626,#7F1D1D 75%)",
                    border: `3px solid ${isPickedSlot && !revealed ? "#22C55E" : revealed ? (card.isStar ? "#F59E0B" : "#D97706") : "#450A0A"}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: phase === "picking" && !transitioning ? "pointer" : "default", boxSizing: "border-box", padding: "10px 8px", position: "relative", userSelect: "none",
                    boxShadow: revealed && card.isStar ? "0 0 24px rgba(245,158,11,0.7)" : "0 4px 10px rgba(0,0,0,0.35)",
                    animation: revealed ? "csRevealPop 0.35s ease-out" : "none",
                  }}
                >
                  {phase === "preview" && (
                    <>{card.isStar ? <div style={{ fontSize: "36px", animation: "csStarPulse 1.1s ease-in-out infinite" }}>⭐</div> : <div style={{ fontSize: "30px", opacity: 0.35 }}>🎪</div>}</>
                  )}
                  {(phase === "shuffling" || phase === "picking" || phase === "answering") && (
                    <div style={{ fontSize: "30px", opacity: 0.4 }}>🎪</div>
                  )}
                  {revealed && (
                    <>
                      {card.isStar && <div style={{ fontSize: "22px", marginBottom: "4px" }}>⭐</div>}
                      <div style={{ fontSize: "10px", fontWeight: "800", color: card.isStar ? "#450A0A" : "#78350F", textAlign: "center", lineHeight: 1.4, padding: "0 4px" }}>{card.task}</div>
                      {pickerTeams.length > 0 && (
                        <div style={{ position: "absolute", top: "-10px", right: "-10px", display: "flex", flexDirection: "column", gap: "2px" }}>
                          {pickerTeams.map(t => (<div key={t.id} style={{ width: "20px", height: "20px", borderRadius: "50%", background: t.color.bg, border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "900", color: "white" }}>{t.name[0]}</div>))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {revealed && pickerTeams.length > 0 && (
                  <div style={{ marginTop: "6px" }}>
                    {pickerTeams.map(t => {
                      const pick = teamPicks[t.id];
                      const won = card.isStar && pick.correct;
                      const partial = !card.isStar && pick.correct;
                      return (
                        <div key={t.id} style={{ background: won ? "rgba(34,197,94,0.18)" : partial ? "rgba(96,165,250,0.18)" : "rgba(248,113,113,0.18)", border: `2px solid ${won ? "#22C55E" : partial ? "#60A5FA" : "#F87171"}`, borderRadius: "8px", padding: "3px 6px", marginBottom: "3px", textAlign: "center", fontSize: "11px", fontWeight: "800", color: "white" }}>
                          {t.name}: {won ? "⭐ +120" : partial ? "+30" : "0"}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {phase === "preview" && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p style={{ color: "#FEF3C7", fontWeight: "700", fontSize: "14px", marginBottom: "10px", animation: "csMarquee 1.6s ease-in-out infinite" }}>One card has a <strong style={{ color: "#FCD34D" }}>⭐ star</strong> — remember which one!</p>
            <button onClick={runShuffle} className="cs-btn" style={{ background: "linear-gradient(135deg,#B91C1C,#FCD34D)", color: "#450A0A", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 20px rgba(252,211,77,0.4)", transition: "transform 0.15s ease" }}>🔀 Shuffle!</button>
          </div>
        )}

        {phase === "picking" && (
          <div style={{ background: "rgba(255,255,255,0.08)", border: `3px solid ${currentTeam.color.bg}`, borderRadius: "14px", padding: "14px", textAlign: "center", marginTop: "8px" }}>
            <div style={{ fontWeight: "900", fontSize: "16px", color: "white", marginBottom: "4px" }}>{currentTeam.name} — pick a card to get your task!</div>
          </div>
        )}

        {phase === "answering" && pickedCard && (
          <div style={{ marginTop: "8px" }}>
            <div style={{ background: "linear-gradient(160deg,#FFFBEB,#FEF3C7)", border: "3px solid #F59E0B", borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#B45309", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>🎤 {currentTeam.name}'s task</div>
              <div style={{ fontSize: "clamp(14px,2.5vw,18px)", fontWeight: "800", color: "#450A0A", lineHeight: 1.5 }}>{pickedCard.task}</div>
            </div>
            {!showAns ? (
              <div style={{ textAlign: "center" }}>
                <button onClick={() => { stop(); setShowAns(true); }} className="cs-btn" style={{ background: "linear-gradient(135deg,#B91C1C,#DC2626)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>✋ Performance complete!</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={() => resolveAnswer(true)} className="cs-btn" style={{ background: "linear-gradient(135deg,#15803D,#22C55E)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>✅ Correct</button>
                <button onClick={() => resolveAnswer(false)} className="cs-btn" style={{ background: "linear-gradient(135deg,#B91C1C,#EF4444)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>❌ Wrong</button>
              </div>
            )}
          </div>
        )}

        {phase === "reveal" && (
          <div style={{ textAlign: "center", marginTop: "70px" }}>
            <div style={{ background: "linear-gradient(160deg,#FDE68A,#F59E0B)", border: "3px solid #FCD34D", borderRadius: "14px", padding: "14px", marginBottom: "14px", boxShadow: "0 0 24px rgba(245,158,11,0.5)" }}>
              <div style={{ fontSize: "22px", marginBottom: "6px", color: "#450A0A", fontWeight: "900" }}>⭐ Star card revealed!</div>
            </div>
            <button onClick={nextRound} className="cs-btn" style={{ background: "linear-gradient(135deg,#B91C1C,#FCD34D)", color: "#450A0A", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "16px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 20px rgba(252,211,77,0.4)", transition: "transform 0.15s ease" }}>
              {roundCount + 1 >= maxRounds ? "🏆 See Final Results" : "➡️ Next Round"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
