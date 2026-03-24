import { useEffect, useMemo, useState } from 'react'
import './FootballChallengePage.css'
import { getTeacherItems } from '../lib/teacherContent'

type Quiz = {
  question: string
  options: string[]
  answer: string
}

type FootballChallengePageProps = {
  onBack: () => void
}

type GameStage = 'intro' | 'quiz' | 'aim' | 'result' | 'finished'
type ShotDirection = 'left' | 'center' | 'right'

const TOTAL_ROUNDS = 5
const TARGETS: ShotDirection[] = ['left', 'center', 'right']

const fallbackQuestions: Quiz[] = [
  { question: '16 + 4 = ?', options: ['18', '19', '20', '21'], answer: '20' },
  { question: 'O‘zbekiston poytaxti qaysi?', options: ['Samarqand', 'Buxoro', 'Toshkent', 'Xiva'], answer: 'Toshkent' },
  { question: '5 x 6 = ?', options: ['25', '30', '35', '40'], answer: '30' },
  { question: 'Suvning formulasi qaysi?', options: ['CO2', 'NaCl', 'H2O', 'O2'], answer: 'H2O' },
  { question: 'Ingliz tilida “book” nimani anglatadi?', options: ['Qalam', 'Kitob', 'Daftar', 'Stol'], answer: 'Kitob' },
  { question: '12 - 7 = ?', options: ['3', '4', '5', '6'], answer: '5' },
  { question: 'Quyosh qaysi tomondan chiqadi?', options: ['G‘arb', 'Shimol', 'Sharq', 'Janub'], answer: 'Sharq' },
]

function normalizeTeacherFootballQuiz(input: unknown): Quiz | null {
  if (!input || typeof input !== 'object') return null
  const item = input as Partial<Quiz>
  if (
    typeof item.question !== 'string' ||
    !Array.isArray(item.options) ||
    item.options.some((opt) => typeof opt !== 'string') ||
    typeof item.answer !== 'string'
  ) {
    return null
  }
  if (!item.options.includes(item.answer)) return null
  return {
    question: item.question,
    options: item.options.slice(0, 4),
    answer: item.answer,
  }
}

function shuffle<T>(items: T[]) {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

function playSfx(kind: 'goal' | 'save' | 'correct' | 'wrong') {
  const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return

  const ctx = new AC()
  const master = ctx.createGain()
  master.gain.value = 0.16
  master.connect(ctx.destination)
  const now = ctx.currentTime + 0.01

  const tone = (type: OscillatorType, from: number, to: number, duration: number, gainValue: number) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(from, now)
    osc.frequency.exponentialRampToValueAtTime(to, now + duration)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.connect(gain)
    gain.connect(master)
    osc.start(now)
    osc.stop(now + duration)
  }

  if (kind === 'goal') {
    tone('triangle', 420, 760, 0.25, 0.22)
    tone('sine', 720, 980, 0.32, 0.18)
  }
  if (kind === 'save') {
    tone('sawtooth', 260, 150, 0.28, 0.14)
  }
  if (kind === 'correct') {
    tone('triangle', 520, 720, 0.18, 0.12)
  }
  if (kind === 'wrong') {
    tone('sine', 220, 130, 0.22, 0.12)
  }

  window.setTimeout(() => void ctx.close(), 420)
}

