export type GradeMode = '5-7' | '8-11'

type RunState = {
  score: number
  lives: number
  gradeMode: GradeMode
  levelTimeSec: number
  startedAt: number
}

const STORAGE_KEY = 'mario_math_platformer_state_v1'

const state: RunState = {
  score: 0,
  lives: 3,
  gradeMode: '5-7',
  levelTimeSec: 180,
  startedAt: Date.now(),
}

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        score: state.score,
        lives: state.lives,
        gradeMode: state.gradeMode,
        levelTimeSec: state.levelTimeSec,
      }),
    )
  } catch {
    // ignore
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Partial<RunState>
    if (typeof parsed.score === 'number') state.score = parsed.score
    if (typeof parsed.lives === 'number') state.lives = parsed.lives
    if (parsed.gradeMode === '5-7' || parsed.gradeMode === '8-11') state.gradeMode = parsed.gradeMode
    if (typeof parsed.levelTimeSec === 'number') state.levelTimeSec = parsed.levelTimeSec
  } catch {
    // ignore
  }
}

export function getState() {
  return state
}

export function setGradeMode(mode: GradeMode) {
  state.gradeMode = mode
  persist()
}

export function addScore(points: number) {
  state.score += points
  persist()
}

export function loseLife() {
  state.lives = Math.max(0, state.lives - 1)
  persist()
}

export function resetForNewGame() {
  state.score = 0
  state.lives = 3
  state.startedAt = Date.now()
  persist()
}

export function restartRunIfNoLives() {
  if (state.lives > 0) return false
  state.lives = 3
  state.score = 0
  state.startedAt = Date.now()
  persist()
  return true
}

export function resetLevelTimer() {
  state.startedAt = Date.now()
}

export function getLevelSecondsRemaining() {
  const elapsed = Math.floor((Date.now() - state.startedAt) / 1000)
  return Math.max(0, state.levelTimeSec - elapsed)
}

