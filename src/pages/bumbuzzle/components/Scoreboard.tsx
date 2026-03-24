import type { Team } from '../types/game'

type Props = {
  teams: Team[]
  activeIndex: number
  projectorMode: boolean
}

export function Scoreboard({ teams, activeIndex, projectorMode }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-amber-100/70 bg-gradient-to-r from-[#f4c867] via-[#f1c15a] to-[#efbb4d] shadow-[0_12px_24px_rgba(217,119,6,.16)]">
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_30%,rgba(255,255,255,.35)_0_1px,transparent_1.2px)] [background-size:44px_44px]" />
      <div className={`relative grid gap-2 p-2 ${teams.length <= 2 ? 'grid-cols-2' : teams.length <= 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'}`}>
        {teams
          .map((team, idx) => ({ team, idx }))
          .map((team) => {
            const active = team.idx === activeIndex
            return (
              <div
                key={team.team.id}
                className={[
                  'rounded-xl border p-2 text-center shadow-sm transition',
                  active
                    ? 'border-blue-300/50 bg-white/30 ring-2 ring-blue-500/20'
                    : 'border-amber-100/70 bg-white/20',
                ].join(' ')}
              >
                <div className="space-y-0.5">
                  <div className="mx-auto inline-flex max-w-full items-center rounded-md bg-blue-600 px-3 py-1 text-white shadow-[0_4px_12px_rgba(37,99,235,.28)]">
                    <p className={projectorMode ? 'truncate text-lg font-extrabold' : 'truncate text-sm font-bold'}>
                      {team.team.name}
                    </p>
                  </div>
                  <p className={projectorMode ? 'text-3xl font-black leading-none text-slate-800' : 'text-2xl font-black leading-none text-slate-800'}>
                    {team.team.points}
                  </p>
                  {team.team.nextDouble ? (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-fuchsia-700">x2 ready</p>
                  ) : (
                    <p className="text-[10px] opacity-0">-</p>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    </section>
  )
}
