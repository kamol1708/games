import { useMemo, useState } from 'react'
import TugBattlePage, { type BattleQuestion } from './TugBattlePage'
import './TugOfWarPage.css'
import { getTeacherItems } from '../lib/teacherContent'
import { generateQuestionsWithGemini } from '../lib/geminiQuestionGenerator'

type Operation = 'add' | 'sub' | 'mul' | 'div'
type Difficulty = 'easy' | 'medium' | 'hard'

type LevelMeta = {
  id: Difficulty
  label: string
}

type OpMeta = {
  id: Operation
  label: string
  symbol: string
}

const QUESTION_COUNT = 15

const operationMeta: OpMeta[] = [
  { id: 'add', label: "Qo'shish", symbol: '+' },
  { id: 'sub', label: 'Ayirish', symbol: '−' },
  { id: 'mul', label: "Ko'paytirish", symbol: '×' },
  { id: 'div', label: "Bo'lish", symbol: '÷' },
]

const levelMeta: LevelMeta[] = [
  { id: 'easy', label: 'Oson' },
  { id: 'medium', label: "O'rta" },
  { id: 'hard', label: 'Qiyin' },
]

const subjectOptions = [
  'Matematika',
  'Ona tili',
  'Ingliz tili',
  'Tarix',
  'Geografiya',
  'Biologiya',
  'Fizika',
  'Kimyo',
  'Informatika',
]

const questionCountOptions = [5, 10, 15, 20, 30]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRangeByDifficulty(level: Difficulty) {
  if (level === 'easy') {
    return { addMin: 3, addMax: 20, mulMin: 2, mulMax: 9 }
  }

  if (level === 'medium') {
    return { addMin: 10, addMax: 70, mulMin: 3, mulMax: 12 }
  }

  return { addMin: 30, addMax: 160, mulMin: 4, mulMax: 16 }
}

function buildOptions(answer: number): string[] {
  const options = new Set<number>([answer])

  while (options.size < 4) {
    const delta = randomInt(2, 12)
    const candidate = Math.max(0, answer + (Math.random() > 0.5 ? delta : -delta))
    options.add(candidate)
  }

  return Array.from(options)
    .sort(() => Math.random() - 0.5)
    .map((item) => String(item))
}

function generateQuestion(operation: Operation, level: Difficulty): BattleQuestion {
  const ranges = getRangeByDifficulty(level)

  if (operation === 'add') {
    const a = randomInt(ranges.addMin, ranges.addMax)
    const b = randomInt(ranges.addMin, ranges.addMax)
    const answer = a + b
    return {
      text: `${a} + ${b} = ?`,
      answer: String(answer),
      options: buildOptions(answer),
      operation,
    }
  }

  if (operation === 'sub') {
    const a = randomInt(ranges.addMin + 8, ranges.addMax + 30)
    const b = randomInt(ranges.addMin, a - 1)
    const answer = a - b
    return {
      text: `${a} − ${b} = ?`,
      answer: String(answer),
      options: buildOptions(answer),
      operation,
    }
  }

  if (operation === 'mul') {
    const a = randomInt(ranges.mulMin, ranges.mulMax)
    const b = randomInt(ranges.mulMin, ranges.mulMax)
    const answer = a * b
    return {
      text: `${a} × ${b} = ?`,
      answer: String(answer),
      options: buildOptions(answer),
      operation,
    }
  }

  const divisor = randomInt(ranges.mulMin, ranges.mulMax)
  const quotient = randomInt(ranges.mulMin + 1, ranges.mulMax + 8)
  const dividend = divisor * quotient
  const answer = quotient

  return {
    text: `${dividend} ÷ ${divisor} = ?`,
    answer: String(answer),
    options: buildOptions(answer),
    operation,
  }
}

function buildQuestionSet(operations: Operation[], level: Difficulty, count: number): BattleQuestion[] {
  const list: BattleQuestion[] = []

  for (let i = 0; i < count; i += 1) {
    const operation = operations[i % operations.length]
    list.push(generateQuestion(operation, level))
  }

  return list
}

