import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { imageQuizQuestions, type ImageQuizQuestion, type QuizDifficulty } from '../data/imageQuizQuestions'

const HIGH_SCORE_KEY = 'image-quiz-high-score-v1'
const TIMER_SECONDS = 15
const categoryTabs = ['Barchasi', 'Matematika', 'Tarix', 'Geografiya', 'Biologiya', 'Fizika', "O'zbekiston", 'Ingliz tili', 'Brendlar'] as const

type CategoryTab = (typeof categoryTabs)[number]
type Screen = 'start' | 'quiz' | 'end'
type GameMode = 'solo' | 'teams'

type TeamState = {
  name: string
  score: number
  correctAnswers: number
}

function buildTeamQuestionSets(list: ImageQuizQuestion[]): ImageQuizQuestion[][] {
  const teamA = list.map((question) => shuffleOptionsForQuestion(question))
  const teamB = list.map((question) => shuffleOptionsForQuestion(question))
  return [teamA, teamB]
}

const pointsByDifficulty: Record<QuizDifficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
}

const imageObjectPositionById: Partial<Record<number, string>> = {
  8: '50% 20%',
  9: '50% 22%',
}

function shuffleQuestions(list: ImageQuizQuestion[]): ImageQuizQuestion[] {
  const next = [...list]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = next[i]
    next[i] = next[j]
    next[j] = temp
  }
  return next
}

function shuffleOptionsForQuestion(question: ImageQuizQuestion): ImageQuizQuestion {
  const indexed = question.options.map((label, idx) => ({ label, idx }))
  for (let i = indexed.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = indexed[i]
    indexed[i] = indexed[j]
    indexed[j] = temp
  }

  const nextCorrectIndex = indexed.findIndex((item) => item.idx === question.correctIndex)
  return {
    ...question,
    options: indexed.map((item) => item.label) as ImageQuizQuestion['options'],
    correctIndex: nextCorrectIndex < 0 ? 0 : nextCorrectIndex,
  }
}

function loadHighScore(): number {
  if (typeof window === 'undefined') return 0
  const raw = window.localStorage.getItem(HIGH_SCORE_KEY)
  const value = Number(raw)
  return Number.isFinite(value) && value > 0 ? value : 0
}

function saveHighScore(score: number) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(HIGH_SCORE_KEY, String(score))
}

async function enterFullscreen() {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null
    webkitExitFullscreen?: () => Promise<void>
  }
  const root = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>
  }

  if (document.fullscreenElement || doc.webkitFullscreenElement) {
    return
  }

  try {
    if (root.requestFullscreen) {
      await root.requestFullscreen()
      return
    }
    if (root.webkitRequestFullscreen) {
      await root.webkitRequestFullscreen()
    }
  } catch {
    // ignore browser fullscreen permission errors
  }
}

