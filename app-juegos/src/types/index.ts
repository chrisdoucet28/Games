export interface TeamColor {
    name: string;
    bg: string;
    light: string;
    dark: string;
    emoji: string;
  }
  
  export interface Team {
    id: string | number;
    name: string;
    color: TeamColor;
    score: number;
  }
  
  export interface GameMode {
    id: string;
    name: string;
    icon: string;
    desc: string;
    color: string;
    tag: string;
  }
  
  // Representa los distintos formatos de preguntas/tareas dependiendo del juego
  export interface QuestionData {
    type?: string;
    question?: string;
    task?: string;
    answer?: string;
    hint?: string;
    difficulty?: string;
    transform?: string;
    form?: "positive" | "negative" | "question";
    word?: string;
    sentence?: string;
    isCorrect?: boolean;
    explanation?: string;
    prompt?: string;
    spanish?: string;
    spyPrompt?: string;
    crewmatePrompt?: string;
    crewmateTopic?: string;
    spyTopic?: string;
    spyGuessOptions?: string[];
    // Which selected topic (by its TOPIC_OPTIONS value/key) a spyRounds entry came from — tagged in
    // LessonGamesGenerator.tsx before the per-topic buckets get mixed together, so SpyAmongUsGame
    // can scope its guess options back down to "everything from this one topic" instead of the
    // whole mixed pool.
    spySourceTopic?: string;
  }
  
  export interface GameProps {
    questions: QuestionData[];
    teams: Team[];
    onUpdateScore: (teamId: string | number, delta: number) => void;
    onEnd: () => void;
    // Lets the top-bar "End Game" button push a game into its own internal final/results phase
    // (where one exists) instead of jumping straight to the app-level results screen. The
    // registered function should return true once it has safely transitioned the game to that
    // phase, or false if the game can't produce a valid final screen right now (e.g. an
    // elimination-style game with more than one team still alive) — false tells the caller to
    // fall back to ending the game immediately, same as before this existed.
    forceFinalRef?: React.MutableRefObject<(() => boolean) | null>;
    // "Save Progress" support (Phase 2, per-game rollout) — only wired up by games with a real
    // persistent board worth resuming exactly (Vault Heist, Castle Defense, Minefield, Battleship,
    // King of the Hill, Race Track, Card Shuffle, Spy Among Us). A game that registers this ref
    // should return a JSON-serializable snapshot of whatever internal state it needs to fully
    // restore itself later. Games driven by a continuous real-time clock or hidden multi-phase
    // sequence (Rocket Fuel, Order Up, Zombie Siege, Hot Potato, Word Whack, Hot Seat) don't wire
    // this up at all — resuming those just restarts the round fresh, which is the correct behavior
    // for them, not a missing feature.
    serializeStateRef?: React.MutableRefObject<(() => unknown) | null>;
    // A previously-saved snapshot (from serializeStateRef) to seed this game's initial state with,
    // instead of starting fresh. Only meaningful to games that also implement serializeStateRef.
    initialGameState?: unknown;
    lessonContent?: string;
    level?: string;
    isTopic?: boolean;
    gridData?: any; // Específico para el Minefield
  }

  // A teacher's own personalization — separate from auth.users, which only holds login info.
  // Auto-created (blank) by a database trigger the moment an account signs up, so the app never
  // needs to check-and-create one before reading/writing display_name.
  export interface Profile {
    id: string;
    display_name: string | null;
    created_at: string;
    updated_at: string;
  }

  // A persistent, named "class" a teacher returns to repeatedly (e.g. "Tuesday B2 Advanced").
  // Team scores accumulate across sessions; at most one unfinished game is tracked at a time
  // (in_progress + the fields after it) — no history of past finished games is kept.
  // `school` lives here rather than on the teacher's profile — a teacher can work at more than
  // one school (or have private students), so "which school" is a property of a specific class,
  // not a single fixed fact about the teacher.
  export interface SavedClass {
    id: string;
    user_id: string;
    name: string;
    school: string | null;
    teams: Team[];
    in_progress: boolean;
    selected_topics: string[] | null;
    selected_game: string | null;
    level: string | null;
    focus: string | null;
    questions_snapshot: QuestionData[] | null;
    // Minefield uses a grid (or array of grids), not `questions` — needs its own snapshot slot
    // since it's the "question content" equivalent for that one game.
    minefield_grid_data: unknown | null;
    game_state: unknown | null;
    created_at: string;
    updated_at: string;
  }
