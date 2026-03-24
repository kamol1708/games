import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GameBoard } from './components/GameBoard'
import { SetupScreen } from './components/SetupScreen'
import {
  closeBombModal,
  createNewSession,
  forceMarkPuzzle,
  openBox,
  submitPuzzleAnswer,
  tickPuzzle,
  toggleProjectorMode,
} from './lib/game'
import { clearSession, loadSession, saveSession } from './lib/storage'
import {
  playBumbuzzleBomb,
  playBumbuzzleBonus,
  playBumbuzzleCorrect,
  playBumbuzzleWin,
  playBumbuzzleWrong,
} from './lib/sfx'
import type { GameSession, SetupConfig } from './types/game'

type Props = {
  onBack?: () => void
}

export default function BumbuzzlePage({ onBack }: Props) {
  const [session, setSession] = useState<GameSession | null>(() => loadSession())
  const prevSessionRef = useRef<GameSession | null>(session)

  useEffect(() => {
    if (!session) return
    saveSession(session)
  }, [session])

  useEffect(() => {
    const prev = prevSessionRef.current
    if (!session) {
      prevSessionRef.current = session
      return
    }

    if (session.gameOver && !prev?.gameOver) {
      playBumbuzzleWin()
    }

    const prevPuzzle = prev?.activePuzzle
    const currPuzzle = session.activePuzzle
    if (!prevPuzzle && currPuzzle?.bomb) {
      playBumbuzzleBomb()
    }

    const latestLog = session.logs[0]
    const prevLatestLogId = prev?.logs[0]?.id
    if (latestLog && latestLog.id !== prevLatestLogId) {
      const msg = latestLog.message.toLowerCase()
      if (msg.includes('bonus oldi') || msg.includes('double points')) playBumbuzzleBonus()
      else if (msg.includes('true')) playBumbuzzleCorrect()
      else if (msg.includes('false')) playBumbuzzleWrong()
      else if (msg.includes('bomba topdi')) playBumbuzzleBomb()
    }

    prevSessionRef.current = session
  }, [session])

  useEffect(() => {
    if (!session?.activePuzzle || session.activePuzzle.bomb || session.gameOver) return
    const id = window.setInterval(() => {
      setSession((prev) => (prev ? tickPuzzle(prev) : prev))
    }, 250)
    return () => window.clearInterval(id)
  }, [session?.activePuzzle?.boxId, session?.activePuzzle?.bomb, session?.gameOver])

  const resetWithSameSetup = () => {
    setSession((prev) => {
      if (!prev) return prev
      return createNewSession({
        teamCount: prev.teams.length,
        teamNames: prev.teams.map((t) => t.name),
        difficulty: prev.difficulty,
        boxCount: prev.boxCount,
        roundCount: prev.roundCount,
      })
    })
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[#eef4ff] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(59,130,246,.18),transparent_40%),radial-gradient(circle_at_88%_8%,rgba(245,158,11,.18),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(236,72,153,.12),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(15,23,42,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.04)_1px,transparent_1px)] [background-size:28px_28px]" />

      {session ? (
        <div className="relative z-10 mx-auto w-full max-w-[1480px] px-3 pt-2 sm:px-5 sm:pt-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 shadow-[0_18px_40px_rgba(30,41,59,.08)] backdrop-blur-xl">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">English Team Game</p>
              <h1 className="truncate bg-gradient-to-r from-blue-700 via-indigo-600 to-fuchsia-600 bg-clip-text text-lg font-semibold tracking-tight text-transparent sm:text-xl">
                Bumbuzzle
              </h1>
              <p className="mt-0.5 text-sm text-slate-600">
                Active team: <span className="font-semibold text-slate-900">{session.teams[session.turnIndex]?.name}</span>
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-white/70 bg-white/80 px-2 py-0.5 text-[11px] text-slate-600">
                  {session.difficulty === 'beginner' ? 'Beginner' : 'Intermediate'}
                </span>
                <span className="rounded-full border border-white/70 bg-white/80 px-2 py-0.5 text-[11px] text-slate-600">
                  {session.boxCount} boxes
                </span>
                <span className="rounded-full border border-white/70 bg-white/80 px-2 py-0.5 text-[11px] text-slate-600">
                  {session.boxes.filter((b) => b.opened).length}/{session.boxes.length} opened
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSession((prev) => (prev ? toggleProjectorMode(prev) : prev))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                {session.projectorMode ? 'Projector: ON' : 'Projector: OFF'}
              </button>
              <button
                type="button"
                onClick={resetWithSameSetup}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-700 transition hover:bg-rose-100"
              >
                Reset game
              </button>
              <button
                type="button"
                onClick={() => {
                  clearSession()
                  setSession(null)
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Setup
              </button>
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  ← Games
                </button>
              ) : (
                <Link to="/games" className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50">
                  ← Games
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {!session ? (
        <SetupScreen
          onStart={(config: SetupConfig) => {
            const next = createNewSession(config)
            setSession(next)
          }}
        />
      ) : (
        <GameBoard
          session={session}
          onOpenBox={(boxId) => setSession((prev) => (prev ? openBox(prev, boxId) : prev))}
          onSubmitAnswer={(answer) => setSession((prev) => (prev ? submitPuzzleAnswer(prev, answer) : prev))}
          onBombContinue={() => setSession((prev) => (prev ? closeBombModal(prev) : prev))}
          onTeacherForceCorrect={() => setSession((prev) => (prev ? forceMarkPuzzle(prev, true) : prev))}
          onTeacherForceWrong={() => setSession((prev) => (prev ? forceMarkPuzzle(prev, false) : prev))}
          onReset={resetWithSameSetup}
          onNewGame={() => {
            clearSession()
            setSession(null)
          }}
        />
      )}
    </main>
  )
}
