export type GradeBand = '5-7' | '8-9' | '10-11'
export type SubjectToggle = {
  math: boolean
  english: boolean
  science: boolean
}

export type WrongPenalty = 'lose-points' | 'lose-life' | 'slow-player' | 'end-frightened'

export type QuizTriggers = {
  powerPellet: boolean
  pelletMilestone: boolean
  pelletMilestoneEvery: number
  quizGate: boolean
}

export type ClassroomSettings = {
  enabled: boolean
  turnSeconds: number
  teams: string[]
}

export type EduSettings = {
  gradeBand: GradeBand
  subjects: SubjectToggle
  triggers: QuizTriggers
  timerSeconds: number
  wrongPenalty: WrongPenalty
  allowSkip: boolean
  skipCost: number
  allowEscClose: boolean
  classroom: ClassroomSettings
}

const STORAGE_KEY = 'pac_edu_settings_v1'

export const DEFAULT_EDU_SETTINGS: EduSettings = {
  gradeBand: '5-7',
  subjects: {
    math: true,
    english: true,
    science: true,
  },
  triggers: {
    powerPellet: false,
    pelletMilestone: false,
    pelletMilestoneEvery: 15,
    quizGate: false,
  },
  timerSeconds: 15,
  wrongPenalty: 'lose-points',
  allowSkip: true,
  skipCost: 40,
  allowEscClose: false,
  classroom: {
    enabled: false,
    turnSeconds: 45,
    teams: ['Jamoa 1', 'Jamoa 2'],
  },
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function sanitizeTeams(input: unknown): string[] {
  if (!Array.isArray(input)) return [...DEFAULT_EDU_SETTINGS.classroom.teams]
  const teams = input
    .map((t) => (typeof t === 'string' ? t.trim() : ''))
    .filter(Boolean)
    .slice(0, 6)
  if (teams.length < 2) return [...DEFAULT_EDU_SETTINGS.classroom.teams]
  return teams
}

export function normalizeEduSettings(value: Partial<EduSettings> | null | undefined): EduSettings {
  const v = value ?? {}
  const subjects = v.subjects ?? DEFAULT_EDU_SETTINGS.subjects
  const triggers = v.triggers ?? DEFAULT_EDU_SETTINGS.triggers
  const classroom = v.classroom ?? DEFAULT_EDU_SETTINGS.classroom

  const normalized: EduSettings = {
    gradeBand: v.gradeBand === '8-9' || v.gradeBand === '10-11' ? v.gradeBand : '5-7',
    subjects: {
      math: subjects.math !== false,
      english: subjects.english !== false,
      science: subjects.science !== false,
    },
    triggers: {
      powerPellet: Boolean(triggers.powerPellet),
      pelletMilestone: Boolean(triggers.pelletMilestone),
      pelletMilestoneEvery: clamp(Number(triggers.pelletMilestoneEvery) || 15, 5, 40),
      quizGate: Boolean(triggers.quizGate),
    },
    timerSeconds: clamp(Number(v.timerSeconds) || 15, 10, 25),
    wrongPenalty:
      v.wrongPenalty === 'lose-life' ||
      v.wrongPenalty === 'slow-player' ||
      v.wrongPenalty === 'end-frightened'
        ? v.wrongPenalty
        : 'lose-points',
    allowSkip: v.allowSkip !== false,
    skipCost: clamp(Number(v.skipCost) || 40, 10, 300),
    allowEscClose: Boolean(v.allowEscClose),
    classroom: {
      enabled: Boolean(classroom.enabled),
      turnSeconds: clamp(Number(classroom.turnSeconds) || 45, 30, 60),
      teams: sanitizeTeams(classroom.teams),
    },
  }

  if (!normalized.subjects.math && !normalized.subjects.english && !normalized.subjects.science) {
    normalized.subjects.math = true
  }

  return normalized
}

export function loadEduSettings(): EduSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_EDU_SETTINGS }
    return normalizeEduSettings(JSON.parse(raw) as Partial<EduSettings>)
  } catch {
    return { ...DEFAULT_EDU_SETTINGS }
  }
}

export function saveEduSettings(settings: EduSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeEduSettings(settings)))
}
