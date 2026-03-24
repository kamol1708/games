import type { QuizGameState } from './types'

const GAME_KEY = 'classroom_quiz_game_state_v1'
const HIGH_KEY = 'classroom_quiz_high_score_v1'

export function loadSavedGame(): QuizGameState | null {
  try {
    const raw = window.localStorage.getItem(GAME_KEY)
    if (!raw) return null
    return JSON.parse(raw) as QuizGameState
  } catch {
    return null
  }
}

export function saveGame(state: QuizGameState) {
  window.localStorage.setItem(GAME_KEY, JSON.stringify(state))
}

export function clearSavedGame() {
  window.localStorage.removeItem(GAME_KEY)
}

export function loadHighScore(): { name: string; score: number } | null {
  try {
    const raw = window.localStorage.getItem(HIGH_KEY)
    if (!raw) return null
    return JSON.parse(raw) as { name: string; score: number }
  } catch {
    return null
  }
}

export function saveHighScore(payload: { name: string; score: number }) {
  const old = loadHighScore()
  if (!old || payload.score > old.score) {
    window.localStorage.setItem(HIGH_KEY, JSON.stringify(payload))
  }
}
