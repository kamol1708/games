import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import CategoryGrid from '../components/CategoryGrid'
import QuestionModal from '../components/QuestionModal'
import Scoreboard from '../components/Scoreboard'
import TeacherControls from '../components/TeacherControls'
import {
  boardFinished,
  markTileUsed,
  nextTeamIndex,
  refreshDoubleTile,
  selectTile,
  subjectLabel,
} from '../logic/gameEngine'
import { scoreForAnswer } from '../logic/scoring'
import { saveHighScore } from '../logic/storage'
import type { QuizGameState, Team } from '../logic/types'

type Props = {
  state: QuizGameState
  setState: Dispatch<SetStateAction<QuizGameState>>
  onReset: () => void
  onBack?: () => void
}

type AnswerState = {
  selectedChoice: number | null
  numericValue: string
}

export default function GameBoard({ state, setState, onReset, onBack }: Props) {
  const [answer, setAnswer] = useState<AnswerState>({ selectedChoice: null, numericValue: '' })
  const [secondsLeft, setSecondsLeft] = useState<number>(state.settings.timerSeconds)
  const [ownerIndex, setOwnerIndex] = useState<number | null>(null)
  const [stealQueue, setStealQueue] = useState<number[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [pendingCloseLog, setPendingCloseLog] = useState<string | null>(null)

  const selectedTile = useMemo(
    () => state.board.find((tile) => tile.id === state.selectedTileId) ?? null,
    [state.board, state.selectedTileId],
  )

  const answeringTeamIndex = stealQueue.length > 0 ? stealQueue[0] : ownerIndex ?? state.activeTeamIndex
  const answeringTeam = state.teams[answeringTeamIndex] ?? null

  const stealCandidates = useMemo(() => {
    if (!selectedTile || ownerIndex === null) return []
    return state.teams.filter((_, idx) => idx !== ownerIndex)
  }, [selectedTile, ownerIndex, state.teams])

  useEffect(() => {
    if (!selectedTile) return
    setSecondsLeft(state.settings.timerSeconds)
  }, [selectedTile, state.settings.timerSeconds])

  useEffect(() => {
    if (!selectedTile || !state.settings.timerEnabled) return
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [selectedTile, state.settings.timerEnabled])

  useEffect(() => {
    if (!selectedTile || !state.settings.timerEnabled) return
    if (state.revealAnswer) return
    if (secondsLeft > 0) return
    handleSubmit(true)
  }, [secondsLeft, selectedTile, state.settings.timerEnabled, state.revealAnswer])

  useEffect(() => {
    const reached = state.teams.some((team) => team.reachedConfetti)
    if (!reached) return
    setShowConfetti(true)
    const timeout = window.setTimeout(() => setShowConfetti(false), 2600)
    return () => window.clearTimeout(timeout)
  }, [state.teams])

  useEffect(() => {
    if (!boardFinished(state)) return
    setShowConfetti(true)
    const timeout = window.setTimeout(() => setShowConfetti(false), 4200)
    return () => window.clearTimeout(timeout)
  }, [state.board, state.teams, state.activeTeamIndex])

  const openTile = (tileId: string) => {
    setState((prev) => {
      const next = selectTile(prev, tileId)
      return {
        ...next,
        revealAnswer: false,
      }
    })
    setOwnerIndex(state.activeTeamIndex)
    setStealQueue([])
    setAnswer({ selectedChoice: null, numericValue: '' })
  }

  const closeQuestionAndAdvance = (updateLog: string) => {
    setState((prev) => {
      if (!prev.selectedTileId) return prev
      const closed = markTileUsed(
        {
          ...prev,
          selectedTileId: null,
          revealAnswer: false,
          eventLog: [updateLog, ...prev.eventLog].slice(0, 10),
        },
        prev.selectedTileId,
      )

      const nextActive = nextTeamIndex(ownerIndex ?? prev.activeTeamIndex, closed.teams.length)
      let updated = {
        ...closed,
        activeTeamIndex: nextActive,
        round: closed.round + 1,
      }

      if (updated.round % updated.teams.length === 0) {
        updated = refreshDoubleTile(updated)
      }

      if (boardFinished(updated)) {
        const winner = [...updated.teams].sort((a, b) => b.score - a.score)[0]
        if (winner) saveHighScore({ name: winner.name, score: winner.score })
      }

      return updated
    })
    setOwnerIndex(null)
    setStealQueue([])
    setAnswer({ selectedChoice: null, numericValue: '' })
  }

  const isAnswerCorrect = () => {
    if (!selectedTile) return false
    const normalize = (value: string) =>
      value
        .toLowerCase()
        .replace(/['`"]/g, '')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    const correctRaw = selectedTile.question.answer ?? ''
    const correct = normalize(correctRaw)
    const userRaw =
      selectedTile.question.type === 'mcq' || selectedTile.question.type === 'boolean'
        ? selectedTile.question.options?.[answer.selectedChoice ?? -1] ?? ''
        : answer.numericValue.trim()
    const user = normalize(userRaw)

    if (!user || !correct) return false
    if (user === correct) return true

    if (selectedTile.question.type === 'numeric') {
      const userNum = Number(user.replace(',', '.'))
      const correctNum = Number(correct.replace(',', '.'))
      if (!Number.isNaN(userNum) && !Number.isNaN(correctNum)) return userNum === correctNum
      return false
    }

    const correctWords = new Set(correct.split(' ').filter((w) => w.length >= 3))
    const userWords = user.split(' ').filter((w) => w.length >= 3)

    // Kalit so'z mos kelsa ham to'g'ri deb qabul qilamiz.
    if (userWords.length === 1 && correctWords.has(userWords[0])) return true
    if (correctWords.size === 1 && userWords.includes([...correctWords][0])) return true

    return false
  }

  const applyTeamScore = (teamIndex: number, correct: boolean) => {
    if (!selectedTile) return
    setState((prev) => {
      const team = prev.teams[teamIndex] as Team
      const nextTeam = scoreForAnswer(team, selectedTile.points, correct, false, selectedTile.isDouble)
      const updatedTeams = prev.teams.map((item, idx) => (idx === teamIndex ? nextTeam : item))
      return {
        ...prev,
        teams: updatedTeams,
      }
    })
  }

  const handleSubmit = (timeout = false) => {
    if (!selectedTile || answeringTeamIndex < 0) return

    const correct = timeout ? false : isAnswerCorrect()
    applyTeamScore(answeringTeamIndex, correct)

    if (!correct && state.settings.stealMode && stealQueue.length === 0 && ownerIndex !== null) {
      const queue = state.teams
        .map((_, idx) => idx)
        .filter((idx) => idx !== ownerIndex)
      if (queue.length > 0) {
        setStealQueue(queue)
        setAnswer({ selectedChoice: null, numericValue: '' })
        setSecondsLeft(state.settings.timerEnabled ? state.settings.timerSeconds : secondsLeft)
        return
      }
    }

    if (!correct && state.settings.stealMode && stealQueue.length > 0) {
      const [, ...rest] = stealQueue
      if (rest.length > 0) {
        setStealQueue(rest)
        setAnswer({ selectedChoice: null, numericValue: '' })
        setSecondsLeft(state.settings.timerEnabled ? state.settings.timerSeconds : secondsLeft)
        return
      }
    }

    const prefix = selectedTile.isDouble ? 'DOUBLE TILE' : subjectLabel(selectedTile.subject)
    const resultLabel = correct ? 'correct' : timeout ? 'time out' : 'wrong'
    const logText = `${prefix} · ${answeringTeam?.name ?? 'Team'} · ${resultLabel} (${selectedTile.points})`
    if (!correct) {
      setState((prev) => ({ ...prev, revealAnswer: true }))
      setPendingCloseLog(logText)
      return
    }
    closeQuestionAndAdvance(logText)
  }

  const handleSkip = () => {
    if (!selectedTile) return
    closeQuestionAndAdvance(`${answeringTeam?.name ?? 'Team'} question skipped`)
  }

  const handleContinueAfterReveal = () => {
    closeQuestionAndAdvance(pendingCloseLog ?? `${answeringTeam?.name ?? 'Team'} · wrong`)
    setPendingCloseLog(null)
  }

  const adjustScore = (teamId: string, delta: number) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((team) =>
        team.id === teamId
          ? { ...team, score: team.score + delta, reachedConfetti: team.reachedConfetti || team.score + delta >= 2000 }
          : team,
      ),
      eventLog: [`Teacher score adjust ${delta > 0 ? '+' : ''}${delta}`, ...prev.eventLog].slice(0, 10),
    }))
  }

  const exportResults = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      settings: state.settings,
      teams: state.teams,
      logs: state.eventLog,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `classroom-quiz-results-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const finished = boardFinished(state)
  const winner = finished ? [...state.teams].sort((a, b) => b.score - a.score)[0] : null

  return (
    <main className="min-h-screen bg-[#04060b] p-3 text-white sm:p-5">
      {showConfetti || Boolean(finished && winner) ? (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {Array.from({ length: 90 }).map((_, idx) => (
            <span
              key={idx}
              className="absolute h-2 w-2 animate-bounce rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-300"
              style={{ left: `${(idx * 37) % 100}%`, top: `${(idx * 19) % 70}%`, animationDuration: `${1 + (idx % 4)}s` }}
            />
          ))}
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1450px] gap-4 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <header className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Jeopardy Style Classroom Battle</p>
                <h1 className="mt-1 text-3xl font-semibold">Team Quiz Board</h1>
                <p className="mt-2 text-sm text-white/65">Current turn: {state.teams[state.activeTeamIndex]?.name}</p>
              </div>
              <div className="flex gap-2">
                {onBack ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm"
                  >
                    Back
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onReset}
                  className="rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-2 text-sm text-rose-100"
                >
                  New Game
                </button>
              </div>
            </div>
          </header>

          <Scoreboard teams={state.teams} activeTeamIndex={state.activeTeamIndex} highScore={state.highScore} />

          <CategoryGrid subjects={state.settings.subjects} tiles={state.board} onSelect={openTile} />

        </section>

        <aside className="space-y-4">
          <TeacherControls teams={state.teams} onAdjustScore={adjustScore} onReset={onReset} onExport={exportResults} />

          {finished && winner ? (
            <section className="rounded-3xl border border-emerald-300/35 bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-200/80">Winner</p>
              <h3 className="mt-1 text-2xl font-semibold text-emerald-100">{winner.name} g&apos;olib!</h3>
              <p className="mt-2 text-sm text-emerald-100/85">Final Score: {winner.score}</p>
            </section>
          ) : null}
        </aside>
      </div>

      {finished && winner ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4">
          <section className="w-full max-w-xl rounded-3xl border border-emerald-300/35 bg-[#07110f] p-6 text-center shadow-[0_28px_100px_rgba(0,0,0,0.7)]">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Final Natija</p>
            <h2 className="mt-3 text-4xl font-extrabold text-emerald-100">{winner.name} g&apos;olib!</h2>
            <p className="mt-2 text-lg text-white/85">Tabriklaymiz, jamoangiz eng yuqori ball oldi.</p>
            <p className="mt-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xl font-semibold text-white">
              Yakuniy ball: <span className="text-emerald-300">{winner.score}</span>
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={onReset}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 font-semibold text-white"
              >
                Yangi o&apos;yin
              </button>
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 font-semibold text-white"
                >
                  Orqaga
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      <QuestionModal
        open={Boolean(selectedTile)}
        question={selectedTile?.question ?? null}
        tilePoints={selectedTile?.points ?? 0}
        team={answeringTeam}
        timerEnabled={state.settings.timerEnabled}
        timerSecondsLeft={secondsLeft}
        revealAnswer={state.revealAnswer}
        stealCandidates={stealCandidates}
        stealActive={stealQueue.length > 0}
        selectedChoice={answer.selectedChoice}
        numericValue={answer.numericValue}
        onSelectChoice={(idx) => setAnswer((prev) => ({ ...prev, selectedChoice: idx }))}
        onNumericChange={(value) => setAnswer((prev) => ({ ...prev, numericValue: value }))}
        onSubmit={() => handleSubmit(false)}
        onSkip={handleSkip}
        onReveal={() => setState((prev) => ({ ...prev, revealAnswer: true }))}
        onContinueAfterReveal={handleContinueAfterReveal}
      />
    </main>
  )
}
