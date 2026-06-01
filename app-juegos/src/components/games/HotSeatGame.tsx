import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../types";

const TOTAL_ROUNDS = 3;
const TURN_SECONDS = 90;
const POINTS_PER_WORD = 10;

const shuffle = <T,>(items: T[]) => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

export function HotSeatGame({ questions, teams, onUpdateScore, onEnd }: GameProps) {
  const [phase, setPhase] = useState<"intro" | "play" | "turnend">("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [teamIndex, setTeamIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [turnCorrect, setTurnCorrect] = useState(0);
  const [lastTurnCorrect, setLastTurnCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);
  const [showWordList, setShowWordList] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const turnCorrectRef = useRef(0);

  const words = useMemo(() => {
    const uniqueWords = new Map<string, string>();

    questions.forEach(q => {
      const word = q.word?.trim();
      if (word) uniqueWords.set(word.toLowerCase(), word);
    });

    return shuffle(Array.from(uniqueWords.values()));
  }, [questions]);

  const currentTeam = teams[teamIndex];
  const currentWord = words.length > 0 ? words[wordIndex % words.length] : "";
  const turnNumber = roundIndex * teams.length + teamIndex + 1;
  const totalTurns = TOTAL_ROUNDS * teams.length;
  const isLastTurn = roundIndex === TOTAL_ROUNDS - 1 && teamIndex === teams.length - 1;
  const timerPct = (timeLeft / TURN_SECONDS) * 100;
  const timerColor = timeLeft > 45 ? "#22C55E" : timeLeft > 20 ? "#F59E0B" : "#EF4444";

  const endTurn = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLastTurnCorrect(turnCorrectRef.current);
    setPhase("turnend");
  };

  useEffect(() => {
    turnCorrectRef.current = turnCorrect;
  }, [turnCorrect]);

  useEffect(() => {
    if (phase !== "play") return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setLastTurnCorrect(turnCorrectRef.current);
          setPhase("turnend");
          return 0;
        }

        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, roundIndex, teamIndex]);

  const startTurn = () => {
    turnCorrectRef.current = 0;
    setTurnCorrect(0);
    setTimeLeft(TURN_SECONDS);
    setPhase("play");
  };

  const markCorrect = () => {
    if (!currentTeam) return;
    onUpdateScore(currentTeam.id, POINTS_PER_WORD);
    setTurnCorrect(score => score + 1);
    setWordIndex(index => index + 1);
  };

  const skipWord = () => {
    setWordIndex(index => index + 1);
  };

  const goToNextTurn = () => {
    if (isLastTurn) {
      onEnd();
      return;
    }

    if (teamIndex < teams.length - 1) {
      setTeamIndex(index => index + 1);
    } else {
      setTeamIndex(0);
      setRoundIndex(index => index + 1);
    }

    setTurnCorrect(0);
    turnCorrectRef.current = 0;
    setLastTurnCorrect(0);
    setTimeLeft(TURN_SECONDS);
    setPhase("intro");
  };

  if (!currentTeam || words.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "24px" }}>
        <div style={{ fontWeight: "900", fontSize: "20px", color: "#1E1B4B", marginBottom: "10px" }}>Hot Seat needs words to play.</div>
        <button onClick={onEnd} style={{ background: "#7C3AED", color: "white", border: "none", borderRadius: "14px", padding: "12px 28px", fontWeight: "900", cursor: "pointer" }}>End Game</button>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg,#7C3AED,#DB2777)", borderRadius: "20px", padding: "28px 24px", marginBottom: "16px", color: "white" }}>
          <div style={{ fontWeight: "900", fontSize: "clamp(22px,4vw,32px)", marginBottom: "8px" }}>Hot Seat</div>
          <div style={{ fontWeight: "900", fontSize: "18px", marginBottom: "14px" }}>
            Round {roundIndex + 1} of {TOTAL_ROUNDS} - Turn {turnNumber} of {totalTurns}
          </div>
          <div style={{ background: "rgba(255,255,255,0.16)", borderRadius: "16px", padding: "16px", display: "inline-block", minWidth: "min(100%, 320px)" }}>
            <div style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", opacity: 0.85, marginBottom: "6px" }}>Up now</div>
            <div style={{ fontWeight: "900", fontSize: "clamp(24px,5vw,38px)" }}>{currentTeam.color.emoji} {currentTeam.name}</div>
          </div>
          <div style={{ fontSize: "15px", lineHeight: 1.7, marginTop: "16px" }}>
            One player faces away from the screen. Everyone else gives hints.
            <br />
            Guess as many words as possible in {TURN_SECONDS} seconds. Each correct word is worth {POINTS_PER_WORD} points.
            <br />
            No spelling and do not say the word.
          </div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <button onClick={() => setShowWordList(v => !v)} style={{ background: showWordList ? "#1E1B4B" : "white", color: showWordList ? "white" : "#1E1B4B", border: "2px solid #1E1B4B", borderRadius: "10px", padding: "8px 20px", fontWeight: "800", cursor: "pointer" }}>
            {showWordList ? "Hide word list" : "Show all words"}
          </button>
          {showWordList && (
            <div style={{ background: "white", border: "2px solid #E0E7FF", borderRadius: "14px", padding: "16px", marginTop: "12px", textAlign: "left", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {[...words].sort().map((word, index) => (
                <span key={`${word}-${index}`} style={{ background: "#EEF2FF", color: "#4338CA", borderRadius: "6px", padding: "4px 10px", fontSize: "13px", fontWeight: "700" }}>{word}</span>
              ))}
            </div>
          )}
        </div>

        <button onClick={startTurn} style={{ background: "linear-gradient(135deg,#7C3AED,#DB2777)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer" }}>
          Start {currentTeam.name}'s Turn
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#7C3AED,#DB2777)", borderRadius: "14px", padding: "14px 16px", marginBottom: "16px", textAlign: "center", color: "white" }}>
        <div style={{ fontWeight: "900", fontSize: "18px" }}>Round {roundIndex + 1} of {TOTAL_ROUNDS} - {currentTeam.name}</div>
        <div style={{ fontWeight: "800", fontSize: "13px", opacity: 0.9, marginTop: "4px" }}>Turn {turnNumber} of {totalTurns}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", background: "white", border: "2px solid #E0E7FF", borderRadius: "14px", padding: "12px 16px" }}>
        <div style={{ position: "relative", width: "78px", height: "78px", flexShrink: 0 }}>
          <svg width="78" height="78" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="39" cy="39" r="32" fill="none" stroke="#E5E7EB" strokeWidth="7" />
            <circle cx="39" cy="39" r="32" fill="none" stroke={timerColor} strokeWidth="7" strokeDasharray={`${2 * Math.PI * 32}`} strokeDashoffset={`${2 * Math.PI * 32 * (1 - timerPct / 100)}`} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "20px", color: timerColor }}>{timeLeft}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
            <div style={{ fontWeight: "900", color: currentTeam.color.dark, fontSize: "16px" }}>{currentTeam.color.emoji} {currentTeam.name}</div>
            <div style={{ fontWeight: "900", color: "#1E1B4B", fontSize: "16px" }}>This turn: {turnCorrect} words / {turnCorrect * POINTS_PER_WORD} pts</div>
          </div>
          <div style={{ height: "10px", background: "#E5E7EB", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: "999px", transition: "width 1s linear, background 0.3s" }} />
          </div>
        </div>
      </div>

      {phase === "play" && (
        <>
          <div style={{ background: `linear-gradient(135deg,${currentTeam.color.light},white)`, border: `4px solid ${currentTeam.color.bg}`, borderRadius: "22px", padding: "26px 18px", textAlign: "center", marginBottom: "16px" }}>
            <div style={{ color: "#6B7280", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", marginBottom: "10px" }}>Describe this word</div>
            <div style={{ background: "white", borderRadius: "18px", border: `3px solid ${currentTeam.color.bg}55`, padding: "24px 12px", color: currentTeam.color.dark, fontWeight: "900", fontSize: "clamp(36px,9vw,72px)", lineHeight: 1.05, minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center", overflowWrap: "anywhere" }}>
              {currentWord}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
            <button onClick={markCorrect} style={{ background: "linear-gradient(135deg,#22C55E,#15803D)", color: "white", border: "none", borderRadius: "14px", padding: "16px", fontSize: "18px", fontWeight: "900", cursor: "pointer" }}>Correct +{POINTS_PER_WORD}</button>
            <button onClick={skipWord} style={{ background: "white", color: "#92400E", border: "3px solid #F59E0B", borderRadius: "14px", padding: "16px", fontSize: "18px", fontWeight: "900", cursor: "pointer" }}>Skip</button>
            <button onClick={endTurn} style={{ background: "white", color: "#7F1D1D", border: "3px solid #FCA5A5", borderRadius: "14px", padding: "16px", fontSize: "18px", fontWeight: "900", cursor: "pointer" }}>End Turn</button>
          </div>
        </>
      )}

      {phase === "turnend" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ background: "#ECFDF5", border: "2px solid #22C55E", borderRadius: "16px", padding: "18px", marginBottom: "16px" }}>
            <div style={{ fontWeight: "900", fontSize: "22px", color: "#14532D", marginBottom: "6px" }}>{currentTeam.name} guessed {lastTurnCorrect} word{lastTurnCorrect === 1 ? "" : "s"}.</div>
            <div style={{ color: "#14532D", fontWeight: "900", fontSize: "18px", marginBottom: "4px" }}>+{lastTurnCorrect * POINTS_PER_WORD} pts</div>
            <div style={{ color: "#166534", fontWeight: "700" }}>Those points have been added to the scoreboard.</div>
          </div>
          <button onClick={goToNextTurn} style={{ background: "#7C3AED", color: "white", border: "none", borderRadius: "14px", padding: "13px 34px", fontSize: "17px", fontWeight: "900", cursor: "pointer" }}>
            {isLastTurn ? "End Game" : teamIndex < teams.length - 1 ? "Next Team" : "Start Next Round"}
          </button>
        </div>
      )}
    </div>
  );
}
