import { useCallback, useEffect, useRef, useState } from "react";
import type { GameProps, QuestionData, Team } from "../../types";

type Phase =
  | "intro"
  | "peek"
  | "discuss"
  | "order-roll"
  | "speak"
  | "vote"
  | "spy-guess"
  | "reveal"
  | "speak-2p"
  | "guess-2p"
  | "reveal-2p";

type SpyRound = QuestionData & {
  spyGuessOptions?: string[];
};

export function SpyAmongUsGame({ questions, teams, onUpdateScore, onEnd }: GameProps) {
  const DISCUSS_SECONDS = 30;
  const isTwoPlayer = teams.length === 2;
  const randomTeamIndex = () => Math.floor(Math.random() * Math.max(teams.length, 1));

  const [ri, setRi] = useState(0);
  const [spyTeamIdx, setSpyTeamIdx] = useState(randomTeamIndex);
  const [phase, setPhase] = useState<Phase>("intro");
  const [peekIdx, setPeekIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [votes, setVotes] = useState<Record<string | number, string | number>>({});
  const [spyGuess, setSpyGuess] = useState<string | null>(null);
  const [speakIdx, setSpeakIdx] = useState(0);
  const [speakOrder, setSpeakOrder] = useState<Team[]>(() => [...teams]);
  const [timeLeft, setTimeLeft] = useState(DISCUSS_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [rollDice, setRollDice] = useState<(number | null)[]>(() => teams.map(() => null));
  const [rollDone, setRollDone] = useState(false);

  const [tp2SpeakIdx, setTp2SpeakIdx] = useState(0);
  const [tp2Guesses, setTp2Guesses] = useState<Record<string | number, string>>({});
  const [tp2GuessIdx, setTp2GuessIdx] = useState(0);
  const [tp2SpeakOrder, setTp2SpeakOrder] = useState<Team[]>(() => [...teams]);

  const round = questions[ri] as SpyRound | undefined;
  if (!round) {
    return (
      <div style={{ textAlign: "center", padding: "32px", fontWeight: "700", color: "#374151" }}>
        No rounds available.
      </div>
    );
  }

  const spyTeam = teams[spyTeamIdx];
  const peekTeam = teams[peekIdx];
  const speakTeam = speakOrder[speakIdx] ?? speakOrder[0] ?? teams[0];
  const isSpy = (teamId: string | number) => teamId === spyTeam.id;
  const spyGuessOptions = Array.from(
    new Set([round.crewmateTopic, round.spyTopic].filter(Boolean)),
  ) as string[];

  const runOrderRoll = useCallback(
    (indicesToRoll: number[], existingRolls: Record<number, number>) => {
      const rolls = { ...existingRolls };
      setRollDone(false);

      const TICKS = 8;
      const intervals = indicesToRoll.map((idx) =>
        setInterval(() => {
          setRollDice((prev) => {
            const next = [...prev];
            next[idx] = Math.floor(Math.random() * 6) + 1;
            return next;
          });
        }, 80),
      );

      setTimeout(() => {
        intervals.forEach((intervalId) => clearInterval(intervalId));

        const finalVals: Record<number, number> = {};
        indicesToRoll.forEach((idx) => {
          finalVals[idx] = Math.floor(Math.random() * 6) + 1;
          rolls[idx] = finalVals[idx];
        });

        setRollDice((prev) => {
          const next = [...prev];
          Object.entries(finalVals).forEach(([i, value]) => {
            next[Number(i)] = value;
          });
          return next;
        });

        const groups: Record<number, number[]> = {};
        indicesToRoll.forEach((idx) => {
          const value = rolls[idx];
          if (!groups[value]) groups[value] = [];
          groups[value].push(idx);
        });

        const tied = Object.values(groups).filter((group) => group.length > 1);
        if (tied.length > 0) {
          setTimeout(() => tied.forEach((group) => runOrderRoll(group, rolls)), 900);
          return;
        }

        const allRolls = { ...existingRolls, ...rolls };
        const ordered = teams
          .map((_, i) => i)
          .sort((a, b) => (allRolls[b] ?? 0) - (allRolls[a] ?? 0));
        setSpeakOrder(ordered.map((i) => teams[i]));
        setSpeakIdx(0);
        setRollDone(true);
      }, TICKS * 80 + 100);
    },
    [teams],
  );

  const startOrderRoll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRollDice(teams.map(() => null));
    setRollDone(false);
    setPhase("order-roll");
    setTimeout(() => runOrderRoll(teams.map((_, i) => i), {}), 300);
  };

  useEffect(() => {
    if (phase !== "discuss") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(DISCUSS_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const nextRound = () => {
    if (ri + 1 >= questions.length) {
      onEnd();
      return;
    }

    setRi((value) => value + 1);
    setSpyTeamIdx(randomTeamIndex());
    setPhase("peek");
    setPeekIdx(0);
    setRevealed(false);
    setVotes({});
    setSpyGuess(null);
    setSpeakIdx(0);
    setSpeakOrder([...teams]);
    setRollDice(teams.map(() => null));
    setRollDone(false);
    setTp2SpeakIdx(0);
    setTp2Guesses({});
    setTp2GuessIdx(0);
    setTp2SpeakOrder([...teams].sort(() => Math.random() - 0.5));
  };

  const resolveVotes = () => {
    const voteCountMap: Record<string | number, number> = {};
    teams.forEach((team) => {
      voteCountMap[team.id] = 0;
    });
    Object.values(votes).forEach((vote) => {
      if (vote !== null && vote !== undefined) {
        voteCountMap[vote] = (voteCountMap[vote] ?? 0) + 1;
      }
    });

    const maxVotes = Math.max(0, ...Object.values(voteCountMap));
    const mostVoted = teams.filter((team) => voteCountMap[team.id] === maxVotes).map((team) => team.id);
    const spyCaught = mostVoted.includes(spyTeam.id) && mostVoted.length === 1;

    teams
      .filter((team) => !isSpy(team.id) && votes[team.id] === spyTeam.id)
      .forEach((team) => onUpdateScore(team.id, 60));

    if (spyCaught) {
      setPhase("spy-guess");
    } else {
      onUpdateScore(spyTeam.id, 100);
      setPhase("reveal");
    }
  };

  const resolveSpyGuess = () => {
    if (spyGuess === round.crewmateTopic) {
      onUpdateScore(spyTeam.id, 60);
    } else {
      teams.filter((team) => !isSpy(team.id)).forEach((team) => onUpdateScore(team.id, 80));
    }
    setPhase("reveal");
  };

  const castVote = (voterId: string | number, suspectId: string | number) => {
    setVotes((current) => ({ ...current, [voterId]: suspectId }));
  };

  const resolve2pGuesses = () => {
    const spyPlayer = teams[spyTeamIdx];
    const crewPlayer = teams.find((team) => team.id !== spyPlayer.id) ?? teams[0];
    const spyGuessedRight = tp2Guesses[spyPlayer.id] === round.crewmateTopic;
    const crewGuessedRight = tp2Guesses[crewPlayer.id] === round.spyTopic;

    if (spyGuessedRight) onUpdateScore(spyPlayer.id, 100);
    if (crewGuessedRight) onUpdateScore(crewPlayer.id, 100);
    setPhase("reveal-2p");
  };

  const allVoted = teams.every((team) => votes[team.id] !== undefined);
  const timerPct = (timeLeft / DISCUSS_SECONDS) * 100;
  const timerColor = timeLeft > 15 ? "#22C55E" : timeLeft > 8 ? "#F59E0B" : "#EF4444";

  const voteCounts: Record<string | number, number> = {};
  teams.forEach((team) => {
    voteCounts[team.id] = 0;
  });
  Object.values(votes).forEach((vote) => {
    if (vote !== null && vote !== undefined) {
      voteCounts[vote] = (voteCounts[vote] ?? 0) + 1;
    }
  });

  const PHASES: Record<Phase, string> = {
    intro: "Mission Briefing",
    peek: "Phase 1: Secret Peek",
    discuss: "Phase 2: Discuss",
    "order-roll": "Phase 3: Roll for Order",
    speak: "Phase 4: Speak",
    vote: "Phase 5: Vote",
    "spy-guess": "Spy's Last Chance",
    reveal: "Reveal",
    "speak-2p": "Phase 2: Speak",
    "guess-2p": "Phase 3: Guess",
    "reveal-2p": "Reveal",
  };

  if (phase === "intro") {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            background: "linear-gradient(135deg,#1F2937,#4B5563)",
            borderRadius: "20px",
            padding: "28px 24px",
            marginBottom: "10px",
            position: "relative",
            color: "white",
            maxWidth: "520px",
            margin: "0 auto 10px",
          }}
        >
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🕵️</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>Spy Among Us</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
            Each round, one team is secretly the <strong>Spy</strong> and gets a different topic.
            <br />
            All teams <strong>peek their secret card</strong>, then take turns speaking about it.
            <br />
            After everyone speaks, teams <strong>vote for who they think the spy is</strong>.
            <br />
            <strong>Correct spy vote = +60 pts</strong>, even if the spy escapes.
            <br />
            <strong>Spy not caught = +100 pts</strong> and <strong>caught + correct guess = +60 pts</strong>.
            <br />
            <strong>Caught + wrong guess = +80 pts</strong> for each crewmate.
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "-14px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "14px solid transparent",
              borderRight: "14px solid transparent",
              borderTop: "14px solid #4B5563",
            }}
          />
        </div>
        <div style={{ marginTop: "24px", marginBottom: "20px", fontSize: "14px", color: "#6B7280", fontWeight: "600" }}>
          {isTwoPlayer
            ? "1v1 mode: both players peek, speak, then guess each other's topic."
            : `${teams.length} teams: one spy per round. Discuss, vote, and reveal.`}
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          {teams.map((team) => (
            <div
              key={team.id}
              style={{
                background: team.color.light,
                border: `3px solid ${team.color.bg}`,
                borderRadius: "14px",
                padding: "10px 18px",
                fontWeight: "800",
                fontSize: "14px",
                color: team.color.dark,
              }}
            >
              {team.color.emoji} {team.name}
            </div>
          ))}
        </div>
        <button
          onClick={() => setPhase("peek")}
          style={{
            background: "linear-gradient(135deg,#1F2937,#4B5563)",
            color: "white",
            border: "none",
            borderRadius: "16px",
            padding: "16px 48px",
            fontSize: "19px",
            fontWeight: "900",
            cursor: "pointer",
            boxShadow: "0 6px 24px rgba(31,41,55,0.4)",
          }}
        >
          🕵️ Start Mission!
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          background: "linear-gradient(135deg,#1F2937,#374151)",
          borderRadius: "14px",
          padding: "12px 20px",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <span style={{ color: "white", fontWeight: "900", fontSize: "16px" }}>
          🕵️ Spy Among Us{isTwoPlayer ? " - 1v1" : ""} - Round {ri + 1}/{questions.length}
        </span>
        <span
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "white",
            padding: "4px 14px",
            borderRadius: "20px",
            fontWeight: "700",
            fontSize: "13px",
          }}
        >
          {PHASES[phase]}
        </span>
      </div>

      {isTwoPlayer && phase === "peek" && peekIdx === 0 && (
        <div
          style={{
            background: "#1E3A8A",
            border: "2px solid #3B82F6",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "14px",
            color: "white",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: "900", fontSize: "14px", marginBottom: "4px" }}>🕵️ 1v1 Mode</div>
          Both players peek their secret card, then each speaks about their topic. Afterwards, each player tries to
          guess what the other topic was.
        </div>
      )}

      {phase === "peek" && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              background: peekTeam.color.light,
              border: `4px solid ${peekTeam.color.bg}`,
              borderRadius: "20px",
              padding: "24px",
              maxWidth: "480px",
              margin: "0 auto 20px",
            }}
          >
            <div style={{ fontWeight: "900", fontSize: "22px", color: peekTeam.color.dark, marginBottom: "12px" }}>
              {peekTeam.color.emoji} {peekTeam.name} - your turn to look!
            </div>
            <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "16px" }}>Everyone else: eyes down!</div>

            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                style={{
                  background: peekTeam.color.bg,
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  padding: "16px 40px",
                  fontSize: "18px",
                  fontWeight: "900",
                  cursor: "pointer",
                  boxShadow: `0 4px 20px ${peekTeam.color.bg}60`,
                }}
              >
                Reveal my role
              </button>
            ) : (
              <div>
                <div
                  style={{
                    background: isSpy(peekTeam.id)
                      ? "linear-gradient(135deg,#1F2937,#374151)"
                      : "linear-gradient(135deg,#1E3A8A,#2563EB)",
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "16px",
                    color: "white",
                  }}
                >
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>{isSpy(peekTeam.id) ? "🕵️" : "👨‍🚀"}</div>
                  <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "6px" }}>
                    {isSpy(peekTeam.id) ? "You are the SPY!" : "You are a CREWMATE"}
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      borderRadius: "12px",
                      padding: "14px",
                      fontSize: "15px",
                      lineHeight: 1.6,
                      fontWeight: "700",
                      marginBottom: "6px",
                    }}
                  >
                    {isSpy(peekTeam.id) ? round.spyPrompt : round.crewmatePrompt}
                  </div>
                  {isSpy(peekTeam.id) && (
                    <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "6px" }}>
                      Blend in and try to guess the real topic if you get caught.
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setRevealed(false);
                    if (peekIdx + 1 < teams.length) {
                      setPeekIdx((value) => value + 1);
                    } else if (isTwoPlayer) {
                      setTp2SpeakOrder([...teams].sort(() => Math.random() - 0.5));
                      setTp2SpeakIdx(0);
                      setPhase("speak-2p");
                    } else {
                      setPhase("discuss");
                    }
                  }}
                  style={{
                    background: "#374151",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 28px",
                    fontSize: "15px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  Okay, I've read it - head down!
                  {peekIdx + 1 < teams.length ? ` (Next: ${teams[peekIdx + 1].name})` : " (Start discussion!)"}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            {teams.map((team, index) => (
              <div
                key={team.id}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: index < peekIdx ? "#22C55E" : index === peekIdx ? team.color.bg : "#D1D5DB",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {phase === "discuss" && (
        <div>
          <div
            style={{
              background: "#F0F9FF",
              border: "2px solid #0EA5E9",
              borderRadius: "14px",
              padding: "18px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: "900", fontSize: "17px", color: "#0C4A6E", marginBottom: "6px" }}>
              Prepare your answer!
            </div>
            <p style={{ color: "#0369A1", fontSize: "14px", margin: "0 0 14px" }}>
              Each team thinks about what they will say. Discuss quietly with your team and do not say your topic out
              loud.
            </p>
            <div style={{ maxWidth: "300px", margin: "0 auto" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#6B7280",
                  marginBottom: "4px",
                }}
              >
                <span>Preparation time</span>
                <span style={{ color: timerColor, fontWeight: "900", fontSize: "18px" }}>{timeLeft}s</span>
              </div>
              <div style={{ height: "10px", background: "#E5E7EB", borderRadius: "5px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${timerPct}%`,
                    background: timerColor,
                    borderRadius: "5px",
                    transition: "width 1s linear",
                  }}
                />
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={startOrderRoll}
              style={{
                background: "#374151",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 28px",
                fontSize: "15px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Ready - Roll for Speaking Order!
            </button>
          </div>
        </div>
      )}

      {phase === "order-roll" && (
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ fontWeight: "900", fontSize: "17px", color: "#1E1B4B", marginBottom: "16px" }}>
            Rolling for speaking order!
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
            {teams.map((team, index) => (
              <div
                key={team.id}
                style={{
                  background: team.color.light,
                  border: `3px solid ${team.color.bg}`,
                  borderRadius: "16px",
                  padding: "12px 16px",
                  minWidth: "90px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontWeight: "800", fontSize: "13px", color: team.color.dark, marginBottom: "4px" }}>
                  {team.name}
                </div>
                <div style={{ fontSize: "40px", lineHeight: 1, minHeight: "44px" }}>
                  {rollDice[index] != null ? ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][rollDice[index]! - 1] : "🎲"}
                </div>
                {rollDone && rollDice[index] != null && (
                  <div style={{ fontWeight: "900", fontSize: "13px", color: team.color.dark, marginTop: "4px" }}>
                    {rollDice[index]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {rollDone && (
            <div>
              <div
                style={{
                  background: "#EEF2FF",
                  border: "2px solid #6366F1",
                  borderRadius: "12px",
                  padding: "12px 20px",
                  marginBottom: "16px",
                  display: "inline-block",
                }}
              >
                <div style={{ fontWeight: "700", fontSize: "13px", color: "#4338CA", marginBottom: "8px" }}>
                  Speaking order - highest roll goes first:
                </div>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                  {speakOrder.map((team, position) => (
                    <span key={team.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontWeight: "900", fontSize: "13px", color: "#6B7280" }}>{position + 1}.</span>
                      <span
                        style={{
                          background: team.color.bg,
                          color: "white",
                          borderRadius: "8px",
                          padding: "3px 10px",
                          fontWeight: "800",
                          fontSize: "13px",
                        }}
                      >
                        {team.name}
                      </span>
                      {position < speakOrder.length - 1 && <span style={{ color: "#9CA3AF" }}>→</span>}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <button
                  onClick={() => setPhase("speak")}
                  style={{
                    background: "#374151",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 28px",
                    fontSize: "15px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  Start Speaking!
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "speak" && (
        <div>
          <div
            style={{
              background: speakTeam.color.light,
              border: `3px solid ${speakTeam.color.bg}`,
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center",
              marginBottom: "14px",
            }}
          >
            <div style={{ fontWeight: "900", fontSize: "20px", color: speakTeam.color.dark, marginBottom: "8px" }}>
              {speakTeam.color.emoji} {speakTeam.name} - speak now!
            </div>
            <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "14px" }}>
              Answer your prompt. Other teams: listen carefully for anything that seems off.
            </div>
            <button
              onClick={() => {
                if (speakIdx + 1 < speakOrder.length) {
                  setSpeakIdx((value) => value + 1);
                } else {
                  setPhase("vote");
                }
              }}
              style={{
                background: speakTeam.color.bg,
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 28px",
                fontSize: "15px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Done - {speakIdx + 1 < speakOrder.length ? `Next: ${speakOrder[speakIdx + 1].name}` : "Go to vote!"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            {speakOrder.map((team, index) => (
              <div
                key={team.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: index < speakIdx ? "#ECFDF5" : index === speakIdx ? team.color.light : "#F3F4F6",
                  border: `2px solid ${index < speakIdx ? "#22C55E" : index === speakIdx ? team.color.bg : "#E5E7EB"}`,
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  fontWeight: "800",
                  color: index < speakIdx ? "#14532D" : team.color.dark,
                }}
              >
                {index < speakIdx ? "✓" : index === speakIdx ? "🗣️" : "⏳"} {team.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "vote" && (
        <div>
          <p
            style={{
              textAlign: "center",
              fontWeight: "700",
              color: "#374151",
              fontSize: "15px",
              marginBottom: "14px",
            }}
          >
            Who do you think is the spy? Each team votes.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            {teams.map((voter) => (
              <div
                key={voter.id}
                style={{
                  background: voter.color.light,
                  border: `2px solid ${voter.color.bg}`,
                  borderRadius: "12px",
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontWeight: "800", color: voter.color.dark, fontSize: "14px", marginBottom: "8px" }}>
                  {voter.color.emoji} {voter.name} suspects:
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {teams
                    .filter((team) => team.id !== voter.id)
                    .map((suspect) => (
                      <button
                        key={suspect.id}
                        onClick={() => castVote(voter.id, suspect.id)}
                        style={{
                          background: votes[voter.id] === suspect.id ? suspect.color.bg : "white",
                          color: votes[voter.id] === suspect.id ? "white" : suspect.color.dark,
                          border: `2px solid ${suspect.color.bg}`,
                          borderRadius: "8px",
                          padding: "6px 14px",
                          fontWeight: "700",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        🕵️ {suspect.name}
                        {voteCounts[suspect.id] > 0 && ` (${voteCounts[suspect.id]})`}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={resolveVotes}
              disabled={!allVoted}
              style={{
                background: allVoted ? "#DC2626" : "#D1D5DB",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 28px",
                fontSize: "15px",
                fontWeight: "800",
                cursor: allVoted ? "pointer" : "not-allowed",
              }}
            >
              Count the votes!
            </button>
            {!allVoted && <p style={{ color: "#9CA3AF", fontSize: "13px", marginTop: "6px" }}>Waiting for all teams to vote</p>}
          </div>
        </div>
      )}

      {phase === "spy-guess" && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              background: "linear-gradient(135deg,#1F2937,#374151)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "16px",
              color: "white",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🕵️</div>
            <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "8px" }}>{spyTeam.name} - you've been caught!</div>
            <div style={{ fontSize: "14px", opacity: 0.85, marginBottom: "16px" }}>
              But you can still win. Guess the real topic the other teams were using.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "320px", margin: "0 auto 16px" }}>
              {spyGuessOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setSpyGuess(option)}
                  style={{
                    background: spyGuess === option ? "#6366F1" : "rgba(255,255,255,0.1)",
                    color: "white",
                    border: `2px solid ${spyGuess === option ? "#818CF8" : "rgba(255,255,255,0.2)"}`,
                    borderRadius: "10px",
                    padding: "10px 16px",
                    fontWeight: "800",
                    fontSize: "15px",
                    cursor: "pointer",
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={resolveSpyGuess}
              disabled={!spyGuess}
              style={{
                background: spyGuess ? "#EF4444" : "#6B7280",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 28px",
                fontSize: "15px",
                fontWeight: "900",
                cursor: spyGuess ? "pointer" : "not-allowed",
              }}
            >
              Lock in my answer!
            </button>
          </div>
        </div>
      )}

      {phase === "reveal" && (
        <div>
          <div style={{ textAlign: "center", marginBottom: "14px" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>🕵️</div>
            <div style={{ fontWeight: "900", fontSize: "20px", color: "#1E1B4B", marginBottom: "4px" }}>
              The spy was {spyTeam.name}!
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div style={{ background: "#EFF6FF", border: "2px solid #3B82F6", borderRadius: "12px", padding: "14px" }}>
              <div style={{ fontWeight: "800", fontSize: "12px", color: "#1E3A8A", marginBottom: "8px" }}>CREWMATE TOPIC</div>
              <div style={{ fontWeight: "900", fontSize: "16px", color: "#1E3A8A", marginBottom: "8px" }}>{round.crewmateTopic}</div>
              <div style={{ fontSize: "13px", color: "#1D4ED8", lineHeight: 1.5, fontStyle: "italic" }}>"{round.crewmatePrompt}"</div>
            </div>
            <div style={{ background: "#1F2937", border: "2px solid #374151", borderRadius: "12px", padding: "14px" }}>
              <div style={{ fontWeight: "800", fontSize: "12px", color: "#9CA3AF", marginBottom: "8px" }}>SPY TOPIC</div>
              <div style={{ fontWeight: "900", fontSize: "16px", color: "#F9FAFB", marginBottom: "8px" }}>{round.spyTopic}</div>
              <div style={{ fontSize: "13px", color: "#D1D5DB", lineHeight: 1.5, fontStyle: "italic" }}>"{round.spyPrompt}"</div>
            </div>
          </div>

          <div style={{ background: "#FEF9C3", border: "2px solid #F59E0B", borderRadius: "12px", padding: "12px", marginBottom: "14px" }}>
            <div style={{ fontWeight: "800", fontSize: "13px", color: "#92400E", marginBottom: "4px" }}>The difference</div>
            <div style={{ color: "#713F12", fontSize: "14px" }}>{round.explanation}</div>
          </div>

          {spyGuess && (
            <div
              style={{
                background: spyGuess === round.crewmateTopic ? "#FEF2F2" : "#ECFDF5",
                border: `2px solid ${spyGuess === round.crewmateTopic ? "#EF4444" : "#22C55E"}`,
                borderRadius: "12px",
                padding: "12px",
                marginBottom: "14px",
                textAlign: "center",
              }}
            >
              {spyGuess === round.crewmateTopic ? (
                <div style={{ fontWeight: "900", color: "#991B1B" }}>
                  🕵️ {spyTeam.name} guessed "{spyGuess}" - correct! Spy earns +60 pts.
                </div>
              ) : (
                <div style={{ fontWeight: "900", color: "#14532D" }}>
                  👨‍🚀 {spyTeam.name} guessed "{spyGuess}" - wrong! Crewmates win +80 pts each.
                </div>
              )}
            </div>
          )}

          <div style={{ background: "#F3F4F6", borderRadius: "12px", padding: "12px", marginBottom: "14px" }}>
            <div style={{ fontWeight: "800", fontSize: "13px", color: "#374151", marginBottom: "8px" }}>Vote results:</div>
            {teams.map((team) => {
              const accused = teams.find((candidate) => candidate.id === votes[team.id]);
              const correct = votes[team.id] === spyTeam.id;
              return (
                <div key={team.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", fontSize: "13px" }}>
                  <span style={{ fontWeight: "700", color: team.color.dark }}>{team.name}:</span>
                  <span style={{ color: correct ? "#16A34A" : "#DC2626", fontWeight: "700" }}>
                    {correct ? "✓" : "✗"} voted {accused?.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={nextRound}
              style={{
                background: "#374151",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 28px",
                fontSize: "15px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              {ri + 1 >= questions.length ? "End Game" : "Next Round"}
            </button>
          </div>
        </div>
      )}

      {phase === "speak-2p" &&
        (() => {
          const speaker = tp2SpeakOrder[tp2SpeakIdx] ?? teams[0];
          const isLast = tp2SpeakIdx >= tp2SpeakOrder.length - 1;
          return (
            <div>
              <div
                style={{
                  background: speaker.color.light,
                  border: `3px solid ${speaker.color.bg}`,
                  borderRadius: "16px",
                  padding: "22px",
                  textAlign: "center",
                  marginBottom: "14px",
                }}
              >
                <div style={{ fontWeight: "900", fontSize: "20px", color: speaker.color.dark, marginBottom: "8px" }}>
                  {speaker.color.emoji} {speaker.name} - speak now!
                </div>
                <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "16px" }}>
                  Talk about your topic. Do not say what your role is - your opponent is listening carefully.
                </div>
                <button
                  onClick={() => {
                    if (isLast) {
                      setTp2GuessIdx(0);
                      setTp2Guesses({});
                      setPhase("guess-2p");
                    } else {
                      setTp2SpeakIdx((value) => value + 1);
                    }
                  }}
                  style={{
                    background: speaker.color.bg,
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 28px",
                    fontSize: "15px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  Done - {isLast ? "Start guessing!" : `Next: ${tp2SpeakOrder[tp2SpeakIdx + 1].name}`}
                </button>
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                {tp2SpeakOrder.map((team, index) => (
                  <div
                    key={team.id}
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: index < tp2SpeakIdx ? "#22C55E" : index === tp2SpeakIdx ? team.color.bg : "#D1D5DB",
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })()}

      {phase === "guess-2p" &&
        (() => {
          const spyPlayer = teams[spyTeamIdx];
          const crewPlayer = teams.find((team) => team.id !== spyPlayer.id) ?? teams[0];
          const guesserOrder = [spyPlayer, crewPlayer];
          const guesser = guesserOrder[tp2GuessIdx] ?? guesserOrder[0];
          const isSpyGuessing = guesser.id === spyPlayer.id;
          const isLastGuesser = tp2GuessIdx >= guesserOrder.length - 1;

          return (
            <div>
              <div
                style={{
                  background: "#FEF9C3",
                  border: "2px solid #F59E0B",
                  borderRadius: "12px",
                  padding: "12px",
                  textAlign: "center",
                  marginBottom: "14px",
                }}
              >
                <div style={{ fontWeight: "800", color: "#92400E", fontSize: "14px" }}>
                  {guesserOrder[tp2GuessIdx === 0 ? 1 : 0].name} - look away! It is {guesser.name}'s turn to guess.
                </div>
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg,#1F2937,#374151)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginBottom: "16px",
                  color: "white",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>{isSpyGuessing ? "🕵️" : "👨‍🚀"}</div>
                <div style={{ fontWeight: "900", fontSize: "18px", marginBottom: "6px" }}>{guesser.name}</div>
                <div style={{ fontSize: "14px", opacity: 0.85, marginBottom: "18px" }}>
                  {isSpyGuessing
                    ? "You were the spy. Based on what you heard, what topic was your opponent talking about?"
                    : "You were the crewmate. Based on what you heard, what was the spy's topic?"}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "340px", margin: "0 auto 18px" }}>
                  {spyGuessOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setTp2Guesses((current) => ({ ...current, [guesser.id]: option }))}
                      style={{
                        background: tp2Guesses[guesser.id] === option ? "#6366F1" : "rgba(255,255,255,0.10)",
                        color: "white",
                        border: `2px solid ${tp2Guesses[guesser.id] === option ? "#818CF8" : "rgba(255,255,255,0.2)"}`,
                        borderRadius: "10px",
                        padding: "10px 16px",
                        fontWeight: "800",
                        fontSize: "15px",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {tp2Guesses[guesser.id] === option ? "✓ " : "○ "}
                      {option}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (!tp2Guesses[guesser.id]) return;
                    if (isLastGuesser) {
                      resolve2pGuesses();
                    } else {
                      setTp2GuessIdx((value) => value + 1);
                    }
                  }}
                  disabled={!tp2Guesses[guesser.id]}
                  style={{
                    background: tp2Guesses[guesser.id] ? "#EF4444" : "#6B7280",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 28px",
                    fontSize: "15px",
                    fontWeight: "900",
                    cursor: tp2Guesses[guesser.id] ? "pointer" : "not-allowed",
                  }}
                >
                  {isLastGuesser ? "Reveal answers!" : `Lock in - pass to ${guesserOrder[1].name}`}
                </button>
              </div>
            </div>
          );
        })()}

      {phase === "reveal-2p" &&
        (() => {
          const spyPlayer = teams[spyTeamIdx];
          const crewPlayer = teams.find((team) => team.id !== spyPlayer.id) ?? teams[0];
          const spyGuessedRight = tp2Guesses[spyPlayer.id] === round.crewmateTopic;
          const crewGuessedRight = tp2Guesses[crewPlayer.id] === round.spyTopic;

          return (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div
                  style={{
                    background: crewPlayer.color.light,
                    border: `3px solid ${crewPlayer.color.bg}`,
                    borderRadius: "14px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "4px" }}>👨‍🚀</div>
                  <div style={{ fontWeight: "900", fontSize: "14px", color: crewPlayer.color.dark }}>{crewPlayer.name}</div>
                  <div style={{ fontSize: "12px", color: crewPlayer.color.dark, opacity: 0.75, marginBottom: "8px" }}>
                    was the Crewmate
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#1E3A8A",
                    }}
                  >
                    Topic: {round.crewmateTopic}
                  </div>
                </div>
                <div
                  style={{
                    background: "#1F2937",
                    border: "3px solid #374151",
                    borderRadius: "14px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "4px" }}>🕵️</div>
                  <div style={{ fontWeight: "900", fontSize: "14px", color: "#F9FAFB" }}>{spyPlayer.name}</div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "8px" }}>was the Spy</div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#D1D5DB",
                    }}
                  >
                    Topic: {round.spyTopic}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                <div
                  style={{
                    background: spyGuessedRight ? "#DCFCE7" : "#FEE2E2",
                    border: `2px solid ${spyGuessedRight ? "#22C55E" : "#EF4444"}`,
                    borderRadius: "12px",
                    padding: "14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "20px" }}>{spyGuessedRight ? "✓" : "✗"}</span>
                    <span style={{ fontWeight: "900", fontSize: "14px", color: spyGuessedRight ? "#14532D" : "#991B1B" }}>
                      {spyPlayer.name} (Spy) guessed the crewmate topic:
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151", marginBottom: "4px" }}>
                    Guessed: <strong>"{tp2Guesses[spyPlayer.id] || "-"}"</strong>
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151" }}>
                    Correct answer: <strong>"{round.crewmateTopic}"</strong>
                  </div>
                  {spyGuessedRight && (
                    <div style={{ marginTop: "6px", fontWeight: "700", fontSize: "13px", color: "#14532D" }}>
                      Spy earns 100 pts!
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: crewGuessedRight ? "#DCFCE7" : "#FEE2E2",
                    border: `2px solid ${crewGuessedRight ? "#22C55E" : "#EF4444"}`,
                    borderRadius: "12px",
                    padding: "14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "20px" }}>{crewGuessedRight ? "✓" : "✗"}</span>
                    <span style={{ fontWeight: "900", fontSize: "14px", color: crewGuessedRight ? "#14532D" : "#991B1B" }}>
                      {crewPlayer.name} (Crewmate) guessed the spy topic:
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151", marginBottom: "4px" }}>
                    Guessed: <strong>"{tp2Guesses[crewPlayer.id] || "-"}"</strong>
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151" }}>
                    Correct answer: <strong>"{round.spyTopic}"</strong>
                  </div>
                  {crewGuessedRight && (
                    <div style={{ marginTop: "6px", fontWeight: "700", fontSize: "13px", color: "#14532D" }}>
                      Crewmate earns 100 pts!
                    </div>
                  )}
                </div>
              </div>

              <div style={{ background: "#FEF9C3", border: "2px solid #F59E0B", borderRadius: "12px", padding: "12px", marginBottom: "14px" }}>
                <div style={{ fontWeight: "800", fontSize: "13px", color: "#92400E", marginBottom: "4px" }}>The difference</div>
                <div style={{ color: "#713F12", fontSize: "14px" }}>{round.explanation}</div>
              </div>

              <div style={{ textAlign: "center" }}>
                <button
                  onClick={nextRound}
                  style={{
                    background: "#374151",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 28px",
                    fontSize: "15px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  {ri + 1 >= questions.length ? "End Game" : "Next Round"}
                </button>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
