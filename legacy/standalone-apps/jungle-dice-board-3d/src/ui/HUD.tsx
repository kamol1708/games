import EventLog from './EventLog'

type Player = { id: 1 | 2; name: string; color: string; step: number }

type Props = {
  phase: string
  currentPlayer: Player
  players: [Player, Player]
  diceValue: number | null
  rollingStatus: string
  canRoll: boolean
  onRoll: () => void
  onRestart: () => void
  onOpenSettings: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
  eventLog: Array<{ id: number; text: string }>
}

export default function HUD({
  phase,
  currentPlayer,
  players,
  diceValue,
  rollingStatus,
  canRoll,
  onRoll,
  onRestart,
  onOpenSettings,
  onToggleFullscreen,
  isFullscreen,
  eventLog,
}: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col gap-3 p-3 sm:p-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="pointer-events-auto rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl shadow-glow">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">Cinematic Jungle Board</p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">Premium 3D Dice Adventure</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">Original jungle-wood tabletop design with real physics dice, turn-based movement, traps/ladders and cinematic motion.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/80">100 Tiles</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/80">Real Physics Dice</span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-cyan-200">Phase: {phase}</span>
          </div>
        </section>

        <section className="pointer-events-auto rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl shadow-glow">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {players.map((p) => (
              <div key={p.id} className={`rounded-2xl border p-3 ${p.id === currentPlayer.id ? 'border-cyan-300/25 bg-cyan-400/10' : 'border-white/8 bg-white/[0.03]'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 12px ${p.color}` }} />
                    <span className="text-sm font-semibold text-white">{p.name}</span>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">Tile {p.step}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button onClick={onRoll} disabled={!canRoll} className="rounded-xl border border-white/15 bg-gradient-to-r from-emerald-500/90 to-cyan-500/90 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">
              {phase === 'ROLLING' ? 'Dice rolling…' : 'Roll Dice'}
            </button>
            <button onClick={onToggleFullscreen} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10">
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
            <button onClick={onOpenSettings} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10">
              Settings
            </button>
            <button onClick={onRestart} className="rounded-xl border border-rose-300/20 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 hover:bg-rose-500/15">
              Restart Game
            </button>
          </div>
        </section>
      </div>

      <div className="pointer-events-none flex-1" />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="pointer-events-auto rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl shadow-glow">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">Current Turn</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="h-3.5 w-3.5 rounded-full" style={{ background: currentPlayer.color, boxShadow: `0 0 18px ${currentPlayer.color}` }} />
            <div>
              <p className="text-lg font-bold text-white">{currentPlayer.name}</p>
              <p className="text-sm text-white/65">{rollingStatus}</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Dice Result</p>
            <p className="mt-1 text-3xl font-black text-white">{diceValue ?? '—'}</p>
          </div>
        </section>

        <div className="pointer-events-auto">
          <EventLog items={eventLog} />
        </div>
      </div>
    </div>
  )
}
