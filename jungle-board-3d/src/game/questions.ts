import type { QuizQuestion } from './types'
import { randInt, sample } from '../utils/math'

const englishTemplates = [
  { q: 'Complete: She ___ to school every day.', a: 'goes' },
  { q: 'Past tense of "take"?', a: 'took' },
  { q: 'Synonym of "big"?', a: 'large' },
  { q: 'Complete: They ___ playing now.', a: 'are' },
  { q: 'Opposite of "early"?', a: 'late' },
  { q: 'Plural of "child"?', a: 'children' },
]

export function generateQuizQuestion(): QuizQuestion {
  const math = Math.random() < 0.6
  if (math) {
    const op = sample(['+', '-', 'x', '÷'] as const)
    if (op === '+') {
      const a = randInt(6, 35)
      const b = randInt(4, 30)
      return { prompt: `${a} + ${b} = ?`, answer: String(a + b), category: 'math' }
    }
    if (op === '-') {
      let a = randInt(20, 80)
      let b = randInt(3, 50)
      if (b > a) [a, b] = [b, a]
      return { prompt: `${a} - ${b} = ?`, answer: String(a - b), category: 'math' }
    }
    if (op === 'x') {
      const a = randInt(2, 12)
      const b = randInt(2, 12)
      return { prompt: `${a} x ${b} = ?`, answer: String(a * b), category: 'math' }
    }
    const divisor = randInt(2, 10)
    const quotient = randInt(2, 12)
    return { prompt: `${divisor * quotient} ÷ ${divisor} = ?`, answer: String(quotient), category: 'math' }
  }

  const item = sample(englishTemplates)
  return { prompt: item.q, answer: item.a, category: 'english' }
}
