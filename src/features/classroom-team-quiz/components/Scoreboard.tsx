import TeamPanel from './TeamPanel'
import type { Team } from '../logic/types'

type Props = {
  teams: Team[]
  activeTeamIndex: number
  highScore: { name: string; score: number } | null
}

export default function Scoreboard({ teams, activeTeamIndex, highScore }: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Scoreboard</h3>
        {highScore ? <p className="text-xs text-white/60">High Score: {highScore.name} ({highScore.score})</p> : null}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {teams.map((team, index) => (
          <TeamPanel key={team.id} team={team} active={index === activeTeamIndex} />
        ))}
      </div>
    </section>
  )
}
