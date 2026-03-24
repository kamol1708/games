import type { TeamState } from '../types/game'

type Props = {
  stationCount: number
  teams: TeamState[]
  activeTeamId: string
}

export function StationMap({ stationCount, teams, activeTeamId }: Props) {
  const stations = Array.from({ length: stationCount }, (_, i) => i)

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Station Map</h3>
        <p className="text-xs text-white/55">Projector-friendly horizontal map</p>
      </div>

      <div className="mt-4 overflow-x-auto pb-2">
        <div className="relative min-w-[760px]">
          <div className="absolute left-4 right-4 top-6 h-1 rounded-full bg-gradient-to-r from-blue-400/40 via-violet-400/40 to-cyan-300/40" />
          <div className="grid grid-cols-10 gap-2 xl:grid-cols-none xl:grid-flow-col auto-cols-fr">
            {stations.map((station) => {
              const onStation = teams.filter((t) => t.position === station)
              return (
                <div key={station} className="relative min-w-[72px]">
                  <div
                    className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl border text-sm font-bold ${
                      station === stationCount - 1
                        ? 'border-emerald-300/30 bg-emerald-400/15 text-emerald-200'
                        : 'border-white/10 bg-[#0b1020]/80 text-white/90'
                    }`}
                  >
                    {station}
                  </div>
                  <div className="mt-2 min-h-10 space-y-1">
                    {onStation.map((team) => (
                      <div
                        key={team.id}
                        className={`truncate rounded-md px-2 py-1 text-[10px] font-semibold text-black ${
                          team.id === activeTeamId ? 'ring-2 ring-white/40' : ''
                        }`}
                        style={{ backgroundColor: team.color }}
                        title={team.name}
                      >
                        🚂 {team.name}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

