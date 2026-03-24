export type TileEventType = 'start' | 'finish' | 'safe' | 'treasure' | 'trap' | 'boost'

export type TileDef = {
  index: number
  step: number
  x: number
  z: number
  eventType: TileEventType
  jumpTo?: number
}

export type PlayerDef = {
  id: number
  name: string
  color: string
  tileIndex: number
  score: number
}

export type GamePhase = 'idle' | 'rolling' | 'moving' | 'resolving' | 'quiz' | 'finished'

// Kept for compatibility with older jungle-board quiz files still compiled by TS.
export type QuizQuestion = {
  prompt: string
  answer: string
  category: 'math' | 'english'
}

export type PendingQuiz = {
  tileIndex: number
  question: QuizQuestion
  timeLeft: number
}
