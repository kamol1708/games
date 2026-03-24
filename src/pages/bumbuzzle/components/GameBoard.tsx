import { BoxCard } from './BoxCard'
import { PuzzleModal } from './PuzzleModal'
import { Scoreboard } from './Scoreboard'
import type { GameSession } from '../types/game'

type Props = {
  session: GameSession
  onOpenBox: (boxId: number) => void
  onSubmitAnswer: (answer: string) => void
  onBombContinue: () => void
  onTeacherForceCorrect: () => void
  onTeacherForceWrong: () => void
  onReset: () => void
  onNewGame: () => void
}

export function GameBoard({
  session,
  onOpenBox,
  onSubmitAnswer,
  onBombContinue,
  onTeacherForceCorrect,
  onTeacherForceWrong,
  onReset,
  onNewGame,
}: Props) {
  const winnerName =
    session.winnerTeamIds.length === 1
      ? session.teams.find((t) => t.id === session.winnerTeamIds[0])?.name ?? 'Team'
      : null

  const compactProjectorBoard = session.projectorMode && session.boxCount >= 16

  const boardGridClass =
    session.boxCount === 24
      ? session.projectorMode
        ? 'grid grid-cols-4 gap-1.5 md:grid-cols-6 lg:grid-cols-8'
        : 'grid grid-cols-4 gap-2 md:grid-cols-6'
      : session.boxCount === 16
        ? session.projectorMode
          ? 'grid grid-cols-4 gap-1.5 md:grid-cols-8'
          : 'grid grid-cols-4 gap-2'
        : session.projectorMode
          ? 'grid grid-cols-4 gap-1.5 md:grid-cols-6'
          : 'grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6'

  return (
    <div className="mx-auto flex w-full max-w-[1700px] flex-col px-3 pb-4 sm:px-5 sm:pb-5">
      <div className="flex flex-col gap-2">
        <Scoreboard
          teams={session.teams}
          activeIndex={session.turnIndex}
          projectorMode={session.projectorMode}
        />

        <section className="flex flex-col rounded-2xl border border-white/70 bg-gradient-to-br from-white/95 to-[#edf4ff]/85 p-2 shadow-[0_14px_30px_rgba(30,41,59,.07)] backdrop-blur-xl sm:p-2.5">
          <div className={`${boardGridClass} content-start auto-rows-fr`}>
            {session.boxes.map((box) => (
              <BoxCard
                key={box.id}
                box={box}
                projectorMode={session.projectorMode}
                compact={compactProjectorBoard}
                disabled={session.gameOver || Boolean(session.activePuzzle)}
                onClick={() => onOpenBox(box.id)}
              />
            ))}
          </div>
        </section>
      </div>

      {session.gameOver ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-xl rounded-3xl border border-white/80 bg-gradient-to-br from-white/90 via-[#edf5ff]/90 to-[#fff4dc]/88 p-6 text-slate-900 shadow-[0_24px_80px_rgba(2,8,23,.25)] backdrop-blur-xl">
            {winnerName ? (
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                {Array.from({ length: 18 }, (_, i) => (
                  <span
                    key={i}
                    className="absolute h-2 w-2 rounded-full animate-bounce"
                    style={{
                      left: `${6 + (i * 5) % 88}%`,
                      top: `${8 + (i % 4) * 6}%`,
                      background:
                        i % 3 === 0 ? 'rgb(196 181 253)' : i % 3 === 1 ? 'rgb(125 211 252)' : 'rgb(250 204 21)',
                      animationDelay: `${(i % 6) * 90}ms`,
                      animationDuration: `${900 + (i % 5) * 120}ms`,
                    }}
                  />
                ))}
              </div>
            ) : null}
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-600/80">Game Over</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">{session.winnerTeamIds.length > 1 ? 'Draw game!' : 'Winner found!'}</h3>
            <p className="mt-3 text-sm text-slate-600">
              {session.winnerTeamIds.length > 1
                ? 'Bir nechta jamoa teng ball bilan yakunladi.'
                : `${winnerName} g‘olib bo‘ldi.`}
            </p>
            <div className="mt-4 space-y-2">
              {session.teams
                .slice()
                .sort((a, b) => b.points - a.points)
                .map((team) => (
                  <div key={team.id} className="flex items-center justify-between rounded-xl border border-white/70 bg-white/80 px-3 py-2">
                    <span className="font-medium">{team.name}</span>
                    <span className="text-lg font-semibold">{team.points}</span>
                  </div>
                ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={onReset} className="flex-1 rounded-xl border border-indigo-300/30 bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_20px_rgba(59,130,246,.2)] transition hover:brightness-110">
                Replay same setup
              </button>
              <button onClick={onNewGame} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
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
