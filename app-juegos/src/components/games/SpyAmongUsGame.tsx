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

// A plain deterministic shuffle (no hooks needed) — same seed always produces the same order,
// so the guess options stay stable across re-renders within a round but vary between rounds.
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = (seed + 1) * 2654435761 % 2147483647;
  const rand = () => { s = (s * 48271) % 2147483647; return s / 2147483647; };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const STARS = Array.from({ length: 45 }, (_, i) => ({
  left: (i * 47) % 100,
  top: (i * 31) % 92,
  size: 1 + (i % 3),
  dur: 2 + (i % 4),
  delay: (i % 10) * 0.3,
}));

const STYLE_TAG = (
  <style>{`
    @keyframes sauTwinkle{0%,100%{opacity:0.2}50%{opacity:1}}
    @keyframes sauAlarmFlash{0%,100%{background-color:rgba(239,68,68,0.12)}50%{background-color:rgba(239,68,68,0.32)}}
    @keyframes sauAlarmGlow{0%,100%{box-shadow:0 0 0px rgba(239,68,68,0)}50%{box-shadow:0 0 26px rgba(239,68,68,0.85)}}
    @keyframes sauEject{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(180px,-140px) rotate(480deg);opacity:0}}
    @keyframes sauFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes sauPopIn{0%{transform:scale(0.7);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
    .sau-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.1)}
    .sau-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
  `}</style>
);

