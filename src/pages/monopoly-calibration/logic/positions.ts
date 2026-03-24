export const TILE_COUNT = 40
export const TILE_MAP_KEY = 'monopoly_tile_map_v1'

export type NormalizedPoint = { nx: number; ny: number }

export type TileMap = Array<NormalizedPoint | null>

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

function defaultPerimeterMap(): TileMap {
  const points: TileMap = Array.from({ length: TILE_COUNT }, () => null)
  const min = 0.065
  const max = 0.935
  const step = (max - min) / 10

  let idx = 0

  for (let i = 0; i <= 10 && idx < TILE_COUNT; i += 1) {
    points[idx] = { nx: max - step * i, ny: max }
    idx += 1
  }

  for (let i = 1; i <= 10 && idx < TILE_COUNT; i += 1) {
    points[idx] = { nx: min, ny: max - step * i }
    idx += 1
  }

  for (let i = 1; i <= 10 && idx < TILE_COUNT; i += 1) {
    points[idx] = { nx: min + step * i, ny: min }
    idx += 1
  }

  for (let i = 1; i <= 9 && idx < TILE_COUNT; i += 1) {
    points[idx] = { nx: max, ny: min + step * i }
    idx += 1
  }

  return points
}

export function validateTileMap(input: unknown): TileMap | null {
  if (!Array.isArray(input) || input.length !== TILE_COUNT) return null

  const result: TileMap = Array.from({ length: TILE_COUNT }, () => null)
  for (let i = 0; i < TILE_COUNT; i += 1) {
    const item = input[i] as { nx?: unknown; ny?: unknown } | null
    if (!item || typeof item !== 'object') {
      result[i] = null
      continue
    }
    const nx = Number(item.nx)
    const ny = Number(item.ny)
    if (!Number.isFinite(nx) || !Number.isFinite(ny)) {
      result[i] = null
      continue
    }
    result[i] = { nx: clamp01(nx), ny: clamp01(ny) }
  }

  return result
}

export function loadTileMap(): TileMap {
  try {
    const raw = window.localStorage.getItem(TILE_MAP_KEY)
    if (!raw) return defaultPerimeterMap()
    const parsed = JSON.parse(raw)
    const validated = validateTileMap(parsed)
    return validated ?? defaultPerimeterMap()
  } catch {
    return defaultPerimeterMap()
  }
}

export function saveTileMap(map: TileMap) {
  const validated = validateTileMap(map)
  if (!validated) return
  window.localStorage.setItem(TILE_MAP_KEY, JSON.stringify(validated))
}

export function clearTileMap() {
  window.localStorage.removeItem(TILE_MAP_KEY)
}

export function hasSavedTileMap() {
  return Boolean(window.localStorage.getItem(TILE_MAP_KEY))
}

export function filledCount(map: TileMap) {
  return map.filter(Boolean).length
}

export function exportTileMap(map: TileMap) {
  const validated = validateTileMap(map)
  return JSON.stringify(validated ?? defaultPerimeterMap(), null, 2)
}

export function importTileMap(text: string): TileMap | null {
  try {
    const parsed = JSON.parse(text)
    return validateTileMap(parsed)
  } catch {
    return null
  }
}

export function getTilePosition(index: number, boardBounds: { x: number; y: number; width: number; height: number }, map: TileMap) {
  const safeIndex = Math.max(0, Math.min(TILE_COUNT - 1, Math.floor(index)))
  const point = map[safeIndex] ?? defaultPerimeterMap()[safeIndex]
  const nx = point?.nx ?? 0.5
  const ny = point?.ny ?? 0.5

  return {
    x: boardBounds.x + nx * boardBounds.width,
    y: boardBounds.y + ny * boardBounds.height,
  }
}

export function setTilePoint(map: TileMap, index: number, x: number, y: number, boardBounds: { x: number; y: number; width: number; height: number }): TileMap {
  const safeIndex = Math.max(0, Math.min(TILE_COUNT - 1, Math.floor(index)))
  const nx = clamp01((x - boardBounds.x) / boardBounds.width)
  const ny = clamp01((y - boardBounds.y) / boardBounds.height)
  const next = [...map]
  next[safeIndex] = { nx, ny }
  return next
}
