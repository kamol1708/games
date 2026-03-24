export type GradeMode = '5-7' | '8-11'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Subject = 'Math' | 'Science' | 'Logic'
export type QuestionType = 'mcq' | 'numeric'
export type TrackKey = 'A' | 'B' | 'C'

export type Question = {
  id: string
  subject: Subject
  difficulty: Difficulty
  type: QuestionType
  gradeModes: GradeMode[]
  prompt: string
  options?: string[]
  answer: string
}

export type TeamState = {
  id: string
  name: string
  score: number
  position: number
  turboAvailable: boolean
  shieldAvailable: boolean
  color: string
}

export type GameSettings = {
  teamCount: number
  gradeMode: GradeMode
  questionTimeSec: number
  stationCount: number
}

export type TrackChallenge = {
  key: TrackKey
  questionId: string
  subject: Subject
  difficulty: Difficulty
}

export type OpenQuestion = {
  stationIndex: number
  trackKey: TrackKey
  questionId: string
}

export type GameStatus = 'playing' | 'finished'

export type GameState = {
  status: GameStatus
  settings: GameSettings
  teams: TeamState[]
  activeTeamIndex: number
  stationTracks: Record<number, TrackChallenge[]>
  usedQuestionIds: string[]
  openQuestion: OpenQuestion | null
  winnerTeamId: string | null
  lastEvent: string
}

