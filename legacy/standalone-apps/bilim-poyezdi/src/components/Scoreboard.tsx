import type { TeamState } from '../types/game'

type Props = {
  teams: TeamState[]
  activeTeamId: string
  stationCount: number
}

export function Scoreboard({ teams, activeTeamId, stationCount }: Props) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Scoreboard</h3>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">
          Finish: {stationCount - 1}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {teams
          .slice()
          .sort((a, b) => b.score - a.score || b.position - a.position)
          .map((team) => {
            const isActive = team.id === activeTeamId
            return (
              <div
                key={team.id}
                className={`rounded-xl border p-3 transition ${
                  isActive ? 'border-violet-300/30 bg-violet-500/10' : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
                    <p className="text-sm font-semibold text-white">{team.name}</p>
                    {isActive ? (
                      <span className="rounded-full border border-violet-300/30 bg-violet-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-violet-100">
                        Turn
                      </span>
                    ) : null}
                  </div>
                  <p className="text-lg font-bold text-white">{team.score}</p>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                  <span>Station: {team.position}</span>
                  <span>{team.turboAvailable ? 'Turbo ✅' : 'Turbo ❌'} · {team.shieldAvailable ? 'Shield ✅' : 'Shield ❌'}</span>
                </div>
              </div>
            )
          })}
      </div>
    </aside>
  )
}

