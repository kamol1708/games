import type { BoxCell } from '../types/game'

type Props = {
  box: BoxCell
  disabled?: boolean
  projectorMode?: boolean
  compact?: boolean
  onClick: () => void
}

const kindColor: Record<BoxCell['kind'], string> = {
  word_puzzle: 'from-violet-200 via-fuchsia-100 to-white',
  sentence_fix: 'from-blue-200 via-sky-100 to-white',
  vocab_match: 'from-cyan-200 via-teal-100 to-white',
  spelling_challenge: 'from-emerald-200 via-lime-100 to-white',
  bonus: 'from-amber-200 via-yellow-100 to-white',
  double_points: 'from-pink-200 via-fuchsia-100 to-white',
  bomb: 'from-rose-200 via-red-100 to-white',
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

export function BoxCard({ box, onClick, disabled, projectorMode, compact }: Props) {
  const opened = box.opened
  const resolved = box.resolved
  return (
    <button
      type="button"
      disabled={disabled || opened}
      onClick={onClick}
      className={[
        'group relative [perspective:900px] disabled:cursor-not-allowed disabled:opacity-90',
        compact ? 'aspect-[1.16/1]' : 'aspect-[1.3/1]',
      ].join(' ')}
      aria-label={`Box ${box.id}`}
    >
      {!opened ? (
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-300/30 via-sky-200/20 to-indigo-300/30 opacity-0 blur-xl transition duration-300 group-hover:opacity-100" />
      ) : null}
      <div
        className={[
          'relative h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d]',
          opened ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(10deg)]',
        ].join(' ')}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-br from-[#5fa2ff] via-[#3f88ef] to-[#235dc5] shadow-[0_10px_20px_rgba(37,99,235,.22)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,.22),transparent_52%)]" />
            <div className={['pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-white/12 to-transparent', compact ? 'h-6' : 'h-8'].join(' ')} />
            <span
              className={[
                'relative select-none font-black leading-none tracking-tight text-white drop-shadow-[0_2px_0_rgba(15,23,42,.2)]',
                compact ? 'text-[1.7rem]' : projectorMode ? 'text-[2.5rem]' : 'text-[2.15rem]',
              ].join(' ')}
            >
              {box.id}
            </span>
          </div>
        </div>

        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className={[
            `relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br text-center shadow-[0_12px_24px_rgba(30,41,59,.12)] ${compact ? 'p-1.5' : 'p-2.5'}`,
            kindColor[box.kind],
          ].join(' ')}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,.7),transparent_55%)]" />
            <span className={compact ? 'text-xl' : projectorMode ? 'text-3xl' : 'text-2xl'}>{iconMap[box.kind]}</span>
            {!compact ? <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.11em] text-slate-700">{box.title}</p> : null}
            {resolved && !compact ? <span className="mt-0.5 text-[9px] text-slate-500">Resolved</span> : null}
          </div>
        </div>
      </div>
    </button>
  )
}
