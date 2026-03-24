export const GAME_PHASES = ['IDLE', 'ROLLING', 'MOVING', 'RESOLVING', 'NEXT_TURN', 'WIN'] as const
export type GamePhase = (typeof GAME_PHASES)[number]

export function canRoll(phase: GamePhase) {
  return phase === 'IDLE'
}
