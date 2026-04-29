import { useState, useRef, useCallback, useEffect } from "react";
import type{ GameProps } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { QuestionCard } from "../shared/QuestionCard";

const HILL_ZONES = [
  { id:"North",  icon:"⬆️", pts:3 },
  { id:"South",  icon:"⬇️", pts:3 },
  { id:"East",   icon:"➡️", pts:2 },
  { id:"West",   icon:"⬅️", pts:2 },
  { id:"Center", icon:"⭐", pts:5 },
];
const TOTAL_ROUNDS = 4;

export function KingOfHillGame({ questions, teams, onUpdateScore, onEnd }: GameProps) {
  const TURN_SECONDS = 20;
  const isTopicMode = questions.length > 0 && questions.every(q => q.type === "speaking task");
  const shuffledQs = useRef([...questions].sort(() => Math.random() - 0.5)).current;

  const [owners, setOwners] = useState<Record<string, string | number>>({});
  const [roundPoints, setRoundPoints] = useState(() => Object.fromEntries(teams.map(t => [t.id, 0])));
  const [round, setRound] = useState(1);
  const [turnOrder, setTurnOrder] = useState(() => teams.map((_, i) => i));
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [qi, setQi] = useState(0);

  const [phase, setPhase] = useState<"intro" | "rolling" | "pick" | "answer" | "contested" | "round-end">("intro");
  const [chosenZone, setChosenZone] = useState<string | null>(null);
  const [showAns, setShowAns] = useState(false);
  const [contest, setContest] = useState<any>(null);
  const [roundSummary, setRoundSummary] = useState<any[] | null>(null);

  const [diceValues, setDiceValues] = useState<(number | null)[]>(() => teams.map(() => null));
  const [rollDone, setRollDone] = useState(false);
  const [finalOrder, setFinalOrder] = useState<any[] | null>(null);

  const runRoundRoll = useCallback((teamIndicesToRoll: number[], existingRolls: Record<number, number>) => {
    const rolls = { ...existingRolls };
    setDiceValues(prev => {
      const next = [...prev];
      teamIndicesToRoll.forEach(i => { next[i] = null; });
      return next;
    });
    setRollDone(false);

    const TICKS = 8;
    let tick = 0;
    const intervals = teamIndicesToRoll.map(teamIdx => {
      return setInterval(() => {
        setDiceValues(prev => {
          const next = [...prev];
          next[teamIdx] = Math.floor(Math.random() * 6) + 1;
          return next;
        });
        tick++;
      }, 80);
    });

    setTimeout(() => {
      intervals.forEach(iv => clearInterval(iv));
      const finalVals: Record<number, number> = {};
      teamIndicesToRoll.forEach(i => {
        finalVals[i] = Math.floor(Math.random() * 6) + 1;
        rolls[i] = finalVals[i];
      });
      setDiceValues(prev => {
        const next = [...prev];
        Object.entries(finalVals).forEach(([i, v]) => { next[Number(i)] = v; });
        return next;
      });

      const valueGroups: Record<number, number[]> = {};
      teamIndicesToRoll.forEach(i => {
        const v = rolls[i];
        if (!valueGroups[v]) valueGroups[v] = [];
        valueGroups[v].push(i);
      });
      const tiedGroups = Object.values(valueGroups).filter(g => g.length > 1);

      if (tiedGroups.length > 0) {
        setTimeout(() => { tiedGroups.forEach(group => runRoundRoll(group, rolls)); }, 900);
      } else {
        const allTeamIndices = teams.map((_, i) => i);
        const allRolls = { ...existingRolls, ...rolls };
        const ordered = [...allTeamIndices].sort((a, b) => (allRolls[b] || 0) - (allRolls[a] || 0));
        setTurnOrder(ordered);
        setFinalOrder(ordered.map(i => ({ teamIdx: i, roll: allRolls[i] })));
        setRollDone(true);
      }
    }, TICKS * 80 + 100);
  }, [teams]);

  useEffect(() => {
    if (phase === "rolling") {
      const allIdx = teams.map((_, i) => i);
      setDiceValues(teams.map(() => null));
      setRollDone(false);
      setFinalOrder(null);
      setTimeout(() => runRoundRoll(allIdx, {}), 300);
    }
  }, [round, phase, runRoundRoll, teams]);

  const activeTeamRealIdx = turnOrder[activeTeamIdx];
  const activeTeam = teams[activeTeamRealIdx];
  const q = shuffledQs[qi % Math.max(shuffledQs.length, 1)];

  const doRoundPayout = useCallback((ownersOverride?: Record<string, string | number>) => {
    const effectiveOwners = ownersOverride || owners;
    const summary = teams.map(t => {
      const owned = HILL_ZONES.filter(z => effectiveOwners[z.id] === t.id);
      const pts = owned.reduce((sum, z) => sum + z.pts, 0);
      return { teamId: t.id, zonesOwned: owned, ptsEarned: pts };
    });
    summary.forEach(s => {
      if (s.ptsEarned > 0) onUpdateScore(s.teamId, s.ptsEarned * 10);
    });
    setRoundPoints(prev => {
      const next = { ...prev };
      summary.forEach(s => { next[s.teamId] = (next[s.teamId] || 0) + s.ptsEarned; });
      return next;
    });
    setRoundSummary(summary);
    setPhase("round-end");
  }, [owners, teams, onUpdateScore]);

  const nextTeamTurn = useCallback((_scored: boolean, ownersOverride?: Record<string, string | number>) => {
    const nextIdx = (activeTeamIdx + 1) % teams.length;
    if (nextIdx === 0) {
      doRoundPayout(ownersOverride);
    } else {
      setActiveTeamIdx(nextIdx);
      setPhase("pick");
      setChosenZone(null);
      setShowAns(false);
      setContest(null);
      setQi(i => i + 1);
    }
  }, [activeTeamIdx, teams.length, owners, doRoundPayout]);

  const { timeLeft, stop } = useTurnTimer(TURN_SECONDS, phase === "pick", () => nextTeamTurn(false, owners), activeTeamIdx);

  const startNextRound = () => {
    if (round >= TOTAL_ROUNDS) { onEnd(); return; }
    setRound(r => r + 1);
    setActiveTeamIdx(0);
    setChosenZone(null);
    setShowAns(false);
    setContest(null);
    setRoundSummary(null);
    setQi(i => i + 1);
    setPhase("rolling");
  };

  const pickZone = (zoneId: string) => {
    if (phase !== "pick") return;
    stop();
    setChosenZone(zoneId);
    const currentOwner = owners[zoneId];
    if (currentOwner !== undefined && currentOwner !== activeTeam.id) {
      setContest({ attackerId: activeTeam.id, defenderId: currentOwner, zoneId, step: "simultaneous" });
      setShowAns(false);
      setPhase("contested");
    } else {
      setPhase("answer");
    }
  };

  const resolveUncontested = (correct: boolean) => {
    let newOwners = owners;
    if (correct && chosenZone) {
      newOwners = { ...owners, [chosenZone]: activeTeam.id };
      setOwners(newOwners);
    }
    nextTeamTurn(correct, newOwners);
  };

  const resolveContest = (winnerId: string | number | null) => {
    let newOwners = { ...owners };
    let reason;
    if (winnerId === contest.attackerId) {
      newOwners[contest.zoneId] = contest.attackerId;
      onUpdateScore(contest.attackerId, 30);
      reason = "attacker";
    } else if (winnerId === contest.defenderId) {
      onUpdateScore(contest.defenderId, 20);
      reason = "defender";
    } else {
      reason = "neither";
    }
    setOwners(newOwners);
    setContest((c: any) => ({ ...c, step: "result", winner: winnerId, reason }));
  };

  if (phase === "intro") return (
    <div style={{ textAlign: "center" }}>
      <div style={{ background: "linear-gradient(135deg,#831843,#DB2777)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "520px", margin: "0 auto 10px", position: "relative" }}>
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>👑</div>
        <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>King of the Hill</div>
        <div style={{ fontSize: "15px", lineHeight: 1.7 }}>
          A map of <strong>5 zones</strong> is up for grabs - each worth different points.<br />
          Roll dice to set the <strong>turn order</strong>, then answer to <strong>claim zones</strong>.<br />
          Attack a claimed zone? <strong>Both teams face the same question!</strong><br />
          {isTopicMode
            ? <>On open questions, <strong>the teacher picks the better answer</strong> - defend well!</>
            : <>On grammar questions, <strong>the fastest correct answer wins</strong> - be quick!</>
          }<br />
          Score points for <strong>every zone you own</strong> at the end of each round.<br />
          Game lasts <strong>{TOTAL_ROUNDS} rounds</strong> - highest score wins!
        </div>
        <div style={{ position: "absolute", bottom: "-14px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "14px solid #DB2777" }} />
      </div>
      <div style={{ marginTop: "24px", marginBottom: "20px", fontSize: "14px", color: "#6B7280", fontWeight: "600" }}>
        The Center zone scores the most - expect fierce competition for it every round!
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
        {teams.map(t => (
          <div key={t.id} style={{ background: t.color.light, border: `3px solid ${t.color.bg}`, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: t.color.dark }}>
            {t.color.emoji} {t.name}
          </div>
        ))}
      </div>
      <button onClick={() => setPhase("rolling")} style={{ background: "linear-gradient(135deg,#831843,#DB2777)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer" }}>👑 Roll for Turn Order!</button>
    </div>
  );

  const renderZone = (zId: string) => {
    const z = HILL_ZONES.find(z => z.id === zId)!;
    const ownerId = owners[zId];
    const owner = ownerId !== undefined ? teams.find(t => t.id === ownerId) : null;
    const isChosen = chosenZone === zId;
    const isContested = contest?.zoneId === zId;
    const canPick = phase === "pick";
    return (
      <div key={zId} onClick={() => canPick && pickZone(zId)} style={{ background: owner ? owner.color.light : "#F3F4F6", border: `3px solid ${isContested ? "#EF4444" : isChosen ? activeTeam.color.bg : owner ? owner.color.bg : "#D1D5DB"}`, borderRadius: "14px", padding: "10px 6px", textAlign: "center", cursor: canPick ? "pointer" : "default", transform: isChosen || isContested ? "scale(1.06)" : "scale(1)", transition: "all 0.2s", boxShadow: isContested ? "0 0 14px #EF444460" : isChosen ? `0 0 12px ${activeTeam.color.bg}60` : "none" }}>
        <div style={{ fontSize: "18px" }}>{z.icon}</div>
        <div style={{ fontWeight: "900", fontSize: "13px", color: owner ? owner.color.dark : "#374151" }}>{zId}</div>
        <div style={{ fontWeight: "800", fontSize: "12px", color: "#F59E0B" }}>+{z.pts}/rnd</div>
        <div style={{ fontSize: "11px", color: owner ? owner.color.dark : "#9CA3AF", marginTop: "2px" }}>{owner ? owner.name : "Free"}</div>
      </div>
    );
  };

  const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  const attacker = contest ? teams.find(t => t.id === contest.attackerId) : null;
  const defender = contest ? teams.find(t => t.id === contest.defenderId) : null;

  return (
    <div>
      {phase === "rolling" && (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ fontWeight: "900", fontSize: "17px", marginBottom: "16px" }}>🎲 Rolling for turn order — Round {round}!</div>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
            {teams.map((t, i) => (
              <div key={t.id} style={{ background: t.color.light, border: `3px solid ${t.color.bg}`, borderRadius: "16px", padding: "14px 20px", textAlign: "center" }}>
                <div style={{ fontWeight: "800", fontSize: "13px", color: t.color.dark }}>{t.name}</div>
                <div style={{ fontSize: "44px", lineHeight: 1 }}>{diceValues[i] != null ? DICE_FACES[diceValues[i]! - 1] : "🎲"}</div>
                {rollDone && diceValues[i] != null && (
                  <div style={{ fontWeight: "900", fontSize: "13px", color: t.color.dark, marginTop: "4px" }}>{diceValues[i]}</div>
                )}
              </div>
            ))}
          </div>
          {rollDone && finalOrder && (
            <div>
              <div style={{ background: "#EEF2FF", border: "2px solid #6366F1", borderRadius: "12px", padding: "12px 20px", marginBottom: "14px", display: "inline-block" }}>
                <div style={{ fontWeight: "700", fontSize: "13px", color: "#4338CA", marginBottom: "6px" }}>Turn order this round:</div>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                  {finalOrder.map((entry, pos) => {
                    const team = teams[entry.teamIdx];
                    return (
                      <span key={entry.teamIdx} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontWeight: "900", fontSize: "13px", color: "#6B7280" }}>{pos + 1}.</span>
                        <span style={{ background: team.color.bg, color: "white", borderRadius: "8px", padding: "3px 10px", fontWeight: "800", fontSize: "13px" }}>{team.name}</span>
                        {pos < finalOrder.length - 1 && <span style={{ color: "#9CA3AF" }}>{"->"}</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <button onClick={() => setPhase("pick")} style={{ background: "#6366F1", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer" }}>▶️ Start Round {round}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase !== "rolling" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontWeight: "900", fontSize: "15px" }}>Round {round}/{TOTAL_ROUNDS}</span>
              <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "600" }}>⭐ Center = 5pts/rnd · N/S = 3pts · E/W = 2pts</span>
            </div>
            {phase === "pick" && <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS} />}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px", justifyContent: "center" }}>
            {teams.map(team => {
              const ownedZones = HILL_ZONES.filter(zone => owners[zone.id] === team.id);
              const income = ownedZones.reduce((sum, zone) => sum + zone.pts, 0);
              return (
                <div key={team.id} style={{ background: team.color.light, border: `2px solid ${team.color.bg}`, borderRadius: "12px", padding: "8px 12px", fontSize: "12px", color: team.color.dark, fontWeight: "700" }}>
                  {team.color.emoji} {team.name}: {income} pts/rnd
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", maxWidth: "380px", margin: "0 auto 14px" }}>
            <div />{renderZone("North")}<div />{renderZone("West")}{renderZone("Center")}{renderZone("East")}<div />{renderZone("South")}<div />
          </div>

          {phase !== "round-end" && (
            <div style={{ background: activeTeam.color.bg, borderRadius: "14px", padding: "10px 16px", marginBottom: "12px" }}>
              <span style={{ color: "white", fontWeight: "900", fontSize: "16px" }}>👑 {activeTeam.name}'s turn</span>
            </div>
          )}

          {phase === "answer" && (
            <>
              <QuestionCard question={q} showAnswer={showAns} onReveal={() => { stop(); setShowAns(true); }} />
              {(showAns || q?.type === "speaking task") && (
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" }}>
                  <button onClick={() => resolveUncontested(true)} style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>✅ Correct! Claim!</button>
                  <button onClick={() => resolveUncontested(false)} style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>❌ Wrong</button>
                </div>
              )}
            </>
          )}

          {phase === "contested" && contest?.step === "simultaneous" && (
            <div>
              <QuestionCard question={q} showAnswer={showAns} onReveal={() => { stop(); setShowAns(true); }} />
              {(showAns || q?.type === "speaking task") && (
                <div style={{ marginTop: "14px", textAlign: "center" }}>
                  <p>Who answered correctly first?</p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button onClick={() => resolveContest(contest.attackerId)} style={{ background: attacker?.color.bg, color: "white", border: "none", borderRadius: "12px", padding: "14px 10px", cursor: "pointer" }}>⚔️ {attacker?.name}</button>
                    <button onClick={() => resolveContest(contest.defenderId)} style={{ background: defender?.color.bg, color: "white", border: "none", borderRadius: "12px", padding: "14px 10px", cursor: "pointer" }}>🛡️ {defender?.name}</button>
                  </div>
                  <button onClick={() => resolveContest(null)} style={{ marginTop: "10px", background: "#F3F4F6", cursor: "pointer", border: "none", padding: "8px 16px" }}>🤝 Neither</button>
                </div>
              )}
            </div>
          )}

          {phase === "contested" && contest?.step === "result" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ padding: "16px", marginBottom: "14px" }}>
                <div style={{ fontWeight: "900", fontSize: "18px", color: "#1E1B4B", marginBottom: "6px" }}>Contest resolved!</div>
                {contest.reason === "attacker" && <div style={{ color: attacker?.color.dark, fontWeight: "700" }}>⚔️ {attacker?.name} steals {contest.zoneId} and gains +30 points.</div>}
                {contest.reason === "defender" && <div style={{ color: defender?.color.dark, fontWeight: "700" }}>🛡️ {defender?.name} holds {contest.zoneId} and gains +20 points.</div>}
                {contest.reason === "neither" && <div style={{ color: "#6B7280", fontWeight: "700" }}>🤝 Nobody wins the zone this turn.</div>}
              </div>
              <button onClick={() => nextTeamTurn(false, owners)} style={{ background: "#6366F1", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", cursor: "pointer" }}>➡️ Next Turn</button>
            </div>
          )}

          {phase === "round-end" && roundSummary && (
            <div style={{ textAlign: "center" }}>
              <div style={{ background: "#FEF9C3", borderRadius: "16px", padding: "16px", marginBottom: "14px" }}>
                <div style={{ fontWeight: "900", fontSize: "18px", color: "#92400E" }}>💰 End of Round {round}</div>
              </div>
              <div style={{ display: "grid", gap: "10px", marginBottom: "16px" }}>
                {roundSummary.map(summary => {
                  const team = teams.find(t => t.id === summary.teamId);
                  if (!team) return null;
                  const totalRoundControl = roundPoints[summary.teamId] ?? 0;
                  return (
                    <div key={summary.teamId} style={{ background: team.color.light, border: `3px solid ${team.color.bg}`, borderRadius: "16px", padding: "12px 16px", textAlign: "left" }}>
                      <div style={{ fontWeight: "900", fontSize: "16px", color: team.color.dark, marginBottom: "6px" }}>
                        {team.color.emoji} {team.name}
                      </div>
                      <div style={{ fontSize: "13px", color: team.color.dark, marginBottom: "4px" }}>
                        Zones: {summary.zonesOwned.length > 0 ? summary.zonesOwned.map((zone: typeof HILL_ZONES[number]) => `${zone.icon} ${zone.id}`).join(", ") : "None"}
                      </div>
                      <div style={{ fontWeight: "800", color: "#92400E" }}>
                        +{summary.ptsEarned * 10} score this round ({summary.ptsEarned} control pts)
                      </div>
                      <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>
                        Total control points earned so far: {totalRoundControl}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={startNextRound} style={{ background: "#6366F1", color: "white", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer" }}>{round >= TOTAL_ROUNDS ? "🏁 End Game" : `▶️ Start Round ${round + 1}`}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
