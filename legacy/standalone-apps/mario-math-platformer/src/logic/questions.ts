import type { GradeMode } from './state'

export type QuestionOp = 'add' | 'sub' | 'mul' | 'div'

export type MathQuestion = {
  prompt: string
  answer: number
  op: QuestionOp
  difficultyLabel: string
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]
}

function generateAdd(gradeMode: GradeMode): MathQuestion {
  const max = gradeMode === '5-7' ? 80 : 500
  const a = randInt(gradeMode === '5-7' ? 5 : 20, max)
  const b = randInt(gradeMode === '5-7' ? 5 : 20, max)
  return {
    prompt: `${a} + ${b} = ?`,
    answer: a + b,
    op: 'add',
    difficultyLabel: gradeMode === '5-7' ? 'Oson' : "O'rta",
  }
}

function generateSub(gradeMode: GradeMode): MathQuestion {
  const max = gradeMode === '5-7' ? 120 : 700
  let a = randInt(gradeMode === '5-7' ? 20 : 100, max)
  let b = randInt(gradeMode === '5-7' ? 1 : 25, max - 10)
  if (b > a) [a, b] = [b, a]
  return {
    prompt: `${a} - ${b} = ?`,
    answer: a - b,
    op: 'sub',
    difficultyLabel: gradeMode === '5-7' ? "O'rta" : "O'rta",
  }
}

function generateMul(gradeMode: GradeMode): MathQuestion {
  const a = gradeMode === '5-7' ? randInt(2, 12) : randInt(6, 25)
  const b = gradeMode === '5-7' ? randInt(2, 12) : randInt(6, 20)
  return {
    prompt: `${a} × ${b} = ?`,
    answer: a * b,
    op: 'mul',
    difficultyLabel: gradeMode === '5-7' ? "O'rta" : 'Qiyin',
  }
}

function generateDiv(gradeMode: GradeMode): MathQuestion {
  const divisor = gradeMode === '5-7' ? randInt(2, 10) : randInt(2, 16)
  const quotient = gradeMode === '5-7' ? randInt(2, 12) : randInt(4, 25)
  const dividend = divisor * quotient
  return {
    prompt: `${dividend} ÷ ${divisor} = ?`,
    answer: quotient,
    op: 'div',
    difficultyLabel: gradeMode === '5-7' ? 'Oson' : "O'rta",
  }
}

export function generateMathQuestion(gradeMode: GradeMode): MathQuestion {
  const op = pick<QuestionOp>(['add', 'sub', 'mul', 'div'])
  switch (op) {
    case 'add':
      return generateAdd(gradeMode)
    case 'sub':
      return generateSub(gradeMode)
    case 'mul':
      return generateMul(gradeMode)
    case 'div':
      return generateDiv(gradeMode)
  }
}

export function isCorrectNumericAnswer(input: string, answer: number) {
  const normalized = input.trim().replace(',', '.')
  if (!normalized) return false
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed === answer
}

