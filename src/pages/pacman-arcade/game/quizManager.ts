import type { EduSettings } from './eduSettings'
import { QUESTION_BANK, type EduQuestion } from './quizData'

export type QuizTrigger = 'power-pellet' | 'pellet-milestone' | 'quiz-gate'

export type QuizOpenRequest = {
  question: EduQuestion
  timerSeconds: number
  allowSkip: boolean
  allowEscClose: boolean
  trigger: QuizTrigger
  teamName?: string
}

export type QuizOpenResult = {
  status: 'answered' | 'skip' | 'timeout'
  choiceIndex?: number
  value?: string
}

export type QuizOutcome = {
  correct: boolean
  status: 'correct' | 'wrong' | 'skip' | 'timeout'
  question: EduQuestion
}

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export class QuizManager {
  private getSettings: () => EduSettings
  private recentIds: string[] = []
  private correctStreak = 0
  private wrongStreak = 0

  constructor(getSettings: () => EduSettings) {
    this.getSettings = getSettings
  }

  private targetDifficulty() {
    const settings = this.getSettings()
    let base = settings.gradeBand === '5-7' ? 1 : settings.gradeBand === '8-9' ? 2 : 3
    if (this.correctStreak >= 3) base = Math.min(3, base + 1)
    if (this.wrongStreak >= 2) base = Math.max(1, base - 1)
    return base as 1 | 2 | 3
  }

  private selectQuestion(): EduQuestion {
    const settings = this.getSettings()
    const subjectList = [
      settings.subjects.math ? 'math' : null,
      settings.subjects.english ? 'english' : null,
      settings.subjects.science ? 'science' : null,
    ].filter(Boolean) as Array<'math' | 'english' | 'science'>

    const gradeFiltered = QUESTION_BANK.filter(
      (q) => q.gradeBand === settings.gradeBand && subjectList.includes(q.subject),
    )

    const targetDiff = this.targetDifficulty()
    let pool = gradeFiltered.filter((q) => q.difficulty === targetDiff)
    if (pool.length === 0) pool = gradeFiltered
    if (pool.length === 0) pool = QUESTION_BANK

    let candidates = pool.filter((q) => !this.recentIds.includes(q.id))
    if (candidates.length === 0) candidates = pool

    const chosen = pickRandom(candidates)
    this.recentIds.push(chosen.id)
    if (this.recentIds.length > 16) this.recentIds.shift()
    return chosen
  }

  private evaluate(question: EduQuestion, response: QuizOpenResult): boolean {
    if (response.status !== 'answered') return false

    if (question.type === 'mcq') {
      const idx = typeof response.choiceIndex === 'number' ? response.choiceIndex : -1
      const picked = question.choices?.[idx]
      if (!picked) return false
      return normalize(picked) === normalize(question.answer)
    }

    const value = response.value?.trim() ?? ''
    if (!value) return false
    return normalize(value) === normalize(question.answer)
  }

  async ask(trigger: QuizTrigger, teamName?: string): Promise<QuizOutcome> {
    const settings = this.getSettings()
    const question = this.selectQuestion()
    const openQuiz = (window as any).__pacOpenQuiz as ((req: QuizOpenRequest) => Promise<QuizOpenResult>) | undefined

    if (!openQuiz) {
      return { correct: true, status: 'correct', question }
    }

    const result = await openQuiz({
      question,
      trigger,
      timerSeconds: settings.timerSeconds,
      allowSkip: settings.allowSkip,
      allowEscClose: settings.allowEscClose,
      teamName,
    })

    if (result.status === 'skip') {
      this.correctStreak = 0
      this.wrongStreak = 0
      return { correct: false, status: 'skip', question }
    }

    if (result.status === 'timeout') {
      this.correctStreak = 0
      this.wrongStreak += 1
      return { correct: false, status: 'timeout', question }
    }

    const correct = this.evaluate(question, result)
    if (correct) {
      this.correctStreak += 1
      this.wrongStreak = 0
      return { correct: true, status: 'correct', question }
    }

    this.correctStreak = 0
    this.wrongStreak += 1
    return { correct: false, status: 'wrong', question }
  }
}
