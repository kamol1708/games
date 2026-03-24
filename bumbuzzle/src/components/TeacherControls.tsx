type Props = {
  hasActivePuzzle: boolean
  onNextTurn: () => void
  onSkipQuestion: () => void
  onRevealAnswer: () => void
  onResetGame: () => void
}

export function TeacherControls({ hasActivePuzzle, onNextTurn, onSkipQuestion, onRevealAnswer, onResetGame }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Teacher Controls</p>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/55">Manual</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <button type="button" onClick={onNextTurn} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white/80 hover:bg-white/10">
          Next turn
        </button>
        <button
          type="button"
          onClick={onSkipQuestion}
          disabled={!hasActivePuzzle}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white/80 hover:bg-white/10 disabled:opacity-40"
        >
          Skip question
        </button>
        <button
          type="button"
          onClick={onRevealAnswer}
          disabled={!hasActivePuzzle}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white/80 hover:bg-white/10 disabled:opacity-40"
        >
          Reveal answer
        </button>
        <button type="button" onClick={onResetGame} className="rounded-xl border border-rose-300/20 bg-rose-400/10 px-3 py-2.5 text-rose-100 hover:bg-rose-400/15">
          Reset game
        </button>
      </div>
    </div>
  )
}
