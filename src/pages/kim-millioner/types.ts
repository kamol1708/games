export type GradeBand = '5-7' | '8-9' | '10-11'

export type Subject = 'math' | 'english' | 'science' | 'history' | 'geography'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type QuestionType = 'mcq' | 'true_false' | 'numeric'

export type TeamColor =
  | '#22d3ee'
  | '#fb7185'
  | '#facc15'
  | '#86efac'
  | '#a78bfa'
  | '#f97316'

export type Question = {
  id: string
  subject: Subject
  gradeBand: GradeBand
  difficulty: Difficulty
  type: QuestionType
  text: string
  options: [string, string, string, string]
  correctIndex: number
  numericAnswer?: number
  explanation: string
}

export type TeamRunState = {
  id: string
  name: string
  color: TeamColor
  currentQuestionIndex: number
  currentWinnings: number
  safeMilestoneWinnings: number
  lifelinesUsed: {
    fiftyFifty: boolean
    askAudience: boolean
    phoneFriend: boolean
  }
  eliminated: boolean
  reentryCooldown: number
  roundsWon: number
}

export type LifelineMode = 'PER_TEAM' | 'SHARED'
export type PlayMode = 'TURN_BASED' | 'BUZZER'
export type WinMode = 'FIRST_MILLION' | 'HIGHEST_AFTER_N' | 'BEST_OF_ROUNDS'

export type Settings = {
  teamCount: 2 | 3 | 4
  gradeBand: GradeBand
  enabledSubjects: Record<Subject, boolean>
  timerEnabled: boolean
  timerSeconds: number
  negativeMarking: boolean
  buzzerMode: boolean
  buzzerWrongAllowsRebuzz: boolean
  allowPass: boolean
  passPenalty: number
  timeoutBehavior: 'WRONG' | 'PASS_NEXT'
  wrongAnswerPolicy: 'ELIMINATE' | 'REENTRY_AFTER_CYCLE'
  lifelineMode: LifelineMode
  sharedLifelinesUsed: {
    fiftyFifty: boolean
    askAudience: boolean
    phoneFriend: boolean
  }
  enableTrueFalse: boolean
  enableNumeric: boolean
  showExplanationAfterReveal: boolean
  teacherPinEnabled: boolean
  teacherPin: string
  winMode: WinMode
  totalQuestionsLimit: number
  bestOfRounds: number
}

export type Phase = 'SETUP' | 'READY' | 'QUESTION' | 'LOCKED' | 'REVEAL' | 'ROUND_END' | 'GAME_END'

export type EventLogItem = {
  id: string
  at: string
  text: string
}

export type SessionStats = {
  totalQuestionsAsked: number
  bestTeamScore: number
}

export type GameState = {
  phase: Phase
  settings: Settings
  teams: TeamRunState[]
  activeTeamId: string | null
  buzzedTeamId: string | null
  currentQuestion: Question | null
  usedQuestionIds: string[]
  hiddenOptionIndexes: number[]
  selectedOptionIndex: number | null
  answerRevealed: boolean
  isCorrect: boolean | null
  timerLeft: number
  timerPaused: boolean
  pauseReason: 'none' | 'audience' | 'friend' | 'teacher'
  audiencePoll: [number, number, number, number] | null
  friendSuggestion: { optionIndex: number; confidence: number } | null
  logs: EventLogItem[]
  questionCounter: number
  cycleTurnCounter: number
  winnerTeamId: string | null
  winnerReason: string | null
  teacherVerified: boolean
  lastAnswerTeamId: string | null
  lastAnswerCorrect: boolean | null
  stats: SessionStats
}

export type SetupForm = {
  teamCount: 2 | 3 | 4
  teamNames: string[]
  teamColors: TeamColor[]
}
