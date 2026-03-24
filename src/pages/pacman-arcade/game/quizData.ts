import type { GradeBand } from './eduSettings'

export type QuizSubject = 'math' | 'english' | 'science'
export type QuizType = 'mcq' | 'numeric'

export type EduQuestion = {
  id: string
  gradeBand: GradeBand
  subject: QuizSubject
  difficulty: 1 | 2 | 3
  type: QuizType
  prompt: string
  choices?: string[]
  answer: string
}

function makeMcq(
  id: string,
  gradeBand: GradeBand,
  subject: QuizSubject,
  difficulty: 1 | 2 | 3,
  prompt: string,
  choices: string[],
  answer: string,
): EduQuestion {
  return { id, gradeBand, subject, difficulty, type: 'mcq', prompt, choices, answer }
}

function makeNumeric(
  id: string,
  gradeBand: GradeBand,
  subject: QuizSubject,
  difficulty: 1 | 2 | 3,
  prompt: string,
  answer: number | string,
): EduQuestion {
  return { id, gradeBand, subject, difficulty, type: 'numeric', prompt, answer: String(answer) }
}

function generateMath57() {
  const out: EduQuestion[] = []
  for (let i = 0; i < 10; i += 1) {
    const a = 8 + i * 2
    const b = 3 + i
    const ans = a + b
    out.push(makeMcq(`m57-add-${i}`, '5-7', 'math', 1, `${a} + ${b} = ?`, [`${ans}`, `${ans + 1}`, `${ans - 1}`, `${ans + 2}`], `${ans}`))
  }
  for (let i = 0; i < 10; i += 1) {
    const a = 30 + i * 3
    const b = 7 + i
    const ans = a - b
    out.push(makeNumeric(`m57-sub-${i}`, '5-7', 'math', 1, `${a} - ${b} = ?`, ans))
  }
  return out
}

function generateMath89() {
  const out: EduQuestion[] = []
  for (let i = 0; i < 10; i += 1) {
    const a = 12 + i
    const b = 4 + (i % 6)
    const ans = a * b
    out.push(makeMcq(`m89-mul-${i}`, '8-9', 'math', 2, `${a} × ${b} = ?`, [`${ans}`, `${ans + b}`, `${ans - a}`, `${ans + a}`], `${ans}`))
  }
  for (let i = 0; i < 10; i += 1) {
    const p = 10 + i * 5
    const base = 200 + i * 20
    const ans = (base * p) / 100
    out.push(makeNumeric(`m89-pct-${i}`, '8-9', 'math', 2, `${base} sonining ${p}% = ?`, ans))
  }
  return out
}

function generateMath1011() {
  const out: EduQuestion[] = []
  for (let i = 0; i < 10; i += 1) {
    const x = 2 + i
    const left = 3 * x + 5
    out.push(makeNumeric(`m1011-eq-${i}`, '10-11', 'math', 3, `3x + 5 = ${left}. x = ?`, x))
  }
  for (let i = 0; i < 10; i += 1) {
    const n = 11 + i
    const ans = n * n
    out.push(makeMcq(`m1011-sq-${i}`, '10-11', 'math', 3, `${n}² = ?`, [`${ans}`, `${ans + n}`, `${ans - n}`, `${ans + 1}`], `${ans}`))
  }
  return out
}

function generateEnglish57() {
  const pairs = [
    ['apple', 'olma'], ['book', 'kitob'], ['water', 'suv'], ['school', 'maktab'], ['teacher', "o'qituvchi"],
    ['sun', 'quyosh'], ['moon', 'oy'], ['friend', "do'st"], ['house', 'uy'], ['river', 'daryo'],
  ] as const
  const out: EduQuestion[] = []
  pairs.forEach((p, i) => {
    out.push(makeMcq(`e57-voc-${i}`, '5-7', 'english', 1, `"${p[0]}" so'zining ma'nosi?`, [p[1], 'daraxt', 'yozuv', 'deraza'], p[1]))
    out.push(makeMcq(`e57-verb-${i}`, '5-7', 'english', 1, `To'g'ri gapni tanlang`, ['She plays football.', 'She play football.', 'She playing football.', 'She played football every day now.'], 'She plays football.'))
  })
  return out
}

