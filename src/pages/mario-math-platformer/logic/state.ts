export type GradeMode = '5-7' | '8-11'

type RunState = {
  score: number
  lives: number
  gradeMode: GradeMode
  currentLevel: number
  levelTimeSec: number
  startedAt: number
}

const STORAGE_KEY = 'mario_math_platformer_state_v1'

const state: RunState = {
  score: 0,
  lives: 3,
  gradeMode: '5-7',
  currentLevel: 1,
  levelTimeSec: 180,
  startedAt: Date.now(),
}

const TOTAL_LEVELS = 10

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        score: state.score,
        lives: state.lives,
        gradeMode: state.gradeMode,
        currentLevel: state.currentLevel,
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
    if (typeof parsed.currentLevel === 'number') state.currentLevel = Math.min(Math.max(1, parsed.currentLevel), TOTAL_LEVELS)
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
  state.currentLevel = 1
  state.startedAt = Date.now()
  persist()
}

export function restartRunIfNoLives() {
  if (state.lives > 0) return false
  state.lives = 3
  state.score = 0
  state.currentLevel = 1
  state.startedAt = Date.now()
  persist()
  return true
}

export function getTotalLevels() {
  return TOTAL_LEVELS
}

export function advanceLevel() {
  if (state.currentLevel >= TOTAL_LEVELS) return false
  state.currentLevel += 1
  state.startedAt = Date.now()
  persist()
  return true
}

export function setCurrentLevel(level: number) {
  state.currentLevel = Math.min(Math.max(1, Math.floor(level)), TOTAL_LEVELS)
  persist()
}

export function resetLevelTimer() {
  state.startedAt = Date.now()
}

export function shiftLevelTimerStart(ms: number) {
  state.startedAt += ms
}

export function getLevelSecondsRemaining() {
  const elapsed = Math.floor((Date.now() - state.startedAt) / 1000)
  return Math.max(0, state.levelTimeSec - elapsed)
}
