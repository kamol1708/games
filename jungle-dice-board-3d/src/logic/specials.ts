export type SpecialType = 'trap' | 'ladder'

export type SpecialTile = {
  from: number
  to: number
  type: SpecialType
}

const SPECIAL_DEFS: Array<[number, number]> = [
  [5, 13],
  [12, 6],
  [18, 28],
  [23, 15],
  [29, 36],
  [34, 24],
  [41, 50],
  [47, 40],
  [53, 65],
  [60, 51],
  [66, 72],
  [72, 61],
  [79, 87],
  [85, 79],
  [92, 80],
  [96, 99],
]

export const SPECIALS: SpecialTile[] = SPECIAL_DEFS.map(([from, to]) => ({
  from,
  to,
  type: to > from ? 'ladder' : 'trap',
}))

export const SPECIALS_BY_FROM = new Map<number, SpecialTile>(SPECIALS.map((s) => [s.from, s]))

export function getSpecialTile(step: number) {
  return SPECIALS_BY_FROM.get(step)
}
