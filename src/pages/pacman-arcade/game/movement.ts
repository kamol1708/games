import { CENTER_EPSILON, MAZE_HEIGHT, MAZE_WIDTH, TILE_SIZE, type TileType } from './constants'

export type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

export type GridEntity = {
  tx: number
  ty: number
  x: number
  y: number
  currentDirection: Direction
  desiredDirection: Direction
  speed: number
}

const DIR_VECTORS: Record<Exclude<Direction, 'none'>, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

export function oppositeDirection(dir: Direction): Direction {
  if (dir === 'up') return 'down'
  if (dir === 'down') return 'up'
  if (dir === 'left') return 'right'
  if (dir === 'right') return 'left'
  return 'none'
}

export function directionVector(dir: Direction) {
  if (dir === 'none') return { x: 0, y: 0 }
  return DIR_VECTORS[dir]
}

export function worldToTile(x: number, y: number) {
  return {
    tx: Math.floor(x / TILE_SIZE),
    ty: Math.floor(y / TILE_SIZE),
  }
}

export function tileToWorldCenter(tx: number, ty: number) {
  return {
    x: tx * TILE_SIZE + TILE_SIZE / 2,
    y: ty * TILE_SIZE + TILE_SIZE / 2,
  }
}

export function clampTile(tx: number, ty: number) {
  return {
    tx: Math.max(0, Math.min(MAZE_WIDTH - 1, tx)),
    ty: Math.max(0, Math.min(MAZE_HEIGHT - 1, ty)),
  }
}

export function isWall(grid: string[], tx: number, ty: number) {
  if (tx < 0 || ty < 0 || tx >= MAZE_WIDTH || ty >= MAZE_HEIGHT) return true
  const tile = (grid[ty]?.[tx] ?? '#') as TileType
  return tile === '#'
}

export function canMove(grid: string[], tx: number, ty: number, dir: Direction) {
  if (dir === 'none') return false
  const vec = directionVector(dir)
  return !isWall(grid, tx + vec.x, ty + vec.y)
}

export function isAtTileCenter(x: number, y: number, epsilon = CENTER_EPSILON) {
  const { tx, ty } = worldToTile(x, y)
  const center = tileToWorldCenter(tx, ty)
  return Math.abs(x - center.x) <= epsilon && Math.abs(y - center.y) <= epsilon
}

export function isIntersection(grid: string[], tx: number, ty: number) {
  const horizontalOpen = Number(canMove(grid, tx, ty, 'left')) + Number(canMove(grid, tx, ty, 'right'))
  const verticalOpen = Number(canMove(grid, tx, ty, 'up')) + Number(canMove(grid, tx, ty, 'down'))
  return horizontalOpen > 0 && verticalOpen > 0
}

export function blockedDirections(grid: string[], tx: number, ty: number) {
  return {
    up: !canMove(grid, tx, ty, 'up'),
    down: !canMove(grid, tx, ty, 'down'),
    left: !canMove(grid, tx, ty, 'left'),
    right: !canMove(grid, tx, ty, 'right'),
  }
}

function isPerpendicular(a: Direction, b: Direction) {
  if (a === 'none' || b === 'none') return false
  const aHorizontal = a === 'left' || a === 'right'
  const bHorizontal = b === 'left' || b === 'right'
  return aHorizontal !== bHorizontal
}

function syncEntityTile(entity: GridEntity) {
  const tile = worldToTile(entity.x, entity.y)
  const clamped = clampTile(tile.tx, tile.ty)
  entity.tx = clamped.tx
  entity.ty = clamped.ty
}

export function stepGridEntity(entity: GridEntity, grid: string[], dt: number, epsilon = CENTER_EPSILON) {
  const clamped = clampTile(entity.tx, entity.ty)
  entity.tx = clamped.tx
  entity.ty = clamped.ty

  const maxStep = entity.speed * Math.max(0, dt)
  let remaining = maxStep

  while (remaining > 0) {
    const tx = entity.tx
    const ty = entity.ty
    const center = tileToWorldCenter(tx, ty)

    const nearCenterX = Math.abs(entity.x - center.x) <= epsilon
    const nearCenterY = Math.abs(entity.y - center.y) <= epsilon
    const atCenter = nearCenterX && nearCenterY
    const desiredCanMove = entity.desiredDirection !== 'none' && canMove(grid, tx, ty, entity.desiredDirection)

    if (entity.currentDirection === 'left' || entity.currentDirection === 'right') {
      entity.y = center.y
    } else if (entity.currentDirection === 'up' || entity.currentDirection === 'down') {
      entity.x = center.x
    } else if (nearCenterX && nearCenterY) {
      entity.x = center.x
      entity.y = center.y
    }

    const nearEnoughForAssist = nearCenterX && nearCenterY
    const canAssistTurn =
      desiredCanMove &&
      (atCenter || nearEnoughForAssist) &&
      (entity.currentDirection === 'none' || isPerpendicular(entity.currentDirection, entity.desiredDirection))

    if (canAssistTurn) {
      entity.x = center.x
      entity.y = center.y
      syncEntityTile(entity)
      if (desiredCanMove) {
        entity.currentDirection = entity.desiredDirection
      }
    }

    if (atCenter) {
      entity.x = center.x
      entity.y = center.y
      syncEntityTile(entity)

      if (desiredCanMove) entity.currentDirection = entity.desiredDirection
      if (!canMove(grid, tx, ty, entity.currentDirection)) {
        entity.currentDirection = 'none'
        break
      }
    }

    if (entity.currentDirection === 'none') break

    const vec = directionVector(entity.currentDirection)
    const nextTile = { tx: tx + vec.x, ty: ty + vec.y }

    if (isWall(grid, nextTile.tx, nextTile.ty)) {
      entity.x = center.x
      entity.y = center.y
      entity.currentDirection = 'none'
      syncEntityTile(entity)
      break
    }

    const nextCenter = tileToWorldCenter(nextTile.tx, nextTile.ty)
    const axisRemaining =
      entity.currentDirection === 'right'
        ? nextCenter.x - entity.x
        : entity.currentDirection === 'left'
          ? entity.x - nextCenter.x
          : entity.currentDirection === 'down'
            ? nextCenter.y - entity.y
            : entity.y - nextCenter.y

    if (remaining >= axisRemaining) {
      entity.x = nextCenter.x
      entity.y = nextCenter.y
      entity.tx = nextTile.tx
      entity.ty = nextTile.ty
      remaining -= axisRemaining
    } else {
      entity.x += vec.x * remaining
      entity.y += vec.y * remaining
      remaining = 0
    }

    if (remaining <= 0.0001) break
  }
}
