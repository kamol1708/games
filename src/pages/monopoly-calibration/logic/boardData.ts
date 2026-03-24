import type { BuyableData, ColorGroup, TileData } from './types'

const color = (name: string): ColorGroup => name as ColorGroup

const property = (
  tileIndex: number,
  name: string,
  cost: number,
  group: ColorGroup,
  houseCost: number,
  rentTable: [number, number, number, number, number, number],
): BuyableData => ({
  tileIndex,
  name,
  kind: 'property',
  cost,
  mortgageValue: Math.floor(cost / 2),
  colorGroup: group,
  houseCost,
  rentTable,
})

const railroad = (tileIndex: number, name: string): BuyableData => ({
  tileIndex,
  name,
  kind: 'railroad',
  cost: 200,
  mortgageValue: 100,
})

const utility = (tileIndex: number, name: string): BuyableData => ({
  tileIndex,
  name,
  kind: 'utility',
  cost: 150,
  mortgageValue: 75,
})

export const TILES: TileData[] = [
  { index: 0, type: 'GO', name: 'GO' },
  { index: 1, type: 'PROPERTY', name: 'Mediterranean Avenue', buyable: property(1, 'Mediterranean Avenue', 60, color('brown'), 50, [2, 10, 30, 90, 160, 250]) },
  { index: 2, type: 'COMMUNITY', name: 'Community Chest' },
  { index: 3, type: 'PROPERTY', name: 'Baltic Avenue', buyable: property(3, 'Baltic Avenue', 60, color('brown'), 50, [4, 20, 60, 180, 320, 450]) },
  { index: 4, type: 'TAX', name: 'Income Tax', taxAmount: 200 },
  { index: 5, type: 'RAILROAD', name: 'Reading Railroad', buyable: railroad(5, 'Reading Railroad') },
  { index: 6, type: 'PROPERTY', name: 'Oriental Avenue', buyable: property(6, 'Oriental Avenue', 100, color('light_blue'), 50, [6, 30, 90, 270, 400, 550]) },
  { index: 7, type: 'CHANCE', name: 'Chance' },
  { index: 8, type: 'PROPERTY', name: 'Vermont Avenue', buyable: property(8, 'Vermont Avenue', 100, color('light_blue'), 50, [6, 30, 90, 270, 400, 550]) },
  { index: 9, type: 'PROPERTY', name: 'Connecticut Avenue', buyable: property(9, 'Connecticut Avenue', 120, color('light_blue'), 50, [8, 40, 100, 300, 450, 600]) },
  { index: 10, type: 'JAIL', name: 'Jail / Just Visiting' },
  { index: 11, type: 'PROPERTY', name: 'St. Charles Place', buyable: property(11, 'St. Charles Place', 140, color('pink'), 100, [10, 50, 150, 450, 625, 750]) },
  { index: 12, type: 'UTILITY', name: 'Electric Company', buyable: utility(12, 'Electric Company') },
  { index: 13, type: 'PROPERTY', name: 'States Avenue', buyable: property(13, 'States Avenue', 140, color('pink'), 100, [10, 50, 150, 450, 625, 750]) },
  { index: 14, type: 'PROPERTY', name: 'Virginia Avenue', buyable: property(14, 'Virginia Avenue', 160, color('pink'), 100, [12, 60, 180, 500, 700, 900]) },
  { index: 15, type: 'RAILROAD', name: 'Pennsylvania Railroad', buyable: railroad(15, 'Pennsylvania Railroad') },
  { index: 16, type: 'PROPERTY', name: 'St. James Place', buyable: property(16, 'St. James Place', 180, color('orange'), 100, [14, 70, 200, 550, 750, 950]) },
  { index: 17, type: 'COMMUNITY', name: 'Community Chest' },
  { index: 18, type: 'PROPERTY', name: 'Tennessee Avenue', buyable: property(18, 'Tennessee Avenue', 180, color('orange'), 100, [14, 70, 200, 550, 750, 950]) },
  { index: 19, type: 'PROPERTY', name: 'New York Avenue', buyable: property(19, 'New York Avenue', 200, color('orange'), 100, [16, 80, 220, 600, 800, 1000]) },
  { index: 20, type: 'FREE_PARKING', name: 'Free Parking' },
  { index: 21, type: 'PROPERTY', name: 'Kentucky Avenue', buyable: property(21, 'Kentucky Avenue', 220, color('red'), 150, [18, 90, 250, 700, 875, 1050]) },
  { index: 22, type: 'CHANCE', name: 'Chance' },
  { index: 23, type: 'PROPERTY', name: 'Indiana Avenue', buyable: property(23, 'Indiana Avenue', 220, color('red'), 150, [18, 90, 250, 700, 875, 1050]) },
  { index: 24, type: 'PROPERTY', name: 'Illinois Avenue', buyable: property(24, 'Illinois Avenue', 240, color('red'), 150, [20, 100, 300, 750, 925, 1100]) },
  { index: 25, type: 'RAILROAD', name: 'B. & O. Railroad', buyable: railroad(25, 'B. & O. Railroad') },
  { index: 26, type: 'PROPERTY', name: 'Atlantic Avenue', buyable: property(26, 'Atlantic Avenue', 260, color('yellow'), 150, [22, 110, 330, 800, 975, 1150]) },
  { index: 27, type: 'PROPERTY', name: 'Ventnor Avenue', buyable: property(27, 'Ventnor Avenue', 260, color('yellow'), 150, [22, 110, 330, 800, 975, 1150]) },
  { index: 28, type: 'UTILITY', name: 'Water Works', buyable: utility(28, 'Water Works') },
  { index: 29, type: 'PROPERTY', name: 'Marvin Gardens', buyable: property(29, 'Marvin Gardens', 280, color('yellow'), 150, [24, 120, 360, 850, 1025, 1200]) },
  { index: 30, type: 'GO_TO_JAIL', name: 'Go To Jail' },
  { index: 31, type: 'PROPERTY', name: 'Pacific Avenue', buyable: property(31, 'Pacific Avenue', 300, color('green'), 200, [26, 130, 390, 900, 1100, 1275]) },
  { index: 32, type: 'PROPERTY', name: 'North Carolina Avenue', buyable: property(32, 'North Carolina Avenue', 300, color('green'), 200, [26, 130, 390, 900, 1100, 1275]) },
  { index: 33, type: 'COMMUNITY', name: 'Community Chest' },
  { index: 34, type: 'PROPERTY', name: 'Pennsylvania Avenue', buyable: property(34, 'Pennsylvania Avenue', 320, color('green'), 200, [28, 150, 450, 1000, 1200, 1400]) },
  { index: 35, type: 'RAILROAD', name: 'Short Line', buyable: railroad(35, 'Short Line') },
  { index: 36, type: 'CHANCE', name: 'Chance' },
  { index: 37, type: 'PROPERTY', name: 'Park Place', buyable: property(37, 'Park Place', 350, color('dark_blue'), 200, [35, 175, 500, 1100, 1300, 1500]) },
  { index: 38, type: 'TAX', name: 'Luxury Tax', taxAmount: 100 },
  { index: 39, type: 'PROPERTY', name: 'Boardwalk', buyable: property(39, 'Boardwalk', 400, color('dark_blue'), 200, [50, 200, 600, 1400, 1700, 2000]) },
]

export const RAILROAD_INDICES = [5, 15, 25, 35]
export const UTILITY_INDICES = [12, 28]

export const COLOR_GROUPS: Record<ColorGroup, number[]> = {
  brown: [1, 3],
  light_blue: [6, 8, 9],
  pink: [11, 13, 14],
  orange: [16, 18, 19],
  red: [21, 23, 24],
  yellow: [26, 27, 29],
  green: [31, 32, 34],
  dark_blue: [37, 39],
}

export function tileByIndex(index: number) {
  return TILES[index]
}

export function buyableTiles() {
  return TILES.filter((tile) => Boolean(tile.buyable)).map((tile) => tile.index)
}
