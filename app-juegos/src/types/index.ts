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
    // Optional emoji mascot, picked independently of color — falls back to color.emoji
    // wherever a team's identity is shown if the team never picked one.
    mascot?: string | null;
    score: number;
  }

  // A saved "preset" team belonging to a class's roster — not a live in-game Team (no score, no
  // positional id). `id` is a stable identity independent of list position, needed since roster
  // entries get toggled in/out and deleted by identity, not by array index.
  export interface TeamRosterEntry {
    id: string;
    name: string;
    color: TeamColor;
    mascot: string | null;
  }
  
  export interface GameMode {
    id: string;
    name: string;
    icon: string;
    desc: string;
    color: string;
    tag: string;
  }

  // One beat of a game's "How to Play" walkthrough (src/data/tutorials/*.tsx) — narration in the
  // guide's speech bubble, plus a small hand-built mockup of that moment.
  export interface TutorialStep {
    narration: React.ReactNode;
    visual: React.ReactNode;
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
    // Same idea as spySourceTopic, but for VaultHeistGame's rewrite-sentence questions: which
    // selected topic (by TOPIC_OPTIONS value/key) this question came from. Needed because generic
    // transform tags like "negative"/"question" are shared across dozens of topics spanning many
    // different tenses — when topics are mixed, a lock card just saying "NEGATIVE" doesn't tell a
    // student which tense's negative form is required. VaultHeistGame uses this to scope those two
    // generic tags to a per-topic category instead of pooling every topic's negatives together.
    sourceTopic?: string;
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
    // "Save Progress" support — every game wires this up now (as of the fix for saved games
    // always resuming at round 1). A game that registers this ref should return a
    // JSON-serializable snapshot of whatever internal state it needs to fully restore itself
    // later; "Resume" seeds initialGameState from that snapshot and the game should drop back
    // into a safe start-of-turn point, not try to replay the exact mid-timer/mid-animation moment
    // that was on screen when it was saved.
    serializeStateRef?: React.MutableRefObject<(() => unknown) | null>;
    // A previously-saved snapshot (from serializeStateRef) to seed this game's initial state with,
    // instead of starting fresh. Only meaningful to games that also implement serializeStateRef.
    initialGameState?: unknown;
    lessonContent?: string;
    level?: string;
    isTopic?: boolean;
    gridData?: any; // Específico para el Minefield
    // Only wired up for the two games driven by a continuous real-time clock that never stops on
    // its own even between turns (Zombie Siege, Order Up) — every other game is turn-based, so its
    // own timer already sits idle whenever nobody's clock is running, and the shared top-bar
    // Pause button (rendered in LessonGamesGenerator.tsx, not here) only appears for those two.
    // A game that accepts this prop should freeze whatever real-time thing it runs (zombies
    // advancing, ticket countdowns) while true, and render its own "Paused" overlay — clicking the
    // overlay should call onTogglePause to resume, matching the shared button.
    paused?: boolean;
    onTogglePause?: () => void;
  }

  // A teacher's own personalization — separate from auth.users, which only holds login info.
  // Auto-created (blank) by a database trigger the moment an account signs up, so the app never
  // needs to check-and-create one before reading/writing display_name.
  export interface Profile {
    id: string;
    display_name: string | null;
    // References data/themes.ts's Theme.id — a preset accent for the app's shared (non-game)
    // screens, not the individual games, which each keep their own fixed visual identity.
    theme_id: string;
    // False only for brand-new signups — flips to true the moment they pick Free or Upgrade on
    // PlanIntroScreen, so it's shown exactly once per account. Defaults to false for new rows and
    // was backfilled to true for every account that existed before this field was added.
    has_completed_plan_intro: boolean;
    created_at: string;
    updated_at: string;
  }

  // The teacher's billing state — a separate table from Profile (not columns on it) so it can be
  // locked down harder: the client can read its own row but can never write one directly, only
  // the Stripe/promo-code Edge Functions (via the service-role key) can. `status` drives whether
  // free-tier limits apply; `provider` distinguishes a real Stripe subscription from a promo grant
  // (and future payment providers like Mercado Pago) without needing separate boolean flags.
  export interface Subscription {
    status: "free" | "active" | "trialing" | "past_due" | "canceled" | "unpaid";
    plan: "monthly" | "annual" | "promo" | null;
    currentPeriodEnd: string | null;
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
    // The class's own level, set once at creation and independent of `level` below (which is
    // scoped to whatever game happens to be in progress and gets cleared when it ends) — this is
    // what pre-selects step 1 of Game Setup whenever a game starts with this class.
    default_level: string | null;
    teams: Team[];
    // Every team ever actually played under this class, accumulated automatically — a separate,
    // persistent library `teams` above isn't: `teams` is just the live/current session's set.
    team_roster: TeamRosterEntry[];
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
