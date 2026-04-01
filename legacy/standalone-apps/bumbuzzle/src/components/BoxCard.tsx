import type { BoxCell } from '../types/game'

type Props = {
  box: BoxCell
  disabled?: boolean
  projectorMode?: boolean
  onClick: () => void
}

const kindColor: Record<BoxCell['kind'], string> = {
  word_puzzle: 'from-violet-500/20 to-violet-300/5',
  sentence_fix: 'from-blue-500/20 to-blue-300/5',
  vocab_match: 'from-cyan-500/20 to-cyan-300/5',
  spelling_challenge: 'from-emerald-500/20 to-emerald-300/5',
  bonus: 'from-amber-500/30 to-yellow-300/10',
  double_points: 'from-fuchsia-500/25 to-pink-300/10',
  bomb: 'from-rose-500/30 to-red-300/10',
}

const iconMap: Record<BoxCell['kind'], string> = {
  word_puzzle: '🔤',
  sentence_fix: '📝',
  vocab_match: '🧠',
  spelling_challenge: '✍️',
  bonus: '🎁',
  double_points: '✨',
  bomb: '💣',
}

export function BoxCard({ box, onClick, disabled, projectorMode }: Props) {
  const opened = box.opened
  return (
    <button
      type="button"
      disabled={disabled || opened}
      onClick={onClick}
      className="group relative aspect-[1.05/1] [perspective:900px] disabled:cursor-not-allowed"
      aria-label={`Box ${box.id}`}
    >
      <div
        className={[
          'relative h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d]',
          opened ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(10deg)]',
        ].join(' ')}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_14px_28px_rgba(2,8,23,.22)] backdrop-blur-xl">
            <span className={projectorMode ? 'text-4xl' : 'text-3xl'}>❓</span>
            <span className="mt-2 text-xs font-medium text-white/55">Box {box.id}</span>
          </div>
        </div>

        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className={[
            'relative flex h-full w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br p-3 text-center shadow-[0_18px_34px_rgba(2,8,23,.26)]',
            kindColor[box.kind],
          ].join(' ')}>
            <span className={projectorMode ? 'text-4xl' : 'text-3xl'}>{iconMap[box.kind]}</span>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">{box.title}</p>
          </div>
        </div>
      </div>
    </button>
  )
}
