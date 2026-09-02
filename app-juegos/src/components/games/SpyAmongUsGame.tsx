import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TeamIcon } from "../shared/TeamIcon";
import { Icon } from "../shared/Icon";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { GameProps, QuestionData, Team } from "../../types";
import { teamsGridCols, GAME_MODES, GAME_ICONS } from "../../data/constants";
import { denseRank } from "../../utils/ranking";
import { RankBadge } from "../shared/RankBadge";
import { makeTeacherTeam, TEACHER_ID } from "../../lib/soloOpponent";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { FlagPromptButton } from "../shared/FlagPromptButton";
import { PhoneJoinPanel } from "../shared/PhoneJoinPanel";
import { PhoneReconnectBadge } from "../shared/PhoneReconnectBadge";
import { SPY_TWOPLAYER_STEPS, SPY_GROUP_STEPS } from "../../data/tutorials/spy";
import {
  generateSessionCode, openSpyChannel, closeChannel,
  type SpyStatePayload, type SpyPhase, type SpyRoleInfo,
} from "../../lib/liveSession";

const GM = GAME_MODES.find(g => g.id === "spy")!;

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
  | "reveal-2p"
  | "final";

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

// The order-roll's animated dice need the actual rolled value's pip layout, not just a generic
// "here's a die" glyph — Icon.tsx's own "dice" icon is a fixed 5-pip decoration, unrelated to any
// specific value. Reuses the same mask-punch technique Icon.tsx's own dice glyph uses, just with a
// pip layout chosen per value instead of a fixed one.
const DICE_PIPS: Record<number, [number, number][]> = {
  1: [[12, 12]],
  2: [[8, 8], [16, 16]],
  3: [[8, 8], [12, 12], [16, 16]],
  4: [[8, 8], [16, 8], [8, 16], [16, 16]],
  5: [[8, 8], [16, 8], [12, 12], [8, 16], [16, 16]],
  6: [[8, 8], [16, 8], [8, 12], [16, 12], [8, 16], [16, 16]],
};
function DiceFace({ value, size = 40 }: { value: number | null; size?: number }) {
  if (value === null) return <Icon name="dice" size={size} />;
  const maskId = `spy-dice-${value}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ display: "inline-block" }}>
      <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        {DICE_PIPS[value].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill="black" />)}
      </mask>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}

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

// What "Save & Exit" snapshots and "Resume" restores — which round we're on, who's currently the
// spy, and the running cross-round tallies. Deliberately excludes in-round progress (who's peeked,
// spoken, voted, or guessed so far) — resuming re-peeks everyone for the same round/spy instead of
// trying to replay a discussion or vote in progress.
type SpySnapshot = {
  ri: number;
  spyTeamIdx: number;
  timesWasSpy: Record<string | number, number>;
  spyWinsByTeam: Record<string | number, number>;
  crewWinsByTeam: Record<string | number, number>;
  gameScoreByTeam: Record<string | number, number>;
  // Only meaningful in solo (teacher stand-in) sessions — undefined/absent in normal multi-team
  // games, where there's no teacher participant to track a score for.
  teacherScore?: number;
};

function validateSpySnapshot(raw: unknown, teamCount: number, roundCount: number): SpySnapshot | undefined {
  const s = raw as Partial<SpySnapshot> | null | undefined;
  if (!s || typeof s.ri !== "number" || s.ri < 0 || s.ri >= Math.max(roundCount, 1)) return undefined;
  if (typeof s.spyTeamIdx !== "number" || s.spyTeamIdx < 0 || s.spyTeamIdx >= teamCount) return undefined;
  return {
    ri: s.ri, spyTeamIdx: s.spyTeamIdx,
    timesWasSpy: s.timesWasSpy ?? {}, spyWinsByTeam: s.spyWinsByTeam ?? {}, crewWinsByTeam: s.crewWinsByTeam ?? {},
    gameScoreByTeam: s.gameScoreByTeam ?? {},
    teacherScore: typeof s.teacherScore === "number" ? s.teacherScore : undefined,
  };
}

export function SpyAmongUsGame({ questions, teams: propTeams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState }: GameProps) {
  const DISCUSS_SECONDS = 120;
  // Solo play makes the teacher the second live participant — Spy Among Us already has a
  // fully-built, fully-tested 2-player ruleset (isTwoPlayer below), so this just needs to make
  // `teams` genuinely length 2. `effectiveTeamCount` is used (rather than `teams.length`) to
  // validate a resumed snapshot before `teams` itself is constructed, since resuming needs to
  // know the right bound before teacherScore/teams exist yet.
  const isSolo = propTeams.length === 1;
  const teacherTeamRef = useRef(isSolo ? makeTeacherTeam() : null);
  const effectiveTeamCount = isSolo ? 2 : propTeams.length;
  const resumed = useRef(validateSpySnapshot(initialGameState, effectiveTeamCount, questions.length)).current;
  const [teacherScore, setTeacherScore] = useState(() => resumed?.teacherScore ?? 0);
  // Memoized so `teams` is referentially stable across renders when nothing has actually
  // changed — a fresh array literal every render would break any effect/callback that depends
  // on `teams` by reference.
  const teams = useMemo(
    () => (isSolo ? [propTeams[0], { ...teacherTeamRef.current!, score: teacherScore }] : propTeams),
    [isSolo, propTeams, teacherScore]
  );
  // Points earned in THIS game only — team.score is the cross-game running total, so the final
  // screen ranking by it declared whoever was ahead overall the winner even when another team
  // scored more here.
  const [gameScoreByTeam, setGameScoreByTeam] = useState<Record<string | number, number>>(() => resumed?.gameScoreByTeam ?? {});
  // The teacher's score is never real class data — it stays local here instead of reaching the
  // parent's onUpdateScore/ScoreBoard/saved-class state.
  const updateScore = (id: string | number, delta: number) => {
    setGameScoreByTeam(prev => ({ ...prev, [id]: (prev[id] ?? 0) + delta }));
    if (isSolo && id === teacherTeamRef.current?.id) { setTeacherScore(s => s + delta); }
    else { onUpdateScore(id, delta); }
  };
  const isTwoPlayer = teams.length === 2;
  const randomTeamIndex = () => Math.floor(Math.random() * Math.max(teams.length, 1));

  const [ri, setRi] = useState(() => resumed?.ri ?? 0);
  const [spyTeamIdx, setSpyTeamIdx] = useState(() => resumed?.spyTeamIdx ?? randomTeamIndex());
  // Cross-round tallies for the final results screen — everything else here (votes, guesses) resets
  // every round. "Spy wins" = escaped the vote outright or guessed the real topic after being
  // caught; "crew wins" = correctly voted for the spy, or correctly guessed the spy's topic.
  const [timesWasSpy, setTimesWasSpy] = useState<Record<string | number, number>>(() => resumed?.timesWasSpy ?? ({ [teams[spyTeamIdx]?.id ?? ""]: 1 }));
  const [spyWinsByTeam, setSpyWinsByTeam] = useState<Record<string | number, number>>(() => resumed?.spyWinsByTeam ?? {});
  const [crewWinsByTeam, setCrewWinsByTeam] = useState<Record<string | number, number>>(() => resumed?.crewWinsByTeam ?? {});
  // A resumed mission skips the intro and re-peeks everyone for the same round/spy.
  const [phase, setPhase] = useState<Phase>(() => resumed ? "peek" : "intro");

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => { setPhase("final"); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase]);

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): SpySnapshot => ({ ri, spyTeamIdx, timesWasSpy, spyWinsByTeam, crewWinsByTeam, gameScoreByTeam, teacherScore });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, ri, spyTeamIdx, timesWasSpy, spyWinsByTeam, crewWinsByTeam, gameScoreByTeam, teacherScore]);
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
  const [showHowTo, setShowHowTo] = useState(false);

  // "Play on Phones" mode — available in group mode, solo, and real 1v1 alike (see
  // enterRoundStartPhase below for how each ruleset handles it). Always defaults to screen, even
  // on Resume: a resumed mission skips the intro screen entirely (see `phase` init above), same
  // intentional limitation as Auction's phone mode.
  const [inputMode, setInputMode] = useState<"screen" | "phone">("screen");
  const [introStep, setIntroStep] = useState<"setup" | "qr">("setup");
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [connectedTeamIds, setConnectedTeamIds] = useState<Set<string | number>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Refs the phone-mode broadcaster (below) reads from, so opening/closing the realtime channel
  // only happens when phone mode itself toggles on/off, not on every round/phase/speaker change —
  // same pattern as AuctionGame.tsx's qiRef/sentenceRef/phaseRef.
  const riRef = useRef(ri);
  const spyTeamIdxRef = useRef(spyTeamIdx);
  const phaseRef = useRef(phase);
  const speakOrderRef = useRef(speakOrder);
  const speakIdxRef = useRef(speakIdx);
  // 1v1's own speaking-order/index — sendState() picks these instead of speakOrderRef/speakIdxRef
  // whenever phase is "speak-2p".
  const tp2SpeakOrderRef = useRef(tp2SpeakOrder);
  const tp2SpeakIdxRef = useRef(tp2SpeakIdx);
  const connectedTeamIdsRef = useRef<Set<string | number>>(new Set());
  const sendStateRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    riRef.current = ri;
    spyTeamIdxRef.current = spyTeamIdx;
    phaseRef.current = phase;
    speakOrderRef.current = speakOrder;
    speakIdxRef.current = speakIdx;
    tp2SpeakOrderRef.current = tp2SpeakOrder;
    tp2SpeakIdxRef.current = tp2SpeakIdx;
  }, [ri, spyTeamIdx, phase, speakOrder, speakIdx, tp2SpeakOrder, tp2SpeakIdx]);

  // Opens/closes the realtime channel only when phone mode itself is toggled on/off. Unlike
  // Auction, phones here never send anything back — this channel only ever broadcasts `state`
  // (each round's private role+prompt for every team, plus who's currently speaking) and a
  // one-shot `ended` event; there's no `.on("broadcast", ...)` listener for incoming phone data
  // because there isn't any.
  useEffect(() => {
    if (inputMode !== "phone" || !sessionCode) return;
    const channel = openSpyChannel(sessionCode);
    channelRef.current = channel;

    const sendState = () => {
      const currentRound = questions[riRef.current] as SpyRound | undefined;
      const spyId = teams[spyTeamIdxRef.current]?.id;
      const roles: Record<string, SpyRoleInfo> = {};
      teams.forEach(t => {
        roles[String(t.id)] = t.id === spyId
          ? { role: "spy", prompt: currentRound?.spyPrompt ?? "" }
          : { role: "crew", prompt: currentRound?.crewmatePrompt ?? "" };
      });
      // Only "intro" (not started) collapses to "lobby" — "peek" is a real, reachable phase now
      // (solo play's teacher stand-in still peeks on-screen while the one real team's phone
      // already has its role), so it's reported as-is.
      const rawPhase = phaseRef.current;
      const mappedPhase: SpyPhase = rawPhase === "intro" ? "lobby" : (rawPhase as SpyPhase);
      // 1v1's speak-2p tracks its own order/index (tp2SpeakOrder/tp2SpeakIdx) instead of the
      // group-mode speakOrder/speakIdx state.
      const usingTp2Order = rawPhase === "speak-2p";
      // The teacher stand-in (solo play) never has a phone — never show it as a joinable/waiting
      // team in the lobby.
      const roster = teams.filter(t => t.id !== TEACHER_ID);
      const payload: SpyStatePayload = {
        phase: mappedPhase,
        ri: riRef.current,
        roster: roster.map(t => ({ id: t.id, name: t.name, color: t.color, mascot: t.mascot })),
        roles,
        speakOrder: (usingTp2Order ? tp2SpeakOrderRef.current : speakOrderRef.current).map(t => t.id),
        speakIdx: usingTp2Order ? tp2SpeakIdxRef.current : speakIdxRef.current,
        connectedTeamIds: Array.from(connectedTeamIdsRef.current),
        ts: Date.now(),
      };
      channel.send({ type: "broadcast", event: "state", payload });
    };
    sendStateRef.current = sendState;

    channel.on("presence", { event: "sync" }, () => {
      const presenceState = channel.presenceState<{ teamId: string | number }>();
      const ids = new Set<string | number>();
      Object.values(presenceState).forEach(entries => entries.forEach(entry => ids.add(entry.teamId)));
      connectedTeamIdsRef.current = ids;
      setConnectedTeamIds(ids);
      sendState(); // roster/connected list changed — push a fresh state right away, don't wait for the interval
    });

    channel.subscribe(status => {
      if (status === "SUBSCRIBED") sendState();
    });

    const interval = setInterval(sendState, 4000);

    return () => {
      clearInterval(interval);
      closeChannel(channel);
      channelRef.current = null;
      sendStateRef.current = null;
    };
  }, [inputMode, sessionCode, teams]);

  // Pushes an immediate state update on round/phase/speaker transitions rather than waiting for
  // the interval — speakIdx (unlike Auction, which only needed qi/phase) matters here too, since a
  // phone's "is it my turn to speak" indicator must update the moment the teacher advances it.
  useEffect(() => {
    sendStateRef.current?.();
  }, [phase, ri, speakIdx]);

  // Tells every connected phone the mission is over the moment it actually ends, same reasoning
  // as Auction's identical effect — without this, a closed channel looks identical to a dropped
  // connection from the phone's side.
  useEffect(() => {
    if (phase === "final" && channelRef.current) {
      channelRef.current.send({ type: "broadcast", event: "ended", payload: {} });
    }
  }, [phase]);

  const handlePickPhoneMode = () => {
    setInputMode("phone");
    setSessionCode(generateSessionCode());
    setIntroStep("qr");
  };

  const handlePickScreenMode = () => {
    setInputMode("screen");
    setIntroStep("setup");
    setSessionCode(null);
    setConnectedTeamIds(new Set());
  };

  // Shared by the Start Mission button and nextRound() — decides which phase (and, for solo
  // phone play, which peekIdx) a fresh round actually opens on:
  //   - screen mode: always "peek" from the top, unchanged.
  //   - group mode + phone: peek is skipped entirely (every real team already got its role via
  //     phone) straight to "discuss", unchanged from the group-mode-only version of this feature.
  //   - solo + phone: the one real team already has its role; only the teacher stand-in
  //     (always teams[1] in solo play) still needs their on-screen reveal, so peek starts at
  //     index 1 instead of 0 — the existing "Okay, I've read it" advance logic already falls
  //     straight into the isTwoPlayer branch (speak-2p) once that single reveal is acknowledged,
  //     no other change needed.
  //   - real 2-team 1v1 + phone: both teams already have their role via phone, so peek is
  //     skipped entirely too — this replicates the same tp2SpeakOrder/tp2SpeakIdx reset the peek
  //     flow's own advance handler does when it reaches this same transition normally.
  const enterRoundStartPhase = () => {
    if (inputMode !== "phone") {
      setPhase("peek");
      setPeekIdx(0);
    } else if (!isTwoPlayer) {
      setPhase("discuss");
    } else if (isSolo) {
      setPhase("peek");
      setPeekIdx(1);
    } else {
      setTp2SpeakOrder([...teams].sort(() => Math.random() - 0.5));
      setTp2SpeakIdx(0);
      setPhase("speak-2p");
    }
  };

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
      setPhase("final");
      return;
    }

    setRi((value) => value + 1);
    const newSpyIdx = randomTeamIndex();
    setSpyTeamIdx(newSpyIdx);
    const newSpyId = teams[newSpyIdx]?.id;
    if (newSpyId !== undefined) {
      setTimesWasSpy((prev) => ({ ...prev, [newSpyId]: (prev[newSpyId] ?? 0) + 1 }));
    }
    // Phone mode already pushed everyone's new role privately via the state broadcast where
    // applicable — enterRoundStartPhase() picks the right phase (and peekIdx) for screen mode,
    // group phone mode, solo phone mode, and real-2-team 1v1 phone mode alike.
    enterRoundStartPhase();
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
      .forEach((team) => {
        updateScore(team.id, 60);
        setCrewWinsByTeam((prev) => ({ ...prev, [team.id]: (prev[team.id] ?? 0) + 1 }));
      });

    if (spyCaught) {
      setPhase("spy-guess");
    } else {
      updateScore(spyTeam.id, 100);
      setSpyWinsByTeam((prev) => ({ ...prev, [spyTeam.id]: (prev[spyTeam.id] ?? 0) + 1 }));
      setPhase("reveal");
    }
  };

  const resolveSpyGuess = () => {
    if (spyGuess === round.crewmateTopic) {
      updateScore(spyTeam.id, 60);
      setSpyWinsByTeam((prev) => ({ ...prev, [spyTeam.id]: (prev[spyTeam.id] ?? 0) + 1 }));
    } else {
      teams.filter((team) => !isSpy(team.id)).forEach((team) => {
        updateScore(team.id, 80);
        setCrewWinsByTeam((prev) => ({ ...prev, [team.id]: (prev[team.id] ?? 0) + 1 }));
      });
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

    if (spyGuessedRight) {
      updateScore(spyPlayer.id, 100);
      setSpyWinsByTeam((prev) => ({ ...prev, [spyPlayer.id]: (prev[spyPlayer.id] ?? 0) + 1 }));
    }
    if (crewGuessedRight) {
      updateScore(crewPlayer.id, 100);
      setCrewWinsByTeam((prev) => ({ ...prev, [crewPlayer.id]: (prev[crewPlayer.id] ?? 0) + 1 }));
    }
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
    final: "Final Results",
  };

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% -15%,#1E293B 0%,#0F172A 55%,#020617 100%)",
  };

  // Tutorial mockup: src/data/tutorials/spy.tsx — update if this intro's rules text changes.
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
            <div style={{ marginBottom: "10px", animation: "sauFloat 3s ease-in-out infinite" }}><Icon name="ufo" size={36} /></div>
            <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#38BDF8" }}>Spy Among Us</div>
            <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
              {isTwoPlayer ? (
                <>
                  You'll each secretly get a <strong style={{ color: "#38BDF8" }}>different topic</strong>. Take turns speaking about your own without giving it away, then each try to <strong style={{ color: "#38BDF8" }}>guess the other player's topic</strong> — guess right to score, and you can both win, or neither!
                </>
              ) : (
                <>
                  Each round, one team is secretly the <strong style={{ color: "#38BDF8" }}>Spy</strong> with a slightly different topic than everyone else. Take turns speaking about your topic, trying to sound like you belong.
                  <br />
                  After everyone speaks, every team <strong style={{ color: "#38BDF8" }}>votes for who they think the Spy is</strong> — catch the Spy and crewmates score; the Spy escapes clean (or talks their way out) if the vote doesn't land on them!
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
<TeamIcon team={team} /> {team.name}
              </div>
            ))}
          </div>
          {introStep === "setup" && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", color: "#94A3B8", fontWeight: "700", marginBottom: "10px" }}>How will teams see their secret role?</div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={handlePickScreenMode} style={{
                  padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                  border: `2px solid ${inputMode === "screen" ? "#38BDF8" : "rgba(255,255,255,0.2)"}`,
                  background: inputMode === "screen" ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.05)",
                  color: inputMode === "screen" ? "#38BDF8" : "#94A3B8",
                  display: "inline-flex", alignItems: "center", gap: "6px",
                }}><Icon name="screen" size={14} /> Play on Screen</button>
                <button onClick={handlePickPhoneMode} style={{
                  padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                  border: `2px solid ${inputMode === "phone" ? "#38BDF8" : "rgba(255,255,255,0.2)"}`,
                  background: inputMode === "phone" ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.05)",
                  color: inputMode === "phone" ? "#38BDF8" : "#94A3B8",
                  display: "inline-flex", alignItems: "center", gap: "6px",
                }}><Icon name="phone" size={14} /> Play on Phones</button>
              </div>
            </div>
          )}

          {introStep === "qr" && sessionCode && (() => {
            const joinUrl = `${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=spy`;
            // The teacher stand-in (solo play) never has a phone — never list it as a joinable
            // or "waiting to connect" team here.
            const phoneEligibleTeams = teams.filter(t => t.id !== TEACHER_ID);
            return (
              <PhoneJoinPanel
                sessionCode={sessionCode} joinUrl={joinUrl} teams={phoneEligibleTeams} connectedTeamIds={connectedTeamIds}
                accent="#38BDF8" panelBg="linear-gradient(160deg,#1E3A5F,#0F172A)" borderColor="#38BDF866"
                footer={
                  <button onClick={handlePickScreenMode} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
                    Switch back to Play on Screen
                  </button>
                }
              />
            );
          })()}
          <button
            onClick={() => setShowHowTo(true)}
            className="sau-btn"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "14px",
              background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800",
              cursor: "pointer",
            }}
          >
            <Icon name="help" size={15} /> How to Play
          </button>
          {showHowTo && (
            <HowToPlayModal
              gameName={GM.name} gameIcon={GAME_ICONS[GM.id]} accentColor={GM.color}
              steps={isTwoPlayer ? SPY_TWOPLAYER_STEPS : SPY_GROUP_STEPS}
              onClose={() => setShowHowTo(false)}
            />
          )}
          <button
            onClick={enterRoundStartPhase}
            className="sau-btn"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
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
            <Icon name="ufo" size={20} /> Start Mission!
          </button>
        </div>
      </div>
    );
  }

  if (phase === "final") {
    // Dense rank on points earned in THIS game (gameScoreByTeam), not team.score (the cross-game
    // running total) — two teams tied for the top both get gold instead of an arbitrary
    // array-order winner.
    const ranking = denseRank(teams, (team) => gameScoreByTeam[team.id] ?? 0).sort((a, b) => b.value - a.value);
    const winners = ranking.filter((r) => r.rank === 0);
    const isTie = winners.length > 1;
    const headline = isTie
      ? `${winners.map((w) => w.item.name).join(" & ")} tied for the sharpest crew!`
      : `${winners[0]?.item.name} outsmarted everyone!`;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <Starfield />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "6px" }}><Icon name="ufo" size={44} color="#38BDF8" /></div>
          <div style={{ fontWeight: "900", fontSize: "22px", color: "#38BDF8", marginBottom: "16px" }}>{headline}</div>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "760px" }}>
            {ranking.map(({ item: team, rank, value }) => {
              const spyCount = timesWasSpy[team.id] ?? 0;
              const spyWins = spyWinsByTeam[team.id] ?? 0;
              const crewWins = crewWinsByTeam[team.id] ?? 0;
              return (
                <div key={team.id} style={{ background: `linear-gradient(160deg,${team.color.dark}55,#0F172A)`, border: `2px solid ${team.color.bg}`, borderRadius: "14px", padding: "12px" }}>
                  <div><RankBadge rank={rank} size={22} /></div>
                  <div style={{ fontWeight: "800", color: "white", fontSize: "14px", marginTop: "4px" }}><TeamIcon team={team} /> {team.name}</div>
                  <div style={{ color: "#38BDF8", fontWeight: "900", fontSize: "16px", marginTop: "4px" }}>{value} pts</div>
                  <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "700", marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", flexWrap: "wrap" }}>
                    <Icon name="search" size={10} /> spy {spyCount}× (escaped {spyWins}×) · <Icon name="astronaut" size={10} /> caught/guessed right {crewWins}×
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={onEnd}
            className="sau-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#0284C7,#38BDF8)", color: "#0C1B2E", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}
          >
            <Icon name="checkeredFlag" size={18} /> End Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={arenaStyle}>
      <Starfield />
      {STYLE_TAG}
      {inputMode === "phone" && sessionCode && (
        <PhoneReconnectBadge
          sessionCode={sessionCode} joinUrl={`${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=spy`}
          teams={teams.filter(t => t.id !== TEACHER_ID)} connectedTeamIds={connectedTeamIds}
          accent="#38BDF8" panelBg="linear-gradient(160deg,#1E3A5F,#0F172A)" borderColor="#38BDF866"
        />
      )}
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
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Icon name="ufo" size={15} /> Spy Among Us{isTwoPlayer ? " - 1v1" : ""} - Round {ri + 1}/{questions.length}
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
            <div style={{ fontWeight: "900", fontSize: "14px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "5px" }}><Icon name="ufo" size={13} /> 1v1 Mode</div>
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
                <TeamIcon team={peekTeam} /> {peekTeam.name} - your turn to look!
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
                    display: "inline-flex", alignItems: "center", gap: "8px",
                  }}
                >
                  <Icon name="satellite" size={16} /> Reveal my role
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
                    <div style={{ marginBottom: "8px" }}><Icon name={isSpy(peekTeam.id) ? "search" : "astronaut"} size={36} /></div>
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
              <div style={{ fontWeight: "900", fontSize: "17px", color: "#7DD3FC", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <Icon name="satellite" size={15} /> Prepare your answer!
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
                  <div style={{ lineHeight: 1, minHeight: "44px" }}>
                    <DiceFace value={rollDice[index]} size={40} />
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
              <div style={{ fontWeight: "900", fontSize: "20px", color: "white", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <Icon name="mic" size={17} /> <TeamIcon team={speakTeam} /> {speakTeam.name} - speak now!
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
                  <Icon name={index < speakIdx ? "check" : index === speakIdx ? "mic" : "hourglass"} size={11} /> {team.name}
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
              <div style={{ marginBottom: "4px" }}><Icon name="warning" size={26} color="#FCA5A5" /></div>
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
                    <TeamIcon team={voter} /> {voter.name} suspects:
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
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon name="warning" size={12} /> {suspect.name}</span>
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
                  display: "inline-flex", alignItems: "center", gap: "8px",
                }}
              >
                <Icon name="warning" size={16} /> Count the votes!
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
              <div style={{ marginBottom: "10px" }}><Icon name="search" size={36} /></div>
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
              <div key={ri} style={{ marginBottom: "8px", display: "inline-block", animation: "sauEject 1.4s ease-in forwards" }}><Icon name="search" size={40} /></div>
              <div style={{ fontWeight: "900", fontSize: "20px", color: "#FCA5A5", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <Icon name="close" size={17} /> {spyTeam.name} was the Spy!
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

            <div style={{ position: "relative", background: "rgba(56,189,248,0.1)", border: "2px solid #38BDF8", borderRadius: "12px", padding: "12px", marginBottom: "14px" }}>
              <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                <FlagPromptButton gameId="spy" questionData={round} />
              </div>
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
                  <div style={{ fontWeight: "900", color: "#FCA5A5", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <Icon name="search" size={15} /> {spyTeam.name} guessed "{spyGuess}" - correct! Spy earns +60 pts.
                  </div>
                ) : (
                  <div style={{ fontWeight: "900", color: "#86EFAC", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <Icon name="astronaut" size={15} /> {spyTeam.name} guessed "{spyGuess}" - wrong! Crewmates win +80 pts each.
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
                    <span style={{ color: correct ? "#4ADE80" : "#F87171", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Icon name={correct ? "check" : "close"} size={11} /> voted {accused?.name}
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
                  display: "inline-flex", alignItems: "center", gap: "8px",
                }}
              >
                {ri + 1 >= questions.length ? <><Icon name="trophy" size={17} /> See Final Results</> : "Next Round"}
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
                  <div style={{ fontWeight: "900", fontSize: "20px", color: "white", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <Icon name="mic" size={17} /> <TeamIcon team={speaker} /> {speaker.name} - speak now!
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
                  <div style={{ marginBottom: "10px" }}><Icon name={isSpyGuessing ? "search" : "astronaut"} size={32} /></div>
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
              <div style={{ position: "relative" }}>
                {/* zIndex needed: the spy card below also sets position:relative, and without an
                    explicit stacking order it paints after (on top of) this button in tree order,
                    silently swallowing clicks even though the button is visually present. */}
                <div style={{ position: "absolute", top: 0, right: 0, zIndex: 2 }}>
                  <FlagPromptButton gameId="spy" questionData={round} />
                </div>
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
                    <div style={{ marginBottom: "4px" }}><Icon name="astronaut" size={28} /></div>
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
                    <div style={{ marginBottom: "4px", display: "inline-block", animation: "sauEject 1.4s ease-in forwards" }}><Icon name="search" size={28} /></div>
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
                      <Icon name={spyGuessedRight ? "check" : "close"} size={18} />
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
                      <Icon name={crewGuessedRight ? "check" : "close"} size={18} />
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
                      display: "inline-flex", alignItems: "center", gap: "8px",
                    }}
                  >
                    {ri + 1 >= questions.length ? <><Icon name="trophy" size={17} /> See Final Results</> : "Next Round"}
                  </button>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
