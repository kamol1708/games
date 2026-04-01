import type { TileDef, TileEventType } from './types'
import { shuffle, sample, randInt } from '../utils/math'

export const TILE_COUNT = 24
export const BOARD_SIZE = 16
export const TILE_SIZE = 1.55

const ringCoords = (() => {
  const side = 7
  const last = side - 1
  const cells: Array<{ gx: number; gz: number }> = []
  for (let x = 0; x < last; x += 1) cells.push({ gx: x, gz: 0 })
  for (let z = 0; z < last; z += 1) cells.push({ gx: last, gz: z })
  for (let x = last; x > 0; x -= 1) cells.push({ gx: x, gz: last })
  for (let z = last; z > 0; z -= 1) cells.push({ gx: 0, gz: z })
  return cells
})()

function gridToWorld(gx: number, gz: number) {
  const offset = 3
  return {
    x: (gx - offset) * (TILE_SIZE + 0.28),
    z: (gz - offset) * (TILE_SIZE + 0.28),
  }
}

export function createTiles(): TileDef[] {
  const eventPool: TileEventType[] = []
  // 22 inner path events excluding start/finish
  eventPool.push(...Array.from({ length: 7 }, () => 'safe'))
  eventPool.push(...Array.from({ length: 6 }, () => 'quiz'))
  eventPool.push(...Array.from({ length: 4 }, () => 'treasure'))
  eventPool.push(...Array.from({ length: 3 }, () => 'trap'))
  eventPool.push(...Array.from({ length: 2 }, () => 'portal'))

  const shuffledEvents = shuffle(eventPool)

  const tiles: TileDef[] = ringCoords.map((cell, index) => {
    const pos = gridToWorld(cell.gx, cell.gz)
    let eventType: TileEventType
    if (index === 0) eventType = 'start'
    else if (index === TILE_COUNT - 1) eventType = 'finish'
    else eventType = shuffledEvents[index - 1]

    return {
      index,
      x: pos.x,
      z: pos.z,
      eventType,
    }
  })

  const portalIndices = tiles.filter((t) => t.eventType === 'portal').map((t) => t.index)
  for (const idx of portalIndices) {
    const candidates = tiles
      .filter((t) => t.index !== idx && t.index !== 0 && t.index !== TILE_COUNT - 1)
      .map((t) => t.index)
    const target = sample(candidates)
    tiles[idx].portalTarget = target
  }

  return tiles
}

export function tileColor(eventType: TileEventType) {
  switch (eventType) {
    case 'start': return '#22c55e'
    case 'finish': return '#f59e0b'
    case 'quiz': return '#38bdf8'
    case 'treasure': return '#fbbf24'
    case 'trap': return '#f43f5e'
    case 'portal': return '#a855f7'
    default: return '#64748b'
  }
}

export function resolveTileEvent(
  eventType: TileEventType,
  currentIndex: number,
  portalTarget?: number,
): { scoreDelta: number; moveTo?: number; message: string; requiresQuiz?: boolean } {
  switch (eventType) {
    case 'start':
      return { scoreDelta: 0, message: 'Start tile' }
    case 'finish':
      return { scoreDelta: 25, message: 'Finish reached! +25' }
    case 'safe':
      return { scoreDelta: 0, message: 'Safe tile' }
    case 'quiz':
      return { scoreDelta: 0, message: 'Quiz tile! Solve to gain points', requiresQuiz: true }
    case 'treasure':
      return { scoreDelta: 12 + randInt(0, 8), message: 'Treasure found! +' }
    case 'trap':
      return { scoreDelta: -8, moveTo: Math.max(0, currentIndex - 2), message: 'Trap! -8 and step back' }
    case 'portal':
      return { scoreDelta: 5, moveTo: portalTarget, message: `Portal jump! +5` }
    default:
      return { scoreDelta: 0, message: 'Tile event' }
  }
}
