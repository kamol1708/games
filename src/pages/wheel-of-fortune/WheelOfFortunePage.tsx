import { useEffect, useMemo, useRef, useState } from 'react'
import './WheelOfFortunePage.css'
import { useTeacherItems } from '../../lib/useTeacherItems'

type QuestionLevel = 'easy' | 'medium' | 'hard'

type Question = {
  text: string
  level: QuestionLevel
  points: number
  seconds: number
}

type WheelOfFortunePageProps = {
  onBack: () => void
}

const STUDENT_SPIN_MS = 4200

const questionBank: Question[] = [
  { text: "9 + 7 = ?", level: 'easy', points: 5, seconds: 120 },
  { text: "24 / 6 + 3 = ?", level: 'easy', points: 5, seconds: 120 },
  { text: "O'zbekiston poytaxti qaysi shahar?", level: 'easy', points: 5, seconds: 120 },
  { text: "15 * 4 - 18 = ?", level: 'medium', points: 10, seconds: 120 },
  { text: "3 ta sinonim so'z ayting.", level: 'medium', points: 10, seconds: 120 },
  { text: '2, 5, 11, 23, ... ketma-ketlikdagi keyingi son?', level: 'medium', points: 10, seconds: 120 },
  { text: "Mantiq: Barcha A lar B. Ba'zi B lar C. Demak nima xulosa qilish mumkin?", level: 'hard', points: 15, seconds: 180 },
  { text: "Agar 40% = 80 bo'lsa, 100% nechchi?", level: 'hard', points: 15, seconds: 180 },
  { text: "Qisqa nutq: 'Kitob o'qishning foydasi' haqida 3 ta fikr ayting.", level: 'hard', points: 15, seconds: 180 },
]

