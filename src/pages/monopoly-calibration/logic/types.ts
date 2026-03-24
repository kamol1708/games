export type TileType =
  | 'GO'
  | 'PROPERTY'
  | 'RAILROAD'
  | 'UTILITY'
  | 'CHANCE'
  | 'COMMUNITY'
  | 'TAX'
  | 'JAIL'
  | 'FREE_PARKING'
  | 'GO_TO_JAIL'

export type ColorGroup =
  | 'brown'
  | 'light_blue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'dark_blue'

export type BuyableKind = 'property' | 'railroad' | 'utility'

export type BuyableData = {
  tileIndex: number
  name: string
  kind: BuyableKind
  cost: number
  mortgageValue: number
  colorGroup?: ColorGroup
  houseCost?: number
  rentTable?: [number, number, number, number, number, number]
}

export type TileData = {
  index: number
  type: TileType
  name: string
  taxAmount?: number
  buyable?: BuyableData
}

export type OwnershipState = {
  ownerId: string | null
  mortgaged: boolean
  level: number
}

export type PlayerState = {
  id: string
  name: string
  color: number
  money: number
  position: number
  inJail: boolean
  jailTurns: number
  getOutOfJailFreeChance: number
  getOutOfJailFreeCommunity: number
  bankrupt: boolean
  consecutiveDoubles: number
}

export type ChanceCardAction =
  | { type: 'MOVE_TO'; tile: number }
  | { type: 'MOVE_NEAREST_RAILROAD'; doubleRent: boolean }
  | { type: 'MOVE_NEAREST_UTILITY' }
  | { type: 'MOVE_BACK'; steps: number }
  | { type: 'MONEY'; amount: number; fromEachPlayer?: boolean; toEachPlayer?: boolean }
  | { type: 'REPAIRS'; houseCost: number; hotelCost: number }
  | { type: 'GO_TO_JAIL' }
  | { type: 'GET_OUT_OF_JAIL' }

export type DeckCard = {
  id: string
  deck: 'chance' | 'community'
  text: string
  action: ChanceCardAction
}

export type DeckState = {
  chance: string[]
  community: string[]
}

export type AuctionState = {
  tileIndex: number
  highestBid: number
  highestBidderId: string | null
  activeBidderId: string
  passedIds: string[]
  done: boolean
}

export type DebtState = {
  debtorId: string
  creditorId: string | 'bank'
  amount: number
  reason: string
}

export type TradeOffer = {
  fromId: string
  toId: string
  offerMoney: number
  requestMoney: number
  offerPropertyIndices: number[]
  requestPropertyIndices: number[]
  offerJailCardChance: boolean
  offerJailCardCommunity: boolean
  requestJailCardChance: boolean
  requestJailCardCommunity: boolean
  acceptedByFrom: boolean
  acceptedByTo: boolean
}

export type TurnPhase =
  | 'SETUP'
  | 'ROLL'
  | 'MOVING'
  | 'RESOLVE'
  | 'BUY_PROMPT'
  | 'AUCTION'
  | 'JAIL_CHOICE'
  | 'DEBT'
  | 'TRADE'
  | 'GAME_OVER'

export type MonopolySettings = {
  freeParkingJackpot: boolean
  unlimitedBuildings: boolean
}

export type MonopolyState = {
  players: PlayerState[]
  currentPlayerIndex: number
  ownership: Record<number, OwnershipState>
  deckState: DeckState
  heldCards: {
    chanceOwnerId: string | null
    communityOwnerId: string | null
  }
  turnPhase: TurnPhase
  lastDice: { d1: number; d2: number; total: number }
  pendingMovePath: number[]
  buyPromptTile: number | null
  auction: AuctionState | null
  bankAuctionQueue: number[]
  debt: DebtState | null
  trade: TradeOffer | null
  eventLog: string[]
  freeParkingPot: number
  housesLeft: number
  hotelsLeft: number
  settings: MonopolySettings
}
