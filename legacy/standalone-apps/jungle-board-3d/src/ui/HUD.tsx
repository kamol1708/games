import type { GamePhase, PlayerDef } from '../game/types'

type Props = {
  players: PlayerDef[]
  activePlayerIndex: number
  phase: GamePhase
  diceValue: number | null
  message: string
  onRoll: () => void
  canRoll: boolean
  playerCount: number
  onPlayerCountChange: (count: number) => void
  onReset: () => void
}

export default function HUD({ players, activePlayerIndex, phase, diceValue, message, onRoll, canRoll, playerCount, onPlayerCountChange, onReset }: Props) {
  const active = players[activePlayerIndex]

  return (
    <div className="hud">
      <div className="hud-top">
        <section className="glass panel">
          <p className="muted" style={{ margin: 0, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Jungle Board Adventure</p>
          <h1 className="title">Cinematic 3D Jungle Board</h1>
          <div className="row" style={{ marginTop: 8 }}>
            <span className="chip">24 Tiles</span>
            <span className="chip">Turn-based</span>
            <span className="chip">Quiz • Trap • Treasure • Portal</span>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <span className="player-pill">
              <span className="dot" style={{ background: active.color, color: active.color }} />
              Current: <strong>{active.name}</strong>
            </span>
            <span className="chip">Phase: {phase.toUpperCase()}</span>
            {diceValue ? <span className="chip">Dice: {diceValue}</span> : null}
          </div>
        </section>

        <section className="glass panel">
          <div className="controls">
            <div>
              <p className="muted" style={{ margin: 0 }}>Turn Controls</p>
              <div className="scoreboard" style={{ marginTop: 8 }}>
                {players.map((player, idx) => (
                  <div key={player.id} className={`score-item${idx === activePlayerIndex ? ' active' : ''}`}>
                    <h4 style={{ color: '#e2e8f0' }}>{player.name}</h4>
                    <p style={{ color: player.color }}>{player.score}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="row">
              <div className="row" style={{ marginRight: 4 }}>
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    className="btn"
                    type="button"
                    onClick={() => onPlayerCountChange(count)}
                    disabled={phase !== 'idle' && phase !== 'finished'}
                    style={{ padding: '8px 10px', borderColor: playerCount === count ? 'rgba(125,211,252,.45)' : undefined }}
                  >
                    {count}P
                  </button>
                ))}
              </div>
              <button className="btn" type="button" onClick={onReset}>Reset</button>
              <button className="btn btn-primary" type="button" onClick={onRoll} disabled={!canRoll}>
                {phase === 'rolling' ? 'Rolling...' : 'Roll Dice'}
              </button>
            </div>
          </div>
        </section>
      </div>

      <div />

      <section className="glass log-panel">
        <p className="log-title">Turn Event</p>
        <p className="log-text">{message}</p>
      </section>
    </div>
  )
}
