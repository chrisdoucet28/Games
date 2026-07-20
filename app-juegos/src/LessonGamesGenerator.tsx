import { useState, useEffect, useRef, useCallback } from "react";
import type { Team, GameMode, QuestionData } from "./types";
import { TEAM_COLORS, GAME_MODES } from "./data/constants";
// Asegúrate de que TOPIC_LIBRARY esté exportado desde tu archivo topics.ts junto con TOPIC_OPTIONS
import { TOPIC_OPTIONS, TOPIC_LIBRARY } from "./data/topics";

import { ScoreBoard } from "./components/shared/ScoreBoard";
import { Confetti } from "./components/shared/Confetti";
import { AuctionGame } from "./components/games/AuctionGame";
import { MinefieldGame } from "./components/games/MinefieldGame";
import { HotSeatGame } from "./components/games/HotSeatGame";
import { SpyAmongUsGame } from "./components/games/SpyAmongUsGame";
import { BattleshipGame } from "./components/games/BattleshipGame";
import { VaultHeistGame } from "./components/games/VaultHeistGame";
import { CardShuffleGame } from "./components/games/CardShuffleGame";
import { CastleGame } from "./components/games/CastleGame";
import { KingOfHillGame } from "./components/games/KingOfHillGame";
import { HotPotatoGame } from "./components/games/HotPotatoGame";
import { RaceTrackGame } from "./components/games/RaceTrackGame";
import { WordWhackGame } from "./components/games/WordWhackGame";
import { RocketFuelGame } from "./components/games/RocketFuelGame";
import { ZombieSiegeGame } from "./components/games/ZombieSiegeGame";
import { OrderUpGame } from "./components/games/OrderUpGame";

type TopicOption = {
  value: string;
  label: string;
  level: string | null;
  focus: string | null;
};

type TopicLibraryEntry = {
  questions: QuestionData[];
  minefieldGrid?: {
    topic: string;
    instructions: string;
    colLabels: string[];
    rowLabels: string[];
  };
  auctionSentences?: QuestionData[];
  cardTasks?: { task: string }[];
  spyRounds?: QuestionData[];
  hotSeatWords?: QuestionData[];
  hotPotatoPrompts?: QuestionData[];
};

type MinefieldGridData = NonNullable<TopicLibraryEntry["minefieldGrid"]>;

const realTopicOptions = TOPIC_OPTIONS.filter(o => o.value !== "ai") as TopicOption[];

const shuffle = <T,>(items: T[]) => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const buildBalancedMixedPool = <T,>(topicBuckets: T[][]) => {
  const activeBuckets = topicBuckets.map(bucket => shuffle(bucket)).filter(bucket => bucket.length > 0);
  const mixed: T[] = [];

  while (activeBuckets.length > 0) {
    const bucketOrder = shuffle(activeBuckets.map((_, index) => index));
    const emptiedBuckets: number[] = [];

    bucketOrder.forEach(bucketIndex => {
      const nextItem = activeBuckets[bucketIndex].shift();
      if (nextItem) mixed.push(nextItem);
      if (activeBuckets[bucketIndex].length === 0) emptiedBuckets.push(bucketIndex);
    });

    [...new Set(emptiedBuckets)].sort((a, b) => b - a).forEach(bucketIndex => {
      activeBuckets.splice(bucketIndex, 1);
    });
  }

  return mixed;
};

const uniqueValues = (values: string[]) => Array.from(new Set(values));

const matchesTopicSearch = (label: string, search: string) => {
  const term = search.trim().toLowerCase();
  return term === "" || label.toLowerCase().includes(term);
};

const getTopicOption = (value: string) => realTopicOptions.find(o => o.value === value);

const getTopicLabel = (value: string) => getTopicOption(value)?.label ?? value;

const getFilteredTopicOptions = (level: string, focus: string) =>
  realTopicOptions.filter(o => (level === "all" || o.level === level) && (focus === "all" || o.focus === focus));