function Starfield() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {STARS.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}px`, height: `${s.size}px`, borderRadius: "50%", background: "white", animation: `sauTwinkle ${s.dur}s ease-in-out infinite ${s.delay}s` }} />
      ))}
    </div>
  );
}

const PANEL_BG = "linear-gradient(160deg,#1E293B,#0F172A)";
const PANEL_BORDER = "1.5px solid #38BDF855";

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
  // No fabricated decoys — every option shown is a real crewmateTopic/spyTopic that some round in
  // this same source topic actually uses (tagged as `spySourceTopic` in LessonGamesGenerator.tsx
  // before topics get mixed together), not a hand-authored fake. Content is authored so every
  // topic has at least 4 rounds with 8 fully distinct crewmateTopic/spyTopic strings between them,
  // so this is never a near-binary guess even scoped to one topic. Falls back to just this round's
  // own two answers if the source-topic tag is ever missing.
  const sameTopicRounds = round.spySourceTopic
    ? questions.filter(q => q.spySourceTopic === round.spySourceTopic)
    : [round];
  const topicPool = Array.from(
    new Set(
      sameTopicRounds.flatMap(q => [q.crewmateTopic, q.spyTopic]).filter(Boolean),
    ),
  ) as string[];
  const spyGuessOptions = seededShuffle(topicPool, ri);

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

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% -15%,#1E293B 0%,#0F172A 55%,#020617 100%)",
  };

  if (phase === "intro") {
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <Starfield />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              background: PANEL_BG,
              border: PANEL_BORDER,
              borderRadius: "20px",
              padding: "28px 24px",
              marginBottom: "10px",
              position: "relative",
              color: "white",
              maxWidth: "540px",
              margin: "0 auto 10px",
              boxShadow: "0 0 50px rgba(56,189,248,0.25)",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "10px", animation: "sauFloat 3s ease-in-out infinite" }}>🛸</div>
            <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#38BDF8" }}>Spy Among Us</div>
            <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
              {isTwoPlayer ? (
                <>
                  You'll each secretly get a <strong style={{ color: "#38BDF8" }}>different topic</strong>.
                  <br />
                  Take turns speaking about your own topic — without giving it away — then each try to <strong style={{ color: "#38BDF8" }}>guess the other player's topic</strong>.
                  <br />
                  Guess right and you score <strong style={{ color: "#38BDF8" }}>+100 pts</strong>. You can both win, or neither!
                </>
              ) : (
                <>
                  Each round, one team is secretly the <strong style={{ color: "#38BDF8" }}>Spy</strong> and gets a slightly different topic than everyone else.
                  <br />
                  All teams <strong style={{ color: "#38BDF8" }}>peek their secret topic</strong>, then take turns speaking about it — try to sound like you belong!
                  <br />
                  After everyone speaks, every team <strong style={{ color: "#38BDF8" }}>votes for who they think the Spy is</strong>.
                  <br />
                  <strong style={{ color: "#FCA5A5" }}>🕵️ If you're the Spy:</strong> get caught (most votes on you) and you get one shot to guess the real topic — guess it and you still escape with <strong style={{ color: "#38BDF8" }}>+60 pts</strong>; guess wrong and every crewmate gets <strong style={{ color: "#38BDF8" }}>+80 pts</strong>. Not caught at all (votes split, no clear leader)? You escape clean with <strong style={{ color: "#38BDF8" }}>+100 pts</strong>.
                  <br />
                  <strong style={{ color: "#86EFAC" }}>👨‍🚀 If you're a crewmate:</strong> vote for the real Spy correctly and score <strong style={{ color: "#38BDF8" }}>+60 pts</strong>, whether or not the group ends up catching them.
                </>
              )}
            </div>
          </div>
          <div style={{ marginTop: "24px", marginBottom: "20px", fontSize: "14px", color: "#94A3B8", fontWeight: "600" }}>
            {isTwoPlayer
              ? "Just the two of you — take it in turns to be the sneaky one!"
              : `${teams.length} teams this round — a new team becomes the Spy every round.`}
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
            {teams.map((team) => (
              <div
                key={team.id}
                style={{
                  background: `linear-gradient(160deg,${team.color.dark}55,#0F172A)`,
                  border: `3px solid ${team.color.bg}`,
                  borderRadius: "14px",
                  padding: "10px 18px",
                  fontWeight: "800",
                  fontSize: "14px",
                  color: "white",
                }}
              >
                {team.color.emoji} {team.name}
              </div>
            ))}
          </div>
          <button
            onClick={() => setPhase("peek")}
            className="sau-btn"
            style={{
              background: "linear-gradient(135deg,#0284C7,#38BDF8)",
              color: "#0C1B2E",
              border: "none",
              borderRadius: "16px",
              padding: "16px 48px",
              fontSize: "19px",
              fontWeight: "900",
              cursor: "pointer",
              boxShadow: "0 6px 24px rgba(56,189,248,0.5)",
              transition: "transform 0.15s ease",
            }}
          >
            🛸 Start Mission!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={arenaStyle}>
      <Starfield />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            background: PANEL_BG,
            border: PANEL_BORDER,
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
            🛸 Spy Among Us{isTwoPlayer ? " - 1v1" : ""} - Round {ri + 1}/{questions.length}
          </span>
          <span
            style={{
              background: "rgba(56,189,248,0.15)",
              border: "1px solid #38BDF855",
              color: "#7DD3FC",
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
              background: "linear-gradient(135deg,#1E3A8A,#1D4ED8)",
              border: "2px solid #60A5FA",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "14px",
              color: "white",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: "900", fontSize: "14px", marginBottom: "4px" }}>🛸 1v1 Mode</div>
            Both players peek their secret card, then each speaks about their topic. Afterwards, each player tries to
            guess what the other topic was.
          </div>
        )}

        {phase === "peek" && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                background: `linear-gradient(160deg,${peekTeam.color.dark}55,#0F172A)`,
                border: `4px solid ${peekTeam.color.bg}`,
                borderRadius: "20px",
                padding: "24px",
                maxWidth: "480px",
                margin: "0 auto 20px",
              }}
            >
              <div style={{ fontWeight: "900", fontSize: "22px", color: "white", marginBottom: "12px" }}>
                {peekTeam.color.emoji} {peekTeam.name} - your turn to look!
              </div>
              <div style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "16px" }}>Everyone else: eyes down!</div>

              {!revealed ? (
                <button
                  onClick={() => setRevealed(true)}
                  className="sau-btn"
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
                    transition: "transform 0.15s ease",
                  }}
                >
                  📡 Reveal my role
                </button>
              ) : (
                <div>
                  <div
                    key={peekIdx}
                    style={{
                      background: isSpy(peekTeam.id)
                        ? "linear-gradient(135deg,#7F1D1D,#450A0A)"
                        : "linear-gradient(135deg,#1E3A8A,#1D4ED8)",
                      border: isSpy(peekTeam.id) ? "2px solid #EF4444" : "2px solid #60A5FA",
                      borderRadius: "16px",
                      padding: "20px",
                      marginBottom: "16px",
                      color: "white",
                      animation: "sauPopIn 0.35s ease-out",
                    }}
                  >
                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>{isSpy(peekTeam.id) ? "🕵️" : "👨‍🚀"}</div>
                    <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "6px" }}>
                      {isSpy(peekTeam.id) ? "You are the SPY!" : "You are a CREWMATE"}
                    </div>
                    <div
                      style={{
                        background: "rgba(0,0,0,0.25)",
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
                    className="sau-btn"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "white",
                      border: "1.5px solid #38BDF855",
                      borderRadius: "12px",
                      padding: "12px 28px",
                      fontSize: "15px",
                      fontWeight: "800",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
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
                    background: index < peekIdx ? "#22C55E" : index === peekIdx ? team.color.bg : "#334155",
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
                background: PANEL_BG,
                border: "2px solid #38BDF8",
                borderRadius: "14px",
                padding: "18px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontWeight: "900", fontSize: "17px", color: "#7DD3FC", marginBottom: "6px" }}>
                📡 Prepare your answer!
              </div>
              <p style={{ color: "#CBD5E1", fontSize: "14px", margin: "0 0 14px" }}>
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
                    color: "#94A3B8",
                    marginBottom: "4px",
                  }}
                >
                  <span>Preparation time</span>
                  <span style={{ color: timerColor, fontWeight: "900", fontSize: "18px" }}>{timeLeft}s</span>
                </div>
                <div style={{ height: "10px", background: "#1E293B", borderRadius: "5px", overflow: "hidden" }}>
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
                className="sau-btn"
                style={{
                  background: "linear-gradient(135deg,#0284C7,#38BDF8)",
                  color: "#0C1B2E",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 28px",
                  fontSize: "15px",
                  fontWeight: "800",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
              >
                Ready - Roll for Speaking Order!
              </button>
            </div>
          </div>
        )}

        {phase === "order-roll" && (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontWeight: "900", fontSize: "17px", color: "white", marginBottom: "16px" }}>
              Rolling for speaking order!
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  style={{
                    background: `linear-gradient(160deg,${team.color.dark}55,#0F172A)`,
                    border: `3px solid ${team.color.bg}`,
                    borderRadius: "16px",
                    padding: "12px 16px",
                    minWidth: "90px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: "800", fontSize: "13px", color: "white", marginBottom: "4px" }}>
                    {team.name}
                  </div>
                  <div style={{ fontSize: "40px", lineHeight: 1, minHeight: "44px" }}>
                    {rollDice[index] != null ? ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][rollDice[index]! - 1] : "🎲"}
                  </div>
                  {rollDone && rollDice[index] != null && (
                    <div style={{ fontWeight: "900", fontSize: "13px", color: "white", marginTop: "4px" }}>
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
                    background: PANEL_BG,
                    border: "2px solid #38BDF8",
                    borderRadius: "12px",
                    padding: "12px 20px",
                    marginBottom: "16px",
                    display: "inline-block",
                  }}
                >
                  <div style={{ fontWeight: "700", fontSize: "13px", color: "#7DD3FC", marginBottom: "8px" }}>
                    Speaking order - highest roll goes first:
                  </div>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                    {speakOrder.map((team, position) => (
                      <span key={team.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontWeight: "900", fontSize: "13px", color: "#94A3B8" }}>{position + 1}.</span>
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
                        {position < speakOrder.length - 1 && <span style={{ color: "#64748B" }}>→</span>}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => setPhase("speak")}
                    className="sau-btn"
                    style={{
                      background: "linear-gradient(135deg,#0284C7,#38BDF8)",
                      color: "#0C1B2E",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 28px",
                      fontSize: "15px",
                      fontWeight: "800",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
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
                background: `linear-gradient(160deg,${speakTeam.color.dark}55,#0F172A)`,
                border: `3px solid ${speakTeam.color.bg}`,
                borderRadius: "16px",
                padding: "20px",
                textAlign: "center",
                marginBottom: "14px",
              }}
            >
              <div style={{ fontWeight: "900", fontSize: "20px", color: "white", marginBottom: "8px" }}>
                🎙️ {speakTeam.color.emoji} {speakTeam.name} - speak now!
              </div>
              <div style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "14px" }}>
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
                className="sau-btn"
                style={{
                  background: speakTeam.color.bg,
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 28px",
                  fontSize: "15px",
                  fontWeight: "800",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
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
                    background: index < speakIdx ? "rgba(34,197,94,0.15)" : index === speakIdx ? `${team.color.bg}33` : "rgba(255,255,255,0.05)",
                    border: `2px solid ${index < speakIdx ? "#22C55E" : index === speakIdx ? team.color.bg : "#334155"}`,
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    fontWeight: "800",
                    color: index < speakIdx ? "#86EFAC" : "white",
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
            <div
              style={{
                borderRadius: "16px",
                border: "2px solid #EF4444",
                padding: "14px 18px",
                marginBottom: "16px",
                textAlign: "center",
                animation: "sauAlarmFlash 1.1s ease-in-out infinite, sauAlarmGlow 1.1s ease-in-out infinite",
              }}
            >
              <div style={{ fontSize: "26px", marginBottom: "4px" }}>🚨</div>
              <div style={{ fontWeight: "900", fontSize: "17px", color: "#FCA5A5" }}>SOUND THE ALARM</div>
              <p style={{ color: "#E2E8F0", fontWeight: "700", fontSize: "14px", margin: "6px 0 0" }}>
                Who do you think is the spy? Each team votes.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
              {teams.map((voter) => (
                <div
                  key={voter.id}
                  style={{
                    background: `linear-gradient(160deg,${voter.color.dark}44,#0F172A)`,
                    border: `2px solid ${voter.color.bg}`,
                    borderRadius: "12px",
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ fontWeight: "800", color: "white", fontSize: "14px", marginBottom: "8px" }}>
                    {voter.color.emoji} {voter.name} suspects:
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {teams
                      .filter((team) => team.id !== voter.id)
                      .map((suspect) => (
                        <button
                          key={suspect.id}
                          onClick={() => castVote(voter.id, suspect.id)}
                          className="sau-btn"
                          style={{
                            background: votes[voter.id] === suspect.id ? suspect.color.bg : "rgba(255,255,255,0.06)",
                            color: votes[voter.id] === suspect.id ? "white" : "#E2E8F0",
                            border: `2px solid ${suspect.color.bg}`,
                            borderRadius: "8px",
                            padding: "6px 14px",
                            fontWeight: "700",
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "transform 0.15s ease",
                          }}
                        >
                          ⚠️ {suspect.name}
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
                className="sau-btn"
                style={{
                  background: allVoted ? "linear-gradient(135deg,#B91C1C,#EF4444)" : "#334155",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 28px",
                  fontSize: "15px",
                  fontWeight: "800",
                  cursor: allVoted ? "pointer" : "not-allowed",
                  transition: "transform 0.15s ease",
                }}
              >
                🚨 Count the votes!
              </button>
              {!allVoted && <p style={{ color: "#64748B", fontSize: "13px", marginTop: "6px" }}>Waiting for all teams to vote</p>}
            </div>
          </div>
        )}

        {phase === "spy-guess" && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                background: "linear-gradient(135deg,#7F1D1D,#450A0A)",
                border: "2px solid #EF4444",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "16px",
                color: "white",
                boxShadow: "0 0 30px rgba(239,68,68,0.35)",
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
                    className="sau-btn"
                    style={{
                      background: spyGuess === option ? "#38BDF8" : "rgba(255,255,255,0.1)",
                      color: spyGuess === option ? "#0C1B2E" : "white",
                      border: `2px solid ${spyGuess === option ? "#7DD3FC" : "rgba(255,255,255,0.2)"}`,
                      borderRadius: "10px",
                      padding: "10px 16px",
                      fontWeight: "800",
                      fontSize: "15px",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                onClick={resolveSpyGuess}
                disabled={!spyGuess}
                className="sau-btn"
                style={{
                  background: spyGuess ? "linear-gradient(135deg,#0284C7,#38BDF8)" : "#4B5563",
                  color: spyGuess ? "#0C1B2E" : "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 28px",
                  fontSize: "15px",
                  fontWeight: "900",
                  cursor: spyGuess ? "pointer" : "not-allowed",
                  transition: "transform 0.15s ease",
                }}
              >
                Lock in my answer!
              </button>
            </div>
          </div>
        )}

        {phase === "reveal" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "14px", position: "relative", minHeight: "60px" }}>
              <div key={ri} style={{ fontSize: "40px", marginBottom: "8px", display: "inline-block", animation: "sauEject 1.4s ease-in forwards" }}>🕵️</div>
              <div style={{ fontWeight: "900", fontSize: "20px", color: "#FCA5A5" }}>
                ❌ {spyTeam.name} was the Spy!
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div style={{ background: "linear-gradient(160deg,#1E3A8A55,#0F172A)", border: "2px solid #3B82F6", borderRadius: "12px", padding: "14px" }}>
                <div style={{ fontWeight: "800", fontSize: "12px", color: "#93C5FD", marginBottom: "8px" }}>CREWMATE TOPIC</div>
                <div style={{ fontWeight: "900", fontSize: "16px", color: "white", marginBottom: "8px" }}>{round.crewmateTopic}</div>
                <div style={{ fontSize: "13px", color: "#CBD5E1", lineHeight: 1.5, fontStyle: "italic" }}>"{round.crewmatePrompt}"</div>
              </div>
              <div style={{ background: "linear-gradient(160deg,#7F1D1D55,#0F172A)", border: "2px solid #EF4444", borderRadius: "12px", padding: "14px" }}>
                <div style={{ fontWeight: "800", fontSize: "12px", color: "#FCA5A5", marginBottom: "8px" }}>SPY TOPIC</div>
                <div style={{ fontWeight: "900", fontSize: "16px", color: "white", marginBottom: "8px" }}>{round.spyTopic}</div>
                <div style={{ fontSize: "13px", color: "#FECACA", lineHeight: 1.5, fontStyle: "italic" }}>"{round.spyPrompt}"</div>
              </div>
            </div>

            <div style={{ background: "rgba(56,189,248,0.1)", border: "2px solid #38BDF8", borderRadius: "12px", padding: "12px", marginBottom: "14px" }}>
              <div style={{ fontWeight: "800", fontSize: "13px", color: "#7DD3FC", marginBottom: "4px" }}>The difference</div>
              <div style={{ color: "#E2E8F0", fontSize: "14px" }}>{round.explanation}</div>
            </div>

            {spyGuess && (
              <div
                style={{
                  background: spyGuess === round.crewmateTopic ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
                  border: `2px solid ${spyGuess === round.crewmateTopic ? "#EF4444" : "#22C55E"}`,
                  borderRadius: "12px",
                  padding: "12px",
                  marginBottom: "14px",
                  textAlign: "center",
                }}
              >
                {spyGuess === round.crewmateTopic ? (
                  <div style={{ fontWeight: "900", color: "#FCA5A5" }}>
                    🕵️ {spyTeam.name} guessed "{spyGuess}" - correct! Spy earns +60 pts.
                  </div>
                ) : (
                  <div style={{ fontWeight: "900", color: "#86EFAC" }}>
                    👨‍🚀 {spyTeam.name} guessed "{spyGuess}" - wrong! Crewmates win +80 pts each.
                  </div>
                )}
              </div>
            )}

            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #334155", borderRadius: "12px", padding: "12px", marginBottom: "14px" }}>
              <div style={{ fontWeight: "800", fontSize: "13px", color: "#94A3B8", marginBottom: "8px" }}>Vote results:</div>
              {teams.map((team) => {
                const accused = teams.find((candidate) => candidate.id === votes[team.id]);
                const correct = votes[team.id] === spyTeam.id;
                return (
                  <div key={team.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", fontSize: "13px" }}>
                    <span style={{ fontWeight: "700", color: "white" }}>{team.name}:</span>
                    <span style={{ color: correct ? "#4ADE80" : "#F87171", fontWeight: "700" }}>
                      {correct ? "✓" : "✗"} voted {accused?.name}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={nextRound}
                className="sau-btn"
                style={{
                  background: "linear-gradient(135deg,#0284C7,#38BDF8)",
                  color: "#0C1B2E",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 28px",
                  fontSize: "15px",
                  fontWeight: "800",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
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
                    background: `linear-gradient(160deg,${speaker.color.dark}55,#0F172A)`,
                    border: `3px solid ${speaker.color.bg}`,
                    borderRadius: "16px",
                    padding: "22px",
                    textAlign: "center",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ fontWeight: "900", fontSize: "20px", color: "white", marginBottom: "8px" }}>
                    🎙️ {speaker.color.emoji} {speaker.name} - speak now!
                  </div>
                  <div style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "16px" }}>
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
                    className="sau-btn"
                    style={{
                      background: speaker.color.bg,
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 28px",
                      fontSize: "15px",
                      fontWeight: "800",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
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
                        background: index < tp2SpeakIdx ? "#22C55E" : index === tp2SpeakIdx ? team.color.bg : "#334155",
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
                    background: "rgba(245,158,11,0.12)",
                    border: "2px solid #F59E0B",
                    borderRadius: "12px",
                    padding: "12px",
                    textAlign: "center",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ fontWeight: "800", color: "#FCD34D", fontSize: "14px" }}>
                    {guesserOrder[tp2GuessIdx === 0 ? 1 : 0].name} - look away! It is {guesser.name}'s turn to guess.
                  </div>
                </div>

                <div
                  style={{
                    background: isSpyGuessing ? "linear-gradient(135deg,#7F1D1D,#450A0A)" : "linear-gradient(135deg,#1E3A8A,#1D4ED8)",
                    border: isSpyGuessing ? "2px solid #EF4444" : "2px solid #60A5FA",
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
                        className="sau-btn"
                        style={{
                          background: tp2Guesses[guesser.id] === option ? "#38BDF8" : "rgba(255,255,255,0.10)",
                          color: tp2Guesses[guesser.id] === option ? "#0C1B2E" : "white",
                          border: `2px solid ${tp2Guesses[guesser.id] === option ? "#7DD3FC" : "rgba(255,255,255,0.2)"}`,
                          borderRadius: "10px",
                          padding: "10px 16px",
                          fontWeight: "800",
                          fontSize: "15px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "transform 0.15s ease",
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
                    className="sau-btn"
                    style={{
                      background: tp2Guesses[guesser.id] ? "linear-gradient(135deg,#0284C7,#38BDF8)" : "#4B5563",
                      color: tp2Guesses[guesser.id] ? "#0C1B2E" : "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 28px",
                      fontSize: "15px",
                      fontWeight: "900",
                      cursor: tp2Guesses[guesser.id] ? "pointer" : "not-allowed",
                      transition: "transform 0.15s ease",
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
                      background: `linear-gradient(160deg,${crewPlayer.color.dark}55,#0F172A)`,
                      border: `3px solid ${crewPlayer.color.bg}`,
                      borderRadius: "14px",
                      padding: "14px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "28px", marginBottom: "4px" }}>👨‍🚀</div>
                    <div style={{ fontWeight: "900", fontSize: "14px", color: "white" }}>{crewPlayer.name}</div>
                    <div style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "8px" }}>
                      was the Crewmate
                    </div>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#93C5FD",
                      }}
                    >
                      Topic: {round.crewmateTopic}
                    </div>
                  </div>
                  <div
                    key={ri}
                    style={{
                      background: "linear-gradient(160deg,#7F1D1D55,#0F172A)",
                      border: "3px solid #EF4444",
                      borderRadius: "14px",
                      padding: "14px",
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    <div style={{ fontSize: "28px", marginBottom: "4px", display: "inline-block", animation: "sauEject 1.4s ease-in forwards" }}>🕵️</div>
                    <div style={{ fontWeight: "900", fontSize: "14px", color: "white" }}>{spyPlayer.name}</div>
                    <div style={{ fontSize: "12px", color: "#FCA5A5", marginBottom: "8px" }}>was the Spy</div>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#FECACA",
                      }}
                    >
                      Topic: {round.spyTopic}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                  <div
                    style={{
                      background: spyGuessedRight ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      border: `2px solid ${spyGuessedRight ? "#22C55E" : "#EF4444"}`,
                      borderRadius: "12px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "20px" }}>{spyGuessedRight ? "✓" : "✗"}</span>
                      <span style={{ fontWeight: "900", fontSize: "14px", color: spyGuessedRight ? "#86EFAC" : "#FCA5A5" }}>
                        {spyPlayer.name} (Spy) guessed the crewmate topic:
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#E2E8F0", marginBottom: "4px" }}>
                      Guessed: <strong>"{tp2Guesses[spyPlayer.id] || "-"}"</strong>
                    </div>
                    <div style={{ fontSize: "13px", color: "#E2E8F0" }}>
                      Correct answer: <strong>"{round.crewmateTopic}"</strong>
                    </div>
                    {spyGuessedRight && (
                      <div style={{ marginTop: "6px", fontWeight: "700", fontSize: "13px", color: "#86EFAC" }}>
                        Spy earns 100 pts!
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      background: crewGuessedRight ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      border: `2px solid ${crewGuessedRight ? "#22C55E" : "#EF4444"}`,
                      borderRadius: "12px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "20px" }}>{crewGuessedRight ? "✓" : "✗"}</span>
                      <span style={{ fontWeight: "900", fontSize: "14px", color: crewGuessedRight ? "#86EFAC" : "#FCA5A5" }}>
                        {crewPlayer.name} (Crewmate) guessed the spy topic:
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#E2E8F0", marginBottom: "4px" }}>
                      Guessed: <strong>"{tp2Guesses[crewPlayer.id] || "-"}"</strong>
                    </div>
                    <div style={{ fontSize: "13px", color: "#E2E8F0" }}>
                      Correct answer: <strong>"{round.spyTopic}"</strong>
                    </div>
                    {crewGuessedRight && (
                      <div style={{ marginTop: "6px", fontWeight: "700", fontSize: "13px", color: "#86EFAC" }}>
                        Crewmate earns 100 pts!
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ background: "rgba(56,189,248,0.1)", border: "2px solid #38BDF8", borderRadius: "12px", padding: "12px", marginBottom: "14px" }}>
                  <div style={{ fontWeight: "800", fontSize: "13px", color: "#7DD3FC", marginBottom: "4px" }}>The difference</div>
                  <div style={{ color: "#E2E8F0", fontSize: "14px" }}>{round.explanation}</div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <button
                    onClick={nextRound}
                    className="sau-btn"
                    style={{
                      background: "linear-gradient(135deg,#0284C7,#38BDF8)",
                      color: "#0C1B2E",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 28px",
                      fontSize: "15px",
                      fontWeight: "800",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    {ri + 1 >= questions.length ? "End Game" : "Next Round"}
                  </button>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
