type Player = { id: 1 | 2; name: string; color: string; step: number }

type Props = {
  open: boolean
  winner: Player | null
  players: [Player, Player]
  onRestart: () => void
}

export default function WinModal({ open, winner, players, onRestart }: Props) {
  if (!open || !winner) return null

  const confetti = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: `${(i * 17) % 100}%`,
    delay: `${(i % 9) * 70}ms`,
    duration: `${1400 + (i % 5) * 180}ms`,
    rotate: `${(i * 47) % 360}deg`,
    color: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#fb923c' : '#facc15',
  }))

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#070b12]/95 p-6 shadow-2xl backdrop-blur-xl">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="pointer-events-none absolute top-0 h-3 w-2 animate-[confetti-fall_var(--dur)_linear_infinite] rounded-sm"
            style={{ left: c.left, animationDelay: c.delay, ['--dur' as string]: c.duration, background: c.color, transform: `rotate(${c.rotate})` }}
          />
        ))}

        <p className="text-center text-[11px] uppercase tracking-[0.22em] text-white/55">Winner</p>
        <h2 className="mt-2 text-center text-3xl font-black" style={{ color: winner.color }}>{winner.name} wins!</h2>
        <p className="mt-2 text-center text-white/75">Tile 100 reached. Cinematic jungle run complete.</p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {players.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm text-white/65">{p.name}</p>
              <p className="text-xl font-bold" style={{ color: p.color }}>Tile {p.step}</p>
            </div>
          ))}
        </div>

        <button onClick={onRestart} className="mt-5 w-full rounded-2xl border border-white/15 bg-gradient-to-r from-emerald-500/90 to-cyan-500/90 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-900/30">
          Restart Game
        </button>
      </div>
    </div>
  )
}
