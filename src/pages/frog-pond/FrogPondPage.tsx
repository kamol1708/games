import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FrogPondPage.css'
import { frogQuizQuestions, frogQuizStageTwoQuestions, frogQuizStageThreeQuestions, type FrogQuizQuestion } from './frogQuizQuestions'
import frogSprite from '../../assets/green-frog-jumping-wild-animal-toad-top-view-isolated-white-background_80590-19908.svg'
import lilyPadSprite from '../../assets/Screenshot 2026-03-19 at 09.14.08 (1).svg'
import stageTwoLilyPadSprite from '../../assets/stage-two-lily-pad.webp'
import stageThreeLilyPadSprite from '../../assets/stage-three-leaf.png'
import stageThreeFrogSprite from '../../assets/stage-three-frog-cropped.svg'

type GameStatus = 'idle' | 'question' | 'jumping' | 'sinking' | 'feedback' | 'won' | 'lost'
type GameMode = 'solo' | 'team'
type FrogId = 'frogA' | 'frogB'

type ActiveQuestion = {
  frogId: FrogId
  levelIndex: number
  padIndex: number
  questionIndex: number
  question: FrogQuizQuestion
}

type Position = {
  left: number
  top: number
}

type CompletedJump = {
  levelIndex: number
  padIndex: number
}

type FrogState = {
  completedJumps: CompletedJump[]
  seenQuestionsByLevel: number[][]
}

type FeedbackState = {
  frogId: FrogId
  tone: 'correct' | 'wrong' | 'timeout'
  title: string
  description: string
}

const LEVEL_COUNT = 7
const STAGE_COUNT = 3
const QUESTION_SECONDS = 20

const columnPositions = [10, 18.5, 27, 35.5, 44, 52.5, 61]
const lanePositions = [18, 34, 50, 66, 82]

const rowLayouts: Position[][] = columnPositions.map((left) =>
  lanePositions.map((top) => ({ left, top })),
)

const frogStartPosition: Position = {
  left: 3.1,
  top: 58,
}

const TEAM_START_VERTICAL_OFFSET = 6.1
const SHARED_PAD_VERTICAL_OFFSET = 5.8
const PAD_CENTER_OFFSET_X = 0
const PAD_CENTER_OFFSET_Y = 0

function createInitialFrogState(): FrogState {
  return {
    completedJumps: [],
    seenQuestionsByLevel: Array.from({ length: LEVEL_COUNT }, () => []),
  }
}

function buildLevels(stageIndex: number) {
  const pool =
    stageIndex === 0
      ? frogQuizQuestions
      : stageIndex === 1
        ? frogQuizStageTwoQuestions
        : frogQuizStageThreeQuestions
  return Array.from({ length: LEVEL_COUNT }, (_, levelIndex) => shuffleLevel(pool[levelIndex % pool.length]))
}

function getQuestionIndexForAttempt(level: FrogQuizQuestion[], padIndex: number, seenIndexes: number[]) {
  for (let offset = 0; offset < level.length; offset += 1) {
    const candidate = (padIndex + offset) % level.length
    if (!seenIndexes.includes(candidate)) {
      return candidate
    }
  }

  return padIndex % level.length
}

function alignToPad(position: Position): Position {
  return {
    left: position.left + PAD_CENTER_OFFSET_X,
    top: position.top + PAD_CENTER_OFFSET_Y,
  }
}

function shuffleLevel(level: FrogQuizQuestion[]): FrogQuizQuestion[] {
  const next = [...level]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = next[i]
    next[i] = next[j]
    next[j] = tmp
  }
  return next
}

function padLetter(index: number) {
  return String.fromCharCode(65 + index)
}

function FrogCharacter({ className = '', frogId, sprite }: { className?: string; frogId: FrogId; sprite: string }) {
  return (
    <div className={`frog-pond-frog ${frogId === 'frogB' ? 'frog-b' : 'frog-a'} ${className}`.trim()}>
      <div className="frog-shadow" />
      <img className="frog-pond-frog-image" src={sprite} alt="Frog" draggable={false} />
    </div>
  )
}

