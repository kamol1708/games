import { QUESTION_BANK } from '../data/questions'
import type { Difficulty, GameSettings, GradeMode, Question, TeamState, TrackChallenge, TrackKey } from '../types/game'
import { getTeacherItems } from '../../../lib/teacherContent'

const TRACK_ORDER: TrackKey[] = ['A', 'B', 'C']
const DIFFICULTY_BY_TRACK: Record<TrackKey, Difficulty> = { A: 'easy', B: 'medium', C: 'hard' }

export const SCORE_RULES = {
  correct: 10,
  fastBonus: 5,
  wrong: -3,
  fastThresholdSec: 10,
} as const

const TEAM_COLORS = ['#60a5fa', '#f472b6', '#f59e0b', '#34d399', '#a78bfa', '#fb7185']

function getTeacherQuestions(): Question[] {
  return getTeacherItems<Partial<Question>>('bilim-poyezdi')
    .filter((item): item is Partial<Question> & { id: string; subject: Question['subject']; difficulty: Difficulty; type: Question['type']; gradeModes: GradeMode[]; prompt: string; answer: string } =>
      Boolean(
        item &&
        typeof item.id === 'string' &&
        typeof item.subject === 'string' &&
        typeof item.difficulty === 'string' &&
        typeof item.type === 'string' &&
        Array.isArray(item.gradeModes) &&
        typeof item.prompt === 'string' &&
        typeof item.answer === 'string',
      ),
    )
    .map((item) => ({
      id: item.id,
      subject: item.subject,
      difficulty: item.difficulty,
      type: item.type,
      gradeModes: item.gradeModes.filter((mode): mode is GradeMode => mode === '5-7' || mode === '8-11'),
      prompt: item.prompt.trim(),
      options: item.type === 'mcq' ? item.options?.filter((option): option is string => typeof option === 'string' && option.trim().length > 0).map((option) => option.trim()) : undefined,
      answer: item.answer.trim(),
    }))
    .filter((item) => item.prompt.length > 0 && item.answer.length > 0 && item.gradeModes.length > 0 && (item.type === 'numeric' || (item.options?.length ?? 0) >= 2))
}

function getQuestionBank(): Question[] {
  return [...QUESTION_BANK, ...getTeacherQuestions()]
}

export function createTeams(names: string[]): TeamState[] {
  return names.map((name, index) => ({
    id: `team-${index + 1}`,
    name: name.trim() || `Team ${index + 1}`,
    score: 0,
    position: 0,
    turboAvailable: true,
    shieldAvailable: true,
    color: TEAM_COLORS[index % TEAM_COLORS.length],
  }))
}

export function getQuestionsByGrade(gradeMode: GradeMode): Question[] {
  return getQuestionBank().filter((q) => q.gradeModes.includes(gradeMode))
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function buildStationTracks(
  settings: GameSettings,
  usedQuestionIds: string[],
): { tracks: TrackChallenge[]; usedIds: string[] } {
  const available = getQuestionsByGrade(settings.gradeMode)
  const usedSet = new Set(usedQuestionIds)
  const selected: TrackChallenge[] = []
  const nextUsed = [...usedQuestionIds]

  TRACK_ORDER.forEach((key) => {
    const difficulty = DIFFICULTY_BY_TRACK[key]
    let pool = available.filter((q) => q.difficulty === difficulty && !usedSet.has(q.id))
    if (pool.length === 0) {
      pool = available.filter((q) => q.difficulty === difficulty)
    }
    if (pool.length === 0) {
      pool = available
    }

    const question = shuffle(pool)[0]
    if (!question) return

    if (!usedSet.has(question.id)) {
      usedSet.add(question.id)
      nextUsed.push(question.id)
    }

    selected.push({
      key,
      questionId: question.id,
      subject: question.subject,
      difficulty: question.difficulty,
    })
  })

  return { tracks: selected, usedIds: nextUsed }
}

export function getQuestionById(id: string): Question | undefined {
  return getQuestionBank().find((q) => q.id === id)
}

export function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function isCorrectAnswer(question: Question, input: string): boolean {
  return normalizeAnswer(input) === normalizeAnswer(question.answer)
}

export function nextTeamIndex(current: number, total: number): number {
  return total === 0 ? 0 : (current + 1) % total
}
