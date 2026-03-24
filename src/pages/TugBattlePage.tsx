import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import Confetti from 'react-confetti-boom'
import charactersImage from '../assets/characters (1).webp'
import './TugBattlePage.css'

export type BattleQuestion = {
  text: string
  answer: string
  options: string[]
  operation?: 'add' | 'sub' | 'mul' | 'div'
}

type TugBattlePageProps = {
  teamA: string
  teamB: string
  questions: BattleQuestion[]
  onBack: () => void
}

const MATCH_TIME = 420
const MAX_ROPE_SHIFT = 8

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function getQuestion(questions: BattleQuestion[], cursor: number, previousText: string | null): BattleQuestion {
  const length = questions.length
  const safeIndex = cursor % length
  const candidate = questions[safeIndex]

  if (length <= 1 || !previousText || candidate.text !== previousText) {
    return candidate
  }

  for (let offset = 1; offset < length; offset += 1) {
    const index = (safeIndex + offset) % length
    const next = questions[index]
    if (next.text !== previousText) {
      return next
    }
  }

  return candidate
}

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

function TugBattlePage({ teamA, teamB, questions, onBack }: TugBattlePageProps) {
  const [timeLeft, setTimeLeft] = useState(MATCH_TIME)
  const [scores, setScores] = useState<[number, number]>([0, 0])
  const [ropeShift, setRopeShift] = useState(0)
  const [roundCursor, setRoundCursor] = useState(0)
  const [pullWinner, setPullWinner] = useState<0 | 1 | null>(null)
  const [flashA, setFlashA] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [flashB, setFlashB] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [wrongOptionA, setWrongOptionA] = useState<number | null>(null)
  const [wrongOptionB, setWrongOptionB] = useState<number | null>(null)
  const [answeredA, setAnsweredA] = useState(false)
  const [answeredB, setAnsweredB] = useState(false)
  const [wrongA, setWrongA] = useState(false)
  const [wrongB, setWrongB] = useState(false)
  const [lastQuestionText, setLastQuestionText] = useState<string | null>(null)

  const finished = timeLeft <= 0 || pullWinner !== null
  const currentQuestion = getQuestion(questions, roundCursor, lastQuestionText)

  const winnerLabel = useMemo(() => {
    if (!finished) {
      return ''
    }

    if (pullWinner === 0) {
      return `${teamA} g'olib!`
    }

    if (pullWinner === 1) {
      return `${teamB} g'olib!`
    }

    if (scores[0] === scores[1]) {
      return 'Durrang!'
    }

    return scores[0] > scores[1] ? `${teamA} g'olib!` : `${teamB} g'olib!`
  }, [finished, pullWinner, scores, teamA, teamB])

  useEffect(() => {
    if (finished) {
      return
    }

    const timerId = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [finished, timeLeft])

  useEffect(() => {
    if (flashA === 'idle') {
      return
    }

    const timerId = window.setTimeout(() => setFlashA('idle'), 280)
    return () => window.clearTimeout(timerId)
  }, [flashA])

  useEffect(() => {
    if (flashB === 'idle') {
      return
    }

    const timerId = window.setTimeout(() => setFlashB('idle'), 280)
    return () => window.clearTimeout(timerId)
  }, [flashB])

  useEffect(() => {
    if (!wrongOptionA) {
      return
    }
    const timerId = window.setTimeout(() => setWrongOptionA(null), 420)
    return () => window.clearTimeout(timerId)
  }, [wrongOptionA])

  useEffect(() => {
    if (!wrongOptionB) {
      return
    }
    const timerId = window.setTimeout(() => setWrongOptionB(null), 420)
    return () => window.clearTimeout(timerId)
  }, [wrongOptionB])

  const submitOption = (teamIndex: 0 | 1, selectedOption: string, optionIndex: number) => {
    if (finished) {
      return
    }

    if (teamIndex === 0) {
      if (answeredA) {
        return
      }

      if (selectedOption === currentQuestion.answer) {
        const nextShift = clamp(ropeShift - 1, -MAX_ROPE_SHIFT, MAX_ROPE_SHIFT)
        setScores((prev) => [prev[0] + 1, prev[1]])
        setRopeShift(nextShift)
        setFlashA('correct')
        setWrongOptionA(null)
        setAnsweredA(false)
        setAnsweredB(false)
        setWrongA(false)
        setWrongB(false)
        setWrongOptionB(null)
        setLastQuestionText(currentQuestion.text)
        setRoundCursor((prev) => prev + 1)
        if (nextShift <= -MAX_ROPE_SHIFT) {
          setPullWinner(0)
        }
      } else {
        setFlashA('wrong')
        setWrongOptionA(optionIndex)
        setAnsweredA(true)
        setWrongA(true)
        window.navigator.vibrate?.([120, 60, 120])
        if (wrongB) {
          setAnsweredA(false)
          setAnsweredB(false)
          setWrongA(false)
          setWrongB(false)
          setWrongOptionA(null)
          setWrongOptionB(null)
          setRoundCursor((prev) => prev + 1)
        }
      }
      return
    }

    if (answeredB) {
      return
    }

    if (selectedOption === currentQuestion.answer) {
      const nextShift = clamp(ropeShift + 1, -MAX_ROPE_SHIFT, MAX_ROPE_SHIFT)
      setScores((prev) => [prev[0], prev[1] + 1])
      setRopeShift(nextShift)
      setFlashB('correct')
      setWrongOptionB(null)
      setAnsweredA(false)
      setAnsweredB(false)
      setWrongA(false)
      setWrongB(false)
      setWrongOptionA(null)
      setLastQuestionText(currentQuestion.text)
      setRoundCursor((prev) => prev + 1)
      if (nextShift >= MAX_ROPE_SHIFT) {
        setPullWinner(1)
      }
    } else {
      setFlashB('wrong')
      setWrongOptionB(optionIndex)
      setAnsweredB(true)
      setWrongB(true)
      window.navigator.vibrate?.([120, 60, 120])
      if (wrongA) {
        setAnsweredA(false)
        setAnsweredB(false)
          setWrongA(false)
          setWrongB(false)
          setWrongOptionA(null)
          setWrongOptionB(null)
          setLastQuestionText(currentQuestion.text)
          setRoundCursor((prev) => prev + 1)
        }
      }
  }

  const restart = () => {
    setTimeLeft(MATCH_TIME)
    setScores([0, 0])
    setRopeShift(0)
    setRoundCursor(0)
    setPullWinner(null)
    setFlashA('idle')
    setFlashB('idle')
    setWrongOptionA(null)
    setWrongOptionB(null)
    setAnsweredA(false)
    setAnsweredB(false)
    setWrongA(false)
    setWrongB(false)
    setLastQuestionText(null)
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      return
    }

    await document.exitFullscreen()
  }

  const sideClassA = flashA === 'idle' ? 'tb-side' : `tb-side tb-side-${flashA}`
  const sideClassB = flashB === 'idle' ? 'tb-side' : `tb-side tb-side-${flashB}`
  const arenaStyle = { '--rope-shift': `${ropeShift * 14}px` } as CSSProperties
  const dangerRatio = Math.min(1, Math.abs(ropeShift) / MAX_ROPE_SHIFT)
  const warningLine = dangerRatio >= 0.6 && !finished
  const midlineStyle = {
    '--midline-thickness': `${2 + dangerRatio * 8}px`,
    '--midline-glow': `${0.2 + dangerRatio * 0.8}`,
  } as CSSProperties
  const hasWinner = finished && winnerLabel !== 'Durrang!'

  return (
    <main className="tb-page">
      <div className="tb-topbar">
        <button type="button" className="tb-clock">⏱ {formatClock(timeLeft)}</button>
        <h1>Jamoaviy musobaqa</h1>
        <div className="tb-pill-row">
          <span className="tb-pill tb-pill-blue">{teamA}: {scores[0]} ball</span>
          <span className="tb-pipe">|</span>
          <span className="tb-pill tb-pill-red">{teamB}: {scores[1]} ball</span>
        </div>
      </div>

      <section className="tb-layout">
        <article className={sideClassA}>
          <div className="tb-question tb-question-blue">{currentQuestion.text}</div>
          <div className="tb-options" role="group" aria-label={`${teamA} variantlari`}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={`a-${currentQuestion.text}-${index}`}
                type="button"
                className={wrongOptionA === index ? 'tb-option tb-option-wrong' : 'tb-option'}
                onClick={() => submitOption(0, option, index)}
                disabled={finished || answeredA}
              >
                {option}
              </button>
            ))}
          </div>
        </article>

        <section className="tb-center">
          <div className="tb-arena" aria-hidden="true" style={arenaStyle}>
            <div className={warningLine ? 'tb-midline tb-midline-warning' : 'tb-midline'} style={midlineStyle} />
            <div className="tb-characters">
              <img src={charactersImage} alt="" className="tb-characters-image" />
            </div>
          </div>
          <p className="tb-hint">Arqonni tortish uchun savollarga to&apos;g&apos;ri javob bering!</p>
          {finished ? <p className="tb-result">{winnerLabel} ({scores[0]}:{scores[1]})</p> : null}
        </section>

        <article className={sideClassB}>
          <div className="tb-question tb-question-red">{currentQuestion.text}</div>
          <div className="tb-options" role="group" aria-label={`${teamB} variantlari`}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={`b-${currentQuestion.text}-${index}`}
                type="button"
                className={wrongOptionB === index ? 'tb-option tb-option-wrong' : 'tb-option'}
                onClick={() => submitOption(1, option, index)}
                disabled={finished || answeredB}
              >
                {option}
              </button>
            ))}
          </div>
        </article>
      </section>

      <div className="tb-floating tb-floating-left">
        <button type="button" onClick={onBack} aria-label="Orqaga qaytish">⌂</button>
      </div>
      <div className="tb-floating tb-floating-right">
        <button type="button" onClick={toggleFullscreen} aria-label="To'liq ekran">↗</button>
      </div>

      {hasWinner ? (
        <Confetti
          mode="boom"
          x={0.5}
          y={0.35}
          particleCount={120}
          shapeSize={14}
          spreadDeg={70}
          effectCount={1}
          colors={['#ff4d4f', '#ffd43b', '#4dabf7', '#63e6be', '#b197fc', '#ff922b']}
          className="tb-confetti-boom"
        />
      ) : null}

      {finished ? (
        <div className="tb-overlay">
          <div className="tb-modal">
            <div className="tb-modal-head">
              <p className="tb-modal-tag">Final Natija</p>
              <h2>{winnerLabel}</h2>
            </div>

            <p className="tb-modal-subtitle">Yakuniy hisob</p>
            <div className="tb-modal-scoreboard">
              <div className="tb-modal-team">
                <span>{teamA}</span>
                <strong>{scores[0]}</strong>
              </div>
              <span className="tb-modal-sep">:</span>
              <div className="tb-modal-team">
                <span>{teamB}</span>
                <strong>{scores[1]}</strong>
              </div>
            </div>

            <div className="tb-actions">
              <button type="button" onClick={restart}>Qayta o&apos;ynash</button>
              <button type="button" onClick={onBack}>Sozlamaga qaytish</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default TugBattlePage
