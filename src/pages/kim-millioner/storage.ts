import type { GameState, Settings } from './types'

const SETTINGS_KEY = 'million_quiz_settings_v1'
const BEST_SCORE_KEY = 'million_quiz_best_score_v1'
const SESSION_KEY = 'million_quiz_last_session_v1'

export function loadSettings(defaults: Settings): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaults
    return { ...defaults, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return defaults
  }
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function loadBestScore(): number {
  const raw = localStorage.getItem(BEST_SCORE_KEY)
  if (!raw) return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export function saveBestScore(score: number) {
  localStorage.setItem(BEST_SCORE_KEY, String(score))
}

export function saveSession(state: GameState) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(state))
}

export function loadSession(): GameState | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as GameState
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
