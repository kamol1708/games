import type { Difficulty, Subject, TrackKey } from '../types/game'

type Props = {
  track: TrackKey
  subject: Subject
  difficulty: Difficulty
  onClick: () => void
  disabled?: boolean
}

const difficultyStyles: Record<Difficulty, string> = {
  easy: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200',
  medium: 'border-amber-300/30 bg-amber-400/10 text-amber-200',
  hard: 'border-rose-300/30 bg-rose-400/10 text-rose-200',
}

export function TrackCard({ track, subject, difficulty, onClick, disabled }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-500/20 blur-2xl group-hover:scale-110" />
      <div className="relative flex items-center justify-between gap-2">
        <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white">Track {track}</span>
        <span className={`rounded-full border px-2 py-1 text-xs font-semibold capitalize ${difficultyStyles[difficulty]}`}>
          {difficulty}
        </span>
      </div>
      <p className="relative mt-4 text-lg font-semibold text-white">{subject}</p>
      <p className="relative mt-1 text-sm leading-6 text-white/65">
        Savolga javob bering va poyezdni oldinga yuring. Noto&apos;g&apos;ri javobda penalty bo&apos;ladi.
      </p>
      <div className="relative mt-4 inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75">
        Open Question
      </div>
    </button>
  )
}

