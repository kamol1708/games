import type { Team } from '../types/game'

type Props = {
  teams: Team[]
  activeIndex: number
  turnNumber: number
  roundCount: number
  projectorMode: boolean
}

export function Scoreboard({ teams, activeIndex, turnNumber, roundCount, projectorMode }: Props) {
  return (
    <aside className="sticky top-4 space-y-3 lg:top-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">Turn</p>
        <p className={projectorMode ? 'mt-2 text-3xl font-semibold text-white' : 'mt-2 text-2xl font-semibold text-white'}>
          {Math.min(turnNumber, roundCount)} / {roundCount}
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Scoreboard</p>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60">
            Active highlighted
          </span>
        </div>
        <div className="space-y-2">
          {teams
            .slice()
            .sort((a, b) => b.points - a.points)
            .map((team) => {
              const actualIdx = teams.findIndex((t) => t.id === team.id)
              const active = actualIdx === activeIndex
              return (
                <div
                  key={team.id}
                  className={[
                    'rounded-xl border p-3 transition',
                    active
                      ? 'border-violet-300/25 bg-violet-400/10 shadow-[0_0_0_1px_rgba(196,181,253,.15)]'
                      : 'border-white/10 bg-black/20',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className={projectorMode ? 'truncate text-base font-semibold text-white' : 'truncate text-sm font-semibold text-white'}>
                        {active ? '▶ ' : ''}
                        {team.name}
                      </p>
                      <p className="mt-0.5 text-xs text-white/50">{team.nextDouble ? 'Next answer x2 ready' : 'Normal mode'}</p>
                    </div>
                    <p className={projectorMode ? 'text-2xl font-semibold text-white' : 'text-xl font-semibold text-white'}>{team.points}</p>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </aside>
  )
}