function QuizModal({
  data,
  timeLeft,
  onAnswer,
}: {
  data: ActiveQuestion
  timeLeft: number
  onAnswer: (option: string) => void
}) {
  const progress = Math.max(0, (timeLeft / QUESTION_SECONDS) * 100)
  const frogLabel = data.frogId === 'frogA' ? 'Qurbaqa A' : 'Qurbaqa B'

  return (
    <div className="frog-pond-modal-backdrop">
      <div className="frog-pond-modal">
        <div className="frog-pond-modal-top">
          <div>
            <span className="frog-pond-subject">{data.question.subject}</span>
            <p className="frog-pond-modal-note">
              {frogLabel} navbati. Nilufar {padLetter(data.padIndex)} ichidagi savolga 20 soniya ichida javob bering.
            </p>
          </div>
          <div className="frog-pond-timer">
            <span>Vaqt</span>
            <strong>{timeLeft}s</strong>
            <div className="frog-pond-bar">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <h2 className="frog-pond-question">{data.question.question}</h2>

        <div className="frog-pond-answer-grid">
          {data.question.options.map((option, index) => (
            <button key={`${data.levelIndex}-${option}`} type="button" className="frog-pond-answer" onClick={() => onAnswer(option)}>
              <span className="frog-pond-answer-index">{padLetter(index)}</span>
              <span className="frog-pond-answer-text">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeedbackCard({ data }: { data: FeedbackState }) {
  return (
    <div className="frog-pond-modal-backdrop">
      <div className={`frog-pond-modal frog-pond-feedback-card ${data.tone}`}>
        <span className="frog-pond-subject">{data.frogId === 'frogA' ? 'Qurbaqa A' : 'Qurbaqa B'}</span>
        <h2 className="frog-pond-question">{data.title}</h2>
        <p className="frog-pond-modal-note">{data.description}</p>
      </div>
    </div>
  )
}

function ModeOverlay({
  onSelect,
}: {
  onSelect: (mode: GameMode) => void
}) {
  return (
    <div className="frog-pond-overlay frog-pond-mode-overlay">
      <div className="frog-pond-overlay-card mode-select">
        <p className="frog-pond-subject">Frog Pond Quiz</p>
        <h2>Qanday o‘ynaymiz?</h2>
        <p>Bitta o‘quvchi bilan o‘ynash yoki 2 qurbaqa navbatma-navbat bellashadigan jamoaviy rejimni tanlang.</p>

        <div className="frog-pond-mode-grid">
          <button type="button" className="frog-pond-mode-card" onClick={() => onSelect('solo')}>
            <span className="frog-pond-mode-tag">1 kishilik</span>
            <strong>Yakka sarguzasht</strong>
            <p>Bitta qurbaqa bilan 3 bosqich va 7 darajadan iborat yo‘lni tugating. Bosqichlar o‘tgan sari savollar qiyinlashadi.</p>
          </button>

          <button type="button" className="frog-pond-mode-card" onClick={() => onSelect('team')}>
            <span className="frog-pond-mode-tag">Jamoalik</span>
            <strong>2 qurbaqa bellashuvi</strong>
            <p>Yashil va qizil qurbaqa navbatma-navbat savol yechadi. Adashgan qurbaqa boshiga qaytadi, ikkinchisi davom etadi.</p>
          </button>
        </div>
      </div>
    </div>
  )
}

function EndOverlay({
  kind,
  levelIndex,
  score,
  jumps,
  winnerFrog,
  gameMode,
  onRestart,
  onExit,
}: {
  kind: 'won' | 'lost'
  levelIndex: number
  score: number
  jumps: number
  winnerFrog?: FrogId | null
  gameMode: GameMode | null
  onRestart: () => void
  onExit: () => void
}) {
  const isWin = kind === 'won'
  const winnerLabel = winnerFrog === 'frogA' ? 'Qurbaqa A' : winnerFrog === 'frogB' ? 'Qurbaqa B' : null

  return (
    <div className="frog-pond-overlay">
      <div className={`frog-pond-overlay-card ${isWin ? 'win' : 'lose'}`}>
        <p className="frog-pond-subject">{isWin ? 'Pond Master' : 'Splash!'}</p>
        <h2>{isWin ? 'Bosqichlar yakunlandi' : 'Qurbaqa suvga tushib ketdi'}</h2>
        <p>
          {isWin
            ? gameMode === 'team'
              ? winnerLabel
                ? `Ajoyib. ${winnerLabel} oxirgi bosqichda marra chizig‘iga birinchi bo‘lib yetib, g‘olib bo‘ldi.`
                : 'Ajoyib. Ikkala qurbaqa ham barcha bosqichlarni tugatib, pond sarguzashtini birga yakunladi.'
              : 'Ajoyib. Siz nilufarlar bo‘ylab barcha darajalarni bosib o‘tib, pond sarguzashtini muvaffaqiyatli tugatdingiz.'
            : 'Savol xato bo‘ldi yoki vaqt tugadi. Yangi marshrut bilan yana urinib ko‘ring.'}
        </p>
        {isWin && gameMode === 'team' && winnerLabel ? <p className="frog-pond-winner-note">{winnerLabel} g‘olib bo‘ldi.</p> : null}
        {isWin && gameMode !== 'team' && winnerLabel ? <p className="frog-pond-winner-note">{winnerLabel} yutdi.</p> : null}

        <div className="frog-pond-overlay-stats">
          <div>
            <span>Daraja</span>
            <strong>{Math.min(levelIndex + 1, LEVEL_COUNT)}</strong>
          </div>
          <div>
            <span>Ball</span>
            <strong>{score}</strong>
          </div>
          <div>
            <span>Sakrashlar</span>
            <strong>{jumps}</strong>
          </div>
        </div>

        <div className="frog-pond-overlay-actions">
          <button type="button" className="frog-pond-btn primary" onClick={onRestart}>
            {isWin ? 'Yana o‘ynash' : 'Qayta boshlash'}
          </button>
          <button type="button" className="frog-pond-btn secondary" onClick={onExit}>
            Games sahifasi
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FrogPondPage() {
  const navigate = useNavigate()
  const audioContextRef = useRef<AudioContext | null>(null)
  const sinkTimeoutRef = useRef<number | null>(null)
  const feedbackTimeoutRef = useRef<number | null>(null)
  const [gameMode, setGameMode] = useState<GameMode | null>(null)
  const [stageIndex, setStageIndex] = useState(0)
  const [levels, setLevels] = useState<FrogQuizQuestion[][]>(() => buildLevels(0))
  const [currentFrog, setCurrentFrog] = useState<FrogId>('frogA')
  const [winnerFrog, setWinnerFrog] = useState<FrogId | null>(null)
  const [status, setStatus] = useState<GameStatus>('idle')
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS)
  const [score, setScore] = useState(0)
  const [frogStates, setFrogStates] = useState<Record<FrogId, FrogState>>({
    frogA: createInitialFrogState(),
    frogB: createInitialFrogState(),
  })
  const [attemptedJump, setAttemptedJump] = useState<CompletedJump | null>(null)
  const [motionFrogId, setMotionFrogId] = useState<FrogId | null>(null)

  const activeFrogs: FrogId[] = gameMode === 'team' ? ['frogA', 'frogB'] : ['frogA']
  const currentLevelIndex = frogStates[currentFrog].completedJumps.length
  const isFrogStageComplete = (frogId: FrogId) => frogStates[frogId].completedJumps.length >= LEVEL_COUNT
  const currentLilyPadSprite = stageIndex === 2 ? stageThreeLilyPadSprite : stageIndex === 1 ? stageTwoLilyPadSprite : lilyPadSprite
  const currentFrogSprite = stageIndex === 2 ? stageThreeFrogSprite : frogSprite

  const getFrogPosition = (frogId: FrogId): Position => {
    const committed = frogStates[frogId].completedJumps
    const activeJump = motionFrogId === frogId && attemptedJump ? attemptedJump : null
    const lastJump = activeJump ?? committed[committed.length - 1]
    const otherFrogId: FrogId = frogId === 'frogA' ? 'frogB' : 'frogA'
    const otherCommitted = frogStates[otherFrogId].completedJumps
    const otherActiveJump = motionFrogId === otherFrogId && attemptedJump ? attemptedJump : null
    const otherLastJump = otherActiveJump ?? otherCommitted[otherCommitted.length - 1]

    if (!lastJump) {
      if (gameMode !== 'team') {
        return frogStartPosition
      }
      return frogId === 'frogA'
        ? { left: frogStartPosition.left, top: frogStartPosition.top + TEAM_START_VERTICAL_OFFSET }
        : { left: frogStartPosition.left, top: frogStartPosition.top - TEAM_START_VERTICAL_OFFSET }
    }

    const pad = rowLayouts[lastJump.levelIndex][lastJump.padIndex]
    const sharesPad =
      gameMode === 'team' &&
      otherLastJump &&
      otherLastJump.levelIndex === lastJump.levelIndex &&
      otherLastJump.padIndex === lastJump.padIndex

    if (activeJump) {
      const jumpingPad = rowLayouts[activeJump.levelIndex][activeJump.padIndex]
      return alignToPad({ left: jumpingPad.left, top: jumpingPad.top })
    }

    if (!sharesPad) {
      return alignToPad({ left: pad.left, top: pad.top })
    }

    return frogId === 'frogA'
      ? alignToPad({ left: pad.left, top: pad.top + SHARED_PAD_VERTICAL_OFFSET })
      : alignToPad({ left: pad.left, top: pad.top - SHARED_PAD_VERTICAL_OFFSET })
  }

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null
    const AudioCtx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return null
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx()
    }
    if (audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume()
    }
    return audioContextRef.current
  }

  const playJumpSound = () => {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.12)
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.24)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(900, now)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.3)
  }

  const playSinkSound = () => {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.45)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(700, now)
    filter.frequency.exponentialRampToValueAtTime(240, now + 0.45)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.52)
  }

  const clearSinkTimeout = () => {
    if (sinkTimeoutRef.current !== null) {
      window.clearTimeout(sinkTimeoutRef.current)
      sinkTimeoutRef.current = null
    }
  }

  const clearFeedbackTimeout = () => {
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current)
      feedbackTimeoutRef.current = null
    }
  }

  const scheduleTurnAdvance = (callback: () => void, delay = 1050) => {
    clearFeedbackTimeout()
    feedbackTimeoutRef.current = window.setTimeout(() => {
      feedbackTimeoutRef.current = null
      callback()
    }, delay)
  }

  const startSinkSequence = (frogId: FrogId, reason: 'wrong' | 'timeout') => {
    clearSinkTimeout()
    clearFeedbackTimeout()
    setStatus('sinking')
    setMotionFrogId(frogId)
    setTimeLeft(0)
    setFeedback({
      frogId,
      tone: reason,
      title: reason === 'timeout' ? 'Vaqt tugadi' : 'Javob xato',
      description:
        reason === 'timeout'
          ? `${frogId === 'frogA' ? 'Qurbaqa A' : 'Qurbaqa B'} ulgurmay qoldi. Endi u boshidan boshlaydi.`
          : `${frogId === 'frogA' ? 'Qurbaqa A' : 'Qurbaqa B'} bu savolda adashdi. U 0-darajaga qaytadi.`,
    })
    setActiveQuestion(null)
    playSinkSound()

    sinkTimeoutRef.current = window.setTimeout(() => {
      setTimeLeft(QUESTION_SECONDS)
      setAttemptedJump(null)
      setMotionFrogId(null)
      sinkTimeoutRef.current = null
      if (gameMode === 'solo') {
        setStatus('lost')
        return
      }

      setFrogStates((prev) => ({
        ...prev,
        [frogId]: {
          ...prev[frogId],
          completedJumps: [],
        },
      }))
      setFeedback({
        frogId,
        tone: reason,
        title: reason === 'timeout' ? 'Boshidan qaytdi' : 'Qayta urinadi',
        description: `Navbat endi ${frogId === 'frogA' ? 'Qurbaqa B' : 'Qurbaqa A'} ga o‘tdi.`,
      })
      setStatus('feedback')
      setCurrentFrog(frogId === 'frogA' ? 'frogB' : 'frogA')

      scheduleTurnAdvance(() => {
        setFeedback(null)
        setStatus('idle')
      }, 850)
    }, 1200)
  }

  const advanceToNextStage = () => {
    const nextStageIndex = stageIndex + 1

    if (nextStageIndex >= STAGE_COUNT) {
      setWinnerFrog(gameMode === 'solo' ? 'frogA' : null)
      setStatus('won')
      return
    }

    setStageIndex(nextStageIndex)
    setLevels(buildLevels(nextStageIndex))
    setCurrentFrog('frogA')
    setMotionFrogId(null)
    setAttemptedJump(null)
    setActiveQuestion(null)
    setTimeLeft(QUESTION_SECONDS)
    setFrogStates({
      frogA: createInitialFrogState(),
      frogB: createInitialFrogState(),
    })
    setFeedback({
      frogId: 'frogA',
      tone: 'correct',
      title: `${nextStageIndex + 1}-bosqich boshlandi`,
      description:
        gameMode === 'team'
          ? 'Ikkala qurbaqa ham marra chizig‘iga yetdi. Endi yangi bosqichda davom etamiz.'
          : 'Yangi bosqichda savollar qiyinlashdi. Yo‘l davom etadi.',
    })
    setStatus('feedback')

    scheduleTurnAdvance(() => {
      setFeedback(null)
      setStatus('idle')
    }, 1200)
  }

  const finishCorrectAnswer = (frogId: FrogId, nextLevel: number) => {
    clearFeedbackTimeout()
    setMotionFrogId(null)
    const otherFrogId: FrogId = frogId === 'frogA' ? 'frogB' : 'frogA'

    if (nextLevel >= LEVEL_COUNT) {
      if (gameMode === 'team' && stageIndex === STAGE_COUNT - 1) {
        setWinnerFrog(frogId)
        setFeedback({
          frogId,
          tone: 'correct',
          title: 'G‘olib aniqlandi',
          description: `${frogId === 'frogA' ? 'Qurbaqa A' : 'Qurbaqa B'} oxirgi bosqichda marra chizig‘iga birinchi bo‘lib yetdi.`,
        })
        setStatus('feedback')

        scheduleTurnAdvance(() => {
          setFeedback(null)
          setStatus('won')
        })
        return
      }

      if (gameMode === 'team') {
        const otherFinished = isFrogStageComplete(otherFrogId)
        setFeedback({
          frogId,
          tone: 'correct',
          title: otherFinished ? 'Bosqich yakunlandi' : 'Marra chizig‘iga yetdi',
          description: otherFinished
            ? 'Ikkala qurbaqa ham oxiriga yetdi. Keyingi bosqichga o‘tamiz.'
            : `${frogId === 'frogA' ? 'Qurbaqa A' : 'Qurbaqa B'} oxiriga yetdi. Endi ${otherFrogId === 'frogA' ? 'Qurbaqa A' : 'Qurbaqa B'} ni kutamiz.`,
        })
        setStatus('feedback')

        scheduleTurnAdvance(() => {
          setFeedback(null)

          if (otherFinished) {
            advanceToNextStage()
            return
          }

          setCurrentFrog(otherFrogId)
          setStatus('idle')
        })
        return
      }

      setFeedback({
        frogId,
        tone: 'correct',
        title: 'Bosqich yakunlandi',
        description: stageIndex + 1 >= STAGE_COUNT ? 'So‘nggi bosqich ham tugadi.' : 'Keyingi bosqichga o‘tamiz.',
      })
      setStatus('feedback')

      scheduleTurnAdvance(() => {
        setFeedback(null)
        if (stageIndex + 1 >= STAGE_COUNT) {
          setWinnerFrog(frogId)
          setStatus('won')
          return
        }
        advanceToNextStage()
      })
      return
    }

    setFeedback({
      frogId,
      tone: 'correct',
      title: 'To‘g‘ri javob',
      description: `${frogId === 'frogA' ? 'Qurbaqa A' : 'Qurbaqa B'} keyingi qatordagi barglarga o‘tdi.`,
    })
    setStatus('feedback')

    scheduleTurnAdvance(() => {
      setFeedback(null)
      setCurrentFrog(gameMode === 'team' ? otherFrogId : 'frogA')
      setStatus('idle')
    })
  }

  useEffect(() => {
    if (status !== 'question' || !activeQuestion) return
    if (timeLeft <= 0) {
      startSinkSequence(activeQuestion.frogId, 'timeout')
      return
    }

    const timerId = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [status, activeQuestion, timeLeft])

  useEffect(() => {
    if (status !== 'jumping' || !activeQuestion) return

    const doneId = window.setTimeout(() => {
      setTimeLeft(QUESTION_SECONDS)
      setStatus('question')
    }, 950)

    return () => window.clearTimeout(doneId)
  }, [status, activeQuestion])

  useEffect(() => {
    return () => clearSinkTimeout()
  }, [])

  useEffect(() => {
    return () => clearFeedbackTimeout()
  }, [])

  useEffect(() => {
    if (gameMode !== 'team' || status !== 'idle') return

    const currentDone = isFrogStageComplete(currentFrog)
    const otherFrogId: FrogId = currentFrog === 'frogA' ? 'frogB' : 'frogA'
    const otherDone = isFrogStageComplete(otherFrogId)

    if (currentDone && !otherDone) {
      setCurrentFrog(otherFrogId)
    }
  }, [gameMode, status, currentFrog, frogStates])

  const openQuestion = (padIndex: number) => {
    if (status !== 'idle') return
    if (gameMode === 'team' && isFrogStageComplete(currentFrog)) {
      const otherFrogId: FrogId = currentFrog === 'frogA' ? 'frogB' : 'frogA'
      if (!isFrogStageComplete(otherFrogId)) {
        setCurrentFrog(otherFrogId)
      }
      return
    }
    const level = levels[currentLevelIndex]
    if (!level) return
    const seenIndexes = frogStates[currentFrog].seenQuestionsByLevel[currentLevelIndex] ?? []
    const questionIndex = getQuestionIndexForAttempt(level, padIndex, seenIndexes)
    const question = level[questionIndex]
    if (!question) return

    playJumpSound()
    setFeedback(null)
    setMotionFrogId(currentFrog)
    setFrogStates((prev) => ({
      ...prev,
      [currentFrog]: {
        ...prev[currentFrog],
        seenQuestionsByLevel: prev[currentFrog].seenQuestionsByLevel.map((seen, index) =>
          index === currentLevelIndex && !seen.includes(questionIndex) ? [...seen, questionIndex] : seen,
        ),
      },
    }))
    setActiveQuestion({ frogId: currentFrog, levelIndex: currentLevelIndex, padIndex, questionIndex, question })
    setAttemptedJump({ levelIndex: currentLevelIndex, padIndex })
    setStatus('jumping')
  }

  const handleAnswer = (option: string) => {
    if (!activeQuestion || status !== 'question' || !attemptedJump) return

    if (option === activeQuestion.question.answer) {
      setScore((prev) => prev + 100)
      const nextLevel = activeQuestion.levelIndex + 1
      setFrogStates((prev) => ({
        ...prev,
        [activeQuestion.frogId]: {
          ...prev[activeQuestion.frogId],
          completedJumps: [...prev[activeQuestion.frogId].completedJumps, attemptedJump],
        },
      }))
      setAttemptedJump(null)

      setActiveQuestion(null)
      setTimeLeft(QUESTION_SECONDS)
      finishCorrectAnswer(activeQuestion.frogId, nextLevel)
      return
    }

    startSinkSequence(activeQuestion.frogId, 'wrong')
  }

  const restart = () => {
    clearSinkTimeout()
    clearFeedbackTimeout()
    setStageIndex(0)
    setLevels(buildLevels(0))
    setCurrentFrog('frogA')
    setWinnerFrog(null)
    setStatus('idle')
    setActiveQuestion(null)
    setFeedback(null)
    setAttemptedJump(null)
    setMotionFrogId(null)
    setTimeLeft(QUESTION_SECONDS)
    setScore(0)
    setFrogStates({
      frogA: createInitialFrogState(),
      frogB: createInitialFrogState(),
    })
  }

  const startGame = (mode: GameMode) => {
    clearSinkTimeout()
    clearFeedbackTimeout()
    setGameMode(mode)
    setStageIndex(0)
    setLevels(buildLevels(0))
    setCurrentFrog('frogA')
    setWinnerFrog(null)
    setStatus('idle')
    setActiveQuestion(null)
    setFeedback(null)
    setAttemptedJump(null)
    setMotionFrogId(null)
    setTimeLeft(QUESTION_SECONDS)
    setScore(0)
    setFrogStates({
      frogA: createInitialFrogState(),
      frogB: createInitialFrogState(),
    })
  }

  const jumpToStageThree = () => {
    if (!gameMode) return

    clearSinkTimeout()
    clearFeedbackTimeout()
    setStageIndex(2)
    setLevels(buildLevels(2))
    setCurrentFrog('frogA')
    setWinnerFrog(null)
    setStatus('idle')
    setActiveQuestion(null)
    setFeedback(null)
    setAttemptedJump(null)
    setMotionFrogId(null)
    setTimeLeft(QUESTION_SECONDS)
    setScore(0)
    setFrogStates({
      frogA: createInitialFrogState(),
      frogB: createInitialFrogState(),
    })
  }

  return (
    <main
      className={`frog-pond-page ${
        stageIndex === 2 ? 'stage-three' : stageIndex === 1 ? 'stage-two' : 'stage-one'
      }`}
    >
      {gameMode ? (
        <button type="button" className="frog-pond-stage-skip" onClick={jumpToStageThree}>
          3-bosqichga o‘tish
        </button>
      ) : null}

      <div className="frog-pond-water" />

      <div className="frog-pond-canopy">
        <div className="frog-pond-tree left-a" />
        <div className="frog-pond-tree left-b" />
        <div className="frog-pond-tree right-a" />
        <div className="frog-pond-tree right-b" />
      </div>

      <div className="frog-pond-foreground">
        <div className="frog-pond-bank" />
        <div className="frog-pond-reeds left" />
        <div className="frog-pond-reeds right" />
        <div className="frog-pond-rock left" />
        <div className="frog-pond-rock right" />
      </div>

      <div className="frog-pond-shell">
        <aside className="frog-pond-sidepanel">
          {activeQuestion && status === 'question' ? (
            <QuizModal data={activeQuestion} timeLeft={timeLeft} onAnswer={handleAnswer} />
          ) : feedback ? (
            <FeedbackCard data={feedback} />
          ) : null}
        </aside>

        <section className="frog-pond-playfield">
          <div className="frog-pond-board-hud">
            <div className="frog-pond-board-pill">
              <span>Bosqich</span>
              <strong>{stageIndex + 1} / {STAGE_COUNT}</strong>
            </div>
            <div className="frog-pond-board-pill">
              <span>Daraja</span>
              <strong>{Math.min(currentLevelIndex + 1, LEVEL_COUNT)} / {LEVEL_COUNT}</strong>
            </div>
            <div className="frog-pond-board-pill">
              <span>Ball</span>
              <strong>{score}</strong>
            </div>
            <div className="frog-pond-board-pill">
              <span>Navbat</span>
              <strong>{gameMode === 'team' ? (currentFrog === 'frogA' ? 'A' : 'B') : 'Solo'}</strong>
            </div>
          </div>

          <div className="frog-pond-lilies">
            {rowLayouts.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`}>
                <span className="frog-pond-row-label" style={{ top: `${Math.max(4, row[0].top - 6)}%` }}>
                  Level {rowIndex + 1}
                </span>
                {row.map((pad, padIndex) => {
                  const isCompleted = Object.values(frogStates).some((frog) =>
                    frog.completedJumps.some((jump) => jump.levelIndex === rowIndex && jump.padIndex === padIndex),
                  )
                  const isCurrent =
                    status !== 'won' &&
                    status !== 'lost' &&
                    rowIndex === currentLevelIndex &&
                    !isFrogStageComplete(currentFrog)
                  const isLocked = rowIndex > currentLevelIndex
                  const padClass = [
                    'frog-pond-pad',
                    isCompleted ? 'active' : '',
                    isCurrent ? 'current' : '',
                    isLocked ? 'locked' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')

                  return (
                    <button
                      key={`pad-${rowIndex}-${padIndex}`}
                      type="button"
                      className={padClass}
                      style={{
                        left: `${pad.left}%`,
                        top: `${pad.top}%`,
                        animationDelay: `${(rowIndex * 5 + padIndex) * 0.12}s`,
                      }}
                      disabled={!isCurrent || status !== 'idle'}
                      onClick={() => openQuestion(padIndex)}
                    >
                      <img className="frog-pond-pad-image" src={currentLilyPadSprite} alt="" draggable={false} />
                      <span className="frog-pond-ripple" />
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {activeFrogs.map((frogId) => {
            const frogPosition = getFrogPosition(frogId)
            const frogClass = motionFrogId === frogId
              ? status === 'jumping'
                ? 'jumping'
                : status === 'sinking'
                  ? 'sinking'
                  : ''
              : ''

            return (
              <div
                key={frogId}
                style={{
                  position: 'absolute',
                  left: `${frogPosition.left}%`,
                  top: `${frogPosition.top}%`,
                }}
              >
                <FrogCharacter frogId={frogId} className={frogClass} sprite={currentFrogSprite} />
              </div>
            )
          })}
        </section>
      </div>

      {status === 'won' ? (
        <EndOverlay
          kind="won"
          levelIndex={winnerFrog ? frogStates[winnerFrog].completedJumps.length - 1 : LEVEL_COUNT - 1}
          score={score}
          jumps={winnerFrog ? frogStates[winnerFrog].completedJumps.length : activeFrogs.length * LEVEL_COUNT}
          winnerFrog={winnerFrog}
          gameMode={gameMode}
          onRestart={restart}
          onExit={() => navigate('/games')}
        />
      ) : null}

      {status === 'lost' ? (
        <EndOverlay
          kind="lost"
          levelIndex={currentLevelIndex}
          score={score}
          jumps={frogStates[currentFrog].completedJumps.length}
          gameMode={gameMode}
          onRestart={restart}
          onExit={() => navigate('/games')}
        />
      ) : null}

      {!gameMode ? <ModeOverlay onSelect={startGame} /> : null}
    </main>
  )
}
