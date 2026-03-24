import * as THREE from 'three'

export const TILE_COUNT = 100
export const GRID_SIZE = 10
export const TILE_SIZE = 0.92
export const TILE_GAP = 0.16
export const TILE_PITCH = TILE_SIZE + TILE_GAP
export const BOARD_PADDING = 1.9
export const BOARD_WORLD_SIZE = GRID_SIZE * TILE_PITCH + BOARD_PADDING
export const BOARD_TOP_Y = 1.1
export const TILE_TOP_Y = BOARD_TOP_Y + 0.12
export const TOKEN_BASE_Y = TILE_TOP_Y + 0.32
export const DICE_SPAWN = new THREE.Vector3(0, 4.8, -3.8)

export type TileWorldPos = {
  index: number
  step: number
  row: number
  col: number
  x: number
  z: number
}

function gridToWorld(col: number, row: number) {
  const half = ((GRID_SIZE - 1) * TILE_PITCH) / 2
  return {
    x: col * TILE_PITCH - half,
    z: row * TILE_PITCH - half,
  }
}

export function createSnakeTilePositions(): TileWorldPos[] {
  const tiles: TileWorldPos[] = []
  for (let row = GRID_SIZE - 1; row >= 0; row -= 1) {
    const visualRowFromBottom = GRID_SIZE - 1 - row
    const leftToRight = visualRowFromBottom % 2 === 0
    if (leftToRight) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const index = tiles.length
        const pos = gridToWorld(col, row)
        tiles.push({ index, step: index + 1, row, col, x: pos.x, z: pos.z })
      }
    } else {
      for (let col = GRID_SIZE - 1; col >= 0; col -= 1) {
        const index = tiles.length
        const pos = gridToWorld(col, row)
        tiles.push({ index, step: index + 1, row, col, x: pos.x, z: pos.z })
      }
    }
  }
  return tiles
}
