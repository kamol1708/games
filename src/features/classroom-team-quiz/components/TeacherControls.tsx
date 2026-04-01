import type { Team } from '../logic/types'

type Props = {
  teams: Team[]
  onAdjustScore: (teamId: string, delta: number) => void
  onReset: () => void
  onExport: () => void
}

export default function TeacherControls({ teams, onAdjustScore, onReset, onExport }: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-lg font-semibold">Teacher Controls</h3>

      <div className="mt-3 space-y-3">
        {teams.map((team) => (
          <div key={team.id} className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-sm font-medium">{team.name}</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => onAdjustScore(team.id, 50)}
                className="rounded-lg border border-emerald-300/30 bg-emerald-500/15 px-3 py-1 text-sm text-emerald-100"
              >
                +50
              </button>
              <button
                type="button"
                onClick={() => onAdjustScore(team.id, -50)}
                className="rounded-lg border border-rose-300/30 bg-rose-500/15 px-3 py-1 text-sm text-rose-100"
              >
                -50
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2">
        <button type="button" onClick={onExport} className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 font-semibold">
          Export Results JSON
        </button>
        <button type="button" onClick={onReset} className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 font-semibold">
          Reset Game
        </button>
      </div>
    </section>
  )
}