export default function FootballChallengePage({ onBack }: FootballChallengePageProps) {
  const teacherQuestions = useMemo(
    () =>
      getTeacherItems<unknown>('football-challenge')
        .map(normalizeTeacherFootballQuiz)
        .filter((item): item is Quiz => item !== null),
    [],
  )

  const questionPool = useMemo(() => {
    const source = teacherQuestions.length > 0 ? teacherQuestions : fallbackQuestions
    return shuffle(source).slice(0, TOTAL_ROUNDS)
  }, [teacherQuestions])

  const [stage, setStage] = useState<GameStage>('intro')
  const [soundOn, setSoundOn] = useState(true)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [goals, setGoals] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [currentOpenTarget, setCurrentOpenTarget] = useState<ShotDirection>('left')
  const [shotDirection, setShotDirection] = useState<ShotDirection | null>(null)
  const [lastResult, setLastResult] = useState<'goal' | 'save' | null>(null)
  const [message, setMessage] = useState("Boshlashni bosing. Har raund: savol + zarba.")
  const [keeperOffset, setKeeperOffset] = useState(0)

  const currentQuestion = questionPool[round] ?? questionPool[questionPool.length - 1] ?? fallbackQuestions[0]
  const progress = Math.min(100, Math.round((round / TOTAL_ROUNDS) * 100))

  useEffect(() => {
    if (stage === 'intro' || stage === 'finished') return
    const timer = window.setInterval(() => {
      setKeeperOffset((prev) => {
        const next = prev + 1
        if (next > 1) return -1
        return next
      })
    }, 850)

    return () => window.clearInterval(timer)
  }, [stage])

  const startGame = () => {
    setRound(0)
    setScore(0)
    setGoals(0)
    setStreak(0)
    setBestStreak(0)
    setSelectedAnswer(null)
    setShotDirection(null)
    setLastResult(null)
    setCurrentOpenTarget(TARGETS[Math.floor(Math.random() * TARGETS.length)])
    setMessage("Savolga javob bering, keyin ochiq burchakka zarba bering.")
    setStage('quiz')
  }

  const finishRound = (goalScored: boolean) => {
    const nextRound = round + 1
    if (nextRound >= TOTAL_ROUNDS) {
      setStage('finished')
      setMessage(goalScored ? "So‘nggi raund ham gol bilan tugadi." : "O‘yin tugadi. Natija tayyor.")
      return
    }

    window.setTimeout(() => {
      setRound(nextRound)
      setSelectedAnswer(null)
      setShotDirection(null)
      setLastResult(null)
      setCurrentOpenTarget(TARGETS[Math.floor(Math.random() * TARGETS.length)])
      setMessage("Keyingi savol tayyor. To‘g‘ri javobdan keyin zarba bering.")
      setStage('quiz')
    }, 1100)
  }

  const answerQuestion = (option: string) => {
    if (stage !== 'quiz') return
    setSelectedAnswer(option)

    if (option !== currentQuestion.answer) {
      if (soundOn) playSfx('wrong')
      setLastResult('save')
      setStreak(0)
      setMessage("Noto‘g‘ri javob. Bu raundda keeper ustun keldi.")
      setStage('result')
      finishRound(false)
      return
    }

    if (soundOn) playSfx('correct')
    setMessage("To‘g‘ri! Endi qaysi burchakka tepishni tanlang.")
    setStage('aim')
  }

  const takeShot = (direction: ShotDirection) => {
    if (stage !== 'aim') return
    setShotDirection(direction)

    const goalScored = direction === currentOpenTarget
    if (goalScored) {
      if (soundOn) playSfx('goal')
      setGoals((prev) => prev + 1)
      setScore((prev) => prev + 100)
      setStreak((prev) => {
        const next = prev + 1
        setBestStreak((best) => Math.max(best, next))
        return next
      })
      setLastResult('goal')
      setMessage('GOOL! Ochiq burchakni to‘g‘ri topdingiz.')
    } else {
      if (soundOn) playSfx('save')
      setStreak(0)
      setLastResult('save')
      setMessage('Keeper ushlab qoldi. Keyingi raundga o‘tamiz.')
    }

    setStage('result')
    finishRound(goalScored)
  }

  const keeperClass =
    shotDirection === 'left'
      ? 'fcx-keeper dive-left'
      : shotDirection === 'right'
        ? 'fcx-keeper dive-right'
        : shotDirection === 'center'
          ? 'fcx-keeper dive-center'
          : keeperOffset < 0
            ? 'fcx-keeper shift-left'
            : keeperOffset > 0
              ? 'fcx-keeper shift-right'
              : ''

  const ballClass = (() => {
    if (!shotDirection || !lastResult) return 'fcx-ball'
    if (lastResult === 'goal') return `fcx-ball shot-goal shot-${shotDirection}`
    return `fcx-ball shot-save shot-${shotDirection}`
  })()

  return (
    <main className="fcx-page">
      <div className="fcx-shell">
        <header className="fcx-header">
          <div className="fcx-topbar">
            <button type="button" className="fcx-back" onClick={onBack}>
              ← Games sahifasi
            </button>
            <button type="button" className="fcx-sound" onClick={() => setSoundOn((prev) => !prev)}>
              {soundOn ? 'Sound ON' : 'Sound OFF'}
            </button>
          </div>

          <div className="fcx-heading">
            <div>
              <p className="fcx-kicker">Easy Football Quiz Game</p>
              <h1>Football Challenge</h1>
              <p className="fcx-subtitle">Har raund: bitta savol, bitta zarba, bitta gol imkoniyati.</p>
            </div>

            <div className="fcx-scoreline">
              <div className="fcx-pill">
                <span>Raund</span>
                <strong>{Math.min(round + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}</strong>
              </div>
              <div className="fcx-pill">
                <span>Gol</span>
                <strong>{goals}</strong>
              </div>
              <div className="fcx-pill">
                <span>Ball</span>
                <strong>{score}</strong>
              </div>
            </div>
          </div>
        </header>

        <section className="fcx-grid">
          <section className="fcx-field-wrap">
            <div className="fcx-progress">
              <div className="fcx-progress-bar">
                <span style={{ width: `${progress}%` }} />
              </div>
              <strong>{progress}% yakunlandi</strong>
            </div>

            <div className="fcx-field">
              <div className="fcx-crowd top" aria-hidden="true" />
              <div className="fcx-goal-area" aria-hidden="true">
                <div className={`fcx-goal-target ${currentOpenTarget === 'left' ? 'open' : ''}`}>L</div>
                <div className={`fcx-goal-target ${currentOpenTarget === 'center' ? 'open' : ''}`}>C</div>
                <div className={`fcx-goal-target ${currentOpenTarget === 'right' ? 'open' : ''}`}>R</div>
                <div className={`fcx-keeper ${keeperClass}`}>🧤</div>
                {lastResult === 'goal' ? <div className="fcx-goal-flash">GOAL</div> : null}
                {lastResult === 'save' && stage === 'result' ? <div className="fcx-save-flash">SAVE</div> : null}
              </div>

              <div className="fcx-field-lines" aria-hidden="true" />
              <div className="fcx-player">🧍</div>
              <div className={ballClass}>⚽</div>
            </div>
          </section>

          <aside className="fcx-panel">
            {stage === 'intro' ? (
              <div className="fcx-card">
                <p className="fcx-card-kicker">How To Play</p>
                <h2>Yengil va oson format</h2>
                <p>Sizda 5 ta penalty raund bor. Har safar avval savolga javob berasiz. To‘g‘ri topsangiz, zarba yo‘nalishini tanlaysiz. Ochiq burchakni topsangiz gol bo‘ladi.</p>
                <ul className="fcx-rules">
                  <li>To‘g‘ri javob: zarba berish huquqi</li>
                  <li>Noto‘g‘ri javob: raund boy beriladi</li>
                  <li>Ochiq burchakka tepsangiz: +100 ball</li>
                  <li>5 raund oxirida ko‘proq gol urishga harakat qiling</li>
                </ul>
                <button type="button" className="fcx-main-btn" onClick={startGame}>
                  O‘yinni boshlash
                </button>
              </div>
            ) : null}

            {stage === 'quiz' ? (
              <div className="fcx-card">
                <p className="fcx-card-kicker">Quiz Round</p>
                <h2>Savolga javob bering</h2>
                <p className="fcx-question">{currentQuestion.question}</p>
                <div className="fcx-options">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={selectedAnswer === option ? 'fcx-option active' : 'fcx-option'}
                      onClick={() => answerQuestion(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {stage === 'aim' ? (
              <div className="fcx-card">
                <p className="fcx-card-kicker">Shot Choice</p>
                <h2>Zarba yo‘nalishini tanlang</h2>
                <p>Darvozadagi yorqin yashil zona ochiq burchakni ko‘rsatadi.</p>
                <div className="fcx-options fcx-shoot-options">
                  <button type="button" className="fcx-option" onClick={() => takeShot('left')}>
                    Chap
                  </button>
                  <button type="button" className="fcx-option" onClick={() => takeShot('center')}>
                    Markaz
                  </button>
                  <button type="button" className="fcx-option" onClick={() => takeShot('right')}>
                    O‘ng
                  </button>
                </div>
              </div>
            ) : null}

            {stage === 'result' ? (
              <div className="fcx-card">
                <p className="fcx-card-kicker">Round Result</p>
                <h2>{lastResult === 'goal' ? 'Gol bo‘ldi' : 'Raund boy berildi'}</h2>
                <p>{message}</p>
              </div>
            ) : null}

            {stage === 'finished' ? (
              <div className="fcx-card fcx-finished">
                <p className="fcx-card-kicker">Final Result</p>
                <h2>{goals >= 4 ? 'Super striker' : goals >= 2 ? 'Yaxshi natija' : 'Yana urinib ko‘ring'}</h2>
                <p>5 raund tugadi. Siz {goals} ta gol urdingiz va {score} ball to‘pladingiz.</p>
                <div className="fcx-finished-stats">
                  <div>
                    <span>Goals</span>
                    <strong>{goals}</strong>
                  </div>
                  <div>
                    <span>Best Streak</span>
                    <strong>{bestStreak}x</strong>
                  </div>
                  <div>
                    <span>Score</span>
                    <strong>{score}</strong>
                  </div>
                </div>
                <button type="button" className="fcx-main-btn" onClick={startGame}>
                  Qayta o‘ynash
                </button>
              </div>
            ) : null}

            <div className="fcx-card fcx-side-card">
              <p className="fcx-card-kicker">Status</p>
              <h3>{stage === 'aim' ? 'Kick ready' : stage === 'quiz' ? 'Question live' : stage === 'finished' ? 'Match over' : 'Match mode'}</h3>
              <p>{message}</p>
              <div className="fcx-mini-grid">
                <div>
                  <span>Combo</span>
                  <strong>{streak}x</strong>
                </div>
                <div>
                  <span>Best</span>
                  <strong>{bestStreak}x</strong>
                </div>
                <div>
                  <span>Open Zone</span>
                  <strong>{currentOpenTarget === 'left' ? 'Chap' : currentOpenTarget === 'center' ? 'Markaz' : 'O‘ng'}</strong>
                </div>
              </div>
              <button type="button" className="fcx-ghost-btn" onClick={startGame}>
                Restart
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
