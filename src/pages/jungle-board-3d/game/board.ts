import type { TileDef, TileEventType } from './types'
import { shuffle, randInt } from '../utils/math'

export const TILE_COUNT = 100
export const GRID_SIDE = 10
export const TILE_SIZE = 0.86
export const TILE_GAP = 0.14
export const BOARD_WORLD_SIZE = GRID_SIDE * (TILE_SIZE + TILE_GAP) + 1.6

function cellToWorld(col: number, row: number) {
  const pitch = TILE_SIZE + TILE_GAP
  const half = ((GRID_SIDE - 1) * pitch) / 2
  return {
    x: col * pitch - half,
    z: row * pitch - half,
  }
}

export function createTiles(): TileDef[] {
  const coords: Array<{ row: number; col: number }> = []
  for (let row = GRID_SIDE - 1; row >= 0; row -= 1) {
    const visualRowIndexFromBottom = GRID_SIDE - 1 - row
    const leftToRight = visualRowIndexFromBottom % 2 === 0
    if (leftToRight) {
      for (let col = 0; col < GRID_SIDE; col += 1) coords.push({ row, col })
    } else {
      for (let col = GRID_SIDE - 1; col >= 0; col -= 1) coords.push({ row, col })
    }
  }

  const eventPool: TileEventType[] = []
  eventPool.push(...Array.from({ length: 56 }, () => 'safe' as const))
  eventPool.push(...Array.from({ length: 14 }, () => 'treasure' as const))
  eventPool.push(...Array.from({ length: 14 }, () => 'trap' as const))
  eventPool.push(...Array.from({ length: 14 }, () => 'boost' as const))
  const events = shuffle(eventPool)

  const tiles: TileDef[] = coords.map((c, i) => {
    const pos = cellToWorld(c.col, c.row)
    let eventType: TileEventType = 'safe'
    if (i === 0) eventType = 'start'
    else if (i === TILE_COUNT - 1) eventType = 'finish'
    else eventType = events[i - 1] ?? 'safe'

    return {
      index: i,
      step: i + 1,
      x: pos.x,
      z: pos.z,
      eventType,
    }
  })

  for (const tile of tiles) {
    if (tile.index === 0 || tile.index === TILE_COUNT - 1) continue
    if (tile.eventType === 'trap') {
      const back = randInt(4, 12)
      tile.jumpTo = Math.max(0, tile.index - back)
      if (tile.jumpTo === tile.index) tile.eventType = 'safe'
    }
    if (tile.eventType === 'boost') {
      const fwd = randInt(5, 14)
      tile.jumpTo = Math.min(TILE_COUNT - 1, tile.index + fwd)
      if (tile.jumpTo === tile.index) tile.eventType = 'safe'
    }
  }

  // avoid ambiguous last row jump spam near finish
  for (const tile of tiles.slice(-10)) {
    if (tile.eventType === 'trap') {
      tile.eventType = 'safe'
      delete tile.jumpTo
    }
  }

  return tiles
}

export function tileColor(eventType: TileEventType) {
  switch (eventType) {
    case 'start': return '#22c55e'
    case 'finish': return '#f59e0b'
    case 'treasure': return '#fbbf24'
    case 'trap': return '#f43f5e'
    case 'boost': return '#38bdf8'
    default: return '#64748b'
  }
}

export function tileLabel(eventType: TileEventType) {
  switch (eventType) {
    case 'start': return 'START'
    case 'finish': return 'FINISH'
    case 'treasure': return 'TREASURE'
    case 'trap': return 'TRAP'
    case 'boost': return 'BOOST'
    default: return 'SAFE'
  }
}

export function resolveTileEvent(tile: TileDef): { scoreDelta: number; moveTo?: number; message: string } {
  switch (tile.eventType) {
    case 'start':
      return { scoreDelta: 0, message: 'Start tile' }
    case 'finish':
      return { scoreDelta: 35, message: 'Finish reached! +35' }
    case 'safe':
      return { scoreDelta: 0, message: `Safe tile (${tile.step})` }
    case 'treasure':
      return { scoreDelta: randInt(8, 18), message: 'Treasure tile! +' }
    case 'trap':
      return { scoreDelta: -10, moveTo: tile.jumpTo, message: `Trap tile! -10 and jump back` }
    case 'boost':
      return { scoreDelta: 10, moveTo: tile.jumpTo, message: `Boost tile! +10 and jump forward` }
    default:
      return { scoreDelta: 0, message: 'Tile event' }
  }
}
