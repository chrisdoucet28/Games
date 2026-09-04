import { useState, useEffect, useRef, useCallback } from "react";
import { TeamIcon, MASCOT_ICON_BY_EMOJI } from "./components/shared/TeamIcon";
import type { Team, GameMode, QuestionData, SavedClass, Subscription, TeamRosterEntry } from "./types";
import { TEAM_COLORS, GAME_MODES, GAME_ICONS, MASCOT_OPTIONS, LEVELS_META, FREE_PLAN_LIMITS, FREE_LAUNCH_ALL_PREMIUM } from "./data/constants";
import { getGameTier } from "./data/pppTiers";
import { PPPDiagram } from "./components/shared/PPPDiagram";
// Asegúrate de que TOPIC_LIBRARY esté exportado desde tu archivo topics.ts junto con TOPIC_OPTIONS
import { TOPIC_OPTIONS, TOPIC_LIBRARY } from "./data/topics";
import { hexToRgba, type Theme } from "./data/themes";
import { LESSONS } from "./data/lessons";

import { ScoreBoard } from "./components/shared/ScoreBoard";
import { Confetti } from "./components/shared/Confetti";
import { ClassesScreen } from "./components/shared/ClassesScreen";
import { ProfileScreen } from "./components/shared/ProfileScreen";
import { LearnScreen } from "./components/shared/LearnScreen";
import { LessonPlanScreen } from "./components/shared/LessonPlanScreen";
import { LeaderboardScreen } from "./components/shared/LeaderboardScreen";
import { BillingScreen } from "./components/shared/BillingScreen";
import { ThemeAmbience } from "./components/shared/ThemeAmbience";
import { FeedbackButton } from "./components/shared/FeedbackButton";
import { BrandBadge } from "./components/shared/BrandBadge";
import { Icon, type IconName } from "./components/shared/Icon";
import { IconBadge } from "./components/shared/IconBadge";
import { MascotIcon } from "./components/shared/MascotArt";
import { saveProgress, clearProgress, listClasses, createClass, upsertTeamRoster, deleteFromTeamRoster, saveTeams } from "./lib/classes";
import { isPaidStatus } from "./lib/subscription";
import { denseRank } from "./utils/ranking";
import { RankBadge } from "./components/shared/RankBadge";
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
  // Sentence Auction content. CONTENT RULE (not enforced by this type — see
  // scripts/check-auction-sentences.js): each sentence must be independently written. Never write
  // a correct sentence immediately followed by the same sentence with one word swapped to make it
  // wrong — students pattern-match "the second of each near-identical pair is the broken one"
  // almost instantly and stop reading the actual content. (isCorrect strictly alternating
  // true/false/true/false is NOT a problem on its own, as long as the sentences are independent —
  // don't rewrite content just to break up an alternating sequence.) Run the checker script after
  // adding/editing any topic's auctionSentences before committing.
  auctionSentences?: QuestionData[];
  cardTasks?: { task: string }[];
  spyRounds?: QuestionData[];
  hotSeatWords?: QuestionData[];
  hotPotatoPrompts?: QuestionData[];
  // Zombie Siege's easier early-round content (prototype) — a sentence starter (the given half)
  // that a team completes aloud with their own free ending, genuinely in between multiple choice
  // (fully closed) and an open speaking prompt (fully open). Optional per topic; a topic without
  // it just keeps using spyRounds-shaped content for every round, exactly like before this
  // existed. exampleCompletion is a reference answer for the teacher judging it, not the only
  // correct completion — same convention as every other open-response field in this codebase.
  halfSentences?: { starter: string; hint?: string; exampleCompletion?: string }[];
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

const DEFAULT_TEAM_NAMES = ["Team Red", "Team Blue", "Team Green", "Team Yellow", "Team Purple"];

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

type LessonGamesGeneratorProps = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  subscription: Subscription;
  onSubscriptionChange: (s: Subscription) => void;
  // Set once, right after a Stripe checkout redirect lands back on the app — see App.tsx.
  checkoutRedirect: "success" | "cancel" | null;
  // Set once, when the first-login welcome screen's "Explore Learn" button was used instead of
  // the plain "Let's go!" — see App.tsx and WelcomeIntroScreen.tsx.
  initialScreen?: "learn" | null;
};

