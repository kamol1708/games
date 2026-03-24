export type TileEventType = 'start' | 'finish' | 'safe' | 'quiz' | 'treasure' | 'trap' | 'portal'

export type TileDef = {
  index: number
  x: number
  z: number
  eventType: TileEventType
  portalTarget?: number
}

export type PlayerDef = {
  id: number
  name: string
  color: string
  tileIndex: number
  score: number
}

export type GamePhase =
  | 'idle'
  | 'rolling'
  | 'moving'
  | 'resolving'
  | 'quiz'
  | 'finished'

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
