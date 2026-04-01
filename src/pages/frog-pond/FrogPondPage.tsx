import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import './FrogPondPage.css'
import {
  buildStageOneQuestions,
  buildStageThreeQuestions,
  buildStageTwoQuestions,
  type FrogQuizQuestion,
} from './frogQuizQuestions'
import frogSprite from '../../assets/green-frog-jumping-wild-animal-toad-top-view-isolated-white-background_80590-19908.svg'
import lilyPadSprite from '../../assets/Screenshot 2026-03-19 at 09.14.08 (1).svg'
import stageTwoLilyPadSprite from '../../assets/stage-two-lily-pad.webp'
import stageThreeLilyPadSprite from '../../assets/stage-three-leaf.png'
import stageThreeFrogSprite from '../../assets/stage-three-frog-cropped.svg'
import oceanFromAbove from '../../assets/sea-beach-top-view-tropical-ocean-coastline-free-vector.jpg'
import frogPondMusic from "../../assets/Children's_Music_—_Happy_Upbeat_Music_Instrumental_Music_For_Kids.mp3"
import { useTeacherItems } from '../../lib/useTeacherItems'

type GameStatus = 'idle' | 'question' | 'jumping' | 'sinking' | 'feedback' | 'won' | 'lost'
type GameMode = 'solo' | 'team' | 'ai'
type FrogId = 'frogA' | 'frogB'
type AiDifficulty = 'easy' | 'medium' | 'hard'

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
  seenQuestionKeysByLevel: string[][]
}

type FeedbackState = {
  frogId: FrogId
  tone: 'correct' | 'wrong' | 'timeout'
  title: string
  description: string
}

type StageWinState = Record<FrogId, number>
type StageFinishOrderState = Record<FrogId, number | null>
type SubjectStats = {
  correct: number
  wrong: number
  total: number
}

type SubjectPerformanceState = Record<string, SubjectStats>
type FrogPondTeacherQuestion = {
  subject?: string
  question?: string
  options?: string[]
  variants?: string[]
  answer?: string
  stage?: number
}

const LEVEL_COUNT = 7
const STAGE_COUNT = 3
const QUESTION_SECONDS = 20

const columnPositions = [10, 18.5, 27, 35.5, 44, 52.5, 61]
const lanePositions = [18, 34, 50, 66, 82]
const mobileColumnPositions = [14, 27, 40, 53, 66, 79, 92]
const mobileLanePositions = [18, 35, 52, 69, 86]

function buildRowLayouts(columns: number[], lanes: number[]) {
  return columns.map((left) => lanes.map((top) => ({ left, top })))
}

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
    seenQuestionKeysByLevel: Array.from({ length: LEVEL_COUNT }, () => []),
  }
}

function normalizeTeacherQuestions(items: FrogPondTeacherQuestion[], stageIndex: number): FrogQuizQuestion[] {
  return items
    .filter((item) => item.stage === stageIndex + 1)
    .map((item) => {
      const options = (item.options ?? item.variants ?? []).filter(Boolean).slice(0, 4)
      if (!item.question || !item.answer || options.length < 2) {
        return null
      }
      const finalOptions = options.includes(item.answer) ? options : [...options.slice(0, 3), item.answer]
      if (finalOptions.length !== 4) {
        return null
      }
      return {
        subject: item.subject?.trim() || 'Teacher savoli',
        question: item.question.trim(),
        options: [finalOptions[0], finalOptions[1], finalOptions[2], finalOptions[3]] as [string, string, string, string],
        answer: item.answer,
      }
    })
    .filter((item): item is FrogQuizQuestion => Boolean(item))
}

function buildLevels(stageIndex: number, teacherQuestions: FrogPondTeacherQuestion[] = []) {
  const pool =
    stageIndex === 0
      ? buildStageOneQuestions()
      : stageIndex === 1
        ? buildStageTwoQuestions()
        : buildStageThreeQuestions()
  const normalizedTeacher = normalizeTeacherQuestions(teacherQuestions, stageIndex)
  const basePool = shuffleLevel(pool.flat())

  if (normalizedTeacher.length === 0) {
    return Array.from({ length: LEVEL_COUNT }, (_, levelIndex) =>
      shuffleLevel(basePool.filter((_, questionIndex) => questionIndex % LEVEL_COUNT === levelIndex)),
    )
  }

  const teacherPool = shuffleLevel(normalizedTeacher)
  const levels = Array.from({ length: LEVEL_COUNT }, () => [] as FrogQuizQuestion[])

  teacherPool.forEach((question, index) => {
    levels[index % LEVEL_COUNT].push(question)
  })

  basePool.forEach((question, index) => {
    levels[index % LEVEL_COUNT].push(question)
  })

  return levels.map((level) => shuffleLevel(level))
}

function buildQuestionKey(question: FrogQuizQuestion) {
  return `${question.subject}::${question.question}`
}