export default function LessonGamesGenerator({ theme, onThemeChange, subscription, onSubscriptionChange, checkoutRedirect, initialScreen }: LessonGamesGeneratorProps) {
  const [screen, setScreen] = useState<"welcome" | "classes" | "profile" | "learn" | "lessonplan" | "leaderboard" | "billing" | "setup" | "game-select" | "game" | "results">(
    checkoutRedirect ? "billing" : initialScreen ?? "welcome"
  );
  // Set right before switching to "lessonplan" when arriving from a specific Learn lesson's
  // "Turn this into a Lesson Plan" button — null when arriving from the welcome screen's own
  // "Lesson Plans" button instead, so LessonPlanScreen opens on its browsable index.
  const [lessonPlanTopicId, setLessonPlanTopicId] = useState<string | null>(null);
  const isPaid = isPaidStatus(subscription.status);
  // The class this session is tied to, if any. Games started via "Start a Game" (not through "My
  // Classes") leave this null — but "Save & Exit" is still available; clicking it with no class
  // linked opens showSavePicker so the teacher can pick/create one on the spot instead of losing
  // the save entirely.
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showSavePicker, setShowSavePicker] = useState(false);
  // Which save action the picker should run once a class is picked/created — "exit" (mid-game
  // Save & Exit), "roster" (setup screen's "Save teams to class"), or "teams" (game-select
  // screen's "Save teams to class"). All three used to just no-op with no class linked yet; now
  // they all fall back to this same picker, matching the fallback Save & Exit already had.
  const [pendingSaveAction, setPendingSaveAction] = useState<"exit" | "roster" | "teams" | null>(null);
  const [pickerClasses, setPickerClasses] = useState<SavedClass[] | null>(null);
  const [pickerNewName, setPickerNewName] = useState("");
  const [pickerNewSchool, setPickerNewSchool] = useState("");
  const [pickerNewLevel, setPickerNewLevel] = useState("all");
  const [pickerBusy, setPickerBusy] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [numTeams, setNumTeams] = useState(2);
  const [teamNames, setTeamNames] = useState(DEFAULT_TEAM_NAMES);
  const [teamColors, setTeamColors] = useState([0, 1, 2, 3, 4]);
  const [teamMascots, setTeamMascots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [teams, setTeams] = useState<Team[]>([]);
  // Every team ever played under the active class, for the tap-to-toggle "saved teams" picker —
  // empty (and the picker hidden) whenever no class is active or it has no roster yet.
  const [teamRoster, setTeamRoster] = useState<TeamRosterEntry[]>([]);
  const [rosterSaveStatus, setRosterSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [teamsSaveStatus, setTeamsSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [level, setLevel] = useState("all");
  const [focus, setFocus] = useState("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  // null = full Learn library (launched from welcome); an array = scoped to a game's chosen
  // topics (launched from game-select) — also tells the Learn screen where "back" should go.
  const [learnFilter, setLearnFilter] = useState<string[] | null>(null);
  const [topicSearch, setTopicSearch] = useState("");
  // The unfiltered topic list runs to 120+ entries — on a narrow screen that's an enormous
  // amount of scrolling before reaching team setup, so it starts capped with a "Show all" expand.
  const [showAllTopics, setShowAllTopics] = useState(false);
  // Accordion, not a per-team Set — only one team's mascot grid open at a time keeps the (already
  // tall, up to 5x) teams section compact by default instead of showing all ~24 icons per team.
  const [expandedMascotTeam, setExpandedMascotTeam] = useState<number | null>(null);

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

  // Gives every screen its own browser tab title instead of a static "ClassCade" everywhere —
  // matters for a teacher who keeps several tabs open (e.g. one mid-game, one browsing Learn).
  // "game" is the one screen that needs a runtime value (which game is actually being played)
  // rather than a fixed per-screen label.
  useEffect(() => {
    const titles: Record<typeof screen, string> = {
      welcome: "ClassCade",
      setup: "Game Setup - ClassCade",
      "game-select": "Choose a Game - ClassCade",
      game: selectedGame ? `${selectedGame.name} - ClassCade` : "ClassCade",
      results: "Results - ClassCade",
      classes: "My Classes - ClassCade",
      profile: "My Profile - ClassCade",
      learn: "Learn - ClassCade",
      lessonplan: "Lesson Plans - ClassCade",
      leaderboard: "Leaderboard - ClassCade",
      billing: "Billing - ClassCade",
    };
    document.title = titles[screen];
  }, [screen, selectedGame]);



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

  // Puts every team back to its untouched default: 0 points, no mascot, and the original
  // index-based color/name pairing (Team Red = slot 0, Team Blue = slot 1, ...). Resets both the
  // setup-screen editing state and the live `teams` array so it works from either screen.
  const resetTeamsToNormal = () => {
    setTeamNames(DEFAULT_TEAM_NAMES.slice());
    setTeamColors([0, 1, 2, 3, 4]);
    setTeamMascots([null, null, null, null, null]);
    setTeams(ts => ts.map((t, i) => ({
      ...t,
      name: DEFAULT_TEAM_NAMES[i] ?? t.name,
      color: TEAM_COLORS[i] ?? t.color,
      mascot: null,
      score: 0,
    })));
  };

  // Saved-team picker: a roster card's "selected" state is derived from whether its name is
  // currently among the active team slots, rather than tracked as separate state — toggling a
  // card is just a quick-fill/quick-remove shortcut against the same teamNames/teamColors/
  // teamMascots/numTeams state the manual editor below already uses, so nothing downstream
  // (handleSetup, score-by-name continuity) needs to know or care where a team name came from.
  const isRosterTeamActive = (entry: TeamRosterEntry) =>
    teamNames.slice(0, numTeams).some(n => n.trim().toLowerCase() === entry.name.trim().toLowerCase());

  // Mirrors the four team-slot pieces of state, updated synchronously (not just via useEffect)
  // inside toggleRosterTeam itself — same idea as this codebase's existing pausedRef/
  // turnCorrectRef pattern. Needed because two roster cards tapped in quick succession fire
  // before React re-renders, so reading the plain state variables for index math in the second
  // call would see stale, pre-first-toggle values and corrupt the result.
  const teamSlotsRef = useRef({ names: teamNames, colors: teamColors, mascots: teamMascots, count: numTeams });
  useEffect(() => {
    teamSlotsRef.current = { names: teamNames, colors: teamColors, mascots: teamMascots, count: numTeams };
  }, [teamNames, teamColors, teamMascots, numTeams]);

  const toggleRosterTeam = (entry: TeamRosterEntry) => {
    const cap = isPaid ? 5 : FREE_PLAN_LIMITS.maxTeams;
    const { names, colors, mascots, count } = teamSlotsRef.current;
    const key = entry.name.trim().toLowerCase();
    const activeIdx = names.slice(0, count).findIndex(n => n.trim().toLowerCase() === key);

    const nextNames = [...names];
    const nextColors = [...colors];
    const nextMascots = [...mascots];
    let nextCount = count;

    if (activeIdx !== -1) {
      for (let i = activeIdx; i < count - 1; i++) {
        nextNames[i] = nextNames[i + 1];
        nextColors[i] = nextColors[i + 1];
        nextMascots[i] = nextMascots[i + 1];
      }
      nextCount = count - 1;
    } else {
      if (count >= cap) return;
      nextNames[count] = entry.name;
      const idx = TEAM_COLORS.findIndex(c => c.name === entry.color.name);
      nextColors[count] = idx === -1 ? count : idx;
      nextMascots[count] = entry.mascot;
      nextCount = count + 1;
    }

    teamSlotsRef.current = { names: nextNames, colors: nextColors, mascots: nextMascots, count: nextCount };
    setTeamNames(nextNames);
    setTeamColors(nextColors);
    setTeamMascots(nextMascots);
    setNumTeams(nextCount);
  };

  // Forgets a saved team preset for next time — deliberately leaves today's active lineup alone
  // even if that name happens to be in play right now.
  const removeFromRoster = (entry: TeamRosterEntry) => {
    if (!activeClassId) return;
    setTeamRoster(prev => prev.filter(r => r.id !== entry.id));
    deleteFromTeamRoster(activeClassId, entry.id).catch(() => {});
  };

  // Roster entries otherwise only get saved when leaving setup for game-select (handleSetup) or
  // via Save & Exit mid-game — both require picking a topic and/or a game first. This lets a
  // teacher just reorganize their saved teams (add/rename/recolor) and persist it immediately,
  // without being forced through the rest of the setup flow. Takes an explicit classId (defaulting
  // to activeClassId) rather than only reading the closure variable, so the save-picker flow below
  // can call this the instant a class is picked/created without waiting on a state update to land.
  const saveTeamsToRoster = (classId: string | null = activeClassId) => {
    if (!classId) return;
    setActiveClassId(classId);
    // Matches handleSetup's own existing-score lookup — a team whose name didn't change keeps
    // whatever score it already has, rather than this save action looking like it zeroes it out.
    const existingScores = Object.fromEntries(teams.map(t => [t.name, t.score]));
    const currentTeams = teamNames.slice(0, numTeams).map((name, i) => ({
      id: i, name, color: TEAM_COLORS[teamColors[i] ?? i], mascot: teamMascots[i] ?? null,
      score: existingScores[name] ?? 0,
    }));
    setRosterSaveStatus("saving");
    upsertTeamRoster(classId, currentTeams)
      .then(merged => {
        setTeamRoster(merged);
        setRosterSaveStatus("saved");
        setTimeout(() => setRosterSaveStatus("idle"), 1400);
      })
      .catch(() => setRosterSaveStatus("idle"));
  };

  // Game-select equivalent — here `teams` already IS the live, scored session (unlike setup,
  // where scores are still keyed off the previous session by name until handleSetup runs), so
  // this checkpoints those real scores to classes.teams as well as syncing the roster, with no
  // in-progress-game bookkeeping touched (no specific game has been chosen yet on this screen).
  // Same explicit-classId reasoning as saveTeamsToRoster above.
  const saveTeamsToClass = (classId: string | null = activeClassId) => {
    if (!classId) return;
    setActiveClassId(classId);
    setTeamsSaveStatus("saving");
    Promise.all([
      saveTeams(classId, teams),
      upsertTeamRoster(classId, teams).then(setTeamRoster),
    ])
      .then(() => {
        setTeamsSaveStatus("saved");
        setTimeout(() => setTeamsSaveStatus("idle"), 1400);
      })
      .catch(() => setTeamsSaveStatus("idle"));
  };

  // Index of the game card currently lit up mid-spin, or null when no spin is running.
  const [randomSpinIndex, setRandomSpinIndex] = useState<number | null>(null);
  const randomSpinTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (randomSpinTimeoutRef.current !== null) window.clearTimeout(randomSpinTimeoutRef.current);
    };
  }, []);

  // Wheel-style reveal: hops the highlight across the game cards, starting fast and easing to a
  // stop on the randomly chosen game, then launches it — same picture as a spinning prize wheel.
  const playRandomGame = () => {
    if (loadingGame || randomSpinIndex !== null) return;

    const targetIndex = Math.floor(Math.random() * GAME_MODES.length);
    const totalSteps = GAME_MODES.length * 3 + targetIndex;

    const runStep = (step: number) => {
      setRandomSpinIndex(step % GAME_MODES.length);

      if (step >= totalSteps) {
        randomSpinTimeoutRef.current = window.setTimeout(() => {
          setRandomSpinIndex(null);
          startGame(GAME_MODES[targetIndex]);
        }, 500);
        return;
      }

      const progress = step / totalSteps;
      const delay = 45 + progress * progress * 280;
      randomSpinTimeoutRef.current = window.setTimeout(() => runStep(step + 1), delay);
    };

    runStep(0);
  };

  // "Start New Game" from My Classes — brings the class's persistent roster/scores into the
  // normal setup flow, same as if the teacher had typed those names in themselves.
  const startWithClass = (cls: SavedClass) => {
    setActiveClassId(cls.id);
    // Pre-selects step 1 of Game Setup with this class's own level, so a teacher who already told
    // us "this is my B2 class" doesn't have to re-pick it every single time they start a game.
    setLevel(cls.default_level ?? "all");
    setTeamRoster(cls.team_roster ?? []);
    if (cls.teams.length > 0) {
      setNumTeams(cls.teams.length);
      setTeamNames(prev => {
        const next = [...prev];
        cls.teams.forEach((t, i) => { next[i] = t.name; });
        return next;
      });
      setTeamColors(prev => {
        const next = [...prev];
        cls.teams.forEach((t, i) => {
          const idx = TEAM_COLORS.findIndex(c => c.name === t.color.name);
          next[i] = idx === -1 ? i : idx;
        });
        return next;
      });
      setTeamMascots(prev => {
        const next = [...prev];
        cls.teams.forEach((t, i) => { next[i] = t.mascot ?? null; });
        return next;
      });
      setTeams(cls.teams);
    }
    setScreen("setup");
  };

  // "Resume" from My Classes — skips setup/game-select entirely and drops straight back into
  // the exact game, teams, topics, and question pool that were in play when it was saved.
  const resumeClass = (cls: SavedClass) => {
    setActiveClassId(cls.id);
    setTeams(cls.teams);
    setSelectedTopics(cls.selected_topics ?? []);
    setLevel(cls.level ?? "all");
    setFocus(cls.focus ?? "all");
    setSelectedGame(GAME_MODES.find(g => g.id === cls.selected_game) ?? null);
    setQuestions(cls.questions_snapshot ?? []);
    setMinefieldGridData((cls.minefield_grid_data as MinefieldGridData | MinefieldGridData[] | null) ?? null);
    setResumeGameState(cls.game_state ?? null);
    setScreen("game");
  };

  // One button for the "sorry class, that's all the time we have today" moment — saves the exact
  // in-progress state, then backs out to My Classes so there's nothing left to accidentally keep
  // playing (and scoring) against an already-saved snapshot. A save that fails leaves the teacher
  // right where they were, so they can just try again.
  const saveToClass = async (classId: string) => {
    if (!selectedGame) return;
    setActiveClassId(classId);
    setSaveStatus("saving");
    try {
      await saveProgress(classId, {
        teams,
        selectedTopics,
        selectedGame: selectedGame.id,
        level,
        focus,
        questionsSnapshot: questions,
        minefieldGridData,
        gameState: serializeStateRef.current?.() ?? null,
      });
      upsertTeamRoster(classId, teams).then(setTeamRoster).catch(() => {});
      setSaveStatus("saved");
      setTimeout(() => { setSaveStatus("idle"); setScreen("classes"); }, 900);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  // Games started directly (not via "My Classes") have no activeClassId yet — instead of hiding
  // a save button entirely in that case, open a quick pick-or-create prompt so the save still
  // lands somewhere, then behaves exactly like a class-linked save from then on. Shared by all
  // three save actions (mid-game Save & Exit, setup's "Save teams to class", game-select's
  // "Save teams to class") — pendingSaveAction remembers which one to actually run once a class
  // comes back from the picker.
  const openSavePicker = (action: "exit" | "roster" | "teams") => {
    setPendingSaveAction(action);
    setPickerError(null);
    setPickerClasses(null);
    setShowSavePicker(true);
    listClasses()
      .then(setPickerClasses)
      .catch(err => setPickerError(err instanceof Error ? err.message : "Couldn't load your classes."));
  };

  const handleSaveAndExit = () => {
    if (!selectedGame) return;
    if (activeClassId) {
      saveToClass(activeClassId);
      return;
    }
    openSavePicker("exit");
  };

  // Setup screen's "Save teams to class" — see openSavePicker above.
  const handleSaveTeamsToRoster = () => {
    if (activeClassId) {
      saveTeamsToRoster(activeClassId);
      return;
    }
    openSavePicker("roster");
  };

  // Game-select screen's "Save teams to class" — see openSavePicker above.
  const handleSaveTeamsToClass = () => {
    if (activeClassId) {
      saveTeamsToClass(activeClassId);
      return;
    }
    openSavePicker("teams");
  };

  // Runs whichever save action was pending once a class has actually been picked/created — an
  // explicit classId (not the activeClassId closure, which won't have updated yet) so each save
  // function links the class and acts in the same call.
  const dispatchPendingSave = (classId: string) => {
    const action = pendingSaveAction;
    setPendingSaveAction(null);
    if (action === "roster") saveTeamsToRoster(classId);
    else if (action === "teams") saveTeamsToClass(classId);
    else saveToClass(classId);
  };

  const handlePickClassForSave = (cls: SavedClass) => {
    setShowSavePicker(false);
    dispatchPendingSave(cls.id);
  };

  const handleCreateClassForSave = async () => {
    if (!pickerNewName.trim()) return;
    setPickerBusy(true);
    setPickerError(null);
    try {
      const created = await createClass(pickerNewName.trim(), pickerNewSchool.trim() || null, pickerNewLevel === "all" ? null : pickerNewLevel);
      setPickerNewName("");
      setPickerNewSchool("");
      setPickerNewLevel("all");
      setShowSavePicker(false);
      dispatchPendingSave(created.id);
    } catch (err) {
      setPickerError(err instanceof Error ? err.message : "Couldn't create the class.");
    } finally {
      setPickerBusy(false);
    }
  };

  // The picker can now be triggered from setup, game-select, or mid-game (see openSavePicker
  // above) — each of those screens is its own early-return render branch (not shared JSX), so
  // this has to be called from all three rather than living inline in just one of them.
  const renderSavePicker = () => (
    showSavePicker && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(15,10,46,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "20px" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "24px", maxWidth: "420px", width: "100%", maxHeight: "80vh", overflowY: "auto", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
          <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 900, color: theme.heroBg[0], fontFamily: theme.headingFont }}>Save to which class?</h3>
          <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6B7280" }}>Pick an existing class, or create a new one — you'll return to it later from "My Classes."</p>

          {pickerError && <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", marginBottom: "12px" }}>{pickerError}</div>}

          {pickerClasses === null ? (
            <div style={{ textAlign: "center", color: "#6B7280", padding: "16px 0" }}>Loading your classes…</div>
          ) : pickerClasses.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {pickerClasses.map(cls => (
                <button
                  key={cls.id} onClick={() => handlePickClassForSave(cls)}
                  style={{ textAlign: "left", background: "#F0F9FF", border: "2px solid #E5E7EB", borderRadius: "10px", padding: "10px 14px", cursor: "pointer", fontWeight: 700, color: theme.heroBg[0], fontSize: "14px" }}
                >
                  {cls.name}
                  {cls.in_progress && <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 500, fontSize: "12px", color: "#B45309", marginTop: "2px" }}><Icon name="warning" size={11} /> Has a game in progress — saving here will replace it</span>}
                </button>
              ))}
            </div>
          ) : null}

          {!isPaid && pickerClasses !== null && pickerClasses.length >= FREE_PLAN_LIMITS.maxClasses ? (
            <div style={{ background: "#F0F9FF", border: "2px dashed #93C5FD", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", color: "#374151", fontWeight: "700", marginBottom: "8px" }}>Free plan is limited to {FREE_PLAN_LIMITS.maxClasses} class. Upgrade for unlimited classes.</div>
              <button
                onClick={() => { setShowSavePicker(false); setScreen("billing"); }}
                style={{ background: `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: "white", border: "none", borderRadius: "10px", padding: "8px 16px", fontWeight: 800, cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Icon name="gem" size={14} /> Upgrade
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                value={pickerNewName} onChange={e => setPickerNewName(e.target.value)} placeholder="e.g. Tuesday B2 Advanced"
                style={{ padding: "10px 12px", borderRadius: "10px", border: "2px solid #E5E7EB", fontSize: "14px" }}
              />
              <input
                value={pickerNewSchool} onChange={e => setPickerNewSchool(e.target.value)} placeholder="School (optional)"
                style={{ padding: "10px 12px", borderRadius: "10px", border: "2px solid #E5E7EB", fontSize: "14px" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "700", marginRight: "2px" }}>Level:</span>
                {LEVELS_META.map(l => (
                  <button
                    key={l.id} type="button" onClick={() => setPickerNewLevel(l.id)}
                    style={{
                      background: pickerNewLevel === l.id ? l.color : "white",
                      color: pickerNewLevel === l.id ? "white" : "#374151",
                      border: `2px solid ${pickerNewLevel === l.id ? l.color : "#E5E7EB"}`,
                      borderRadius: "8px", padding: "5px 10px", cursor: "pointer", fontWeight: "700", fontSize: "12px",
                    }}
                  >
                    {l.id === "all" ? "Any" : l.id}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCreateClassForSave} disabled={pickerBusy || !pickerNewName.trim()}
                style={{ background: `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: "white", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: 800, cursor: pickerBusy ? "default" : "pointer", opacity: pickerBusy || !pickerNewName.trim() ? 0.6 : 1, fontFamily: theme.headingFont }}
              >
                + New
              </button>
            </div>
          )}

          <button onClick={() => setShowSavePicker(false)} style={{ marginTop: "16px", background: "none", border: "none", color: "#9CA3AF", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    )
  );

  const handleSetup = () => {
    setLoadError("");

    if (selectedTopics.length === 0) {
      setLoadError("Choose at least one topic.");
      return;
    }

    const existingScores = Object.fromEntries(teams.map(t => [t.name, t.score]));
    const builtTeams = teamNames.slice(0, numTeams).map((name, i) => ({
      id: i, name, color: TEAM_COLORS[teamColors[i] ?? i], mascot: teamMascots[i] ?? null,
      score: existingScores[name] ?? 0,
    }));
    setTeams(builtTeams);
    if (activeClassId) upsertTeamRoster(activeClassId, builtTeams).then(setTeamRoster).catch(() => {});
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
    // Every fresh game launch (as opposed to "Resume") starts cold — clears out any snapshot left
    // over from an earlier resume in this same session so it can never leak into an unrelated game.
    setResumeGameState(null);
    setPaused(false);

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
      } else if (mode.id === "spy") {
        // Tagged with which selected topic each round came from (by TOPIC_OPTIONS value, looked up
        // per-topic rather than zipped by index against selectedEntries, since that array silently
        // drops any topic value that doesn't resolve in TOPIC_LIBRARY and would misalign a zip) —
        // SpyAmongUsGame uses this to scope its guess options to "same topic" instead of the whole
        // mixed pool.
        qs = mixByTopic(selectedTopics.map(value => {
          const entry = TOPIC_LIBRARY[value as keyof typeof TOPIC_LIBRARY] as TopicLibraryEntry | undefined;
          return (entry?.spyRounds ?? []).map(r => ({ ...r, spySourceTopic: value }));
        }));
      } else if (mode.id === "zombie") {
        // Zombie Siege reuses Spy Among Us's spyRounds content (crewmateTopic/crewmatePrompt) for
        // its sentence-response prompts — short grammar-topic labels with a scenario/example-word
        // cue, not the fixed-answer drill format the other mixed-pool games use. Tagging follows
        // the same per-topic-lookup reasoning as the "spy" branch above.
        // Also merges in a three-tier easy on-ramp (per teacher request), mapped onto the same
        // crewmateTopic/crewmatePrompt shape so SiegeQuestionCard needs no structural changes:
        // - halfSentences where a topic has it (sentence-starter items a team completes aloud),
        //   tagged type:"finish the sentence" — authored for every topic in the library.
        // - every topic's own cardTasks (already guaranteed non-empty, see the Card Shuffle
        //   round-shortfall fix), tagged type:"speaking task" — a single open task with no
        //   crewmate/spy roleplay framing, so it reads as easier than the full spyRounds prompt
        //   even though it's not grammar-scoped the way halfSentences is.
        // ZombieSiegeGame's own round-based picking logic (pickNextQuestion) is what actually
        // prefers one tier over another for a given round; topics missing a tier just fall through
        // to the next one down, all the way to spyRounds exactly as before any of this existed.
        qs = mixByTopic(selectedTopics.map(value => {
          const entry = TOPIC_LIBRARY[value as keyof typeof TOPIC_LIBRARY] as TopicLibraryEntry | undefined;
          return [
            ...(entry?.spyRounds ?? []).map(r => ({ ...r, spySourceTopic: value })),
            ...(entry?.halfSentences ?? []).map(h => ({
              // crewmateTopic is set to the starter/task itself (never displayed for this type —
              // see SiegeQuestionCard) purely so pickNextQuestion's "don't immediately repeat the
              // same crewmateTopic" dedup logic treats each item as distinct, instead of every
              // item in a tier colliding under one shared label.
              type: "finish the sentence" as const,
              crewmateTopic: h.starter,
              crewmatePrompt: h.starter,
              hint: h.hint,
              answer: h.exampleCompletion,
              spySourceTopic: value,
            })),
            ...(entry?.cardTasks ?? []).map(ct => ({
              type: "speaking task" as const,
              crewmateTopic: ct.task,
              crewmatePrompt: ct.task,
              spySourceTopic: value,
            })),
          ];
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
      } else if (mode.id === "castle" || mode.id === "racetrack" || mode.id === "whack" || mode.id === "rocket") {
        qs = mixByTopic(selectedEntries.map((entry, index) => [...(entry.questions ?? []), ...cardTaskBuckets[index]]));
      } else if (mode.id === "vault") {
        // Tagged with which selected topic each question came from (by TOPIC_OPTIONS value, looked
        // up per-topic rather than zipped by index against selectedEntries — same reasoning as
        // spy/zombie above). VaultHeistGame needs this because generic transform tags like
        // "negative"/"question" are shared across dozens of topics spanning many different tenses;
        // without knowing the source topic it can't scope a lock's category to one specific tense.
        qs = mixByTopic(selectedTopics.map(value => {
          const entry = TOPIC_LIBRARY[value as keyof typeof TOPIC_LIBRARY] as TopicLibraryEntry | undefined;
          return [...(entry?.questions ?? []), ...cardTasksAsQuestions(entry?.cardTasks ?? [])].map(q => ({ ...q, sourceTopic: value }));
        }));
      } else if (isTopicOnlySelection && allCardTasks.length > 0) {
        qs = mixByTopic(cardTaskBuckets);
      } else {
        qs = isMixedSelection
          ? mixByTopic(selectedEntries.map((entry, index) => [...(entry.questions ?? []), ...cardTaskBuckets[index]]))
          : mixByTopic(questionBuckets);
      }

      // Card-task ("speaking task") objects only render correctly for games using the shared
      // QuestionCard component (vault, cards, battleship, castle/racetrack/whack/rocket, and the
      // generic default branch above) or that already merge cardTasks into their own pool.
      // Auction, Spy/Zombie, Hot Seat, Hot Potato, and Order Up each expect a completely different
      // object shape (sentence/isCorrect, crewmateTopic/spyTopic, word, prompt/answer, ticket
      // shape) - silently substituting cardTasks here for those games renders broken/empty content
      // (e.g. Auction showing empty quotation marks, since `s.sentence` is undefined on a
      // speaking-task object) instead of a clear "no content" message. Confirmed live: this exact
      // bug hit Auction when a topic (comparatives_superlatives) had zero auctionSentences.
      const CARDTASK_INCOMPATIBLE_MODES = new Set(["auction", "spy", "zombie", "hotseat", "hotpotato", "orderup"]);
      if (qs.length === 0 && allCardTasks.length > 0 && !CARDTASK_INCOMPATIBLE_MODES.has(mode.id)) {
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

  // Registered by whichever game is currently mounted (see GameProps.forceFinalRef) so the
  // top-bar "End Game" button can push it into its own final/results phase first, instead of
  // jumping straight past it to the app-level results screen.
  const forceFinalRef = useRef<(() => boolean) | null>(null);

  // Phase 2: registered by whichever full-board-state game is currently mounted (see
  // GameProps.serializeStateRef) so "Save & Exit" can capture its exact in-progress state
  // (cracked locks, revealed tiles, etc.) instead of always saving game_state as null. Only the
  // 8 full-state-tier games register into this — the rest leave it untouched, so saving under
  // them just keeps behaving like session-level-only save (round restarts on resume).
  const serializeStateRef = useRef<(() => unknown) | null>(null);
  // The game_state snapshot restored by "Resume" (see resumeClass below), fed back in as
  // initialGameState so the freshly-mounted game can seed itself from it instead of starting
  // cold. Cleared whenever a game is started fresh (see startGame) so a stale snapshot from an
  // earlier resume can never leak into an unrelated new game.
  const [resumeGameState, setResumeGameState] = useState<unknown>(null);
  // Only meaningful for the two continuous-real-time games (Zombie Siege, Order Up) — see
  // GameProps.paused. Every other game is turn-based and has nothing running that needs a pause,
  // so the header button below only ever appears for those two.
  const [paused, setPaused] = useState(false);

  const handleGameEnd = () => {
    // The class's running scores persist either way; a naturally-finished game just has nothing
    // left to resume, so the in-progress snapshot gets cleared rather than left stale.
    if (activeClassId) clearProgress(activeClassId, teams).catch(() => {});
    setConfetti(true);
    setScreen("results");
    setTimeout(() => setConfetti(false), 4000);
  };

  // The top-bar button: try to hand off to the active game's own final screen first. Only fall
  // through to ending the whole session immediately if the game has no final phase to show, or
  // can't safely produce one right now (e.g. an elimination game with several teams still alive).
  const handleTopBarEndGame = () => {
    if (forceFinalRef.current && forceFinalRef.current()) return;
    handleGameEnd();
  };

  // Dense rank on score — two teams tied for first both get gold and share the "wins" headline
  // instead of an arbitrary array-order winner (the old `sort()[0]` picked one team as "the
  // winner" even when another team had the exact same score).
  const finalRanking = teams.length ? denseRank(teams, t => t.score).sort((a, b) => b.value - a.value) : [];
  const winners = finalRanking.filter(r => r.rank === 0).map(r => r.item);

  if (screen === "welcome") return (
    <div ref={appRef} style={{ minHeight: "100vh", position: "relative", background: `linear-gradient(160deg,${theme.heroBg[0]} 0%,${theme.heroBg[1]} 45%,${theme.heroBg[2]} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px 24px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <ThemeAmbience themeId={theme.id} />
      <div style={{ maxWidth: "680px", width: "100%", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: "28px" }}>
          <Icon name="joystick" size={64} color="#FCD34D" style={{ marginBottom: "14px", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }} />
          <h1 style={{ fontSize: "clamp(34px,6.5vw,60px)", fontWeight: "900", color: "white", margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.1, textShadow: "0 2px 24px rgba(0,0,0,0.4)", fontFamily: theme.headingFont }}>
            Class<span style={{ color: "#FCD34D" }}>Cade</span>
          </h1>
          <p style={{ color: theme.accent[1], fontSize: "clamp(15px,2.5vw,18px)", margin: "0", lineHeight: 1.7, maxWidth: "500px", marginLeft: "auto", marginRight: "auto" }}>
            {realTopicOptions.length}+ built-in topics from A1 to C1 across Grammar, Vocabulary & Speaking.<br />
            {GAME_MODES.length} competitive game modes. Zero prep. Ready in seconds.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
          {([{ icon: "target", label: `${GAME_MODES.length} Game Modes` }, { icon: "books", label: `${realTopicOptions.length}+ Built-in Topics` }, { icon: "trophy", label: "Up to 5 Teams" }, { icon: "bolt", label: "Instant Play" }] as { icon: IconName; label: string }[]).map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "20px", padding: "8px 16px", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: "7px" }}>
              <Icon name={s.icon} size={16} color="white" />
              <span style={{ color: "white", fontWeight: "700", fontSize: "13px" }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "8px", marginBottom: "32px" }}>
          {GAME_MODES.map(g => (
            <div key={g.id} style={{ background: "rgba(255,255,255,0.08)", borderRadius: "12px", padding: "10px 12px", border: "1px solid rgba(255,255,255,0.15)", display: "flex", flexDirection: "column", gap: "4px", backdropFilter: "blur(6px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <Icon name={GAME_ICONS[g.id]} size={20} color={g.color} />
                <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: "600", fontSize: "13px", textAlign: "left", lineHeight: 1.3, fontFamily: theme.headingFont }}>{g.name}</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px", textAlign: "left", lineHeight: 1.35 }}>{g.tag}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => { setActiveClassId(null); setScreen("setup"); }} style={{ background: `linear-gradient(135deg,${theme.cta[0]},${theme.cta[1]})`, color: "white", border: "none", borderRadius: "16px", padding: "18px 56px", fontSize: "20px", fontWeight: "900", cursor: "pointer", boxShadow: `0 8px 32px ${hexToRgba(theme.cta[1], 0.45)}`, letterSpacing: "0.01em", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "8px" }}><Icon name="rocket" size={20} /> Start a Game</button>
          <button onClick={() => setScreen("classes")} style={{ background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "16px", padding: "18px 40px", fontSize: "18px", fontWeight: "800", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "8px" }}><Icon name="books" size={18} /> My Classes</button>
          <button onClick={() => { setLearnFilter(null); setScreen("learn"); }} style={{ background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "16px", padding: "18px 40px", fontSize: "18px", fontWeight: "800", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "8px" }}><Icon name="learn" size={18} /> Learn</button>
          <button onClick={() => { setLessonPlanTopicId(null); setScreen("lessonplan"); }} style={{ background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "16px", padding: "18px 40px", fontSize: "18px", fontWeight: "800", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "8px" }}><Icon name="school" size={18} /> Lesson Plans</button>
          <button onClick={() => setScreen("leaderboard")} style={{ background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "16px", padding: "18px 40px", fontSize: "18px", fontWeight: "800", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "8px" }}><Icon name="trophy" size={18} /> Leaderboard</button>
          <button onClick={() => setScreen("profile")} style={{ background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "16px", padding: "18px 40px", fontSize: "18px", fontWeight: "800", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "8px" }}><Icon name="person" size={18} /> My Profile</button>
          {/* Hidden during the free-launch phase — see FREE_LAUNCH_ALL_PREMIUM in data/constants.ts.
              Everyone already has premium, so there's nothing useful for this button to show (and
              clicking into BillingScreen would render a confusing paid-but-no-real-subscription
              state). Just delete this guard clause to bring it back once billing is re-enabled. */}
          {!FREE_LAUNCH_ALL_PREMIUM && (
            <button onClick={() => setScreen("billing")} style={{ background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "16px", padding: "18px 40px", fontSize: "18px", fontWeight: "800", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "8px" }}><Icon name="gem" size={18} /> {isPaid ? "My Plan" : "Upgrade"}</button>
          )}
        </div>
      </div>
      <FeedbackButton />
      <BrandBadge isPaid={isPaid} />
    </div>
  );

  if (screen === "classes") return (
    <>
      <ClassesScreen
        onBack={() => setScreen("welcome")}
        onResumeClass={resumeClass}
        onStartWithClass={startWithClass}
        theme={theme}
        isPaid={isPaid}
        onUpgrade={() => setScreen("billing")}
      />
      <FeedbackButton />
      <BrandBadge isPaid={isPaid} />
    </>
  );

  if (screen === "leaderboard") return (
    <>
      <LeaderboardScreen onBack={() => setScreen("welcome")} theme={theme} />
      <FeedbackButton />
      <BrandBadge isPaid={isPaid} />
    </>
  );

  if (screen === "profile") return (
    <>
      <ProfileScreen onBack={() => setScreen("welcome")} theme={theme} onThemeChange={onThemeChange} isPaid={isPaid} onUpgrade={() => setScreen("billing")} />
      <FeedbackButton />
      <BrandBadge isPaid={isPaid} />
    </>
  );

  if (screen === "billing") return (
    <>
      <BillingScreen
        onBack={() => setScreen("welcome")}
        theme={theme}
        subscription={subscription}
        onSubscriptionChange={onSubscriptionChange}
        justReturnedFrom={checkoutRedirect}
      />
      <FeedbackButton />
      <BrandBadge isPaid={isPaid} />
    </>
  );

  if (screen === "learn") return (
    <>
      <LearnScreen
        onBack={() => setScreen(learnFilter ? "game-select" : "welcome")}
        theme={theme}
        filterTopicIds={learnFilter ?? undefined}
        onOpenLessonPlan={id => { setLessonPlanTopicId(id); setScreen("lessonplan"); }}
      />
      <FeedbackButton />
      <BrandBadge isPaid={isPaid} />
    </>
  );

  if (screen === "lessonplan") return (
    <>
      <LessonPlanScreen
        onBack={() => setScreen("welcome")}
        theme={theme}
        initialTopicId={lessonPlanTopicId}
      />
      <FeedbackButton />
      <BrandBadge isPaid={isPaid} />
    </>
  );

  if (screen === "setup") {
    const filteredTopics = getFilteredTopicOptions(level, focus).filter(o => matchesTopicSearch(o.label, topicSearch));
    const TOPIC_DEFAULT_CAP = 30;
    const isSearchingTopics = topicSearch.trim() !== "";
    const topicsAreCapped = !isSearchingTopics && !showAllTopics && filteredTopics.length > TOPIC_DEFAULT_CAP;
    const visibleTopics = topicsAreCapped ? filteredTopics.slice(0, TOPIC_DEFAULT_CAP) : filteredTopics;
    const selectedTopicOptions = selectedTopics.map(getTopicOption).filter((option): option is TopicOption => Boolean(option));
    const selectedTopicSummary = selectedTopicOptions.map(o => o.label).join(", ");
    const FOCUS_META = [
      { id: "all", icon: "*", label: "All", desc: "Grammar, words & themes" },
      { id: "grammar", icon: "G", label: "Grammar", desc: "Structures & rules" },
      { id: "vocabulary", icon: "V", label: "Vocabulary", desc: "Words in context" },
      { id: "topic", icon: "T", label: "Themes", desc: "Real-world subjects" },
    ];

    return (
      <div style={{ minHeight: "100vh", background: "#F0F9FF", padding: "clamp(10px,4vw,20px)", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
        {renderSavePicker()}
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <button onClick={() => { setActiveClassId(null); setScreen("welcome"); }} style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="back" size={13} /> Back</button>

          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "900", color: theme.heroBg[0], margin: 0, fontFamily: theme.headingFont, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><Icon name="gear" size={28} /> Game Setup</h2>
            <p style={{ color: "#6B7280", marginTop: "8px" }}>Set up your class, then pick one or more topics and a game</p>
          </div>

          <div style={{ background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "16px", padding: "clamp(14px,4vw,20px)", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ background: theme.accentSolid, color: "white", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "14px", flexShrink: 0 }}>1</div>
              <div>
                <div style={{ fontWeight: "800", color: theme.heroBg[0], fontSize: "16px", fontFamily: theme.headingFont }}>What level is your class?</div>
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
              <div style={{ background: theme.accentSolid, color: "white", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "14px", flexShrink: 0 }}>2</div>
              <div>
                <div style={{ fontWeight: "800", color: theme.heroBg[0], fontSize: "16px", fontFamily: theme.headingFont }}>Grammar, Vocabulary, or Themes?</div>
                <div style={{ color: "#6B7280", fontSize: "12px", marginTop: "2px" }}>Filters the topic list below</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {FOCUS_META.map(f => (
                <button key={f.id} onClick={() => setFocus(f.id)} style={{
                  flex: 1, minWidth: "120px", background: focus === f.id ? theme.accentSolid : "white",
                  color: focus === f.id ? "white" : "#374151",
                  border: `3px solid ${focus === f.id ? theme.accentSolid : "#D1D5DB"}`,
                  borderRadius: "12px", padding: "14px 12px", cursor: "pointer",
                  textAlign: "left", transition: "all 0.15s"
                }}>
                  <div style={{ fontWeight: "800", fontSize: "16px" }}>{f.icon} {f.label}</div>
                  <div style={{ fontSize: "12px", opacity: 0.75, marginTop: "3px" }}>{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "16px", padding: "clamp(14px,4vw,20px)", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ background: theme.accentSolid, color: "white", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "14px", flexShrink: 0 }}>3</div>
              <div>
                <div style={{ fontWeight: "800", color: theme.heroBg[0], fontSize: "16px", fontFamily: theme.headingFont }}>Choose topic mix</div>
                <div style={{ color: "#6B7280", fontSize: "12px", marginTop: "2px" }}>
                  {filteredTopics.length > 0
                    ? topicsAreCapped
                      ? `Showing ${visibleTopics.length} of ${filteredTopics.length} topics - ${selectedTopics.length} selected`
                      : `${filteredTopics.length} topic${filteredTopics.length !== 1 ? "s" : ""} shown - ${selectedTopics.length} selected`
                    : topicSearch.trim() !== ""
                      ? `No topics match "${topicSearch.trim()}"`
                      : "No built-in topics match these filters"}
                </div>
              </div>
            </div>

            <div style={{ position: "relative", marginBottom: "14px" }}>
              <Icon name="search" size={15} color="#9CA3AF" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                type="text"
                value={topicSearch}
                onChange={e => setTopicSearch(e.target.value)}
                placeholder="Search topics..."
                style={{
                  width: "100%", boxSizing: "border-box", padding: "11px 40px 11px 38px",
                  border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "12px", fontSize: "14px",
                  fontWeight: "600", color: theme.heroBg[0], outline: "none",
                }}
              />
              {topicSearch !== "" && (
                <button
                  type="button"
                  onClick={() => setTopicSearch("")}
                  aria-label="Clear search"
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: hexToRgba(theme.accentSolid, 0.12), border: "none", borderRadius: "50%", width: "22px", height: "22px", color: theme.accentSolid, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Icon name="close" size={10} />
                </button>
              )}
            </div>
            {selectedTopics.length > 0 && (
              <div style={{ background: hexToRgba(theme.accentSolid, 0.12), border: `2px solid ${hexToRgba(theme.accentSolid, 0.4)}`, color: theme.accentSolid, borderRadius: "12px", padding: "10px 12px", fontWeight: "700", fontSize: "13px", marginBottom: "12px", lineHeight: 1.5 }}>
                Playing with: {selectedTopicSummary}
              </div>
            )}
            {filteredTopics.length > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                  <button type="button" onClick={clearSelectedTopics} style={{ background: "white", border: "2px solid #FCA5A5", color: "#B91C1C", borderRadius: "999px", padding: "6px 14px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>
                    Deselect all
                  </button>
                  <button type="button" onClick={selectAllVisibleTopics} style={{ background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.4)}`, color: theme.accentSolid, borderRadius: "999px", padding: "6px 14px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>
                    Select all {filteredTopics.length}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: "8px" }}>
                  {visibleTopics.map(o => {
                    const isSelected = selectedTopics.includes(o.value);
                    const levelColor = LEVELS_META.find(l => l.id === o.level)?.color || "#6366F1";
                    return (
                      <button key={o.value} onClick={() => toggleTopicSelection(o.value)} style={{
                        background: isSelected ? levelColor : "#F0F9FF",
                        color: isSelected ? "white" : theme.heroBg[0],
                        border: `2px solid ${isSelected ? levelColor : hexToRgba(theme.accentSolid, 0.25)}`,
                        borderRadius: "10px", padding: "10px 14px",
                        cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                        fontWeight: isSelected ? "800" : "700", fontSize: "13px", lineHeight: 1.4
                      }}>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
                {topicsAreCapped && (
                  <button type="button" onClick={() => setShowAllTopics(true)} style={{ width: "100%", marginTop: "10px", background: "#F0F9FF", border: `2px dashed ${hexToRgba(theme.accentSolid, 0.4)}`, color: theme.accentSolid, borderRadius: "10px", padding: "10px", fontWeight: "800", fontSize: "13px", cursor: "pointer" }}>
                    Show all {filteredTopics.length} topics
                  </button>
                )}
                {!topicsAreCapped && !isSearchingTopics && filteredTopics.length > TOPIC_DEFAULT_CAP && (
                  <button type="button" onClick={() => setShowAllTopics(false)} style={{ width: "100%", marginTop: "10px", background: "none", border: "none", color: "#6B7280", borderRadius: "10px", padding: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
                    Show fewer topics
                  </button>
                )}
              </>
            )}
          </div>

          <div style={{ background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "16px", padding: "clamp(14px,4vw,20px)", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
              <div style={{ background: theme.accentSolid, color: "white", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "14px", flexShrink: 0 }}>4</div>
              <div style={{ fontWeight: "800", color: theme.heroBg[0], fontSize: "16px", fontFamily: theme.headingFont, flex: 1, minWidth: "140px" }}>How many teams?</div>
              <button
                onClick={handleSaveTeamsToRoster} disabled={rosterSaveStatus === "saving"}
                title={activeClassId ? "Save these team names/colors/mascots to this class, without picking a topic or game" : "Pick or create a class to save these teams to"}
                style={{
                  background: rosterSaveStatus === "saved" ? "#DCFCE7" : "none",
                  border: `2px solid ${rosterSaveStatus === "saved" ? "#22C55E" : "#D1D5DB"}`,
                  borderRadius: "20px", padding: "4px 14px", fontWeight: "700", fontSize: "12px",
                  color: rosterSaveStatus === "saved" ? "#166534" : "#9CA3AF",
                  cursor: rosterSaveStatus === "saving" ? "default" : "pointer", flexShrink: 0,
                  display: "inline-flex", alignItems: "center", gap: "5px",
                }}
              >
                {rosterSaveStatus === "saving" ? "Saving…" : rosterSaveStatus === "saved" ? <><Icon name="check" size={12} /> Saved!</> : <><Icon name="save" size={12} /> Save teams to class</>}
              </button>
              <button onClick={() => resetTeamsToNormal()} title="0 points, no mascots, original colors and names" style={{ background: "none", border: "2px solid #D1D5DB", borderRadius: "20px", padding: "4px 14px", fontWeight: "700", fontSize: "12px", color: "#9CA3AF", cursor: "pointer", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "5px" }}><Icon name="refresh" size={12} /> Reset teams to normal</button>
            </div>
            {activeClassId && teamRoster.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#6B7280", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Icon name="folder" size={13} /> Saved teams for this class — tap to bring in today
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {teamRoster.map(entry => {
                    const isActive = isRosterTeamActive(entry);
                    const cap = isPaid ? 5 : FREE_PLAN_LIMITS.maxTeams;
                    const locked = !isActive && numTeams >= cap;
                    return (
                      <div key={entry.id} style={{ position: "relative" }}>
                        <button
                          type="button"
                          onClick={() => locked ? setScreen("billing") : toggleRosterTeam(entry)}
                          title={locked ? `Free plan is limited to ${cap} teams — upgrade to unlock more` : undefined}
                          style={{
                            background: isActive ? entry.color.bg : "#F0F9FF",
                            color: isActive ? "white" : "#374151",
                            border: `2px solid ${isActive ? entry.color.bg : "#D1D5DB"}`,
                            borderRadius: "999px", padding: "8px 16px 8px 12px", cursor: "pointer",
                            fontWeight: isActive ? "800" : "700", fontSize: "13px", opacity: locked ? 0.5 : 1,
                          }}
                        >
                          <TeamIcon team={entry} color={isActive ? "white" : undefined} /> {entry.name}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFromRoster(entry); }}
                          title="Remove from saved teams"
                          style={{
                            position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", borderRadius: "50%",
                            background: "#EF4444", color: "white", border: "2px solid white", fontSize: "10px", lineHeight: 1, cursor: "pointer",
                            padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        ><Icon name="close" size={9} /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
              {[1, 2, 3, 4, 5].map(n => {
                const locked = !isPaid && n > FREE_PLAN_LIMITS.maxTeams;
                return (
                  <button
                    key={n}
                    onClick={() => locked ? setScreen("billing") : setNumTeams(n)}
                    title={locked ? `Free plan is limited to ${FREE_PLAN_LIMITS.maxTeams} teams — upgrade to unlock more` : undefined}
                    style={{ background: numTeams === n ? theme.accentSolid : "white", color: numTeams === n ? "white" : locked ? "#9CA3AF" : "#374151", border: `3px solid ${numTeams === n ? theme.accentSolid : "#D1D5DB"}`, borderRadius: "12px", padding: "10px 24px", fontSize: "18px", fontWeight: "800", cursor: "pointer", opacity: locked ? 0.6 : 1, display: "inline-flex", alignItems: "center", gap: "5px" }}
                  >
                    {locked && <Icon name="lock" size={13} />}{n}
                  </button>
                );
              })}
              {!isPaid && (
                <span style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px" }}><Icon name="gem" size={13} /> Upgrade for up to 5 teams</span>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(${numTeams > 3 ? "160px" : "180px"},1fr))`, gap: "12px" }}>
              {Array.from({ length: numTeams }).map((_, i) => {
                const color = TEAM_COLORS[teamColors[i] ?? i];

                return (
                  <div key={i} style={{ border: `3px solid ${color.bg}`, borderRadius: "14px", overflow: "hidden", background: "white" }}>
                    <div style={{ background: color.bg, padding: "8px 10px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <TeamIcon team={{ mascot: teamMascots[i], color }} size={16} color="white" />
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
                    {expandedMascotTeam === i ? (
                      <div style={{ background: "white", padding: "8px 10px", borderTop: `1px solid ${color.bg}20` }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>
                          <button
                            type="button" title="No mascot"
                            onClick={() => { const next = [...teamMascots]; next[i] = null; setTeamMascots(next); setExpandedMascotTeam(null); }}
                            style={{ width: "28px", height: "28px", borderRadius: "8px", color: "#9CA3AF", background: teamMascots[i] == null ? "#F3F4F6" : "transparent", border: teamMascots[i] == null ? `2px solid ${color.bg}` : "1px solid #E5E7EB", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                          ><Icon name="close" size={12} /></button>
                          {MASCOT_OPTIONS.map(m => (
                            <button
                              key={m} type="button" title={m}
                              onClick={() => { const next = [...teamMascots]; next[i] = m; setTeamMascots(next); setExpandedMascotTeam(null); }}
                              style={{
                                width: "28px", height: "28px", borderRadius: "8px", cursor: "pointer", flexShrink: 0,
                                background: teamMascots[i] === m ? color.light : "transparent",
                                border: teamMascots[i] === m ? `2px solid ${color.bg}` : "1px solid transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            ><MascotIcon name={MASCOT_ICON_BY_EMOJI[m]} size={20} /></button>
                          ))}
                        </div>
                        <button type="button" onClick={() => setExpandedMascotTeam(null)} style={{ background: "none", border: "none", color: "#6B7280", fontWeight: "700", fontSize: "12px", cursor: "pointer", padding: "2px 0" }}>
                          Done
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setExpandedMascotTeam(i)}
                        style={{ width: "100%", boxSizing: "border-box", background: "white", padding: "8px 10px", borderTop: `1px solid ${color.bg}20`, borderLeft: "none", borderRight: "none", borderBottom: "none", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", textAlign: "left" }}
                      >
                        {teamMascots[i] ? <MascotIcon name={MASCOT_ICON_BY_EMOJI[teamMascots[i]!]} size={20} /> : <Icon name="close" size={14} color="#9CA3AF" />}
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#374151", flex: 1 }}>
                          {teamMascots[i] ? MASCOT_ICON_BY_EMOJI[teamMascots[i]!].replace(/^./, c => c.toUpperCase()) : "No mascot"}
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: "800", color: color.bg }}>Change</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {loadError && <div style={{ color: "#DC2626", fontWeight: "800", textAlign: "center", marginBottom: "12px" }}>{loadError}</div>}

          <button onClick={handleSetup} disabled={selectedTopics.length === 0} style={{ width: "100%", background: selectedTopics.length === 0 ? "#CBD5E1" : `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: "white", border: "none", borderRadius: "16px", padding: "18px", fontSize: "20px", fontWeight: "900", cursor: selectedTopics.length === 0 ? "not-allowed" : "pointer", fontFamily: theme.headingFont, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Icon name="controller" size={20} /> Choose a Game!
          </button>
        </div>
        <FeedbackButton />
        <BrandBadge isPaid={isPaid} />
      </div>
    );
  }

  if (screen === "game-select") return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      {renderSavePicker()}
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        <div style={{ background: `linear-gradient(135deg,${theme.heroBg[0]},${theme.heroBg[2]})`, borderRadius: "20px", padding: "20px 24px", marginBottom: "20px", color: "white", position: "relative", overflow: "hidden" }}>
          <ThemeAmbience themeId={theme.id} variant="compact" />
          <div style={{ textAlign: "center", marginBottom: "16px", position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: theme.accent[1], marginBottom: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Current Topic Mix</div>
            <div style={{ fontSize: "clamp(18px,4vw,26px)", fontWeight: "900", lineHeight: 1.2, fontFamily: theme.headingFont }}>
              {selectedTopics.length === 1 ? getTopicLabel(selectedTopics[0]) : `${selectedTopics.length} topics mixed`}
            </div>
            {selectedTopics.length > 1 && (
              <div style={{ color: theme.accent[1], fontWeight: "700", fontSize: "13px", marginTop: "8px", lineHeight: 1.5 }}>
                {selectedTopics.map(getTopicLabel).join(" + ")}
              </div>
            )}
            {selectedTopics.some(id => LESSONS[id]) && (
              <button
                onClick={() => { setLearnFilter(selectedTopics.filter(id => LESSONS[id])); setScreen("learn"); }}
                style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.35)", color: "white", borderRadius: "12px", padding: "8px 18px", fontSize: "13px", fontWeight: "800", cursor: "pointer", marginTop: "14px", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Icon name="bookOpen" size={14} /> Review these topics
              </button>
            )}
          </div>
        </div>

        <ScoreBoard teams={teams} headingFont={theme.headingFont} />
        {/* Below ~480px these 4 utility buttons pack into a fixed 2x2 grid instead of each
            wrapping onto its own full-width line — the flex-wrap layout above works fine on
            desktop since 2-3 fit per row naturally, but on a phone every button's text is wide
            enough to fill the row alone. */}
        <style>{`
          @media (max-width: 480px) {
            .cc-team-actions-row { display: grid !important; grid-template-columns: repeat(2,1fr) !important; }
            .cc-team-actions-row button { width: 100%; box-sizing: border-box; justify-content: center; }
          }
        `}</style>
        <div className="cc-team-actions-row" style={{ textAlign: "center", marginTop: "10px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
            <button
              onClick={handleSaveTeamsToClass} disabled={teamsSaveStatus === "saving"}
              title={activeClassId ? "Save current scores and teams to this class, in case you stop before finishing another game" : "Pick or create a class to save these teams to"}
              style={{
                background: teamsSaveStatus === "saved" ? "#DCFCE7" : "none",
                border: `2px solid ${teamsSaveStatus === "saved" ? "#22C55E" : "#D1D5DB"}`,
                borderRadius: "20px", padding: "4px 16px", fontWeight: "700", fontSize: "12px",
                color: teamsSaveStatus === "saved" ? "#166534" : "#9CA3AF",
                cursor: teamsSaveStatus === "saving" ? "default" : "pointer",
                display: "inline-flex", alignItems: "center", gap: "5px",
              }}
            >
              {teamsSaveStatus === "saving" ? "Saving…" : teamsSaveStatus === "saved" ? <><Icon name="check" size={12} /> Saved!</> : <><Icon name="save" size={12} /> Save teams to class</>}
            </button>
            <button onClick={() => setTeams(ts => ts.map(t => ({ ...t, score: 0 })))} style={{ background: "none", border: "2px solid #D1D5DB", borderRadius: "20px", padding: "4px 16px", fontWeight: "700", fontSize: "12px", color: "#9CA3AF", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}><Icon name="refresh" size={12} /> Reset all scores to 0</button>
            <button onClick={() => resetTeamsToNormal()} title="0 points, no mascots, original colors and names" style={{ background: "none", border: "2px solid #D1D5DB", borderRadius: "20px", padding: "4px 16px", fontWeight: "700", fontSize: "12px", color: "#9CA3AF", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}><Icon name="refresh" size={12} /> Reset teams to normal</button>
            <button onClick={() => setScreen("setup")} style={{ background: "none", border: "2px solid #D1D5DB", borderRadius: "20px", padding: "4px 16px", fontWeight: "700", fontSize: "12px", color: "#9CA3AF", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}><Icon name="gear" size={12} /> Edit teams & settings</button>
        </div>

        {loadError && <div style={{ color: "red", fontWeight: "bold", textAlign: "center" }}>{loadError}</div>}

        <div style={{ textAlign: "center" }}>
          <button
            onClick={playRandomGame}
            disabled={loadingGame || randomSpinIndex !== null}
            title="Not sure which game to pick? Let us choose for you."
            style={{ background: `linear-gradient(135deg,${theme.cta[0]},${theme.cta[1]})`, color: "white", border: "none", borderRadius: "14px", padding: "12px 28px", fontSize: "15px", fontWeight: "800", cursor: (loadingGame || randomSpinIndex !== null) ? "not-allowed" : "pointer", opacity: (loadingGame || randomSpinIndex !== null) ? 0.6 : 1, fontFamily: theme.headingFont, boxShadow: `0 6px 20px ${hexToRgba(theme.cta[1], 0.35)}`, display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Icon name="dice" size={15} /> {randomSpinIndex !== null ? "Picking..." : "Surprise Me! (Random Game)"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "14px", marginTop: "20px" }}>
          {GAME_MODES.map((g, i) => {
            const isSpinLit = randomSpinIndex === i;
            const tier = getGameTier(g.id);
            return (
              <div
                key={g.id}
                onClick={() => !loadingGame && randomSpinIndex === null && startGame(g)}
                style={{
                  background: isSpinLit ? `${g.color}1A` : "white",
                  border: `3px solid ${g.color}`,
                  borderRadius: "18px",
                  padding: "20px",
                  cursor: randomSpinIndex === null ? "pointer" : "default",
                  transition: "transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease",
                  transform: isSpinLit ? "scale(1.06)" : "scale(1)",
                  boxShadow: isSpinLit ? `0 0 0 4px ${g.color}55, 0 10px 24px ${g.color}55` : "none"
                }}
              >
                <div style={{ marginBottom: "10px" }}><IconBadge icon={GAME_ICONS[g.id]} color={g.color} size={52} /></div>
                <div style={{ fontWeight: "900", fontSize: "17px", color: theme.heroBg[0], marginBottom: "4px", fontFamily: theme.headingFont }}>{g.name}</div>
                <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "8px" }}>{g.desc}</div>
                <div style={{ fontSize: "12px", color: g.color, fontWeight: "700", lineHeight: 1.4, borderTop: `1px solid ${g.color}33`, paddingTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {tier && <span title={tier.label} style={{ width: "8px", height: "8px", borderRadius: "50%", background: tier.color, flexShrink: 0 }} />}
                  <Icon name="mic" size={13} /> {g.tag}
                </div>
              </div>
            );
          })}
        </div>

        <PPPDiagram variant="compact" />
      </div>
      <FeedbackButton />
      <BrandBadge isPaid={isPaid} />
    </div>
  );

  if (screen === "game" && selectedGame) {
    const selectedLevels = uniqueValues(selectedTopics.map(value => getTopicOption(value)?.level).filter((value): value is string => Boolean(value)));
    const hotPotatoLevel = selectedLevels.length === 1 ? selectedLevels[0] : "mixed";
    const orderUpLevel = hotPotatoLevel;

    return (
      <div ref={appRef} style={{ minHeight: "100vh", background: "#0F0A2E", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
        {renderSavePicker()}
        <div style={{ background: `linear-gradient(90deg,${theme.accent[0]},${theme.accent[1]})`, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: "white", margin: 0, fontSize: "20px", fontFamily: theme.headingFont, display: "flex", alignItems: "center", gap: "8px" }}><Icon name={GAME_ICONS[selectedGame.id]} size={20} color="white" /> {selectedGame.name}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleSaveAndExit} disabled={saveStatus === "saving"}
              title="Save exactly where you are and come back to it next class"
              style={{ background: saveStatus === "saved" ? "#22C55E" : saveStatus === "error" ? "#EF4444" : "rgba(255,255,255,0.15)", color: "white", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: saveStatus === "saving" ? "default" : "pointer", fontWeight: "700", fontFamily: theme.headingFont }}
            >
              {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? <><Icon name="check" size={13} /> Saved!</> : saveStatus === "error" ? <><Icon name="warning" size={13} /> Failed — try again</> : <><Icon name="save" size={13} /> Save & Exit</>}
            </button>
            <button onClick={toggleFullscreen} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontWeight: "700", fontFamily: theme.headingFont }}><Icon name="fullscreen" size={13} /> Fullscreen</button>
            <button onClick={handleTopBarEndGame} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontWeight: "700", fontFamily: theme.headingFont }}><Icon name="checkeredFlag" size={13} /> End Game</button>
          </div>
        </div>
        <div style={{ padding: "16px", maxWidth: "900px", margin: "0 auto" }}>
          <ScoreBoard teams={teams} headingFont={theme.headingFont} />
          <div style={{ background: "white", borderRadius: "20px", padding: "20px", marginTop: "16px" }}>
            {selectedGame.id === "auction" && <AuctionGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "minefield" && <MinefieldGame questions={[]} gridData={minefieldGridData} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "hotseat" && <HotSeatGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "spy" && <SpyAmongUsGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "battleship" && <BattleshipGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "vault" && <VaultHeistGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "cards" && <CardShuffleGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "castle" && <CastleGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "hill" && <KingOfHillGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "hotpotato" && <HotPotatoGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} level={hotPotatoLevel} />}
            {selectedGame.id === "racetrack" && <RaceTrackGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "whack" && <WordWhackGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "rocket" && <RocketFuelGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} />}
            {selectedGame.id === "zombie" && <ZombieSiegeGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} paused={paused} onTogglePause={() => setPaused(p => !p)} />}
            {selectedGame.id === "orderup" && <OrderUpGame questions={questions} teams={teams} forceFinalRef={forceFinalRef} serializeStateRef={serializeStateRef} initialGameState={resumeGameState} onUpdateScore={updateScore} onEnd={handleGameEnd} level={orderUpLevel} paused={paused} onTogglePause={() => setPaused(p => !p)} />}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "results") {
    // This screen shows the running cross-game total (finalRanking is denseRank(teams, t =>
    // t.score) above), not a settled result — a class can keep playing more games afterward via
    // "Play Again"/"New Lesson", so "wins!" overstated it as final. "is winning" (current
    // standings) matches what's actually being shown; each game's own end screen is what
    // declares who won that specific game.
    const headline = winners.length > 1 ? `${winners.map(w => w.name).join(" & ")} are tied for the lead!` : `${winners[0]?.name} is winning!`;
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg,${theme.heroBg[0]},${theme.heroBg[2]})`, padding: "20px", textAlign: "center", color: "white", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
        <Confetti active={confetti} />
        <div style={{ fontSize: "80px", margin: "20px 0" }}>🏆</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: "900", margin: "0 0 8px", fontFamily: theme.headingFont }}>Game Over!</h1>
        <p style={{ color: theme.accent[1], fontSize: "18px", marginBottom: "28px" }}>{headline} 🎉</p>

        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "20px", padding: "24px", maxWidth: "600px", margin: "0 auto 24px" }}>
          {finalRanking.map(({ item: t, rank, value }, i) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 0", borderBottom: i < finalRanking.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
              <div><RankBadge rank={rank} size={32} /></div>
              <div style={{ flex: 1, textAlign: "left", fontWeight: "900", fontSize: "20px", fontFamily: theme.headingFont }}>{t.name}</div>
              <div style={{ fontWeight: "900", fontSize: "28px", color: t.color.bg }}>{value}</div>
            </div>
          ))}
        </div>
        
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setScreen("game-select")} style={{ background: `linear-gradient(135deg,${theme.cta[0]},${theme.cta[1]})`, color: "white", border: "none", borderRadius: "14px", padding: "14px 28px", fontSize: "17px", fontWeight: "800", cursor: "pointer", fontFamily: theme.headingFont }}>🎮 Play Again</button>
          <button onClick={() => setScreen("setup")} style={{ background: `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: "white", border: "none", borderRadius: "14px", padding: "14px 28px", fontSize: "17px", fontWeight: "800", cursor: "pointer", fontFamily: theme.headingFont }}>📚 New Lesson</button>
        </div>
        <FeedbackButton />
        <BrandBadge isPaid={isPaid} />
      </div>
    );
  }

  return null;
}
