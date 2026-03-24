type Props = {
  hasActivePuzzle: boolean
  onNextTurn: () => void
  onSkipQuestion: () => void
  onRevealAnswer: () => void
  onResetGame: () => void
}

export function TeacherControls({ hasActivePuzzle, onNextTurn, onSkipQuestion, onRevealAnswer, onResetGame }: Props) {
  return (
    <div className="rounded-2xl border border-white/70 bg-gradient-to-br from-[#fff7de]/85 via-white/80 to-[#edf5ff]/80 p-3 shadow-[0_12px_24px_rgba(30,41,59,.06)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Teacher Controls</p>
        <span className="rounded-full border border-white/80 bg-white/80 px-2 py-1 text-[11px] text-slate-600">Manual</span>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <button type="button" onClick={onNextTurn} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:bg-slate-50">
          Next turn
        </button>
        <button
          type="button"
          onClick={onSkipQuestion}
          disabled={!hasActivePuzzle}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          Skip question
        </button>
        <button
          type="button"
          onClick={onRevealAnswer}
          disabled={!hasActivePuzzle}
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 transition hover:bg-amber-100 disabled:opacity-40"
        >
          Reveal answer
        </button>
        <button type="button" onClick={onResetGame} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 transition hover:bg-rose-100">
          Reset game
        </button>
      </div>
    </div>
  )
}