function generateEnglish89() {
  const out: EduQuestion[] = []
  const prompts = [
    ['He ____ to school yesterday.', 'went', ['go', 'goes', 'went', 'gone']],
    ['They ____ TV now.', 'are watching', ['watch', 'watched', 'are watching', 'is watching']],
    ['If it rains, we ____ at home.', 'stay', ['stayed', 'stay', 'stays', 'staying']],
    ['I have ____ my homework.', 'finished', ['finish', 'finished', 'finishing', 'finishes']],
    ['She is ____ than her sister.', 'taller', ['tall', 'taller', 'tallest', 'more tall']],
  ] as const
  for (let i = 0; i < 12; i += 1) {
    const p = prompts[i % prompts.length]
    out.push(makeMcq(`e89-gram-${i}`, '8-9', 'english', 2, p[0], [...p[2]], p[1]))
  }
  for (let i = 0; i < 8; i += 1) {
    out.push(makeMcq(`e89-order-${i}`, '8-9', 'english', 2, 'To‘g‘ri tartibni tanlang', ['I usually wake up at 7.', 'Usually I wake at up 7.', 'I wake usually up at 7.', 'I at 7 up usually wake.'], 'I usually wake up at 7.'))
  }
  return out
}

function generateEnglish1011() {
  const out: EduQuestion[] = []
  const advanced = [
    ['Neither of the students ____ late.', 'is', ['are', 'is', 'were', 'be']],
    ['By next year, I ____ English for 8 years.', 'will have studied', ['study', 'will study', 'will have studied', 'studied']],
    ['The book, ____ was expensive, is excellent.', 'which', ['who', 'which', 'where', 'what']],
    ['Had I known, I ____ earlier.', 'would have come', ['will come', 'would come', 'would have come', 'came']],
  ] as const
  for (let i = 0; i < 20; i += 1) {
    const p = advanced[i % advanced.length]
    out.push(makeMcq(`e1011-adv-${i}`, '10-11', 'english', 3, p[0], [...p[2]], p[1]))
  }
  return out
}

function generateScience57() {
  const out: EduQuestion[] = []
  const facts = [
    ['O‘simliklar oziqani qaysi jarayonda hosil qiladi?', 'Fotosintez'],
    ['Inson tanasida qon haydaydigan organ?', 'Yurak'],
    ['Suv qaysi haroratda muzlaydi? (°C)', '0'],
    ['Yerning tabiiy yo‘ldoshi?', 'Oy'],
    ['Nafas olishda kerakli gaz?', 'Kislorod'],
  ] as const
  for (let i = 0; i < 14; i += 1) {
    const f = facts[i % facts.length]
    out.push(makeMcq(`s57-${i}`, '5-7', 'science', 1, f[0], [f[1], 'Azot', 'Temir', 'Yorug‘lik'], f[1]))
  }
  return out
}

function generateScience89() {
  const out: EduQuestion[] = []
  const facts = [
    ['Nyutonning 2-qonuni formulasi?', 'F = ma'],
    ['Hujayra energiya markazi?', 'Mitoxondriya'],
    ['pH<7 bo‘lgan eritma?', 'Kislotali'],
    ['Elektr toki birligi?', 'Amper'],
    ['Qonning suyuq qismi?', 'Plazma'],
  ] as const
  for (let i = 0; i < 13; i += 1) {
    const f = facts[i % facts.length]
    out.push(makeMcq(`s89-${i}`, '8-9', 'science', 2, f[0], [f[1], 'Volt', 'Atom', 'Neytron'], f[1]))
  }
  return out
}

function generateScience1011() {
  const out: EduQuestion[] = []
  const facts = [
    ['Organik birikmalarning asosi?', 'Uglerod'],
    ['DNK replikatsiyasi qayerda boshlanadi?', 'Yadroda'],
    ['Qaysi kuch tezlanishni keltirib chiqaradi?', 'Natijaviy kuch'],
    ['Avogadro soni taxminan?', '6.02×10^23'],
    ['Fotosintezning yorug‘lik fazasi qayerda?', 'Tilakoidda'],
  ] as const
  for (let i = 0; i < 13; i += 1) {
    const f = facts[i % facts.length]
    out.push(makeMcq(`s1011-${i}`, '10-11', 'science', 3, f[0], [f[1], 'Proton', 'Elektron', 'Lizosoma'], f[1]))
  }
  return out
}

export const QUESTION_BANK: EduQuestion[] = [
  ...generateMath57(),
  ...generateMath89(),
  ...generateMath1011(),
  ...generateEnglish57(),
  ...generateEnglish89(),
  ...generateEnglish1011(),
  ...generateScience57(),
  ...generateScience89(),
  ...generateScience1011(),
]

export const QUESTION_COUNT = {
  math: QUESTION_BANK.filter((q) => q.subject === 'math').length,
  english: QUESTION_BANK.filter((q) => q.subject === 'english').length,
  science: QUESTION_BANK.filter((q) => q.subject === 'science').length,
}
