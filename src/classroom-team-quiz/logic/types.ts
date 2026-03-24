export type Subject = 'math' | 'english' | 'science' | 'history'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type GradeBand = '5-7' | '8-9' | '10-11'

export type QuestionType = 'mcq' | 'numeric' | 'sentence' | 'boolean'

export type QuizQuestion = {
  id: string
  subject: Subject
  difficulty: Difficulty
  points: 150 | 250 | 400
  question: string
  type: QuestionType
  options?: string[]
  answer: string
}

export type Team = {
  id: string
  name: string
  score: number
  streak: number
  reachedConfetti: boolean
}

export type GameSettings = {
  teams: string[]
  gradeBand: GradeBand
  subjects: Subject[]
  timerEnabled: boolean
  timerSeconds: 15 | 20
  negativeMarking: boolean
  stealMode: boolean
}

export type BoardTile = {
  id: string
  subject: Subject
  difficulty: Difficulty
  points: 150 | 250 | 400
  question: QuizQuestion
  used: boolean
  isDouble: boolean
}

export type QuizGameState = {
  settings: GameSettings
  teams: Team[]
  activeTeamIndex: number
  board: BoardTile[]
  selectedTileId: string | null
  revealAnswer: boolean
  eventLog: string[]
  round: number
  highScore: { name: string; score: number } | null
}