export default function ImageQuizPage() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('start')
  const [gameMode, setGameMode] = useState<GameMode>('solo')
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>('Barchasi')
  const [sessionQuestions, setSessionQuestions] = useState<ImageQuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [highScore, setHighScore] = useState(loadHighScore)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [timeUp, setTimeUp] = useState(false)
  const [missingImageMap, setMissingImageMap] = useState<Record<number, boolean>>({})
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [teamQuestionSets, setTeamQuestionSets] = useState<ImageQuizQuestion[][]>([[], []])
  const [teamRoundIndex, setTeamRoundIndex] = useState(0)
  const [teamSelectedOptions, setTeamSelectedOptions] = useState<Array<number | null>>([null, null])
  const [teamTimeUp, setTeamTimeUp] = useState([false, false])
  const [teamHintOpen, setTeamHintOpen] = useState([false, false])
  const [teams, setTeams] = useState<TeamState[]>([
    { name: 'Jamoa A', score: 0, correctAnswers: 0 },
    { name: 'Jamoa B', score: 0, correctAnswers: 0 },
  ])

  const availableQuestions = useMemo(() => {
    if (selectedCategory === 'Barchasi') return imageQuizQuestions
    return imageQuizQuestions.filter((item) => item.category === selectedCategory)
  }, [selectedCategory])

  const currentQuestion = gameMode === 'solo' ? sessionQuestions[currentIndex] : undefined
  const teamQuestions = gameMode === 'teams'
    ? [teamQuestionSets[0]?.[teamRoundIndex], teamQuestionSets[1]?.[teamRoundIndex]]
    : [undefined, undefined]
  const isAnswered = selectedOption !== null || timeUp
  const teamResolved = teamSelectedOptions.map((option, index) => option !== null || teamTimeUp[index])
  const allTeamsResolved = teamResolved.every(Boolean)
  const totalRounds = gameMode === 'teams' ? teamQuestionSets[0]?.length ?? 0 : sessionQuestions.length
  const progressPercent = totalRounds
    ? Math.min(100, Math.round((((gameMode === 'teams' ? teamRoundIndex : currentIndex) + 1) / totalRounds) * 100))
    : 0
  const leadingTeam = teams[0].score === teams[1].score ? null : teams[0].score > teams[1].score ? teams[0] : teams[1]
  const canStart = gameMode === 'teams' ? availableQuestions.length >= 2 : availableQuestions.length >= 1

  useEffect(() => {
    if (screen !== 'quiz') return

    if (gameMode === 'teams') {
      if (allTeamsResolved) return
      if (timeLeft <= 0) {
        setTeamTimeUp((prev) => prev.map((item, index) => item || teamSelectedOptions[index] === null))
        return
      }

      const timerId = window.setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)

      return () => window.clearTimeout(timerId)
    }

    if (isAnswered) return
    if (timeLeft <= 0) {
      setTimeUp(true)
      return
    }

    const timerId = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [screen, gameMode, isAnswered, timeLeft, allTeamsResolved, teamSelectedOptions])

  useEffect(() => {
    if (gameMode === 'teams') {
      setTeamHintOpen([false, false])
    } else {
      setIsAboutOpen(false)
    }
  }, [currentQuestion?.id, screen, gameMode, teamRoundIndex])

  const startGame = () => {
    const list = shuffleQuestions(availableQuestions).map((question) => shuffleOptionsForQuestion(question))
    if (gameMode === 'teams') {
      setTeamQuestionSets(buildTeamQuestionSets(list))
      setTeamRoundIndex(0)
      setTeamSelectedOptions([null, null])
      setTeamTimeUp([false, false])
      setTeamHintOpen([false, false])
      setSessionQuestions([])
      setCurrentIndex(0)
    } else {
      setSessionQuestions(list)
      setCurrentIndex(0)
      setTeamQuestionSets([[], []])
    }
    setSelectedOption(null)
    setScore(0)
    setCorrectAnswers(0)
    setTeams([
      { name: 'Jamoa A', score: 0, correctAnswers: 0 },
      { name: 'Jamoa B', score: 0, correctAnswers: 0 },
    ])
    setTimeLeft(TIMER_SECONDS)
    setTimeUp(false)
    setScreen('quiz')
    void enterFullscreen()
  }

  const handleAnswer = (optionIndex: number) => {
    if (!currentQuestion || isAnswered) return

    setSelectedOption(optionIndex)
    const isCorrect = optionIndex === currentQuestion.correctIndex
    if (isCorrect) {
      const gained = pointsByDifficulty[currentQuestion.difficulty]
      const nextScore = score + gained
      setScore(nextScore)
      setCorrectAnswers((prev) => prev + 1)
      if (nextScore > highScore) {
        setHighScore(nextScore)
        saveHighScore(nextScore)
      }
    }
  }

  const handleTeamAnswer = (teamIndex: number, optionIndex: number) => {
    const question = teamQuestions[teamIndex]
    if (!question || teamResolved[teamIndex]) return

    setTeamSelectedOptions((prev) => prev.map((value, index) => (index === teamIndex ? optionIndex : value)))
    const isCorrect = optionIndex === question.correctIndex
    if (!isCorrect) return

    const gained = pointsByDifficulty[question.difficulty]
    setTeams((prev) =>
      prev.map((team, index) =>
        index === teamIndex
          ? { ...team, score: team.score + gained, correctAnswers: team.correctAnswers + 1 }
          : team,
      ),
    )
  }

  const goNext = () => {
    if (gameMode === 'teams') {
      if (!teamQuestionSets[0].length) return
      if (teamRoundIndex >= teamQuestionSets[0].length - 1) {
        setScreen('end')
        return
      }

      setTeamRoundIndex((prev) => prev + 1)
      setTeamSelectedOptions([null, null])
      setTeamTimeUp([false, false])
      setTeamHintOpen([false, false])
      setTimeLeft(TIMER_SECONDS)
      return
    }

    if (!sessionQuestions.length) return

    if (currentIndex >= sessionQuestions.length - 1) {
      setScreen('end')
      return
    }

    setCurrentIndex((prev) => prev + 1)
    setSelectedOption(null)
    setTimeLeft(TIMER_SECONDS)
    setTimeUp(false)
  }

  const restart = () => {
    setScreen('start')
    setSessionQuestions([])
    setCurrentIndex(0)
    setSelectedOption(null)
    setScore(0)
    setCorrectAnswers(0)
    setTimeLeft(TIMER_SECONDS)
    setTimeUp(false)
    setTeamQuestionSets([[], []])
    setTeamRoundIndex(0)
    setTeamSelectedOptions([null, null])
    setTeamTimeUp([false, false])
    setTeamHintOpen([false, false])
    setTeams([
      { name: 'Jamoa A', score: 0, correctAnswers: 0 },
      { name: 'Jamoa B', score: 0, correctAnswers: 0 },
    ])
  }

  const renderOptionClass = (index: number) => {
    if (!currentQuestion) return ''
    const base =
      'group w-full rounded-2xl border px-4 py-4 text-left text-base font-semibold transition-all duration-200 md:text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300'

    if (!isAnswered) {
      return `${base} border-white/15 bg-gradient-to-r from-white/10 to-white/5 text-white hover:-translate-y-0.5 hover:border-cyan-300/70 hover:from-cyan-400/20 hover:to-blue-400/10 hover:shadow-[0_14px_30px_rgba(34,211,238,0.2)]`
    }

    if (index === currentQuestion.correctIndex) {
      return `${base} border-emerald-400 bg-gradient-to-r from-emerald-500/30 to-emerald-400/10 text-emerald-100 shadow-[0_10px_25px_rgba(16,185,129,0.25)]`
    }

    if (selectedOption === index) {
      return `${base} border-rose-400 bg-gradient-to-r from-rose-500/30 to-rose-400/10 text-rose-100 shadow-[0_10px_25px_rgba(244,63,94,0.22)]`
    }

    return `${base} border-white/15 bg-white/5 text-white/55`
  }

  const renderTeamOptionClass = (teamIndex: number, optionIndex: number, question: ImageQuizQuestion) => {
    const base =
      'group flex min-h-[72px] w-full flex-1 items-center rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300'

    if (!teamResolved[teamIndex]) {
      return `${base} border-white/15 bg-gradient-to-r from-white/10 to-white/5 text-white hover:-translate-y-0.5 hover:border-cyan-300/70 hover:from-cyan-400/20 hover:to-blue-400/10`
    }

    if (optionIndex === question.correctIndex) {
      return `${base} border-emerald-400 bg-gradient-to-r from-emerald-500/30 to-emerald-400/10 text-emerald-100`
    }

    if (teamSelectedOptions[teamIndex] === optionIndex) {
      return `${base} border-rose-400 bg-gradient-to-r from-rose-500/30 to-rose-400/10 text-rose-100`
    }

    return `${base} border-white/15 bg-white/5 text-white/55`
  }

  if (screen === 'start') {
    return (
      <main className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Image Quiz</p>
          <h1 className="mt-4 text-3xl font-black leading-tight md:text-5xl">Rasmli Bilim Bellashuvi</h1>
          <p className="mt-5 max-w-3xl text-base text-slate-300 md:text-lg">
            Har bir savolda rasm bor. Rasmga qarang, to‘g‘ri javobni tanlang va ball to‘plang.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <button
              type="button"
              onClick={() => setGameMode('solo')}
              className={
                gameMode === 'solo'
                  ? 'rounded-3xl border border-cyan-300 bg-[linear-gradient(135deg,rgba(34,211,238,0.24),rgba(59,130,246,0.16))] p-5 text-left shadow-[0_20px_45px_rgba(14,116,144,0.24)]'
                  : 'rounded-3xl border border-white/10 bg-white/5 p-5 text-left hover:border-white/25 hover:bg-white/10'
              }
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Yakka o‘yin</p>
              <h3 className="mt-3 text-2xl font-black text-white">1 o‘quvchi</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                Oddiy rejim: har savol uchun o‘zingiz javob berasiz, umumiy ball va high score yig‘iladi.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setGameMode('teams')}
              className={
                gameMode === 'teams'
                  ? 'rounded-3xl border border-amber-300 bg-[linear-gradient(135deg,rgba(251,191,36,0.18),rgba(249,115,22,0.14))] p-5 text-left shadow-[0_20px_45px_rgba(180,83,9,0.22)]'
                  : 'rounded-3xl border border-white/10 bg-white/5 p-5 text-left hover:border-white/25 hover:bg-white/10'
              }
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">Jamoaviy rejim</p>
              <h3 className="mt-3 text-2xl font-black text-white">2 ta jamoa</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                Har raundda ikki jamoaga ikki xil rasm va ikki xil variant beriladi. Har jamoa o‘z panelida javob beradi va ball alohida hisoblanadi.
              </p>
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedCategory(tab)}
                className={
                  selectedCategory === tab
                    ? 'rounded-2xl border border-cyan-300 bg-cyan-400/20 px-4 py-3 font-bold text-cyan-100'
                    : 'rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-semibold text-white/80 hover:border-white/35'
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={startGame}
              disabled={!canStart}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 text-lg font-black text-slate-950 shadow-xl hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Boshlash
            </button>
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-base font-semibold text-white/85 hover:bg-white/10"
            >
              O‘yinlar ro‘yxatiga qaytish
            </button>
            <p className="text-base text-slate-300">High score: <span className="font-bold text-amber-300">{highScore}</span></p>
          </div>

          {gameMode === 'teams' ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-amber-300/20 bg-[linear-gradient(160deg,rgba(120,53,15,0.22),rgba(15,23,42,0.7))] p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-200">2 jamoalik qanday o‘ynaladi</p>
                <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-200">
                  <p>1. Har raundda ikki jamoa uchun ikki alohida rasmli savol chiqadi.</p>
                  <p>2. Chap panel Jamoa A uchun, o‘ng panel Jamoa B uchun ishlaydi.</p>
                  <p>3. Har jamoa faqat o‘z variantlaridan birini tanlaydi.</p>
                  <p>4. To‘g‘ri javob o‘sha jamoaga ball beradi, noto‘g‘ri javobda ball qo‘shilmaydi.</p>
                  <p>5. Raund tugagach keyingi ikki savol ochiladi va oxirida eng ko‘p ball olgan jamoa yutadi.</p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">Jamoa A</p>
                  <p className="mt-2 text-lg font-black text-white">Moviy jamoa</p>
                </div>
                <div className="rounded-3xl border border-rose-300/20 bg-rose-400/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-200">Jamoa B</p>
                  <p className="mt-2 text-lg font-black text-white">Qizil jamoa</p>
                </div>
              </div>
            </div>
          ) : null}

          {!canStart ? (
            <p className="mt-4 text-sm font-semibold text-rose-300">
              {gameMode === 'teams'
                ? '2 jamoalik rejim uchun bu kategoriyada kamida 2 ta savol kerak.'
                : 'Bu kategoriyada savol topilmadi.'}
            </p>
          ) : null}
        </div>
      </main>
    )
  }

  if (screen === 'end') {
    return (
      <main className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-7 text-center shadow-2xl backdrop-blur md:p-10">
          <h2 className="text-3xl font-black md:text-5xl">O‘yin tugadi</h2>
          <p className="mt-6 text-lg text-slate-300">Natija</p>

          {gameMode === 'teams' ? (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {teams.map((team, index) => (
                  <div
                    key={team.name}
                    className={
                      index === 0
                        ? 'rounded-2xl border border-cyan-300/25 bg-cyan-400/10 p-5'
                        : 'rounded-2xl border border-rose-300/25 bg-rose-400/10 p-5'
                    }
                  >
                    <p className="text-sm uppercase tracking-wide text-slate-200">{team.name}</p>
                    <p className="mt-2 text-3xl font-black text-white">{team.score}</p>
                    <p className="mt-2 text-sm text-slate-300">To‘g‘ri javoblar: <span className="font-bold text-emerald-300">{team.correctAnswers}</span></p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-wide text-slate-400">G‘olib</p>
                <p className="mt-2 text-3xl font-black text-amber-300">
                  {leadingTeam ? leadingTeam.name : 'Durang'}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {leadingTeam ? `${leadingTeam.score} ball bilan oldinda.` : 'Ikkala jamoa ham bir xil ball to‘pladi.'}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-wide text-slate-400">To‘g‘ri javoblar</p>
                  <p className="mt-2 text-3xl font-black text-emerald-300">{correctAnswers} / {sessionQuestions.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-wide text-slate-400">Ball</p>
                  <p className="mt-2 text-3xl font-black text-cyan-300">{score}</p>
                </div>
              </div>

              <p className="mt-6 text-base text-slate-300">Eng yuqori ball: <span className="font-bold text-amber-300">{highScore}</span></p>
            </>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={restart}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3 text-base font-black text-slate-950 hover:brightness-110"
            >
              Qayta boshlash
            </button>
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white/85 hover:bg-white/10"
            >
              O‘yinlar ro‘yxati
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!currentQuestion) {
    if (gameMode === 'teams' && teamQuestions[0] && teamQuestions[1]) {
      const featuredQuestion = teamQuestions[0]
      return (
        <main className="h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,#020617_0%,#07111f_100%)] text-white">
          <div className="grid h-full w-full grid-rows-[auto_auto_1fr_auto] gap-3 p-3 md:gap-4 md:p-4">
            <div className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-2xl backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">Rasmli Quiz • 2 Jamoa</p>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-300 md:text-sm">
                <p>Raund: <span className="text-amber-300">{teamRoundIndex + 1} / {totalRounds}</span></p>
                <p>Vaqt: <span className={timeLeft <= 5 ? 'text-rose-300' : 'text-cyan-200'}>{timeLeft}s</span></p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {teams.map((team, index) => (
                <div
                  key={team.name}
                  className={
                    index === 0
                      ? 'rounded-3xl border border-cyan-300/35 bg-cyan-400/12 px-4 py-3 shadow-[0_18px_35px_rgba(8,145,178,0.12)]'
                      : 'rounded-3xl border border-rose-300/35 bg-rose-400/12 px-4 py-3 shadow-[0_18px_35px_rgba(225,29,72,0.12)]'
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{team.name}</p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-200">{teamResolved[index] ? 'Yakunlandi' : 'Faol'}</p>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-2xl font-black text-white md:text-3xl">{team.score}</p>
                    <p className="text-xs text-slate-300 md:text-sm">To‘g‘ri: <span className="font-bold text-emerald-300">{team.correctAnswers}</span></p>
                  </div>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">Bir xil rasm, alohida variantlar</p>
                </div>
              ))}
            </div>

            <section className="grid min-h-0 gap-3 md:grid-cols-[0.86fr_1.28fr_0.86fr]">
              {teamQuestions[0] ? (
                <div
                  className="flex min-h-0 flex-col rounded-3xl border border-cyan-300/28 bg-[linear-gradient(180deg,rgba(14,116,144,0.18),rgba(15,23,42,0.92))] p-3 shadow-[0_20px_45px_rgba(2,6,23,0.35)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100">
                      {teams[0].name}
                    </p>
                    <button
                      type="button"
                      onClick={() => setTeamHintOpen((prev) => prev.map((item, index) => (index === 0 ? !item : item)))}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200 hover:bg-white/10"
                    >
                      {teamHintOpen[0] ? 'Hint yopish' : 'Hint'}
                    </button>
                  </div>

                  {teamHintOpen[0] ? (
                    <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200">Hint</p>
                      <p className="mt-1 text-xs leading-5 text-slate-200">{teamQuestions[0].hint}</p>
                    </div>
                  ) : null}

                  <div className="mt-3 grid flex-1 content-stretch gap-2">
                    {teamQuestions[0]!.options.map((option, optionIndex) => (
                      <button
                        key={`${teamQuestions[0]!.id}-${option}`}
                        type="button"
                        onClick={() => handleTeamAnswer(0, optionIndex)}
                        disabled={teamResolved[0]}
                        className={renderTeamOptionClass(0, optionIndex, teamQuestions[0]!)}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xs font-black text-cyan-100">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span className="line-clamp-2">{option}</span>
                        </span>
                      </button>
                    ))}
                  </div>

                  {teamResolved[0] ? (
                    <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                      {teamTimeUp[0] && teamSelectedOptions[0] === null ? (
                        <p className="text-xs font-bold text-rose-300">{teams[0].name} vaqtida javob bera olmadi.</p>
                      ) : teamSelectedOptions[0] === teamQuestions[0]!.correctIndex ? (
                        <p className="text-xs font-bold text-emerald-300">{teams[0].name} to‘g‘ri topdi.</p>
                      ) : (
                        <p className="text-xs font-bold text-rose-300">{teams[0].name} noto‘g‘ri javob berdi.</p>
                      )}

                      <p className="mt-1 text-[11px] text-slate-300">
                        To‘g‘ri javob: <span className="font-bold text-cyan-200">{teamQuestions[0]!.options[teamQuestions[0]!.correctIndex]}</span>
                      </p>
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
              ) : null}

              <div className="order-first md:order-none rounded-[2rem] border border-white/12 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-4 shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Markaziy Rasm</p>
                    <h2 className="mt-2 text-lg font-black leading-tight text-white md:text-xl">{featuredQuestion.question}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">{featuredQuestion.category}</p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">{featuredQuestion.difficulty}</p>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/75">
                  {missingImageMap[featuredQuestion.id] ? (
                    <div className="grid h-[42vh] place-items-center text-lg font-bold text-rose-300">Rasm topilmadi</div>
                  ) : (
                    <img
                      src={featuredQuestion.image}
                      alt={featuredQuestion.question}
                      className="h-[42vh] w-full bg-slate-950 object-contain p-3"
                      style={{ objectPosition: imageObjectPositionById[featuredQuestion.id] ?? 'center' }}
                      onError={() => setMissingImageMap((prev) => ({ ...prev, [featuredQuestion.id]: true }))}
                    />
                  )}
                </div>

                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-500 transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {teamQuestions[1] ? (
                <div
                  className="flex min-h-0 flex-col rounded-3xl border border-rose-300/28 bg-[linear-gradient(180deg,rgba(190,24,93,0.18),rgba(15,23,42,0.92))] p-3 shadow-[0_20px_45px_rgba(2,6,23,0.35)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="inline-flex rounded-full border border-rose-300/35 bg-rose-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-100">
                      {teams[1].name}
                    </p>
                    <button
                      type="button"
                      onClick={() => setTeamHintOpen((prev) => prev.map((item, index) => (index === 1 ? !item : item)))}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200 hover:bg-white/10"
                    >
                      {teamHintOpen[1] ? 'Hint yopish' : 'Hint'}
                    </button>
                  </div>

                  {teamHintOpen[1] ? (
                    <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200">Hint</p>
                      <p className="mt-1 text-xs leading-5 text-slate-200">{teamQuestions[1].hint}</p>
                    </div>
                  ) : null}

                  <div className="mt-3 grid flex-1 content-stretch gap-2">
                    {teamQuestions[1]!.options.map((option, optionIndex) => (
                      <button
                        key={`${teamQuestions[1]!.id}-${option}`}
                        type="button"
                        onClick={() => handleTeamAnswer(1, optionIndex)}
                        disabled={teamResolved[1]}
                        className={renderTeamOptionClass(1, optionIndex, teamQuestions[1]!)}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xs font-black text-cyan-100">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span className="line-clamp-2">{option}</span>
                        </span>
                      </button>
                    ))}
                  </div>

                  {teamResolved[1] ? (
                    <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                      {teamTimeUp[1] && teamSelectedOptions[1] === null ? (
                        <p className="text-xs font-bold text-rose-300">{teams[1].name} vaqtida javob bera olmadi.</p>
                      ) : teamSelectedOptions[1] === teamQuestions[1]!.correctIndex ? (
                        <p className="text-xs font-bold text-emerald-300">{teams[1].name} to‘g‘ri topdi.</p>
                      ) : (
                        <p className="text-xs font-bold text-rose-300">{teams[1].name} noto‘g‘ri javob berdi.</p>
                      )}

                      <p className="mt-1 text-[11px] text-slate-300">
                        To‘g‘ri javob: <span className="font-bold text-cyan-200">{teamQuestions[1]!.options[teamQuestions[1]!.correctIndex]}</span>
                      </p>
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
              ) : null}
            </section>

            {allTeamsResolved ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-400 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/25 hover:brightness-110"
                >
                  {teamRoundIndex >= totalRounds - 1 ? 'Natijani ko‘rish' : 'Keyingi raund'}
                </button>
              </div>
            ) : null}
          </div>
        </main>
      )
    }

    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-xl font-bold">Savollar topilmadi</p>
          <button
            type="button"
            onClick={restart}
            className="mt-4 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
          >
            Ortga qaytish
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-screen overflow-y-auto bg-slate-950 text-white">
      <div className="min-h-screen w-full border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-300">Rasmli Quiz</p>
          <p className="text-sm font-semibold text-slate-300">Ball: <span className="text-amber-300">{score}</span></p>
          <p className="text-sm font-semibold text-slate-300">Qolgan vaqt: <span className={timeLeft <= 5 ? 'text-rose-300' : 'text-cyan-200'}>{timeLeft}s</span></p>
        </div>

        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-500 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
          <p>{currentIndex + 1} / {sessionQuestions.length}</p>
          <p>Kategoriya: <span className="font-bold text-cyan-200">{currentQuestion!.category}</span></p>
          <p>Qiyinlik: <span className="font-bold text-amber-200">{currentQuestion!.difficulty}</span></p>
        </div>

        <section className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
            {missingImageMap[currentQuestion!.id] ? (
              <div className="grid h-[360px] place-items-center text-lg font-bold text-rose-300 md:h-[430px]">Rasm topilmadi</div>
            ) : (
              <img
                src={currentQuestion!.image}
                alt={currentQuestion!.question}
                className="h-[360px] w-full bg-slate-950 object-contain p-2 md:h-[430px] md:p-3"
                style={{ objectPosition: imageObjectPositionById[currentQuestion!.id] ?? 'center' }}
                onError={() => setMissingImageMap((prev) => ({ ...prev, [currentQuestion!.id]: true }))}
              />
            )}

            <div className="border-t border-white/10 bg-slate-950/80 p-4">
              <button
                type="button"
                onClick={() => setIsAboutOpen((prev) => !prev)}
                className="rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/20"
              >
                {isAboutOpen ? 'Hintni yopish' : 'Hint'}
              </button>

              {isAboutOpen ? (
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">Yo‘naltiruvchi hint</p>
                  <p className="mt-2 text-sm leading-7 text-slate-200 md:text-base">{currentQuestion!.hint}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_40%),linear-gradient(160deg,rgba(15,23,42,0.95),rgba(2,6,23,0.95))] p-4 shadow-[0_20px_50px_rgba(8,47,73,0.45)] md:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-400/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
                Savol paneli
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300">
                {currentQuestion!.category}
              </p>
            </div>

            <h2 className="mt-4 text-2xl font-black leading-tight text-white md:text-3xl">{currentQuestion!.question}</h2>

            <div className="mt-5 grid gap-3">
              {currentQuestion!.options.map((option, index) => (
                <button
                  key={`${currentQuestion!.id}-${option}`}
                  type="button"
                  onClick={() => handleAnswer(index)}
                  disabled={isAnswered}
                  className={renderOptionClass(index)}
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm font-black text-cyan-100 group-hover:bg-cyan-300/25">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </span>
                </button>
              ))}
            </div>

            {isAnswered ? (
              <div className="mt-5 rounded-2xl border border-white/15 bg-gradient-to-r from-white/10 to-white/5 p-4">
                {timeUp ? (
                  <p className="text-lg font-bold text-rose-300">Vaqt tugadi. Noto‘g‘ri javob.</p>
                ) : selectedOption === currentQuestion!.correctIndex ? (
                  <p className="text-lg font-bold text-emerald-300">To‘g‘ri javob</p>
                ) : (
                  <p className="text-lg font-bold text-rose-300">Noto‘g‘ri javob</p>
                )}

                <p className="mt-2 text-sm text-slate-300">
                  To‘g‘ri javob: <span className="font-bold text-cyan-200">{currentQuestion!.options[currentQuestion!.correctIndex]}</span>
                </p>

                <button
                  type="button"
                  onClick={goNext}
                  className="mt-4 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/25 hover:brightness-110"
                >
                  Keyingi savol
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}
