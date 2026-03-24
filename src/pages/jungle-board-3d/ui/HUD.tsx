import type { GamePhase, PlayerDef } from '../game/types'

type Props = {
  players: PlayerDef[]
  activePlayerIndex: number
  phase: GamePhase
  diceValue: number | null
  message: string
  onRoll: () => void
  canRoll: boolean
  onReset: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
  trapCount: number
  boostCount: number
  treasureCount: number
  lastEventLabel: string
  winnerId: number | null
}

export default function HUD({
  players,
  activePlayerIndex,
  phase,
  diceValue,
  message,
  onRoll,
  canRoll,
  onReset,
  onToggleFullscreen,
  isFullscreen,
  trapCount,
  boostCount,
  treasureCount,
  lastEventLabel,
  winnerId,
}: Props) {
  const active = players[activePlayerIndex]
  const winner = winnerId ? players.find((p) => p.id === winnerId) ?? null : null

  return (
    <div className={`jb3d-hud${isFullscreen ? ' is-fs' : ''}`}>
      <div className="jb3d-hud-top">
        <section className="jb3d-glass jb3d-panel jb3d-hero-panel">
          <h1 className="jb3d-title">100-Qadamli 3D Jungle Xarita</h1>
          {!isFullscreen ? (
            <p className="jb3d-subtext">2 ta jamoa navbat bilan zar tashlaydi. Tuzoq kataklar ortga qaytaradi, boost kataklar oldinga sakratadi.</p>
          ) : null}
          <div className="jb3d-scoreboard" style={{ marginTop: 14 }}>
            {players.map((player, idx) => (
              <div key={player.id} className={`jb3d-score-item${idx === activePlayerIndex ? ' active' : ''}`}>
                <div className="jb3d-row" style={{ justifyContent: 'space-between' }}>
                  <h4 style={{ color: '#e2e8f0', margin: 0 }}>{player.name}</h4>
                  <span className="jb3d-step-pill" style={{ color: player.color, borderColor: `${player.color}55` }}>
                    {player.tileIndex + 1}/100
                  </span>
                </div>
                <p style={{ color: player.color }}>{player.score}</p>
              </div>
            ))}
          </div>
          <div className="jb3d-row" style={{ marginTop: 10 }}>
            <span className="jb3d-chip">100 step</span>
            <span className="jb3d-chip">Turn-based dice</span>
            <span className="jb3d-chip">Trap / Boost / Treasure</span>
            {lastEventLabel ? <span className="jb3d-chip jb3d-chip-accent">Last: {lastEventLabel}</span> : null}
            <span className="jb3d-mini-stat">Trap: {trapCount}</span>
            <span className="jb3d-mini-stat">Boost: {boostCount}</span>
            <span className="jb3d-mini-stat">Treasure: {treasureCount}</span>
          </div>
        </section>

        <section className="jb3d-glass jb3d-panel jb3d-controls-panel">
          <div className="jb3d-action-stack jb3d-action-stack-right">
            <div className="jb3d-current-card">
              <span className="jb3d-dot" style={{ background: active.color, color: active.color }} />
              <div>
                <p className="jb3d-muted" style={{ margin: 0 }}>Navbat</p>
                <p className="jb3d-current-name">{active.name}</p>
              </div>
            </div>

            <div className="jb3d-dice-readout">
              <span className="jb3d-muted">Zar</span>
              <strong>{diceValue ?? '–'}</strong>
            </div>

            <button className="jb3d-btn jb3d-btn-primary jb3d-roll-btn" type="button" onClick={onRoll} disabled={!canRoll}>
              {phase === 'rolling' ? 'Zar Aylanmoqda...' : phase === 'finished' ? 'O‘yin tugadi' : 'Zar Tashlash'}
            </button>
            <button className="jb3d-btn" type="button" onClick={onToggleFullscreen}>
              {isFullscreen ? 'Fullscreen chiqish' : 'Fullscreen'}
            </button>
            <button className="jb3d-btn" type="button" onClick={onReset}>Yangi Xarita</button>
          </div>
        </section>
      </div>

      <div />

      <section className="jb3d-glass jb3d-log-panel">
        <p className="jb3d-log-title">Turn Event</p>
        <p className="jb3d-log-text">{message}</p>
      </section>

      {winner ? (
        <div className="jb3d-win-overlay" role="presentation">
          <div className="jb3d-win-card" role="dialog" aria-modal="true" aria-labelledby="jb3d-win-title">
            <p className="jb3d-win-tag">JUNGLE WINNER</p>
            <h2 id="jb3d-win-title" style={{ color: winner.color }}>{winner.name} g‘olib bo‘ldi!</h2>
            <p className="jb3d-win-text">100-qadamli jungle xaritada finishga birinchi yetib bordi. Tabriklaymiz! 🎉</p>
            <div className="jb3d-win-score-grid">
              {players.map((p) => (
                <div key={p.id} className="jb3d-win-score-item">
                  <span>{p.name}</span>
                  <strong style={{ color: p.color }}>{p.score} ball</strong>
                  <small>{p.tileIndex + 1}/100 qadam</small>
                </div>
              ))}
            </div>
            <button className="jb3d-btn jb3d-btn-primary" type="button" onClick={onReset}>Qayta o‘ynash</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
