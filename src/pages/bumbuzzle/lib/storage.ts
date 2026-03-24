import type { GameSession } from '../types/game'

const STORAGE_KEY = 'bumbuzzle_session_v1'

export function loadSession(): GameSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<GameSession>
    if (!parsed || !Array.isArray(parsed.boxes) || !Array.isArray(parsed.teams)) return null
    const inferredBoxCount = parsed.boxes.length === 12 || parsed.boxes.length === 16 || parsed.boxes.length === 24 ? parsed.boxes.length : 16
    return {
      ...(parsed as GameSession),
      boxCount: (parsed.boxCount ?? inferredBoxCount) as GameSession['boxCount'],
      roundCount: typeof parsed.roundCount === 'number' ? parsed.roundCount : parsed.boxes.length,
    }
  } catch {
    return null
  }
}

export function saveSession(session: GameSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // ignore storage errors for demo mode
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
