export const TILE_SIZE = 24
export const CENTER_EPSILON = 2

export const BASE_PLAYER_SPEED = 80
export const BASE_GHOST_SPEED = 75
export const BASE_GHOST_FRIGHTENED_SPEED = 55

export const PLAYER_START = { x: 9, y: 16 }
export const GHOST_STARTS = [
  { x: 8, y: 8 },
  { x: 9, y: 8 },
  { x: 10, y: 8 },
  { x: 11, y: 8 },
]

export const MAZE_LAYOUT = [
  '###################',
  '#........#........#',
  '#.###.##.#.##.###.#',
  '#o###.##.#.##.###o#',
  '#.................#',
  '#.###.#.###.#.###.#',
  '#.....#..#..#.....#',
  '#####.### # ###.###',
  '#####.#      #.####',
  '#####.# ###  #.####',
  '#.....  ###  .....#',
  '#####.# ###  #.####',
  '#####.#      #.####',
  '#####.#.###.#.#####',
  '#........#........#',
  '#.###.##.#.##.###.#',
  '#o..#.... ....#..o#',
  '###.#.#.###.#.#.###',
  '#.....#..#..#.....#',
  '#.########.########',
  '#.................#',
  '###################',
] as const

export const MAZE_HEIGHT = MAZE_LAYOUT.length
export const MAZE_WIDTH = MAZE_LAYOUT[0].length

export const GAME_WIDTH = MAZE_WIDTH * TILE_SIZE
export const GAME_HEIGHT = MAZE_HEIGHT * TILE_SIZE

export const LEVEL_SPEED_SCALE_STEP = 0.03

export const STORAGE_LEVEL_KEY = 'pac_arcade_level_v1'

export type TileType = '#' | '.' | 'o' | ' '
