import { BoxCard } from './BoxCard'
import { PuzzleModal } from './PuzzleModal'
import { Scoreboard } from './Scoreboard'
import { TeacherControls } from './TeacherControls'
import type { GameSession } from '../types/game'

type Props = {
  session: GameSession
  onOpenBox: (boxId: number) => void
  onSubmitAnswer: (answer: string) => void
  onBombContinue: () => void
  onTeacherNextTurn: () => void
  onTeacherSkipQuestion: () => void
  onTeacherReveal: () => void
  onTeacherForceCorrect: () => void
  onTeacherForceWrong: () => void
  onReset: () => void
  onToggleProjector: () => void
  onNewGame: () => void
}

export function GameBoard({
  session,
  onOpenBox,
  onSubmitAnswer,
  onBombContinue,
  onTeacherNextTurn,
  onTeacherSkipQuestion,
  onTeacherReveal,
  onTeacherForceCorrect,
  onTeacherForceWrong,
  onReset,
  onToggleProjector,
  onNewGame,
}: Props) {
  const activeTeam = session.teams[session.turnIndex]
  const titleSize = session.projectorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'

  return (
    <div className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-5 sm:py-6">
      <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Bumbuzzle</p>
            <h2 className={`${titleSize} mt-1 font-semibold tracking-tight text-white`}>Mystery Box Team Board</h2>
            <p className="mt-1 text-sm text-white/60">
              Active team: <span className="font-semibold text-white">{activeTeam?.name}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onToggleProjector}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              {session.projectorMode ? 'Projector: ON' : 'Projector: OFF'}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-100 hover:bg-rose-400/15"
            >
              Reset game
            </button>
            <button
              type="button"
              onClick={onNewGame}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              New setup
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">Board (5x4)</p>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60">
                {session.boxes.filter((b) => b.opened).length}/20 opened
              </span>
            </div>
            <div className={session.projectorMode ? 'grid grid-cols-4 gap-3 sm:grid-cols-5' : 'grid grid-cols-4 gap-2.5 sm:grid-cols-5'}>
              {session.boxes.map((box) => (
                <BoxCard
                  key={box.id}
                  box={box}
                  projectorMode={session.projectorMode}
                  disabled={session.gameOver || Boolean(session.activePuzzle)}
                  onClick={() => onOpenBox(box.id)}
                />
              ))}
            </div>
          </section>

          <TeacherControls
            hasActivePuzzle={Boolean(session.activePuzzle)}
            onNextTurn={onTeacherNextTurn}
            onSkipQuestion={onTeacherSkipQuestion}
            onRevealAnswer={onTeacherReveal}
            onResetGame={onReset}
          />

          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">Game Log</p>
              <span className="text-xs text-white/45">Latest 25</span>
            </div>
            <div className="scrollbar-thin max-h-56 space-y-2 overflow-y-auto pr-1">
              {session.logs.map((log) => (
                <div key={log.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70">
                  {log.message}
                </div>
              ))}
            </div>
          </section>
        </div>

        <Scoreboard
          teams={session.teams}
          activeIndex={session.turnIndex}
          turnNumber={session.turnNumber}
          roundCount={session.roundCount}
          projectorMode={session.projectorMode}
        />
      </div>

      {session.gameOver ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b0f18]/95 p-6 text-white shadow-[0_24px_80px_rgba(2,8,23,.6)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-violet-200/80">Game Over</p>
            <h3 className="mt-2 text-2xl font-semibold">{session.winnerTeamIds.length > 1 ? 'Draw game!' : 'Winner found!'}</h3>
            <p className="mt-3 text-sm text-white/65">
              {session.winnerTeamIds.length > 1
                ? 'Bir nechta jamoa teng ball bilan yakunladi.'
                : `${session.teams.find((t) => t.id === session.winnerTeamIds[0])?.name ?? 'Team'} g‘olib bo‘ldi.`}
            </p>
            <div className="mt-4 space-y-2">
              {session.teams
                .slice()
                .sort((a, b) => b.points - a.points)
                .map((team) => (
                  <div key={team.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="font-medium">{team.name}</span>
                    <span className="text-lg font-semibold">{team.points}</span>
                  </div>
                ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={onReset} className="flex-1 rounded-xl border border-violet-300/20 bg-violet-400/10 px-4 py-2.5 text-sm font-medium text-violet-100">
                Replay same setup
              </button>
              <button onClick={onNewGame} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80">
                New setup
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <PuzzleModal
        activePuzzle={session.activePuzzle}
        teams={session.teams}
        turnIndex={session.turnIndex}
        onSubmitAnswer={onSubmitAnswer}
        onCloseBomb={onBombContinue}
        onForceCorrect={onTeacherForceCorrect}
        onForceWrong={onTeacherForceWrong}
      />
    </div>
  )
}
