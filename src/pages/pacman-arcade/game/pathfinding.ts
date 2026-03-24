import { MAZE_HEIGHT, MAZE_WIDTH } from './constants'
import { canMove, directionVector, oppositeDirection, type Direction } from './movement'

type Tile = { tx: number; ty: number }

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right']

function keyOf(tx: number, ty: number) {
  return `${tx},${ty}`
}

export function chooseGhostDirection(
  grid: string[],
  from: Tile,
  target: Tile,
  currentDirection: Direction,
): Direction {
  const queue: Tile[] = [from]
  let head = 0
  const cameFrom = new Map<string, { prev: string; dir: Direction }>()
  const seen = new Set<string>([keyOf(from.tx, from.ty)])

  while (head < queue.length) {
    const node = queue[head] as Tile
    head += 1
    if (node.tx === target.tx && node.ty === target.ty) break

    for (const dir of DIRECTIONS) {
      if (!canMove(grid, node.tx, node.ty, dir)) continue
      const vec = directionVector(dir)
      const nx = node.tx + vec.x
      const ny = node.ty + vec.y
      if (nx < 0 || ny < 0 || nx >= MAZE_WIDTH || ny >= MAZE_HEIGHT) continue
      const nk = keyOf(nx, ny)
      if (seen.has(nk)) continue
      seen.add(nk)
      cameFrom.set(nk, { prev: keyOf(node.tx, node.ty), dir })
      queue.push({ tx: nx, ty: ny })
    }
  }

  const targetKey = keyOf(target.tx, target.ty)
  if (!cameFrom.has(targetKey)) {
    const reverse = oppositeDirection(currentDirection)
    const fallback = DIRECTIONS.find((d) => d !== reverse && canMove(grid, from.tx, from.ty, d))
    return fallback ?? currentDirection
  }

  let cursor = targetKey
  let step = cameFrom.get(cursor)
  let firstDir: Direction = currentDirection

  while (step) {
    firstDir = step.dir
    if (step.prev === keyOf(from.tx, from.ty)) break
    cursor = step.prev
    step = cameFrom.get(cursor)
  }

  if (firstDir === oppositeDirection(currentDirection)) {
    const alt = DIRECTIONS.find((d) => d !== firstDir && canMove(grid, from.tx, from.ty, d))
    return alt ?? firstDir
  }

  return firstDir
}
