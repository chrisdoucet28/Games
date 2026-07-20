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
    earlyEndRef?: React.MutableRefObject<(() => void) | null>;
    lessonContent?: string;
    level?: string;
    isTopic?: boolean;
    gridData?: any; // Específico para el Minefield
  }
