import { useState, useRef, useCallback, useEffect } from "react";
import type { GameProps } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";

export function CardShuffleGame({ questions, teams, onUpdateScore, onEnd }: GameProps) {
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

  const [roundCount, setRoundCount] = useState(0);
  const [cards, setCards] = useState(() => buildRound(0));
  const [cardSlots, setCardSlots] = useState([0, 1, 2, 3]);
  const [cardPos, setCardPos] = useState(() => [0, 1, 2, 3].map(slotPos));
  const [phase, setPhase] = useState<"intro" | "preview" | "shuffling" | "picking" | "answering" | "reveal">("intro");
  const [teamPicks, setTeamPicks] = useState<Record<string | number, { cardIdx: number, slot: number, correct: boolean }>>({});
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
      if (cards[pick.cardIdx]?.isStar && pick.correct) onUpdateScore(t.id, 120);
      else if (!cards[pick.cardIdx]?.isStar && pick.correct) onUpdateScore(t.id, 30);
    });
  }, [phase, teams, teamPicks, cards, onUpdateScore]);
  
  useEffect(() => { if (phase === "preview") hasScored.current = false; }, [phase]);

  const nextRound = () => {
    const next = roundCount + 1;
    if (next * NUM_CARDS >= questions.length && next >= 5) { onEnd(); return; }
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
  const maxRounds = Math.min(5, Math.floor(questions.length / NUM_CARDS));

  if (phase === "intro") return (
    <div style={{ textAlign: "center" }}>
      <div style={{ background: "linear-gradient(135deg,#4338CA,#6366F1)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", position: "relative", color: "white", maxWidth: "520px", margin: "0 auto 10px" }}>
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>🃏</div>
        <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>Card Shuffle</div>
        <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
          Four cards appear — one has a <strong>⭐ star</strong>. Remember which one!<br />
          The cards <strong>shuffle fast</strong> — try to track the star card.<br />
          Each team picks a card and gets a <strong>speaking task</strong> to complete.<br />
          Land on the <strong>star card = 120 pts</strong>. Any other card = 30 pts.
        </div>
        <div style={{ position: "absolute", bottom: "-14px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "14px solid #6366F1" }} />
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
        {teams.map(t => (<div key={t.id} style={{ background: t.color.light, border: "3px solid " + t.color.bg, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: t.color.dark }}>{t.color.emoji} {t.name}</div>))}
      </div>
      <button onClick={() => setPhase("preview")} style={{ background: "linear-gradient(135deg,#4338CA,#6366F1)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(99,102,241,0.4)" }}>
        🃏 Deal the Cards!
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ background: "#4338CA", borderRadius: "14px", padding: "10px 16px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ color: "white", fontWeight: "900", fontSize: "16px" }}>
          🃏 Round {roundCount + 1}/{maxRounds || 5} —{" "}
          {phase === "preview" && "⭐ Remember which card is the star — then we shuffle!"}
          {phase === "shuffling" && "👀 Watch carefully — track the star!"}
          {phase === "picking" && `${currentTeam.name} — pick your card!`}
          {phase === "answering" && `${currentTeam.name} — complete the task!`}
          {phase === "reveal" && "🌟 Reveal time!"}
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

          return (
            <div key={card.cid} style={{ position: "absolute", top: `${pos.y}px`, left: `${pos.x}px`, width: `${CARD_W}px`, height: `${CARD_H}px`, transition: `left ${transitionMs}ms ease-in-out, top ${transitionMs}ms ease-in-out`, zIndex: isPickedSlot ? 2 : 1 }}>
              <div onClick={() => phase === "picking" && !transitioning && pickSlot(slot)} style={{ width: "100%", height: "100%", borderRadius: "14px", background: phase === "reveal" ? (card.isStar ? "#FCD34D" : "#6366F1") : "#6366F1", border: `3px solid ${isPickedSlot && phase !== "reveal" ? "#22C55E" : phase === "reveal" ? (card.isStar ? "#F59E0B" : "#4338CA") : "#4338CA"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: phase === "picking" && !transitioning ? "pointer" : "default", boxSizing: "border-box", padding: "10px 8px", position: "relative", userSelect: "none" }}>
                {phase === "preview" && (
                  <>{card.isStar ? <div style={{ fontSize: "36px" }}>⭐</div> : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", opacity: 0.25 }}><div style={{ width: "56px", height: "2px", background: "white", borderRadius: "2px" }} /><div style={{ width: "40px", height: "2px", background: "white", borderRadius: "2px" }} /><div style={{ width: "50px", height: "2px", background: "white", borderRadius: "2px" }} /></div>}</>
                )}
                {(phase === "shuffling" || phase === "picking" || phase === "answering") && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", opacity: phase === "answering" ? 0.3 : 0.3 }}><div style={{ width: "56px", height: "2px", background: "white", borderRadius: "2px" }} /><div style={{ width: "40px", height: "2px", background: "white", borderRadius: "2px" }} /><div style={{ width: "50px", height: "2px", background: "white", borderRadius: "2px" }} /></div>
                )}
                {phase === "reveal" && (
                  <>
                    {card.isStar && <div style={{ fontSize: "22px", marginBottom: "4px" }}>⭐</div>}
                    <div style={{ fontSize: "10px", fontWeight: "800", color: "white", textAlign: "center", lineHeight: 1.4, padding: "0 4px" }}>{card.task}</div>
                    {pickerTeams.length > 0 && (
                      <div style={{ position: "absolute", top: "-10px", right: "-10px", display: "flex", flexDirection: "column", gap: "2px" }}>
                        {pickerTeams.map(t => (<div key={t.id} style={{ width: "20px", height: "20px", borderRadius: "50%", background: t.color.bg, border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "900", color: "white" }}>{t.name[0]}</div>))}
                      </div>
                    )}
                  </>
                )}
              </div>
              {phase === "reveal" && pickerTeams.length > 0 && (
                <div style={{ marginTop: "6px" }}>
                  {pickerTeams.map(t => {
                    const pick = teamPicks[t.id];
                    const won = card.isStar && pick.correct;
                    const partial = !card.isStar && pick.correct;
                    return (
                      <div key={t.id} style={{ background: won ? "#ECFDF5" : partial ? "#EFF6FF" : "#FEF2F2", border: `2px solid ${won ? "#22C55E" : partial ? "#3B82F6" : "#EF4444"}`, borderRadius: "8px", padding: "3px 6px", marginBottom: "3px", textAlign: "center", fontSize: "11px", fontWeight: "800", color: won ? "#14532D" : partial ? "#1E3A8A" : "#991B1B" }}>
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
          <p style={{ color: "#374151", fontWeight: "700", fontSize: "14px", marginBottom: "4px" }}>One card has a <strong>⭐ star</strong> — remember which one!</p>
          <button onClick={runShuffle} style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer" }}>🔀 Shuffle!</button>
        </div>
      )}

      {phase === "picking" && (
        <div style={{ background: currentTeam.color.light, border: `3px solid ${currentTeam.color.bg}`, borderRadius: "14px", padding: "14px", textAlign: "center", marginTop: "8px" }}>
          <div style={{ fontWeight: "900", fontSize: "16px", color: currentTeam.color.dark, marginBottom: "4px" }}>{currentTeam.name} — pick a card to get your task!</div>
        </div>
      )}

      {phase === "answering" && pickedCard && (
        <div style={{ marginTop: "8px" }}>
          <div style={{ background: "#EEF2FF", border: "3px solid #6366F1", borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#4338CA", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>🗣️ {currentTeam.name}'s task</div>
            <div style={{ fontSize: "clamp(14px,2.5vw,18px)", fontWeight: "800", color: "#1E1B4B", lineHeight: 1.5 }}>{pickedCard.task}</div>
          </div>
          {!showAns ? (
            <div style={{ textAlign: "center" }}>
              <button onClick={() => { stop(); setShowAns(true); }} style={{ background: "#6366F1", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>✋ Ready to judge</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => resolveAnswer(true)} style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>✅ Correct</button>
              <button onClick={() => resolveAnswer(false)} style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>❌ Wrong</button>
            </div>
          )}
        </div>
      )}

      {phase === "reveal" && (
        <div style={{ textAlign: "center", marginTop: "70px" }}>
          <div style={{ background: "#FEF9C3", border: "3px solid #FCD34D", borderRadius: "14px", padding: "14px", marginBottom: "14px" }}>
            <div style={{ fontSize: "22px", marginBottom: "6px" }}>⭐ Star card revealed!</div>
          </div>
          <button onClick={nextRound} style={{ background: "#6366F1", color: "white", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "16px", fontWeight: "900", cursor: "pointer" }}>
            {roundCount + 1 >= (maxRounds || 5) ? "🏁 End Game" : "➡️ Next Round"}
          </button>
        </div>
      )}
    </div>
  );
}
