import { useEffect, useMemo, useState } from 'react'
import { GameBoard } from './components/GameBoard'
import { SetupScreen } from './components/SetupScreen'
import {
  addLog,
  advanceTurn,
  closeBombModal,
  createNewSession,
  forceMarkPuzzle,
  openBox,
  revealPuzzleAnswer,
  skipPuzzle,
  submitPuzzleAnswer,
  tickPuzzle,
  toggleProjectorMode,
} from './lib/game'
import { clearSession, loadSession, saveSession } from './lib/storage'
import type { GameSession, SetupConfig } from './types/game'

export default function App() {
  const [session, setSession] = useState<GameSession | null>(() => loadSession())

  useEffect(() => {
    if (!session) return
    saveSession(session)
  }, [session])

  useEffect(() => {
    if (!session?.activePuzzle || session.activePuzzle.bomb || session.gameOver) return
    const id = window.setInterval(() => {
      setSession((prev) => (prev ? tickPuzzle(prev) : prev))
    }, 250)
    return () => window.clearInterval(id)
  }, [session?.activePuzzle?.boxId, session?.activePuzzle?.bomb, session?.gameOver])

  const activeTeamName = useMemo(() => {
    if (!session) return ''
    return session.teams[session.turnIndex]?.name ?? ''
  }, [session])

  const resetWithSameSetup = () => {
    setSession((prev) => {
      if (!prev) return prev
      return createNewSession({
        teamCount: prev.teams.length,
        teamNames: prev.teams.map((t) => t.name),
        difficulty: prev.difficulty,
        roundCount: prev.roundCount,
      })
    })
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#05060a] text-white">
        <SetupScreen
          onStart={(config: SetupConfig) => {
            const next = createNewSession(config)
            setSession(next)
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <GameBoard
        session={session}
        onOpenBox={(boxId) => setSession((prev) => (prev ? openBox(prev, boxId) : prev))}
        onSubmitAnswer={(answer) => setSession((prev) => (prev ? submitPuzzleAnswer(prev, answer) : prev))}
        onBombContinue={() => setSession((prev) => (prev ? closeBombModal(prev) : prev))}
        onTeacherNextTurn={() =>
          setSession((prev) => (prev ? addLog(advanceTurn({ ...prev, activePuzzle: null }), `${activeTeamName}: teacher next turn`) : prev))
        }
        onTeacherSkipQuestion={() => setSession((prev) => (prev ? skipPuzzle(prev) : prev))}
        onTeacherReveal={() => setSession((prev) => (prev ? revealPuzzleAnswer(prev) : prev))}
        onTeacherForceCorrect={() => setSession((prev) => (prev ? forceMarkPuzzle(prev, true) : prev))}
        onTeacherForceWrong={() => setSession((prev) => (prev ? forceMarkPuzzle(prev, false) : prev))}
        onReset={resetWithSameSetup}
        onToggleProjector={() => setSession((prev) => (prev ? toggleProjectorMode(prev) : prev))}
        onNewGame={() => {
          clearSession()
          setSession(null)
        }}
      />
    </div>
  )
}
