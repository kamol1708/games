export type Difficulty = 'beginner' | 'intermediate'
export type RoundCount = number
export type BoxCount = 12 | 16 | 24

export type Team = {
  id: string
  name: string
  points: number
  nextDouble: boolean
}

export type BoxKind =
  | 'word_puzzle'
  | 'sentence_fix'
  | 'vocab_match'
  | 'spelling_challenge'
  | 'bonus'
  | 'double_points'
  | 'bomb'

export type BoxCell = {
  id: number
  kind: BoxKind
  opened: boolean
  resolved: boolean
  title: string
}

export type UnscrambleQuestion = {
  type: 'word_puzzle'
  id: string
  word: string
  scrambled: string
  difficulty: Difficulty
}

export type GrammarQuestion = {
  type: 'sentence_fix'
  id: string
  broken: string
  corrected: string
  difficulty: Difficulty
}

export type VocabQuestion = {
  type: 'vocab_match'
  id: string
  prompt: string
  options: string[]
  answer: string
  difficulty: Difficulty
}

export type SpellingQuestion = {
  type: 'spelling_challenge'
  id: string
  prompt: string
  answer: string
  difficulty: Difficulty
}

export type PuzzleQuestion = UnscrambleQuestion | GrammarQuestion | VocabQuestion | SpellingQuestion

export type ActivePuzzle = {
  boxId: number
  teamId: string
  startedAt: number
  timeLeft: number
  revealAnswer: boolean
  resolved: boolean
  bomb?: boolean
  question?: PuzzleQuestion
}

export type GameLogItem = {
  id: string
  message: string
  at: number
}

export type GameSession = {
  teams: Team[]
  difficulty: Difficulty
  roundCount: RoundCount
  boxCount: BoxCount
  turnIndex: number
  turnNumber: number
  boxes: BoxCell[]
  activePuzzle: ActivePuzzle | null
  gameOver: boolean
  winnerTeamIds: string[]
  logs: GameLogItem[]
  projectorMode: boolean
  usedQuestionIds: string[]
}

export type SetupConfig = {
  teamCount: number
  teamNames: string[]
  difficulty: Difficulty
  roundCount?: RoundCount
  boxCount: BoxCount
}
