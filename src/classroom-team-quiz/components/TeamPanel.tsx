import type { Team } from '../logic/types'

type Props = {
  team: Team
  active: boolean
}

export default function TeamPanel({ team, active }: Props) {
  return (
    <div
      className={`rounded-2xl border p-3 transition ${
        active
          ? 'border-cyan-300/50 bg-cyan-500/15 shadow-[0_0_35px_rgba(34,211,238,0.24)]'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <p className="text-sm text-white/70">{team.name}</p>
      <p className="mt-1 text-2xl font-semibold">{team.score}</p>
      <p className="mt-1 text-xs text-white/55">Combo: {team.streak}</p>
    </div>
  )
}
