import { questionsFor } from './questionBank'
import type { BoardTile, Difficulty, GameSettings, QuizGameState, Subject, Team } from './types'

const DIFFICULTIES: Array<{ difficulty: Difficulty; points: 150 | 250 | 400 }> = [
  { difficulty: 'easy', points: 150 },
  { difficulty: 'medium', points: 250 },
  { difficulty: 'hard', points: 400 },
]

export function createTeams(names: string[]): Team[] {
  return names.map((name, idx) => ({
    id: `team-${idx + 1}`,
    name,
    score: 0,
    streak: 0,
    reachedConfetti: false,
  }))
}

function shuffle<T>(list: T[]) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j] as T
    arr[j] = temp as T
  }
  return arr
}

function createBoard(settings: GameSettings): BoardTile[] {
  const tiles: BoardTile[] = []

  settings.subjects.forEach((subject) => {
    DIFFICULTIES.forEach(({ difficulty, points }) => {
      const questions = questionsFor(settings.gradeBand, subject, difficulty)
      const picked = questions[Math.floor(Math.random() * questions.length)]
      tiles.push({
        id: `${subject}-${difficulty}`,
        subject,
        difficulty,
        points,
        question: picked,
        used: false,
        isDouble: false,
      })
    })
  })

  if (tiles.length > 0) {
    const random = Math.floor(Math.random() * tiles.length)
    const target = tiles[random] as BoardTile
    target.isDouble = true
  }

  return shuffle(tiles)
}

export function createInitialGame(settings: GameSettings): QuizGameState {
  return {
    settings,
    teams: createTeams(settings.teams),
    activeTeamIndex: 0,
    board: createBoard(settings),
    selectedTileId: null,
    revealAnswer: false,
    eventLog: ['Game boshlandi'],
    round: 1,
    highScore: null,
  }
}

export function nextTeamIndex(current: number, total: number) {
  return (current + 1) % total
}

export function selectTile(state: QuizGameState, tileId: string) {
  if (state.selectedTileId) return state
  const tile = state.board.find((t) => t.id === tileId)
  if (!tile || tile.used) return state
  return {
    ...state,
    selectedTileId: tileId,
    revealAnswer: false,
  }
}

export function markTileUsed(state: QuizGameState, tileId: string) {
  return {
    ...state,
    board: state.board.map((tile) => (tile.id === tileId ? { ...tile, used: true } : tile)),
  }
}

export function boardFinished(state: QuizGameState) {
  return state.board.every((tile) => tile.used)
}

export function refreshDoubleTile(state: QuizGameState) {
  const openTiles = state.board.filter((tile) => !tile.used)
  if (openTiles.length === 0) return state

  const candidate = openTiles[Math.floor(Math.random() * openTiles.length)]
  return {
    ...state,
    board: state.board.map((tile) => ({
      ...tile,
      isDouble: tile.id === candidate.id,
    })),
  }
}

export function subjectLabel(subject: Subject) {
  if (subject === 'math') return 'Math'
  if (subject === 'english') return 'English'
  if (subject === 'science') return 'Science'
  return 'History'
}