function getQuestionIndexForAttempt(level: FrogQuizQuestion[], padIndex: number, seenKeys: string[], usedQuestionKeys: string[]) {
  for (let offset = 0; offset < level.length; offset += 1) {
    const candidate = (padIndex + offset) % level.length
    const candidateKey = buildQuestionKey(level[candidate])
    if (!seenKeys.includes(candidateKey) && !usedQuestionKeys.includes(candidateKey)) {
      return candidate
    }
  }

  for (let offset = 0; offset < level.length; offset += 1) {
    const candidate = (padIndex + offset) % level.length
    const candidateKey = buildQuestionKey(level[candidate])
    if (!usedQuestionKeys.includes(candidateKey)) {
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

function toPlayfieldTop(topPercent: number) {
  return `calc(var(--frog-pond-hud-safe-top) + (${topPercent} * (100% - var(--frog-pond-hud-safe-top)) / 100))`
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

function isCompetitiveMode(mode: GameMode | null) {
  return mode === 'team' || mode === 'ai'
}

function getFrogLabel(frogId: FrogId, mode: GameMode | null) {
  if (mode === 'ai') {
    return frogId === 'frogA' ? 'Siz' : 'AI qurbaqa'
  }
  return frogId === 'frogA' ? 'Qurbaqa A' : 'Qurbaqa B'
}

function getAiAccuracy(stage: number, level: number, difficulty: AiDifficulty) {
  if (difficulty === 'hard') {
    const hardStageBase = [0.94, 0.91, 0.88][stage] ?? 0.88
    const hardLevelPenalty = level * 0.01
    return Math.max(0.78, Math.min(0.95, hardStageBase - hardLevelPenalty))
  }

  const difficultyBoost = difficulty === 'easy' ? -0.14 : 0
  const stageBase = ([0.78, 0.66, 0.54][stage] ?? 0.6) + difficultyBoost
  const levelPenalty = level * 0.025
  return Math.max(0.34, Math.min(0.78, stageBase - levelPenalty))
}

function chooseAiAnswer(
  question: FrogQuizQuestion,
  stage: number,
  level: number,
  difficulty: AiDifficulty,
  forceCorrect = false,
) {
  if (forceCorrect) {
    return question.answer
  }

  const shouldBeCorrect = Math.random() < getAiAccuracy(stage, level, difficulty)
  if (shouldBeCorrect) {
    return question.answer
  }

  const wrongOptions = question.options.filter((option) => option !== question.answer)
  if (wrongOptions.length === 0) {
    return question.answer
  }

  return wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
}

function pickAiPadIndex(options: number[], blockedIndex?: number | null) {
  const pool = options.filter((index) => index !== blockedIndex)
  const source = pool.length > 0 ? pool : options
  return source[Math.floor(Math.random() * source.length)]
}

function getAiRecommendation(stats: SubjectPerformanceState) {
  const ranked = Object.entries(stats).sort((a, b) => b[1].total - a[1].total)
  const strongest = [...ranked].sort((a, b) => (b[1].correct / Math.max(1, b[1].total)) - (a[1].correct / Math.max(1, a[1].total)))[0]
  const weakest = [...ranked].sort((a, b) => (a[1].correct / Math.max(1, a[1].total)) - (b[1].correct / Math.max(1, b[1].total)))[0]

  if (!ranked.length) {
    return 'AI hali sizni kuzatyapti. Bir nechta savoldan keyin tavsiya chiqadi.'
  }

  if (!weakest || weakest[1].total < 1) {
    return 'AI hali yetarli ma’lumot yig‘madi.'
  }

  if (strongest && strongest[0] !== weakest[0]) {
    return `${weakest[0]} faniga ko‘proq e’tibor bering. ${strongest[0]} sizning kuchli tomoningiz bo‘lib turibdi.`
  }

  return `${weakest[0]} bo‘yicha mashqni ko‘paytirish foydali bo‘ladi.`
}

function StageScoreboard({ stageWins, gameMode }: { stageWins: StageWinState; gameMode: GameMode | null }) {
  if (!isCompetitiveMode(gameMode)) {
    return null
  }

  return (
    <div className="frog-pond-board-pill frog-pond-board-pill.scoreboard">
      <div className="frog-pond-scoreboard-inline">
        <span className="frog-pond-scoreboard-name">{getFrogLabel('frogA', gameMode)}</span>
        <strong className="frog-pond-scoreboard-score">{stageWins.frogA} : {stageWins.frogB}</strong>
        <span className="frog-pond-scoreboard-name">{getFrogLabel('frogB', gameMode)}</span>
      </div>
    </div>
  )
}

function FrogCharacter({
  className = '',
  frogId,
  sprite,
  style,
}: {
  className?: string
  frogId: FrogId
  sprite: string
  style?: CSSProperties
}) {
  return (
    <div className={`frog-pond-frog ${frogId === 'frogB' ? 'frog-b' : 'frog-a'} ${className}`.trim()} style={style}>
      <div className="frog-shadow" />
      <img className="frog-pond-frog-image" src={sprite} alt="Frog" draggable={false} />
    </div>
  )
}

function QuizModal({
  data,
  timeLeft,
  gameMode,
  onAnswer,
}: {
  data: ActiveQuestion
  timeLeft: number
  gameMode: GameMode | null
  onAnswer: (option: string) => void
}) {
  const progress = Math.max(0, (timeLeft / QUESTION_SECONDS) * 100)
  const frogLabel = getFrogLabel(data.frogId, gameMode)
  const isAiTurn = gameMode === 'ai' && data.frogId === 'frogB'

  return (
    <div className="frog-pond-modal-backdrop">
      <div className="frog-pond-modal">
        <div className="frog-pond-modal-top">
          <div>
            <span className="frog-pond-subject">{data.question.subject}</span>
            <p className="frog-pond-modal-note">
              {frogLabel} navbati. Nilufar {padLetter(data.padIndex)} ichidagi savolga 20 soniya ichida javob bering.
            </p>
            {isAiTurn ? <p className="frog-pond-modal-note">AI qurbaqa savolni tahlil qilyapti. U har doim ham to‘g‘ri topmaydi.</p> : null}
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
            <button
              key={`${data.levelIndex}-${option}`}
              type="button"
              className="frog-pond-answer"
              onClick={() => onAnswer(option)}
              disabled={isAiTurn}
            >
              <span className="frog-pond-answer-index">{padLetter(index)}</span>
              <span className="frog-pond-answer-text">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeedbackCard({ data, gameMode }: { data: FeedbackState; gameMode: GameMode | null }) {
  return (
    <div className="frog-pond-modal-backdrop">
      <div className={`frog-pond-modal frog-pond-feedback-card ${data.tone}`}>
        <span className="frog-pond-subject">{getFrogLabel(data.frogId, gameMode)}</span>
        <h2 className="frog-pond-question">{data.title}</h2>
        <p className="frog-pond-modal-note">{data.description}</p>
      </div>
    </div>
  )
}

function ModeOverlay({
  aiDifficulty,
  onAiDifficultyChange,
  onSelect,
}: {
  aiDifficulty: AiDifficulty
  onAiDifficultyChange: (difficulty: AiDifficulty) => void
  onSelect: (mode: GameMode) => void
}) {
  return (
    <div className="frog-pond-overlay frog-pond-mode-overlay">
      <div className="frog-pond-overlay-card mode-select">
        <p className="frog-pond-subject">Frog Pond Quiz</p>
        <h2>Qanday o‘ynaymiz?</h2>
        <p>1 kishilik, 2 kishilik yoki AI qurbaqa bilan bellashadigan rejimlardan birini tanlang.</p>

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

          <button type="button" className="frog-pond-mode-card" onClick={() => onSelect('ai')}>
            <span className="frog-pond-mode-tag">AI bilan</span>
            <strong>Siz vs AI qurbaqa</strong>
            <p>2 ta qurbaqa maydonga tushadi: biri siz, ikkinchisi AI. AI ba'zi savollarda xato qiladi, 3 bosqichning hammasini to‘liq o‘ynaydi.</p>
            <div className="frog-pond-ai-difficulty" onClick={(event) => event.stopPropagation()}>
              {([['hard', 'Kuchli']] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`frog-pond-ai-chip${aiDifficulty === value ? ' active' : ''}`}
                  onClick={() => onAiDifficultyChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
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
  const winnerLabel = winnerFrog ? getFrogLabel(winnerFrog, gameMode) : null

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
              : gameMode === 'ai'
                ? winnerLabel === 'Siz'
                  ? 'Zo‘r. Siz AI qurbaqani ortda qoldirib, barcha 3 bosqichni muvaffaqiyatli yakunladingiz.'
                  : 'AI qurbaqa oxirgi bosqichda tezroq yetib bordi. Yana urinib uni yengib ko‘ring.'
              : 'Ajoyib. Siz nilufarlar bo‘ylab barcha darajalarni bosib o‘tib, pond sarguzashtini muvaffaqiyatli tugatdingiz.'
            : 'Savol xato bo‘ldi yoki vaqt tugadi. Yangi marshrut bilan yana urinib ko‘ring.'}
        </p>
        {isWin && isCompetitiveMode(gameMode) && winnerLabel ? <p className="frog-pond-winner-note">{winnerLabel} g‘olib bo‘ldi.</p> : null}
        {isWin && !isCompetitiveMode(gameMode) && winnerLabel ? <p className="frog-pond-winner-note">{winnerLabel} yutdi.</p> : null}

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
  const teacherQuestions = useTeacherItems<FrogPondTeacherQuestion>('frog-pond')
  const pageRef = useRef<HTMLElement | null>(null)
  const autoFullscreenTriedRef = useRef(false)
  const musicRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sinkTimeoutRef = useRef<number | null>(null)
  const feedbackTimeoutRef = useRef<number | null>(null)
  const aiMoveTimeoutRef = useRef<number | null>(null)
  const aiAnswerTimeoutRef = useRef<number | null>(null)
  const preventImmediateAiMistakeRef = useRef(false)
  const [gameMode, setGameMode] = useState<GameMode | null>(null)
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('hard')
  const [stageIndex, setStageIndex] = useState(0)
  const [levels, setLevels] = useState<FrogQuizQuestion[][]>(() => buildLevels(0, teacherQuestions))
  const [currentFrog, setCurrentFrog] = useState<FrogId>('frogA')
  const [winnerFrog, setWinnerFrog] = useState<FrogId | null>(null)
  const [status, setStatus] = useState<GameStatus>('idle')
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS)
  const [score, setScore] = useState(0)
  const [stageWins, setStageWins] = useState<StageWinState>({ frogA: 0, frogB: 0 })
  const [stageHadMistake, setStageHadMistake] = useState(false)
  const [stageFinishOrder, setStageFinishOrder] = useState<StageFinishOrderState>({ frogA: null, frogB: null })
  const [usedQuestionKeys, setUsedQuestionKeys] = useState<string[]>([])
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformanceState>({})
  const [frogStates, setFrogStates] = useState<Record<FrogId, FrogState>>({
    frogA: createInitialFrogState(),
    frogB: createInitialFrogState(),
  })
  const [attemptedJump, setAttemptedJump] = useState<CompletedJump | null>(null)
  const [motionFrogId, setMotionFrogId] = useState<FrogId | null>(null)
  const [isMobileBoard, setIsMobileBoard] = useState(false)
  const [aiTurnRequest, setAiTurnRequest] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const isAiThinking =
    gameMode === 'ai' &&
    currentFrog === 'frogB' &&
    (status === 'idle' || (status === 'question' && activeQuestion?.frogId === 'frogB'))

  useEffect(() => {
    setLevels(buildLevels(stageIndex, teacherQuestions))
  }, [stageIndex, teacherQuestions])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia('(max-width: 430px) and (pointer: coarse)')
    const sync = () => setIsMobileBoard(media.matches)
    sync()

    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const requestPageFullscreen = () => {
      if (document.fullscreenElement || autoFullscreenTriedRef.current) return
      autoFullscreenTriedRef.current = true
      void pageRef.current?.requestFullscreen?.().catch(() => {
        autoFullscreenTriedRef.current = false
      })
    }

    requestPageFullscreen()

    const retryAutoFullscreen = () => {
      requestPageFullscreen()
    }

    window.addEventListener('pointerdown', retryAutoFullscreen, { once: true })
    return () => window.removeEventListener('pointerdown', retryAutoFullscreen)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const requestPageFullscreen = () => {
      autoFullscreenTriedRef.current = true
      void pageRef.current?.requestFullscreen?.().catch(() => {
        autoFullscreenTriedRef.current = false
      })
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.key.toLowerCase() !== 'f') return

      const target = event.target as HTMLElement | null
      const tagName = target?.tagName?.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
        return
      }

      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {})
        return
      }

      requestPageFullscreen()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const music = musicRef.current
    if (!music) return

    music.volume = 0.42
    music.loop = true
    music.muted = isMuted

    if (isMuted) {
      music.pause()
      return
    }

    void music.play().catch(() => {})

    return () => {
      music.pause()
    }
  }, [isMuted, gameMode])

  const activeFrogs: FrogId[] = isCompetitiveMode(gameMode) ? ['frogA', 'frogB'] : ['frogA']
  const rowLayouts = isMobileBoard
    ? buildRowLayouts(mobileColumnPositions, mobileLanePositions)
    : buildRowLayouts(columnPositions, lanePositions)
  const currentLevelIndex = frogStates[currentFrog].completedJumps.length
  const isFrogStageComplete = (frogId: FrogId) => frogStates[frogId].completedJumps.length >= LEVEL_COUNT
  const currentLilyPadSprite = stageIndex === 2 ? stageThreeLilyPadSprite : stageIndex === 1 ? stageTwoLilyPadSprite : lilyPadSprite
  const currentFrogSprite = stageIndex === 2 ? stageThreeFrogSprite : frogSprite
  const effectiveAiDifficulty: AiDifficulty = 'hard'
  const aiRecommendation = getAiRecommendation(subjectPerformance)

  const toggleMute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)

    if (!nextMuted) {
      void musicRef.current?.play().catch(() => {})
    }
  }

  const getFrogPosition = (frogId: FrogId): Position => {
    const committed = frogStates[frogId].completedJumps
    const activeJump = motionFrogId === frogId && attemptedJump ? attemptedJump : null
    const lastJump = activeJump ?? committed[committed.length - 1]
    const otherFrogId: FrogId = frogId === 'frogA' ? 'frogB' : 'frogA'
    const otherCommitted = frogStates[otherFrogId].completedJumps
    const otherActiveJump = motionFrogId === otherFrogId && attemptedJump ? attemptedJump : null
    const otherLastJump = otherActiveJump ?? otherCommitted[otherCommitted.length - 1]

    if (!lastJump) {
      if (!isCompetitiveMode(gameMode)) {
        return frogStartPosition
      }
      return frogId === 'frogA'
        ? { left: frogStartPosition.left, top: frogStartPosition.top + TEAM_START_VERTICAL_OFFSET }
        : { left: frogStartPosition.left, top: frogStartPosition.top - TEAM_START_VERTICAL_OFFSET }
    }

    const pad = rowLayouts[lastJump.levelIndex][lastJump.padIndex]
    const sharesPad =
      isCompetitiveMode(gameMode) &&
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

  const clearAiMoveTimeout = () => {
    if (aiMoveTimeoutRef.current !== null) {
      window.clearTimeout(aiMoveTimeoutRef.current)
      aiMoveTimeoutRef.current = null
    }
  }

  const clearAiAnswerTimeout = () => {
    if (aiAnswerTimeoutRef.current !== null) {
      window.clearTimeout(aiAnswerTimeoutRef.current)
      aiAnswerTimeoutRef.current = null
    }
  }

  const clearAiTimeouts = () => {
    clearAiMoveTimeout()
    clearAiAnswerTimeout()
  }

  const requestAiTurn = () => {
    if (gameMode !== 'ai') return
    setAiTurnRequest((value) => value + 1)
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
    clearAiTimeouts()
    setStatus('sinking')
    setMotionFrogId(frogId)
    setTimeLeft(0)
    setFeedback({
      frogId,
      tone: reason,
      title: reason === 'timeout' ? 'Vaqt tugadi' : 'Javob xato',
      description:
        reason === 'timeout'
          ? `${getFrogLabel(frogId, gameMode)} ulgurmay qoldi. Endi u boshidan boshlaydi.`
          : `${getFrogLabel(frogId, gameMode)} bu savolda adashdi. U 0-darajaga qaytadi.`,
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
      if (gameMode === 'ai') {
        setStageHadMistake(true)
        if (frogId === 'frogA') {
          preventImmediateAiMistakeRef.current = true
        }
      }
      setFeedback({
        frogId,
        tone: reason,
        title: reason === 'timeout' ? 'Boshidan qaytdi' : 'Qayta urinadi',
        description: `Navbat endi ${getFrogLabel(frogId === 'frogA' ? 'frogB' : 'frogA', gameMode)} ga o‘tdi.`,
      })
      setStatus('feedback')
      setCurrentFrog(frogId === 'frogA' ? 'frogB' : 'frogA')

      scheduleTurnAdvance(() => {
        setFeedback(null)
        setStatus('idle')
        if (gameMode === 'ai' && frogId === 'frogA') {
          requestAiTurn()
        }
      }, 850)
    }, 1200)
  }

  const advanceToNextStage = () => {
    clearAiTimeouts()
    const nextStageIndex = stageIndex + 1

    if (nextStageIndex >= STAGE_COUNT) {
      setWinnerFrog(gameMode === 'solo' ? 'frogA' : null)
      setStatus('won')
      return
    }

    setStageIndex(nextStageIndex)
    setLevels(buildLevels(nextStageIndex, teacherQuestions))
    setCurrentFrog('frogA')
    setMotionFrogId(null)
    setAttemptedJump(null)
    setActiveQuestion(null)
    setTimeLeft(QUESTION_SECONDS)
    setStageHadMistake(false)
    setStageFinishOrder({ frogA: null, frogB: null })
    setUsedQuestionKeys([])
    setFrogStates({
      frogA: createInitialFrogState(),
      frogB: createInitialFrogState(),
    })
    setFeedback({
      frogId: 'frogA',
      tone: 'correct',
      title: `${nextStageIndex + 1}-bosqich boshlandi`,
      description:
        isCompetitiveMode(gameMode)
          ? 'Ikkala qurbaqa ham marra chizig‘iga yetdi. Endi yangi bosqichda davom etamiz.'
          : 'Yangi bosqichda savollar qiyinlashdi. Yo‘l davom etadi.',
    })
    setStatus('feedback')

    scheduleTurnAdvance(() => {
      setFeedback(null)
      setStatus('idle')
      if (gameMode === 'ai') {
        clearAiTimeouts()
        setAiTurnRequest(0)
      }
    }, 1200)
  }

  const finishCorrectAnswer = (frogId: FrogId, nextLevel: number) => {
    clearFeedbackTimeout()
    clearAiTimeouts()
    setMotionFrogId(null)
    const otherFrogId: FrogId = frogId === 'frogA' ? 'frogB' : 'frogA'

    const finalizeCompetitiveStage = (stageWinner: FrogId | null, description: string) => {
      const projectedWins: StageWinState = {
        frogA: stageWins.frogA + (stageWinner === 'frogA' ? 1 : 0),
        frogB: stageWins.frogB + (stageWinner === 'frogB' ? 1 : 0),
      }

      setStageWins(projectedWins)
      setFeedback({
        frogId: stageWinner ?? frogId,
        tone: 'correct',
        title: stageIndex + 1 >= STAGE_COUNT ? 'Sarguzasht yakunlandi' : `${stageIndex + 1}-bosqich yakunlandi`,
        description,
      })
      setStatus('feedback')

      scheduleTurnAdvance(() => {
        setFeedback(null)
        if (stageIndex + 1 >= STAGE_COUNT) {
          const overallWinner =
            projectedWins.frogA === projectedWins.frogB
              ? stageWinner
              : projectedWins.frogA > projectedWins.frogB
                ? 'frogA'
                : 'frogB'
          setWinnerFrog(overallWinner)
          setStatus('won')
          return
        }
        advanceToNextStage()
      }, 1200)
    }

    if (nextLevel >= LEVEL_COUNT) {
      if (isCompetitiveMode(gameMode)) {
        const otherFinished = isFrogStageComplete(otherFrogId)
        const finishRank = (stageFinishOrder.frogA !== null ? 1 : 0) + (stageFinishOrder.frogB !== null ? 1 : 0) + 1
        const nextFinishOrder: StageFinishOrderState =
          stageFinishOrder[frogId] === null
            ? { ...stageFinishOrder, [frogId]: finishRank }
            : stageFinishOrder
        const firstFinisher =
          nextFinishOrder.frogA === 1 ? 'frogA' : nextFinishOrder.frogB === 1 ? 'frogB' : frogId
        const isWaitingStage = stageIndex < STAGE_COUNT - 1 && stageHadMistake

        setStageFinishOrder(nextFinishOrder)

        if (isWaitingStage && !otherFinished) {
          const otherProgress = frogStates[otherFrogId].completedJumps.length
          const padsBehind = Math.max(0, LEVEL_COUNT - otherProgress)

          if (padsBehind <= 1) {
            setFeedback({
              frogId,
              tone: 'correct',
              title: 'Marra chizig‘iga yetdi',
              description: `${getFrogLabel(frogId, gameMode)} marraga yetdi. ${getFrogLabel(otherFrogId, gameMode)} atigi 1 barg ortda, shuning uchun kutamiz.`,
            })
            setStatus('feedback')

            scheduleTurnAdvance(() => {
              setFeedback(null)
              setCurrentFrog(otherFrogId)
              setStatus('idle')
              if (gameMode === 'ai' && otherFrogId === 'frogB') {
                requestAiTurn()
              }
            })
            return
          }

          if (padsBehind <= 2) {
            finalizeCompetitiveStage(
              firstFinisher,
              `${getFrogLabel(firstFinisher, gameMode)} birinchi bo‘lib finishga yetdi. ${getFrogLabel(otherFrogId, gameMode)} 2 ta barg ortda qolgan bo‘lsa ham keyingi bosqichga o‘tiladi.`,
            )
            return
          }

          if (padsBehind > 2) {
            finalizeCompetitiveStage(
              firstFinisher,
              `${getFrogLabel(firstFinisher, gameMode)} finishga ancha oldin yetib bordi. ${getFrogLabel(otherFrogId, gameMode)} 2 tadan ko‘p barg ortda qolgani uchun o‘yin shu yerda tugadi.`,
            )
            return
          }
        }

        if (gameMode === 'ai' && stageHadMistake && stageIndex + 1 >= STAGE_COUNT) {
          finalizeCompetitiveStage(
            firstFinisher,
            `${getFrogLabel(firstFinisher, gameMode)} xato bo‘lgan bosqichda ham birinchi bo‘lib marraga yetdi va g‘alabani oldi.`,
          )
          return
        }

        setFeedback({
          frogId,
          tone: 'correct',
          title: otherFinished ? 'Bosqich yakunlandi' : 'Marra chizig‘iga yetdi',
          description: otherFinished
            ? stageHadMistake
              ? `${getFrogLabel(firstFinisher, gameMode)} birinchi bo‘lib kelgani uchun bosqichni yutdi. Endi keyingi bosqichga o‘tamiz.`
              : 'Ikkala qurbaqa ham xatosiz marraga yetdi. Keyingi bosqichga o‘tamiz.'
            : stageHadMistake
              ? `${getFrogLabel(frogId, gameMode)} finishga yetdi. Endi ${getFrogLabel(otherFrogId, gameMode)} holatiga qarab bosqich taqdiri hal bo‘ladi.`
              : `${getFrogLabel(frogId, gameMode)} xatosiz marraga yetdi. Endi ${getFrogLabel(otherFrogId, gameMode)} ham yetib kelishi kerak.`,
        })
        setStatus('feedback')

        scheduleTurnAdvance(() => {
          setFeedback(null)

          if (otherFinished) {
            if (stageIndex + 1 >= STAGE_COUNT) {
              finalizeCompetitiveStage(
                stageHadMistake ? firstFinisher : null,
                stageHadMistake
                  ? `${getFrogLabel(firstFinisher, gameMode)} finishga birinchi yetib kelgani uchun yakuniy bosqichni yutdi.`
                  : 'Ikkala qurbaqa ham barcha bosqichlarni xatosiz yakunladi. Yakuniy hisob bo‘yicha g‘olib aniqlandi.',
              )
              return
            }
            advanceToNextStage()
            return
          }

          setCurrentFrog(otherFrogId)
          setStatus('idle')
          if (gameMode === 'ai' && otherFrogId === 'frogB') {
            requestAiTurn()
          }
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
      description: `${getFrogLabel(frogId, gameMode)} keyingi qatordagi barglarga o‘tdi.`,
    })
    setStatus('feedback')

    scheduleTurnAdvance(() => {
      setFeedback(null)
      const nextFrog = isCompetitiveMode(gameMode) ? otherFrogId : 'frogA'
      setCurrentFrog(nextFrog)
      setStatus('idle')
      if (gameMode === 'ai' && nextFrog === 'frogB') {
        requestAiTurn()
      }
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
    clearAiMoveTimeout()

    if (gameMode !== 'ai' || status !== 'idle' || currentFrog !== 'frogB' || isFrogStageComplete('frogB') || aiTurnRequest === 0) {
      return
    }

    aiMoveTimeoutRef.current = window.setTimeout(() => {
      aiMoveTimeoutRef.current = null
      const aiLevelIndex = frogStates.frogB.completedJumps.length
      const playerJumpOnSameLevel = frogStates.frogA.completedJumps.find((jump) => jump.levelIndex === aiLevelIndex)
      const randomPadIndex = pickAiPadIndex(
        Array.from({ length: lanePositions.length }, (_, index) => index),
        playerJumpOnSameLevel?.padIndex ?? null,
      )
      openQuestion(randomPadIndex, 'frogB')
    }, 90 + Math.floor(Math.random() * 110))

    return () => clearAiMoveTimeout()
  }, [gameMode, status, currentFrog, frogStates, aiTurnRequest])

  useEffect(() => {
    clearAiAnswerTimeout()

    if (gameMode !== 'ai' || status !== 'question' || !activeQuestion || activeQuestion.frogId !== 'frogB') {
      return
    }

    aiAnswerTimeoutRef.current = window.setTimeout(() => {
      aiAnswerTimeoutRef.current = null
      const forceCorrect = aiDifficulty === 'hard' && preventImmediateAiMistakeRef.current
      preventImmediateAiMistakeRef.current = false
      handleAnswer(chooseAiAnswer(activeQuestion.question, stageIndex, activeQuestion.levelIndex, effectiveAiDifficulty, forceCorrect))
    }, 2000)

    return () => clearAiAnswerTimeout()
  }, [gameMode, status, activeQuestion, stageIndex, effectiveAiDifficulty])

  useEffect(() => {
    return () => clearSinkTimeout()
  }, [])

  useEffect(() => {
    return () => clearFeedbackTimeout()
  }, [])

  useEffect(() => {
    return () => clearAiTimeouts()
  }, [])

  useEffect(() => {
    if (!isCompetitiveMode(gameMode) || status !== 'idle') return

    const currentDone = isFrogStageComplete(currentFrog)
    const otherFrogId: FrogId = currentFrog === 'frogA' ? 'frogB' : 'frogA'
    const otherDone = isFrogStageComplete(otherFrogId)

    if (currentDone && !otherDone) {
      setCurrentFrog(otherFrogId)
      if (gameMode === 'ai' && otherFrogId === 'frogB') {
        requestAiTurn()
      }
    }
  }, [gameMode, status, currentFrog, frogStates])

  const openQuestion = (padIndex: number, frogId = currentFrog) => {
    if (status !== 'idle') return
    if (isCompetitiveMode(gameMode) && isFrogStageComplete(frogId)) {
      const otherFrogId: FrogId = frogId === 'frogA' ? 'frogB' : 'frogA'
      if (!isFrogStageComplete(otherFrogId)) {
        setCurrentFrog(otherFrogId)
      }
      return
    }
    const frogLevelIndex = frogStates[frogId].completedJumps.length
    const level = levels[frogLevelIndex]
    if (!level) return
    const seenQuestionKeys = frogStates[frogId].seenQuestionKeysByLevel[frogLevelIndex] ?? []
    const questionIndex = getQuestionIndexForAttempt(level, padIndex, seenQuestionKeys, usedQuestionKeys)
    const question = level[questionIndex]
    if (!question) return
    const questionKey = buildQuestionKey(question)

    playJumpSound()
    setFeedback(null)
    setMotionFrogId(frogId)
    setFrogStates((prev) => ({
      ...prev,
      [frogId]: {
        ...prev[frogId],
        seenQuestionKeysByLevel: prev[frogId].seenQuestionKeysByLevel.map((seen, index) =>
          index === frogLevelIndex && !seen.includes(questionKey) ? [...seen, questionKey] : seen,
        ),
      },
    }))
    setUsedQuestionKeys((prev) => (prev.includes(questionKey) ? prev : [...prev, questionKey]))
    setCurrentFrog(frogId)
    if (frogId === 'frogB') {
      setAiTurnRequest(0)
    }
    setActiveQuestion({ frogId, levelIndex: frogLevelIndex, padIndex, questionIndex, question })
    setAttemptedJump({ levelIndex: frogLevelIndex, padIndex })
    setStatus('jumping')
  }

  const handleAnswer = (option: string) => {
    if (!activeQuestion || status !== 'question' || !attemptedJump) return
    const isCorrect = option === activeQuestion.question.answer

    if (gameMode === 'ai' && activeQuestion.frogId === 'frogA') {
      setSubjectPerformance((prev) => {
        const current = prev[activeQuestion.question.subject] ?? { correct: 0, wrong: 0, total: 0 }
        return {
          ...prev,
          [activeQuestion.question.subject]: {
            correct: current.correct + (isCorrect ? 1 : 0),
            wrong: current.wrong + (isCorrect ? 0 : 1),
            total: current.total + 1,
          },
        }
      })
    }

    if (isCorrect) {
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
    clearAiTimeouts()
    setStageIndex(0)
    setLevels(buildLevels(0, teacherQuestions))
    setCurrentFrog('frogA')
    setWinnerFrog(null)
    setStatus('idle')
    setActiveQuestion(null)
    setFeedback(null)
    setAttemptedJump(null)
    setMotionFrogId(null)
    setTimeLeft(QUESTION_SECONDS)
    setScore(0)
    setStageWins({ frogA: 0, frogB: 0 })
    setStageHadMistake(false)
    setStageFinishOrder({ frogA: null, frogB: null })
    setUsedQuestionKeys([])
    setSubjectPerformance({})
    setAiTurnRequest(0)
    preventImmediateAiMistakeRef.current = false
    setFrogStates({
      frogA: createInitialFrogState(),
      frogB: createInitialFrogState(),
    })
  }

  const startGame = (mode: GameMode) => {
    clearSinkTimeout()
    clearFeedbackTimeout()
    clearAiTimeouts()
    setGameMode(mode)
    setStageIndex(0)
    setLevels(buildLevels(0, teacherQuestions))
    setCurrentFrog('frogA')
    setWinnerFrog(null)
    setStatus('idle')
    setActiveQuestion(null)
    setFeedback(null)
    setAttemptedJump(null)
    setMotionFrogId(null)
    setTimeLeft(QUESTION_SECONDS)
    setScore(0)
    setStageWins({ frogA: 0, frogB: 0 })
    setStageHadMistake(false)
    setStageFinishOrder({ frogA: null, frogB: null })
    setUsedQuestionKeys([])
    setSubjectPerformance({})
    setAiTurnRequest(0)
    preventImmediateAiMistakeRef.current = false
    setFrogStates({
      frogA: createInitialFrogState(),
      frogB: createInitialFrogState(),
    })
  }

  return (
    <main
      ref={pageRef}
      className={`frog-pond-page ${
        stageIndex === 2 ? 'stage-three' : stageIndex === 1 ? 'stage-two' : 'stage-one'
      }`}
      style={{
        backgroundImage: `url(${oceanFromAbove})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <audio ref={musicRef} src={frogPondMusic} autoPlay loop preload="auto" />
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
            <QuizModal data={activeQuestion} timeLeft={timeLeft} gameMode={gameMode} onAnswer={handleAnswer} />
          ) : feedback ? (
            <FeedbackCard data={feedback} gameMode={gameMode} />
          ) : isAiThinking ? (
            <div className="frog-pond-modal-backdrop">
              <div className="frog-pond-modal frog-pond-feedback-card correct">
                <span className="frog-pond-subject">AI qurbaqa</span>
                <h2 className="frog-pond-question">AI o‘ylayapti...</h2>
                <p className="frog-pond-modal-note">AI navbati boshlandi. U nilufarni tanlab, savolga javob tayyorlayapti.</p>
              </div>
            </div>
          ) : null}
        </aside>

        <section className="frog-pond-playfield">
          <div className="frog-pond-board-scroll">
            <div className="frog-pond-board">
              <div className="frog-pond-board-hud">
                <div className="frog-pond-board-pill">
                  <span>Bosqich</span>
                  <strong>{stageIndex + 1} / {STAGE_COUNT}</strong>
                </div>
                <StageScoreboard stageWins={stageWins} gameMode={gameMode} />
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
                  <strong>{gameMode ? getFrogLabel(currentFrog, gameMode) : 'Solo'}</strong>
                </div>
                {gameMode === 'ai' ? (
                  <div className="frog-pond-board-pill">
                    <span>AI daraja</span>
                    <strong>Kuchli</strong>
                    <small>{aiRecommendation}</small>
                  </div>
                ) : null}
                {gameMode === 'ai' ? (
                  <div className="frog-pond-board-pill frog-pond-board-pill.ai-live">
                    <span>Holat</span>
                    <strong>{isAiThinking ? 'AI o‘ylayapti...' : 'AI kutyapti'}</strong>
                  </div>
                ) : null}
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
                          disabled={!isCurrent || status !== 'idle' || (gameMode === 'ai' && currentFrog === 'frogB')}
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
                  <FrogCharacter
                    key={frogId}
                    frogId={frogId}
                    className={frogClass}
                    sprite={currentFrogSprite}
                    style={{
                      left: `${frogPosition.left}%`,
                      top: toPlayfieldTop(frogPosition.top),
                    }}
                  />
                )
              })}
            </div>
          </div>
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

      {!gameMode ? <ModeOverlay aiDifficulty={aiDifficulty} onAiDifficultyChange={setAiDifficulty} onSelect={startGame} /> : null}

      <button type="button" className="frog-pond-mute-toggle" onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
    </main>
  )
}