const studentWheelTones = ['#ff7b54', '#4dabf7', '#2ec4b6', '#ffd166', '#9b5de5', '#06d6a0', '#ef476f', '#f4a261']

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function parseStudents(raw: string): string[] {
  return raw
    .split(/[\n,]+/g)
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function buildStudentGradient(students: string[]) {
  if (students.length === 0) {
    return 'conic-gradient(#e2e8f0 0deg 360deg)'
  }
  const size = 360 / students.length
  const stops = students
    .map((_, index) => {
      const color = studentWheelTones[index % studentWheelTones.length]
      const from = (index * size).toFixed(2)
      const to = ((index + 1) * size).toFixed(2)
      return `${color} ${from}deg ${to}deg`
    })
    .join(', ')
  return `conic-gradient(${stops})`
}

function WheelOfFortunePage({ onBack }: WheelOfFortunePageProps) {
  const [screen, setScreen] = useState<'setup' | 'playing'>('setup')
  const [studentInputValue, setStudentInputValue] = useState('Ali\nVali\nMadina\nAziza\nJasur')
  const [students, setStudents] = useState<string[]>([])
  const [studentScores, setStudentScores] = useState<Record<string, number>>({})
  const [studentRotation, setStudentRotation] = useState(0)
  const [studentSpinning, setStudentSpinning] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [studentError, setStudentError] = useState('')
  const studentTimeoutRef = useRef<number | null>(null)
  const teacherItems = useTeacherItems<unknown>('wheel-of-fortune')

  const sortedStudentBoard = useMemo(
    () => students.map((name) => ({ name, score: studentScores[name] ?? 0 })).sort((a, b) => b.score - a.score),
    [students, studentScores],
  )
  const allQuestions = useMemo(() => {
    const teacher = teacherItems.filter((item): item is Question => {
      if (!item || typeof item !== 'object') {
        return false
      }
      const q = item as Partial<Question>
      return (
        typeof q.text === 'string' &&
        (q.level === 'easy' || q.level === 'medium' || q.level === 'hard') &&
        typeof q.points === 'number' &&
        typeof q.seconds === 'number'
      )
    })
    return [...questionBank, ...teacher]
  }, [teacherItems])

  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) {
      if (timeLeft <= 0) {
        setTimerRunning(false)
      }
      return
    }
    const id = window.setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => window.clearTimeout(id)
  }, [timerRunning, timeLeft])

  useEffect(() => {
    return () => {
      if (studentTimeoutRef.current) {
        window.clearTimeout(studentTimeoutRef.current)
      }
    }
  }, [])

  const startStudentGame = () => {
    const parsed = parseStudents(studentInputValue)
    if (parsed.length < 2) {
      setStudentError("Kamida 2 ta o'quvchi kiriting.")
      return
    }

    const scoreMap: Record<string, number> = {}
    parsed.forEach((name) => {
      scoreMap[name] = 0
    })

    setStudents(parsed)
    setStudentScores(scoreMap)
    setStudentError('')
    setStudentRotation(0)
    setSelectedStudent(null)
    setActiveQuestion(null)
    setTimeLeft(0)
    setTimerRunning(false)
    setScreen('playing')
  }

  const spinStudentWheel = () => {
    if (studentSpinning || students.length === 0) {
      return
    }

    const targetIndex = randomInt(0, students.length - 1)
    const studentSegmentSize = 360 / students.length
    const currentNorm = ((studentRotation % 360) + 360) % 360
    const centerAngle = targetIndex * studentSegmentSize + studentSegmentSize / 2
    const finalNorm = (360 - centerAngle) % 360
    const deltaNorm = (finalNorm - currentNorm + 360) % 360
    const nextRotation = studentRotation + randomInt(7, 9) * 360 + deltaNorm

    setStudentSpinning(true)
    setStudentRotation(nextRotation)
    setSelectedStudent(null)
    setActiveQuestion(null)
    setTimerRunning(false)
    setTimeLeft(0)

    if (studentTimeoutRef.current) {
      window.clearTimeout(studentTimeoutRef.current)
    }

    studentTimeoutRef.current = window.setTimeout(() => {
      const student = students[targetIndex]
      const question = allQuestions[randomInt(0, allQuestions.length - 1)]
      setStudentSpinning(false)
      setSelectedStudent(student)
      setActiveQuestion(question)
      setTimeLeft(question.seconds)
      setTimerRunning(true)
      studentTimeoutRef.current = null
    }, STUDENT_SPIN_MS + 60)
  }

  const markStudentAnswer = (correct: boolean) => {
    if (!selectedStudent || !activeQuestion) {
      return
    }
    if (correct) {
      setStudentScores((prev) => ({
        ...prev,
        [selectedStudent]: (prev[selectedStudent] ?? 0) + activeQuestion.points,
      }))
    }
    setTimerRunning(false)
  }

  if (screen === 'setup') {
    return (
      <main className="wof-page">
        <section className="wof-shell">
          <header className="wof-head">
            <button type="button" className="wof-back" onClick={onBack}>Orqaga</button>
            <h1>Baraban O&apos;yini</h1>
            <span />
          </header>

          <section className="wof-setup">
            <h2>Baraban sozlamasi</h2>
            <p>Ismlarni kiriting. Wheel o&apos;quvchini tanlaydi, savol va 2/3 minut timer chiqadi.</p>
            <textarea
              className="wof-student-input"
              value={studentInputValue}
              onChange={(event) => setStudentInputValue(event.target.value)}
            />
            {studentError ? <p className="wof-error">{studentError}</p> : null}
            <button type="button" className="wof-start" onClick={startStudentGame}>Barabanni boshlash</button>
          </section>
        </section>
      </main>
    )
  }

  return (
    <main className="wof-page">
      <section className="wof-shell">
        <header className="wof-head">
          <button type="button" className="wof-back" onClick={onBack}>Orqaga</button>
          <h1>Baraban O&apos;yini</h1>
          <button type="button" className="wof-reset" onClick={() => setScreen('setup')}>Sozlama</button>
        </header>

        <section className="wof-main">
          <article className="wof-wheel-card">
            <div className="wof-turn-tag">O&apos;quvchi Tanlash</div>
            <div className="wof-wheel-zone">
              <div className="wof-pointer" aria-hidden="true" />
              <div
                className="wof-wheel"
                style={{ background: buildStudentGradient(students), transform: `rotate(${studentRotation}deg)` }}
              >
                {students.map((name, index) => {
                  const studentSegmentSize = students.length === 0 ? 0 : 360 / students.length
                  const angle = index * studentSegmentSize + studentSegmentSize / 2
                  return (
                    <span
                      key={`${name}-${index}`}
                      className="wof-segment-label"
                      style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-130px)` }}
                    >
                      <b>{name}</b>
                    </span>
                  )
                })}
                <div className="wof-wheel-core" />
              </div>
            </div>

            <div className="wof-wheel-actions">
              <button type="button" className="wof-spin" onClick={spinStudentWheel} disabled={studentSpinning || students.length === 0}>
                {studentSpinning ? 'Aylanmoqda...' : 'Aylantirish'}
              </button>
            </div>
          </article>

          <aside className="wof-side">
            <section className="wof-scoreboard">
              <h2>Savol Zonasi</h2>
              {selectedStudent && activeQuestion ? (
                <>
                  <p className="wof-student-pick">O&apos;quvchi: <strong>{selectedStudent}</strong></p>
                  <p className="wof-qtext">{activeQuestion.text}</p>
                  <p className="wof-qmeta">
                    Daraja: <b>{activeQuestion.level}</b> • Ball: <b>+{activeQuestion.points}</b> • Vaqt: <b>{formatClock(timeLeft)}</b>
                  </p>
                  <div className="wof-judge">
                    <button type="button" onClick={() => setTimerRunning((prev) => !prev)}>
                      {timerRunning ? 'Pauza' : 'Davom'}
                    </button>
                    <button type="button" onClick={() => setTimeLeft(activeQuestion.seconds)}>Qayta vaqt</button>
                  </div>
                  <div className="wof-judge">
                    <button type="button" onClick={() => markStudentAnswer(true)}>To&apos;g&apos;ri (+{activeQuestion.points})</button>
                    <button type="button" onClick={() => markStudentAnswer(false)}>Noto&apos;g&apos;ri (0)</button>
                  </div>
                </>
              ) : (
                <p className="wof-muted">Wheel ni aylantiring, tanlangan o&apos;quvchiga savol chiqadi.</p>
              )}
            </section>

            <section className="wof-history">
              <h2>O&apos;quvchi Ballari</h2>
              <ul>
                {sortedStudentBoard.map((item, index) => (
                  <li key={item.name}>
                    <strong>{index + 1}. {item.name}</strong>
                    <span>Ball: {item.score}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </section>
      </section>
    </main>
  )
}

export default WheelOfFortunePage