const getSelectedTopicEntries = (selectedTopics: string[]) =>
  selectedTopics
    .map(value => TOPIC_LIBRARY[value as keyof typeof TOPIC_LIBRARY] as TopicLibraryEntry | undefined)
    .filter((entry): entry is TopicLibraryEntry => Boolean(entry));

const cardTasksAsQuestions = (tasks: { task: string }[]): QuestionData[] =>
  tasks.map(ct => ({
    type: "speaking task",
    question: ct.task,
    answer: "Open - teacher judges",
    hint: undefined,
    difficulty: "medium"
  }));

const buildMinefieldGrids = (entries: TopicLibraryEntry[]) =>
  entries.map(entry => entry.minefieldGrid).filter((grid): grid is MinefieldGridData => Boolean(grid));

export default function LessonGamesGenerator() {
  const [screen, setScreen] = useState<"welcome" | "setup" | "game-select" | "game" | "results">("welcome");
  const [numTeams, setNumTeams] = useState(2);
  const [teamNames, setTeamNames] = useState(["Team Red", "Team Blue", "Team Green", "Team Yellow", "Team Purple"]);
  const [teamColors, setTeamColors] = useState([0, 1, 2, 3, 4]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [level, setLevel] = useState("all");
  const [focus, setFocus] = useState("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicSearch, setTopicSearch] = useState("");

  const [loadingGame, setLoadingGame] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selectedGame, setSelectedGame] = useState<GameMode | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [, setIsFullscreen] = useState(false);
  const [minefieldGridData, setMinefieldGridData] = useState<MinefieldGridData | MinefieldGridData[] | null>(null);
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);


  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      appRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const updateScore = useCallback((teamId: string | number, delta: number) => {
    setTeams(ts => ts.map(t => t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t));
  }, []);

  const handleSetup = () => {
    setLoadError("");

    if (selectedTopics.length === 0) {
      setLoadError("Choose at least one topic.");
      return;
    }

    const existingScores = Object.fromEntries(teams.map(t => [t.name, t.score]));
    const builtTeams = teamNames.slice(0, numTeams).map((name, i) => ({
      id: i, name, color: TEAM_COLORS[teamColors[i] ?? i],
      score: existingScores[name] ?? 0,
    }));
    setTeams(builtTeams);
    setScreen("game-select");
  };

  const toggleTopicSelection = (topicValue: string) => {
    setSelectedTopics(current => {
      if (current.includes(topicValue)) {
        return current.filter(value => value !== topicValue);
      }

      return [...current, topicValue];
    });
  };

  const selectAllVisibleTopics = () => {
    const visibleTopicValues = getFilteredTopicOptions(level, focus)
      .filter(o => matchesTopicSearch(o.label, topicSearch))
      .map(o => o.value);
    setSelectedTopics(current => uniqueValues([...current, ...visibleTopicValues]));
  };

  const clearSelectedTopics = () => {
    setSelectedTopics([]);
  };

  const startGame = (mode: GameMode) => {
    setSelectedGame(mode);
    setLoadingGame(true);
    setLoadError("");

    try {
      const selectedEntries = getSelectedTopicEntries(selectedTopics);
      if (selectedEntries.length === 0) {
        setLoadError("Topic data not found.");
        setLoadingGame(false);
        return;
      }

      if (mode.id === "minefield") {
        const minefieldGrids = buildMinefieldGrids(selectedEntries);
        if (minefieldGrids.length === 0) {
          setLoadError("Minefield grid data not found for the selected topic.");
          setLoadingGame(false);
          return;
        }

        setMinefieldGridData(minefieldGrids.length === 1 ? minefieldGrids[0] : minefieldGrids);
        setQuestions([]);
        setScreen("game");
        setLoadingGame(false);
        return;
      }

      const questionBuckets = selectedEntries.map(entry => entry.questions ?? []);
      const cardTaskBuckets = selectedEntries.map(entry => cardTasksAsQuestions(entry.cardTasks ?? []));
      const allCardTasks = selectedEntries.flatMap(entry => entry.cardTasks ?? []);
      const selectedFocuses = uniqueValues(selectedTopics.map(value => getTopicOption(value)?.focus).filter((value): value is string => Boolean(value)));
      const isMixedSelection = selectedTopics.length > 1;
      const isTopicOnlySelection = selectedFocuses.length === 1 && selectedFocuses[0] === "topic";
      const mixByTopic = (buckets: QuestionData[][]) => isMixedSelection ? buildBalancedMixedPool(buckets) : shuffle(buckets.flat());

      let qs: QuestionData[] = [];

      if (mode.id === "auction") {
        qs = mixByTopic(selectedEntries.map(entry => entry.auctionSentences ?? []));
      } else if (mode.id === "cards") {
        qs = mixByTopic(cardTaskBuckets);
      } else if (mode.id === "spy" || mode.id === "zombie") {
        // Zombie Siege reuses Spy Among Us's spyRounds content (crewmateTopic/crewmatePrompt) for
        // its sentence-response prompts — short grammar-topic labels with a scenario/example-word
        // cue, not the fixed-answer drill format the other mixed-pool games use.
        // Tagged with which selected topic each round came from (by TOPIC_OPTIONS value, looked up
        // per-topic rather than zipped by index against selectedEntries, since that array silently
        // drops any topic value that doesn't resolve in TOPIC_LIBRARY and would misalign a zip) —
        // SpyAmongUsGame uses this to scope its guess options to "same topic" instead of the whole
        // mixed pool.
        qs = mixByTopic(selectedTopics.map(value => {
          const entry = TOPIC_LIBRARY[value as keyof typeof TOPIC_LIBRARY] as TopicLibraryEntry | undefined;
          return (entry?.spyRounds ?? []).map(r => ({ ...r, spySourceTopic: value }));
        }));
      } else if (mode.id === "hotseat") {
        qs = mixByTopic(selectedEntries.map(entry => entry.hotSeatWords ?? []));
      } else if (mode.id === "hotpotato") {
        qs = mixByTopic(selectedEntries.map(entry => entry.hotPotatoPrompts ?? []));
      } else if (mode.id === "orderup") {
        // Merges two source arrays no other branch combines: transform-tagged rewrite-sentence
        // items (grammar targets) and hotSeatWords (vocab targets) — OrderUpGame splits this back
        // into its two pools by shape (q.transform vs q.word), same "merge upstream, filter-by-
        // shape downstream" pattern Battleship/Castle already use for questions+cardTasks.
        qs = mixByTopic(selectedEntries.map(entry => [
          ...(entry.questions ?? []).filter(q => q.type === "rewrite sentences" && q.transform),
          ...(entry.hotSeatWords ?? []),
        ]));
      } else if (mode.id === "battleship") {
        // Battleship's identity is error-hunting: always merge entry.questions (which now
        // includes L1-interference-flavored mistakes for topic-focus content) with cardTasks,
        // rather than dropping grammar content entirely for topic-only selections.
        qs = mixByTopic(selectedEntries.map((entry, index) => [...(entry.questions ?? []), ...cardTaskBuckets[index]]));
      } else if (mode.id === "castle" || mode.id === "racetrack" || mode.id === "whack" || mode.id === "rocket" || mode.id === "vault") {
        qs = mixByTopic(selectedEntries.map((entry, index) => [...(entry.questions ?? []), ...cardTaskBuckets[index]]));
      } else if (isTopicOnlySelection && allCardTasks.length > 0) {
        qs = mixByTopic(cardTaskBuckets);
      } else {
        qs = isMixedSelection
          ? mixByTopic(selectedEntries.map((entry, index) => [...(entry.questions ?? []), ...cardTaskBuckets[index]]))
          : mixByTopic(questionBuckets);
      }

      if (qs.length === 0 && allCardTasks.length > 0) {
        qs = mixByTopic(cardTaskBuckets);
      }

      if (qs.length === 0) {
        setLoadError("No game content found for the selected topic combination.");
        setLoadingGame(false);
        return;
      }

      setQuestions(isMixedSelection ? qs : shuffle(qs));
      setScreen("game");
    } catch {
      setLoadError("An error occurred loading the game.");
    } finally {
      setLoadingGame(false);
    }
  };

  const earlyEndRef = useRef<(() => void) | null>(null);

  const handleGameEnd = () => {
    if (earlyEndRef.current) {
      earlyEndRef.current();
      earlyEndRef.current = null;
    }
    setConfetti(true);
    setScreen("results");
    setTimeout(() => setConfetti(false), 4000);
  };

  const winner = teams.length ? [...teams].sort((a, b) => b.score - a.score)[0] : null;

  if (screen === "welcome") return (
    <div ref={appRef} style={{ minHeight: "100vh", background: "linear-gradient(160deg,#1E1B4B 0%,#312E81 45%,#4C1D95 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px 24px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "680px", width: "100%", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "64px", marginBottom: "14px", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }}>🎮</div>
          <h1 style={{ fontSize: "clamp(30px,5.5vw,52px)", fontWeight: "900", color: "white", margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.1, textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}>
            Lesson Games<br /><span style={{ color: "#FCD34D" }}>Generator</span>
          </h1>
          <p style={{ color: "#C4B5FD", fontSize: "clamp(15px,2.5vw,18px)", margin: "0", lineHeight: 1.7, maxWidth: "500px", marginLeft: "auto", marginRight: "auto" }}>
            50+ built-in topics from A1 to C1 across Grammar, Vocabulary & Speaking.<br />
            {GAME_MODES.length} competitive game modes. Zero prep. Ready in seconds.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
          {[{ icon: "🎯", label: `${GAME_MODES.length} Game Modes` }, { icon: "📚", label: "50+ Built-in Topics" }, { icon: "🏆", label: "Up to 5 Teams" }, { icon: "⚡", label: "Instant Play" }].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "20px", padding: "8px 16px", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ fontSize: "16px" }}>{s.icon}</span>
              <span style={{ color: "white", fontWeight: "700", fontSize: "13px" }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "8px", marginBottom: "32px" }}>
          {GAME_MODES.map(g => (
            <div key={g.id} style={{ background: "rgba(255,255,255,0.08)", borderRadius: "12px", padding: "10px 12px", border: "1px solid rgba(255,255,255,0.15)", display: "flex", flexDirection: "column", gap: "4px", backdropFilter: "blur(6px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <span style={{ fontSize: "20px", flexShrink: 0 }}>{g.icon}</span>
                <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: "600", fontSize: "13px", textAlign: "left", lineHeight: 1.3 }}>{g.name}</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", textAlign: "left", lineHeight: 1.35 }}>{g.tag}</span>
            </div>
          ))}
        </div>
        <div>
          <button onClick={() => setScreen("setup")} style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)", color: "white", border: "none", borderRadius: "16px", padding: "18px 56px", fontSize: "20px", fontWeight: "900", cursor: "pointer", boxShadow: "0 8px 32px rgba(239,68,68,0.45)", letterSpacing: "0.01em" }}>🚀 Start a Game</button>
        </div>
      </div>
    </div>
  );

  if (screen === "setup") {
    const filteredTopics = getFilteredTopicOptions(level, focus).filter(o => matchesTopicSearch(o.label, topicSearch));
    const selectedTopicOptions = selectedTopics.map(getTopicOption).filter((option): option is TopicOption => Boolean(option));
    const selectedTopicSummary = selectedTopicOptions.map(o => o.label).join(", ");
    const LEVELS_META = [
      { id: "all", desc: "All levels", color: "#6366F1" },
      { id: "A1", desc: "Beginner", color: "#22C55E" },
      { id: "A2", desc: "Elementary", color: "#84CC16" },
      { id: "B1", desc: "Intermediate", color: "#F59E0B" },
      { id: "B2", desc: "Upper-Int.", color: "#F97316" },
      { id: "C1", desc: "Advanced", color: "#EF4444" },
    ];
    const FOCUS_META = [
      { id: "all", icon: "*", label: "All", desc: "Grammar, words & themes" },
      { id: "grammar", icon: "G", label: "Grammar", desc: "Structures & rules" },
      { id: "vocabulary", icon: "V", label: "Vocabulary", desc: "Words in context" },
      { id: "topic", icon: "T", label: "Topics", desc: "Speaking themes" },
    ];

    return (
      <div style={{ minHeight: "100vh", background: "#F8F7FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <button onClick={() => setScreen("welcome")} style={{ background: "none", border: "2px solid #6366F1", color: "#6366F1", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px" }}>← Back</button>
          
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#1E1B4B", margin: 0 }}>⚙️ Game Setup</h2>
            <p style={{ color: "#6B7280", marginTop: "8px" }}>Set up your class, then pick one or more topics and a game</p>
          </div>

          <div style={{ background: "white", border: "2px solid #E0E7FF", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ background: "#6366F1", color: "white", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "14px", flexShrink: 0 }}>1</div>
              <div>
                <div style={{ fontWeight: "800", color: "#1E1B4B", fontSize: "16px" }}>What level is your class?</div>
                <div style={{ color: "#6B7280", fontSize: "12px", marginTop: "2px" }}>Filters the topic list below</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {LEVELS_META.map(l => (
                <button key={l.id} onClick={() => setLevel(l.id)} style={{
                  background: level === l.id ? l.color : "white",
                  color: level === l.id ? "white" : "#374151",
                  border: `3px solid ${level === l.id ? l.color : "#D1D5DB"}`,
                  borderRadius: "12px", padding: "10px 16px", cursor: "pointer",
                  textAlign: "center", minWidth: "72px", transition: "all 0.15s",
                  fontWeight: level === l.id ? "900" : "700"
                }}>
                  <div style={{ fontSize: "18px", fontWeight: "900" }}>{l.id}</div>
                  <div style={{ fontSize: "11px", opacity: 0.85, marginTop: "2px" }}>{l.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ background: "#6366F1", color: "white", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "14px", flexShrink: 0 }}>2</div>
              <div>
                <div style={{ fontWeight: "800", color: "#1E1B4B", fontSize: "16px" }}>Grammar, Vocabulary, or Topics?</div>
                <div style={{ color: "#6B7280", fontSize: "12px", marginTop: "2px" }}>Filters the topic list below</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {FOCUS_META.map(f => (
                <button key={f.id} onClick={() => setFocus(f.id)} style={{
                  flex: 1, minWidth: "120px", background: focus === f.id ? "#6366F1" : "white",
                  color: focus === f.id ? "white" : "#374151",
                  border: `3px solid ${focus === f.id ? "#6366F1" : "#D1D5DB"}`,
                  borderRadius: "12px", padding: "14px 12px", cursor: "pointer",
                  textAlign: "left", transition: "all 0.15s"
                }}>
                  <div style={{ fontWeight: "800", fontSize: "16px" }}>{f.icon} {f.label}</div>
                  <div style={{ fontSize: "12px", opacity: 0.75, marginTop: "3px" }}>{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "white", border: "2px solid #E0E7FF", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ background: "#6366F1", color: "white", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "14px", flexShrink: 0 }}>3</div>
              <div>
                <div style={{ fontWeight: "800", color: "#1E1B4B", fontSize: "16px" }}>Choose topic mix</div>
                <div style={{ color: "#6B7280", fontSize: "12px", marginTop: "2px" }}>
                  {filteredTopics.length > 0
                    ? `${filteredTopics.length} topic${filteredTopics.length !== 1 ? "s" : ""} shown - ${selectedTopics.length} selected`
                    : topicSearch.trim() !== ""
                      ? `No topics match "${topicSearch.trim()}"`
                      : "No built-in topics match these filters"}
                </div>
              </div>
            </div>

            <div style={{ position: "relative", marginBottom: "14px" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", color: "#9CA3AF", pointerEvents: "none" }}>🔍</span>
              <input
                type="text"
                value={topicSearch}
                onChange={e => setTopicSearch(e.target.value)}
                placeholder="Search topics..."
                style={{
                  width: "100%", boxSizing: "border-box", padding: "11px 40px 11px 38px",
                  border: "2px solid #E0E7FF", borderRadius: "12px", fontSize: "14px",
                  fontWeight: "600", color: "#1E1B4B", outline: "none",
                }}
              />
              {topicSearch !== "" && (
                <button
                  type="button"
                  onClick={() => setTopicSearch("")}
                  aria-label="Clear search"
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "#EEF2FF", border: "none", borderRadius: "50%", width: "22px", height: "22px", color: "#4338CA", fontWeight: "800", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  ✕
                </button>
              )}
            </div>
            {selectedTopics.length > 0 && (
              <div style={{ background: "#EEF2FF", border: "2px solid #C7D2FE", color: "#312E81", borderRadius: "12px", padding: "10px 12px", fontWeight: "700", fontSize: "13px", marginBottom: "12px", lineHeight: 1.5 }}>
                Playing with: {selectedTopicSummary}
              </div>
            )}
            {filteredTopics.length > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                  <button type="button" onClick={clearSelectedTopics} style={{ background: "white", border: "2px solid #FCA5A5", color: "#B91C1C", borderRadius: "999px", padding: "6px 14px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>
                    Deselect all
                  </button>
                  <button type="button" onClick={selectAllVisibleTopics} style={{ background: "white", border: "2px solid #C7D2FE", color: "#4338CA", borderRadius: "999px", padding: "6px 14px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>
                    Select all shown
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: "8px" }}>
                  {filteredTopics.map(o => {
                    const isSelected = selectedTopics.includes(o.value);
                    const levelColor = LEVELS_META.find(l => l.id === o.level)?.color || "#6366F1";
                    return (
                      <button key={o.value} onClick={() => toggleTopicSelection(o.value)} style={{
                        background: isSelected ? levelColor : "#F8F7FF",
                        color: isSelected ? "white" : "#1E1B4B",
                        border: `2px solid ${isSelected ? levelColor : "#E0E7FF"}`,
                        borderRadius: "10px", padding: "10px 14px",
                        cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                        fontWeight: isSelected ? "800" : "700", fontSize: "13px", lineHeight: 1.4
                      }}>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div style={{ background: "white", border: "2px solid #E0E7FF", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ background: "#6366F1", color: "white", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "14px", flexShrink: 0 }}>4</div>
              <div style={{ fontWeight: "800", color: "#1E1B4B", fontSize: "16px" }}>How many teams?</div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {[2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setNumTeams(n)} style={{ background: numTeams === n ? "#6366F1" : "white", color: numTeams === n ? "white" : "#374151", border: `3px solid ${numTeams === n ? "#6366F1" : "#D1D5DB"}`, borderRadius: "12px", padding: "10px 24px", fontSize: "18px", fontWeight: "800", cursor: "pointer" }}>{n}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(${numTeams > 3 ? "160px" : "180px"},1fr))`, gap: "12px" }}>
              {Array.from({ length: numTeams }).map((_, i) => {
                const color = TEAM_COLORS[teamColors[i] ?? i];

                return (
                  <div key={i} style={{ border: `3px solid ${color.bg}`, borderRadius: "14px", overflow: "hidden", background: "white" }}>
                    <div style={{ background: color.bg, padding: "8px 10px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "16px" }}>{color.emoji}</span>
                      <span style={{ color: "white", fontWeight: "800", fontSize: "13px" }}>{color.name}</span>
                    </div>
                    <input
                      value={teamNames[i]}
                      onChange={e => {
                        const next = [...teamNames];
                        next[i] = e.target.value;
                        setTeamNames(next);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        fontSize: "14px",
                        fontWeight: "700",
                        border: "none",
                        borderBottom: `2px solid ${color.bg}20`,
                        color: color.dark,
                        background: color.light,
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                      placeholder="Team name..."
                    />
                    <div style={{ background: color.light, padding: "8px 10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {TEAM_COLORS.map((swatch, swatchIndex) => (
                        <button
                          key={swatchIndex}
                          type="button"
                          onClick={() => {
                            const next = [...teamColors];
                            next[i] = swatchIndex;
                            setTeamColors(next);
                          }}
                          title={swatch.name}
                          aria-label={`${teamNames[i] || `Team ${i + 1}`} color ${swatch.name}`}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: swatch.bg,
                            cursor: "pointer",
                            border: teamColors[i] === swatchIndex ? `3px solid ${swatch.dark}` : `2px solid ${swatch.bg}`,
                            transform: teamColors[i] === swatchIndex ? "scale(1.25)" : "scale(1)",
                            transition: "all 0.15s",
                            flexShrink: 0,
                            boxShadow: teamColors[i] === swatchIndex ? `0 0 0 2px white, 0 0 0 4px ${swatch.bg}` : "none"
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {loadError && <div style={{ color: "#DC2626", fontWeight: "800", textAlign: "center", marginBottom: "12px" }}>{loadError}</div>}

          <button onClick={handleSetup} disabled={selectedTopics.length === 0} style={{ width: "100%", background: selectedTopics.length === 0 ? "#CBD5E1" : "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "white", border: "none", borderRadius: "16px", padding: "18px", fontSize: "20px", fontWeight: "900", cursor: selectedTopics.length === 0 ? "not-allowed" : "pointer" }}>
            🎮 Choose a Game!
          </button>
        </div>
      </div>
    );
  }

  if (screen === "game-select") return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        
        <div style={{ background: "linear-gradient(135deg,#1E1B4B,#312E81)", borderRadius: "20px", padding: "20px 24px", marginBottom: "20px", color: "white" }}>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#A5B4FC", marginBottom: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Current Topic Mix</div>
            <div style={{ fontSize: "clamp(18px,4vw,26px)", fontWeight: "900", lineHeight: 1.2 }}>
              {selectedTopics.length === 1 ? getTopicLabel(selectedTopics[0]) : `${selectedTopics.length} topics mixed`}
            </div>
            {selectedTopics.length > 1 && (
              <div style={{ color: "#C4B5FD", fontWeight: "700", fontSize: "13px", marginTop: "8px", lineHeight: 1.5 }}>
                {selectedTopics.map(getTopicLabel).join(" + ")}
              </div>
            )}
          </div>
        </div>

        <ScoreBoard teams={teams} />
        <div style={{ textAlign: "center", marginTop: "10px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
            <button onClick={() => setTeams(ts => ts.map(t => ({ ...t, score: 0 })))} style={{ background: "none", border: "2px solid #D1D5DB", borderRadius: "20px", padding: "4px 16px", fontWeight: "700", fontSize: "12px", color: "#9CA3AF", cursor: "pointer" }}>🔄 Reset all scores to 0</button>
            <button onClick={() => setScreen("setup")} style={{ background: "none", border: "2px solid #D1D5DB", borderRadius: "20px", padding: "4px 16px", fontWeight: "700", fontSize: "12px", color: "#9CA3AF", cursor: "pointer" }}>⚙️ Edit teams & settings</button>
        </div>

        {loadError && <div style={{ color: "red", fontWeight: "bold", textAlign: "center" }}>{loadError}</div>}
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "14px", marginTop: "20px" }}>
          {GAME_MODES.map(g => (
            <div key={g.id} onClick={() => !loadingGame && startGame(g)} style={{ background: "white", border: `3px solid ${g.color}`, borderRadius: "18px", padding: "20px", cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>{g.icon}</div>
              <div style={{ fontWeight: "900", fontSize: "17px", color: "#1E1B4B", marginBottom: "4px" }}>{g.name}</div>
              <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "8px" }}>{g.desc}</div>
              <div style={{ fontSize: "12px", color: g.color, fontWeight: "700", lineHeight: 1.4, borderTop: `1px solid ${g.color}33`, paddingTop: "8px" }}>🗣️ {g.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (screen === "game" && selectedGame) {
    const selectedLevels = uniqueValues(selectedTopics.map(value => getTopicOption(value)?.level).filter((value): value is string => Boolean(value)));
    const hotPotatoLevel = selectedLevels.length === 1 ? selectedLevels[0] : "mixed";
    const orderUpLevel = hotPotatoLevel;

    return (
      <div ref={appRef} style={{ minHeight: "100vh", background: "#0F0A2E", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
        <div style={{ background: "linear-gradient(90deg,#6366F1,#8B5CF6)", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: "white", margin: 0, fontSize: "20px" }}>{selectedGame.icon} {selectedGame.name}</h2>
          <div>
            <button onClick={toggleFullscreen} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", marginRight: "10px", fontWeight: "700" }}>⛶ Fullscreen</button>
            <button onClick={handleGameEnd} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontWeight: "700" }}>🏁 End Game</button>
          </div>
        </div>
        <div style={{ padding: "16px", maxWidth: "900px", margin: "0 auto" }}>
          <ScoreBoard teams={teams} />
          <div style={{ background: "white", borderRadius: "20px", padding: "20px", marginTop: "16px" }}>
            {selectedGame.id === "auction" && <AuctionGame questions={questions} teams={teams} earlyEndRef={earlyEndRef} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "minefield" && <MinefieldGame questions={[]} gridData={minefieldGridData} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "hotseat" && <HotSeatGame questions={questions} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "spy" && <SpyAmongUsGame questions={questions} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "battleship" && <BattleshipGame questions={questions} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "vault" && <VaultHeistGame questions={questions} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "cards" && <CardShuffleGame questions={questions} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "castle" && <CastleGame questions={questions} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "hill" && <KingOfHillGame questions={questions} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "hotpotato" && <HotPotatoGame questions={questions} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} level={hotPotatoLevel} />}
            {selectedGame.id === "racetrack" && <RaceTrackGame questions={questions} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "whack" && <WordWhackGame questions={questions} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "rocket" && <RocketFuelGame questions={questions} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "zombie" && <ZombieSiegeGame questions={questions} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "orderup" && <OrderUpGame questions={questions} teams={teams} onUpdateScore={updateScore} onEnd={handleGameEnd} level={orderUpLevel} />}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "results") {
    const sorted = [...teams].sort((a, b) => b.score - a.score);
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1E1B4B,#312E81)", padding: "20px", textAlign: "center", color: "white", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
        <Confetti active={confetti} />
        <div style={{ fontSize: "80px", margin: "20px 0" }}>🏆</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: "900", margin: "0 0 8px" }}>Game Over!</h1>
        <p style={{ color: "#C4B5FD", fontSize: "18px", marginBottom: "28px" }}>{winner?.name} wins! 🎉</p>
        
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "20px", padding: "24px", maxWidth: "600px", margin: "0 auto 24px" }}>
          {sorted.map((t, i) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 0", borderBottom: i < sorted.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
              <div style={{ fontSize: "32px" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🎖️"}</div>
              <div style={{ flex: 1, textAlign: "left", fontWeight: "900", fontSize: "20px" }}>{t.name}</div>
              <div style={{ fontWeight: "900", fontSize: "28px", color: t.color.bg }}>{t.score}</div>
            </div>
          ))}
        </div>
        
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setScreen("game-select")} style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)", color: "white", border: "none", borderRadius: "14px", padding: "14px 28px", fontSize: "17px", fontWeight: "800", cursor: "pointer" }}>🎮 Play Again</button>
          <button onClick={() => setScreen("setup")} style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "white", border: "none", borderRadius: "14px", padding: "14px 28px", fontSize: "17px", fontWeight: "800", cursor: "pointer" }}>📚 New Lesson</button>
        </div>
      </div>
    );
  }

  return null;
}