function normalizeBattleQuestion(item: unknown): BattleQuestion | null {
  if (!item || typeof item !== 'object') {
    return null
  }

  const raw = item as {
    text?: unknown
    question?: unknown
    answer?: unknown
    options?: unknown
    operation?: unknown
  }

  const textCandidate = typeof raw.text === 'string' ? raw.text : typeof raw.question === 'string' ? raw.question : ''
  const text = textCandidate.trim()
  const options = Array.isArray(raw.options)
    ? raw.options
        .map((option) => (typeof option === 'string' || typeof option === 'number' ? String(option).trim() : ''))
        .filter(Boolean)
    : []
  const answer = typeof raw.answer === 'string' || typeof raw.answer === 'number' ? String(raw.answer).trim() : ''

  if (!text || !answer || options.length < 2) {
    return null
  }

  const nextOptions = options.includes(answer) ? options.slice(0, 4) : [answer, ...options].slice(0, 4)
  const operation =
    raw.operation === 'add' || raw.operation === 'sub' || raw.operation === 'mul' || raw.operation === 'div'
      ? raw.operation
      : undefined

  return {
    text,
    answer,
    options: nextOptions,
    operation,
  }
}

function TugOfWarPage() {
  const [screen, setScreen] = useState<'setup' | 'battle'>('setup')
  const [teamA, setTeamA] = useState('1-Jamoa')
  const [teamB, setTeamB] = useState('2-Jamoa')
  const [level, setLevel] = useState<Difficulty>('easy')
  const [selectedOps, setSelectedOps] = useState<Operation[]>(['add', 'sub'])
  const [error, setError] = useState('')

  const [aiSubject, setAiSubject] = useState(subjectOptions[0])
  const [aiCount, setAiCount] = useState<number>(10)
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>('medium')
  const [aiQuestions, setAiQuestions] = useState<BattleQuestion[]>([])
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiInfo, setAiInfo] = useState('')

  const teacherQuestions = useMemo(
    () =>
      getTeacherItems<unknown>('tug-of-war')
        .map((item) => normalizeBattleQuestion(item))
        .filter((item): item is BattleQuestion => item !== null),
    [],
  )

  const generatedQuestions = useMemo(() => buildQuestionSet(selectedOps, level, QUESTION_COUNT), [selectedOps, level])

  const questions = useMemo(() => {
    if (aiQuestions.length > 0) {
      return aiQuestions
    }
    return [...teacherQuestions, ...generatedQuestions]
  }, [aiQuestions, generatedQuestions, teacherQuestions])

  const selectionLabel = selectedOps
    .map((id) => operationMeta.find((item) => item.id === id)?.label)
    .filter(Boolean)
    .join(', ')

  const toggleOperation = (id: Operation) => {
    setSelectedOps((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          return prev
        }

        return prev.filter((item) => item !== id)
      }

      return [...prev, id]
    })
    setError('')
  }

  const handleGenerateAi = async () => {
    const safeCount = Math.min(30, Math.max(3, Number(aiCount) || 10))
    setAiCount(safeCount)

    if (!aiSubject.trim()) {
      setAiError('Fan tanlang.')
      return
    }

    try {
      setIsGeneratingAi(true)
      setAiError('')
      setAiInfo('')
      const generated = await generateQuestionsWithGemini({
        subject: aiSubject.trim(),
        count: safeCount,
        difficulty: aiDifficulty,
      })
      const mapped: BattleQuestion[] = generated.map((item) => ({
        text: item.text,
        options: item.options,
        answer: item.answer,
      }))
      setAiQuestions(mapped)
      setAiInfo(`${mapped.length} ta AI savol tayyor bo‘ldi.`)
      setError('')
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI savollarni yaratishda xatolik bo‘ldi.')
      setAiInfo('')
    } finally {
      setIsGeneratingAi(false)
    }
  }

  const clearAiQuestions = () => {
    setAiQuestions([])
    setAiInfo('AI savollar o‘chirildi. Endi lokal savollar ishlaydi.')
    setAiError('')
  }

  const startBattle = () => {
    if (!teamA.trim() || !teamB.trim()) {
      setError('Ikkala jamoa nomini ham kiriting.')
      return
    }

    if (aiQuestions.length === 0 && selectedOps.length === 0) {
      setError('Kamida bitta amal tanlang.')
      return
    }

    if (questions.length === 0) {
      setError('Boshlash uchun kamida bitta savol kerak.')
      return
    }

    setError('')
    setScreen('battle')
  }

  if (screen === 'battle') {
    return (
      <TugBattlePage
        teamA={teamA.trim()}
        teamB={teamB.trim()}
        questions={questions}
        onBack={() => setScreen('setup')}
      />
    )
  }

  return (
    <main className="tow-page">
      <div className="tow-layout">
        <section className="tow-card tow-about">
          <h2>O&apos;yin haqida</h2>
          <p>
            O&apos;qituvchi amallar yoki AI savollarini tanlaydi, o&apos;yin paytida har bir jamoaga
            savollar tasodifiy tarzda chiqadi. Har bir to&apos;g&apos;ri javob arqonni
            sizning tomonga siljitadi.
          </p>

          <p className="tow-warning">
            Telefonda o&apos;ynash uchun ekraningizni gorizontal holatga o&apos;tkazing.
          </p>

          <ol>
            <li>Jamoa nomlarini kiriting.</li>
            <li>Amallar va darajani tanlang yoki AI savol yarating.</li>
            <li>&quot;Boshlash&quot; tugmasini bosing.</li>
          </ol>

          <div className="tow-info-box">
            <span>TANLANGAN SAVOLLAR</span>
            <strong>{questions.length}</strong>
            <p>{aiQuestions.length > 0 ? 'AI rejimida yaratilgan savollar' : 'Lokal va teacher savollar'}</p>
          </div>

          <div className="tow-team-box">
            <h3>{aiQuestions.length > 0 ? `AI savollar (${aiQuestions.length} ta)` : `Amaldagi savollar (${questions.length} ta)`}</h3>
            <ol className="tow-question-list">
              {questions.map((item, index) => (
                <li key={`${item.text}-${index}`}>{item.text}</li>
              ))}
            </ol>
          </div>

          <div className="tow-team-box">
            <h3>Jamoa nomlari</h3>
            <div className="tow-teams">
              <input
                value={teamA}
                onChange={(event) => setTeamA(event.target.value)}
                aria-label="Birinchi jamoa"
                placeholder="1-Jamoa"
              />
              <input
                value={teamB}
                onChange={(event) => setTeamB(event.target.value)}
                aria-label="Ikkinchi jamoa"
                placeholder="2-Jamoa"
              />
            </div>
          </div>

          {error ? <p className="tow-error">{error}</p> : null}

          <button className="tow-start" type="button" onClick={startBattle}>
            ▷ O&apos;yinni Boshlash
          </button>
        </section>

        <section className="tow-card tow-actions">
          <div className="tow-actions-head">
            <h2>Amal tanlash</h2>
            <span>{selectedOps.length} ta amal</span>
          </div>

          <div className="tow-ops-grid">
            {operationMeta.map((item) => (
              <button
                key={item.id}
                className={selectedOps.includes(item.id) ? 'tow-op active' : 'tow-op'}
                type="button"
                onClick={() => toggleOperation(item.id)}
              >
                <i>{item.symbol}</i>
                {item.label}
              </button>
            ))}
          </div>

          <h3 className="tow-level-title">Daraja tanlash</h3>
          <div className="tow-levels">
            {levelMeta.map((item) => (
              <button
                key={item.id}
                className={level === item.id ? 'active' : ''}
                type="button"
                onClick={() => setLevel(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="tow-summary">
            <div>
              <span>TANLOV</span>
              <strong>{selectionLabel || "Qo'shish"}</strong>
              <p>Daraja: {levelMeta.find((item) => item.id === level)?.label}</p>
            </div>
            <div className="tow-count">
              <span>SAVOLLAR</span>
              <strong>{questions.length}</strong>
            </div>
          </div>

          <div className="tow-ai-box">
            <div className="tow-ai-head">
              <h3>AI bilan savol yaratish</h3>
              <span>Gemini</span>
            </div>

            <div className="tow-ai-grid">
              <label>
                Fan
                <select value={aiSubject} onChange={(event) => setAiSubject(event.target.value)}>
                  {subjectOptions.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Savol soni
                <select value={aiCount} onChange={(event) => setAiCount(Number(event.target.value))}>
                  {questionCountOptions.map((count) => (
                    <option key={count} value={count}>
                      {count} ta
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="tow-ai-levels">
              {levelMeta.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={aiDifficulty === item.id ? 'active' : ''}
                  onClick={() => setAiDifficulty(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="tow-ai-actions">
              <button type="button" onClick={handleGenerateAi} disabled={isGeneratingAi}>
                {isGeneratingAi ? 'Yaratilmoqda...' : 'AI savol yaratish'}
              </button>
              <button type="button" onClick={clearAiQuestions} disabled={isGeneratingAi || aiQuestions.length === 0}>
                AI savollarni o&apos;chirish
              </button>
            </div>

            {aiInfo ? <p className="tow-ai-info">{aiInfo}</p> : null}
            {aiError ? <p className="tow-ai-error">{aiError}</p> : null}
          </div>
        </section>
      </div>
    </main>
  )
}

export default TugOfWarPage
