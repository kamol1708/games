import { COLOR_GROUPS, RAILROAD_INDICES, TILES, UTILITY_INDICES, tileByIndex } from './boardData'
import { CARD_BY_ID, createShuffledDeckState } from './decks'
import type {
  AuctionState,
  DeckCard,
  MonopolySettings,
  MonopolyState,
  OwnershipState,
  PlayerState,
  TradeOffer,
} from './types'

export const START_MONEY = 1500
export const PASS_GO_MONEY = 200
export const JAIL_INDEX = 10
export const GO_TO_JAIL_INDEX = 30
export type RollResult = { state: MonopolyState; path: number[] }

export type LandingResult =
  | { kind: 'none' }
  | { kind: 'buy_prompt'; tileIndex: number }
  | { kind: 'rent'; amount: number; ownerId: string; tileIndex: number }
  | { kind: 'tax'; amount: number }
  | { kind: 'card'; card: DeckCard }
  | { kind: 'free_parking'; amount: number }
  | { kind: 'go_to_jail' }
  | { kind: 'auction'; tileIndex: number }

const ceil10p = (n: number) => Math.ceil(n * 1.1)

function byId(players: PlayerState[], id: string) {
  return players.find((p) => p.id === id) ?? null
}

function nextAlivePlayerIndex(players: PlayerState[], from: number) {
  const total = players.length
  for (let s = 1; s <= total; s += 1) {
    const idx = (from + s) % total
    if (!players[idx]?.bankrupt) return idx
  }
  return from
}

function ownCount(state: MonopolyState, ownerId: string, indices: number[]) {
  return indices.filter((i) => state.ownership[i]?.ownerId === ownerId).length
}

function ownsFullGroup(state: MonopolyState, ownerId: string, group: keyof typeof COLOR_GROUPS) {
  return COLOR_GROUPS[group].every((idx) => state.ownership[idx]?.ownerId === ownerId)
}

function propertyRent(state: MonopolyState, tileIndex: number, diceTotal: number, forceDoubleRailRent = false) {
  const tile = tileByIndex(tileIndex)
  const buy = tile.buyable
  const own = state.ownership[tileIndex]
  if (!buy || !own || !own.ownerId || own.mortgaged) return 0

  if (buy.kind === 'railroad') {
    const rr = ownCount(state, own.ownerId, RAILROAD_INDICES)
    const table = [25, 50, 100, 200]
    const base = table[Math.max(0, rr - 1)] ?? 25
    return forceDoubleRailRent ? base * 2 : base
  }

  if (buy.kind === 'utility') {
    const owned = ownCount(state, own.ownerId, UTILITY_INDICES)
    return diceTotal * (owned >= 2 ? 10 : 4)
  }

  const rentTable = buy.rentTable ?? [0, 0, 0, 0, 0, 0]
  const level = own.level
  let base = rentTable[Math.min(level, 5)] ?? 0
  if (level === 0 && buy.colorGroup && ownsFullGroup(state, own.ownerId, buy.colorGroup)) {
    base *= 2
  }
  return base
}

function buildOwnershipMap() {
  const map: Record<number, OwnershipState> = {}
  for (const tile of TILES) {
    if (tile.buyable) {
      map[tile.index] = {
        ownerId: null,
        mortgaged: false,
        level: 0,
      }
    }
  }
  return map
}

function logPush(state: MonopolyState, message: string) {
  return {
    ...state,
    eventLog: [message, ...state.eventLog].slice(0, 10),
  }
}

export function createInitialMonopolyState(
  playersInput: Array<{ name: string; color: number }>,
  settings: MonopolySettings,
): MonopolyState {
  const players: PlayerState[] = playersInput.map((item, idx) => ({
    id: `p-${idx + 1}`,
    name: item.name,
    color: item.color,
    money: START_MONEY,
    position: 0,
    inJail: false,
    jailTurns: 0,
    getOutOfJailFreeChance: 0,
    getOutOfJailFreeCommunity: 0,
    bankrupt: false,
    consecutiveDoubles: 0,
  }))

  return {
    players,
    currentPlayerIndex: 0,
    ownership: buildOwnershipMap(),
    deckState: createShuffledDeckState(),
    heldCards: {
      chanceOwnerId: null,
      communityOwnerId: null,
    },
    turnPhase: 'ROLL',
    lastDice: { d1: 0, d2: 0, total: 0 },
    pendingMovePath: [],
    buyPromptTile: null,
    auction: null,
    bankAuctionQueue: [],
    debt: null,
    trade: null,
    eventLog: ['Monopoly game started'],
    freeParkingPot: 0,
    housesLeft: settings.unlimitedBuildings ? 999 : 32,
    hotelsLeft: settings.unlimitedBuildings ? 999 : 12,
    settings,
  }
}

export function activePlayer(state: MonopolyState) {
  return state.players[state.currentPlayerIndex] as PlayerState
}

export function canRoll(state: MonopolyState) {
  return state.turnPhase === 'ROLL' || state.turnPhase === 'JAIL_CHOICE'
}

function rollWithDice(state: MonopolyState, d1: number, d2: number): RollResult {
  const player = activePlayer(state)
  if (player.bankrupt) return { state, path: [] }
  const total = d1 + d2
  const isDouble = d1 === d2

  let next: MonopolyState = {
    ...state,
    lastDice: { d1, d2, total },
    eventLog: [`${player.name} rolled ${d1} + ${d2} = ${total}`, ...state.eventLog].slice(0, 10),
  }

  const players = [...next.players]
  const idx = next.currentPlayerIndex
  const updatedPlayer = { ...players[idx] }

  if (isDouble) updatedPlayer.consecutiveDoubles += 1
  else updatedPlayer.consecutiveDoubles = 0

  if (updatedPlayer.consecutiveDoubles >= 3) {
    players[idx] = updatedPlayer
    next = { ...next, players }
    next = sendToJail(next, updatedPlayer.id)
    return { state: next, path: [] }
  }

  players[idx] = updatedPlayer
  next = { ...next, players }
  return movePlayerBy(next, updatedPlayer.id, total)
}

function buildPath(start: number, steps: number) {
  const path: number[] = []
  let pos = start
  for (let i = 0; i < steps; i += 1) {
    pos = (pos + 1) % 40
    path.push(pos)
  }
  return path
}

function movePlayerBy(state: MonopolyState, playerId: string, steps: number): RollResult {
  const players = [...state.players]
  const idx = players.findIndex((p) => p.id === playerId)
  if (idx < 0) return { state, path: [] as number[] }
  const p = { ...players[idx] }
  const path = buildPath(p.position, steps)
  const last = path[path.length - 1] ?? p.position

  if (path.some((tile) => tile === 0)) {
    p.money += PASS_GO_MONEY
    state = logPush(state, `${p.name} passed GO and collected $200`)
  }

  p.position = last
  players[idx] = p
  return {
    state: {
      ...state,
      players,
      pendingMovePath: path,
      turnPhase: 'MOVING',
    },
    path,
  }
}

function setPlayerPosition(state: MonopolyState, playerId: string, target: number, collectGo: boolean): MonopolyState {
  const players = [...state.players]
  const idx = players.findIndex((p) => p.id === playerId)
  if (idx < 0) return state
  const p = { ...players[idx] }
  const prev = p.position
  if (collectGo && target < prev) {
    p.money += PASS_GO_MONEY
    state = logPush(state, `${p.name} passed GO and collected $200`)
  }
  p.position = target
  players[idx] = p
  return { ...state, players }
}

function sendToJail(state: MonopolyState, playerId: string): MonopolyState {
  const players = [...state.players]
  const idx = players.findIndex((p) => p.id === playerId)
  if (idx < 0) return state
  const p = { ...players[idx] }
  p.position = JAIL_INDEX
  p.inJail = true
  p.jailTurns = 0
  p.consecutiveDoubles = 0
  players[idx] = p
  return logPush({ ...state, players, turnPhase: 'RESOLVE' }, `${p.name} was sent to Jail`)
}

function transferMoney(state: MonopolyState, fromId: string | 'bank', toId: string | 'bank', amount: number, reason: string): MonopolyState {
  if (amount <= 0) return state
  const players = [...state.players]

  const fromPlayer = fromId === 'bank' ? null : byId(players, fromId)
  const toPlayer = toId === 'bank' ? null : byId(players, toId)

  if (fromPlayer) {
    fromPlayer.money -= amount
  }
  if (toPlayer) {
    toPlayer.money += amount
  }

  let next: MonopolyState = { ...state, players }

  if (fromPlayer && fromPlayer.money < 0) {
    next = {
      ...next,
      debt: {
        debtorId: fromPlayer.id,
        creditorId: toId,
        amount: Math.abs(fromPlayer.money),
        reason,
      },
      turnPhase: 'DEBT',
    }
  }

  return logPush(next, `${fromId === 'bank' ? 'Bank' : fromPlayer?.name} paid $${amount} to ${toId === 'bank' ? 'Bank' : toPlayer?.name} (${reason})`)
}

function drawCard(state: MonopolyState, deck: 'chance' | 'community'): { state: MonopolyState; card: DeckCard | null } {
  const ids = [...state.deckState[deck]]
  const cardId = ids.shift()
  if (!cardId) return { state, card: null as DeckCard | null }
  const card = CARD_BY_ID.get(cardId) ?? null
  if (card && card.action.type !== 'GET_OUT_OF_JAIL') {
    ids.push(cardId)
  }
  return {
    state: {
      ...state,
      deckState: {
        ...state.deckState,
        [deck]: ids,
      },
    },
    card,
  }
}

function nearestIndex(from: number, options: number[]) {
  for (let offset = 1; offset <= 40; offset += 1) {
    const target = (from + offset) % 40
    if (options.includes(target)) return target
  }
  return options[0] as number
}

function chargeRepairs(state: MonopolyState, playerId: string, houseCost: number, hotelCost: number): MonopolyState {
  const owned = Object.entries(state.ownership)
    .filter(([, own]) => own.ownerId === playerId)
    .map(([idx, own]) => ({ idx: Number(idx), level: own.level }))

  let houses = 0
  let hotels = 0
  for (const item of owned) {
    if (item.level >= 5) hotels += 1
    else houses += item.level
  }

  const cost = houses * houseCost + hotels * hotelCost
  if (cost <= 0) return state
  return transferMoney(state, playerId, 'bank', cost, 'Property repairs')
}

function applyCardAction(state: MonopolyState, playerId: string, card: DeckCard, diceTotal: number): { state: MonopolyState; landing: LandingResult } {
  let next: MonopolyState = logPush(state, `${activePlayer(state).name} drew card: ${card.text}`)
  const players = [...next.players]
  const player = players.find((p) => p.id === playerId)
  if (!player) return { state: next, landing: { kind: 'none' } as LandingResult }

  const action = card.action
  if (action.type === 'GET_OUT_OF_JAIL') {
    if (card.deck === 'chance') {
      player.getOutOfJailFreeChance += 1
      next.heldCards.chanceOwnerId = playerId
    } else {
      player.getOutOfJailFreeCommunity += 1
      next.heldCards.communityOwnerId = playerId
    }
    return { state: { ...next, players }, landing: { kind: 'none' } as LandingResult }
  }

  if (action.type === 'GO_TO_JAIL') {
    return { state: sendToJail(next, playerId), landing: { kind: 'go_to_jail' } as LandingResult }
  }

  if (action.type === 'MONEY') {
    if (action.fromEachPlayer) {
      for (const p of players) {
        if (p.id === playerId || p.bankrupt) continue
        next = transferMoney(next, p.id, playerId, action.amount, 'Card collect from each player')
      }
      return { state: next, landing: { kind: 'none' } as LandingResult }
    }
    if (action.toEachPlayer) {
      for (const p of players) {
        if (p.id === playerId || p.bankrupt) continue
        next = transferMoney(next, playerId, p.id, Math.abs(action.amount), 'Card pay each player')
      }
      return { state: next, landing: { kind: 'none' } as LandingResult }
    }
    if (action.amount >= 0) {
      next = transferMoney(next, 'bank', playerId, action.amount, 'Card reward')
    } else {
      next = transferMoney(next, playerId, 'bank', Math.abs(action.amount), 'Card penalty')
    }
    return { state: next, landing: { kind: 'none' } as LandingResult }
  }

  if (action.type === 'REPAIRS') {
    next = chargeRepairs(next, playerId, action.houseCost, action.hotelCost)
    return { state: next, landing: { kind: 'none' } as LandingResult }
  }

  if (action.type === 'MOVE_BACK') {
    const target = ((player.position - action.steps) % 40 + 40) % 40
    next = setPlayerPosition(next, playerId, target, false)
    return { state: next, landing: resolveTile(next, playerId, diceTotal, false) }
  }

  if (action.type === 'MOVE_NEAREST_RAILROAD') {
    const target = nearestIndex(player.position, RAILROAD_INDICES)
    next = setPlayerPosition(next, playerId, target, target < player.position)
    const landing = resolveTile(next, playerId, diceTotal, false, action.doubleRent)
    return { state: next, landing }
  }

  if (action.type === 'MOVE_NEAREST_UTILITY') {
    const target = nearestIndex(player.position, UTILITY_INDICES)
    next = setPlayerPosition(next, playerId, target, target < player.position)
    return { state: next, landing: resolveTile(next, playerId, diceTotal, false) }
  }

  if (action.type === 'MOVE_TO') {
    next = setPlayerPosition(next, playerId, action.tile, action.tile < player.position)
    return { state: next, landing: resolveTile(next, playerId, diceTotal, false) }
  }

  return { state: next, landing: { kind: 'none' } as LandingResult }
}

export function resolveTile(
  state: MonopolyState,
  playerId: string,
  diceTotal: number,
  fromMove = true,
  forceDoubleRailRent = false,
): LandingResult {
  const player = byId(state.players, playerId)
  if (!player) return { kind: 'none' }
  const tile = tileByIndex(player.position)

  if (tile.type === 'GO') return { kind: 'none' }
  if (tile.type === 'FREE_PARKING') {
    if (state.settings.freeParkingJackpot && state.freeParkingPot > 0) {
      return { kind: 'free_parking', amount: state.freeParkingPot }
    }
    return { kind: 'none' }
  }

  if (tile.type === 'GO_TO_JAIL') return { kind: 'go_to_jail' }
  if (tile.type === 'JAIL') return { kind: 'none' }

  if (tile.type === 'TAX') {
    return { kind: 'tax', amount: tile.taxAmount ?? 0 }
  }

  if (tile.type === 'CHANCE' || tile.type === 'COMMUNITY') {
    const { state: next, card } = drawCard(state, tile.type === 'CHANCE' ? 'chance' : 'community')
    ;(state as any).__cardState = next
    if (!card) return { kind: 'none' }
    return { kind: 'card', card }
  }

  if (tile.buyable) {
    const own = state.ownership[tile.index]
    if (!own?.ownerId) {
      return { kind: 'buy_prompt', tileIndex: tile.index }
    }

    if (own.ownerId !== playerId && !own.mortgaged) {
      const amount = propertyRent(state, tile.index, diceTotal, forceDoubleRailRent)
      if (amount > 0) return { kind: 'rent', amount, ownerId: own.ownerId, tileIndex: tile.index }
    }
  }

  if (fromMove) {
    return { kind: 'none' }
  }
  return { kind: 'none' }
}

export function startTurn(state: MonopolyState): MonopolyState {
  const player = activePlayer(state)
  if (player.bankrupt) {
    return {
      ...state,
      currentPlayerIndex: nextAlivePlayerIndex(state.players, state.currentPlayerIndex),
      turnPhase: 'ROLL',
    }
  }

  if (player.inJail) {
    return {
      ...state,
      turnPhase: 'JAIL_CHOICE',
      eventLog: [`${player.name} is in jail. Choose action.`, ...state.eventLog].slice(0, 10),
    }
  }

  return { ...state, turnPhase: 'ROLL' }
}

export function rollDice(state: MonopolyState): RollResult {
  if (!canRoll(state)) return { state, path: [] as number[] }

  const player = activePlayer(state)
  if (player.bankrupt) return { state, path: [] as number[] }

  const d1 = PhaserLikeRand(1, 6)
  const d2 = PhaserLikeRand(1, 6)

  if (state.turnPhase === 'JAIL_CHOICE') {
    return { state: { ...state, lastDice: { d1, d2, total: d1 + d2 } }, path: [] as number[] }
  }
  return rollWithDice(state, d1, d2)
}

function afterPaymentCheck(state: MonopolyState): MonopolyState {
  if (!state.debt) return state
  const debtor = byId(state.players, state.debt.debtorId)
  if (!debtor) return state
  if (debtor.money >= 0) {
    return {
      ...state,
      debt: null,
      turnPhase: 'RESOLVE',
    }
  }
  return state
}

export function applyLandingResult(state: MonopolyState, landing: LandingResult): MonopolyState {
  let next: MonopolyState = { ...state, turnPhase: 'RESOLVE' }
  const player = activePlayer(next)

  if (landing.kind === 'none') return next

  if (landing.kind === 'buy_prompt') {
    return {
      ...next,
      buyPromptTile: landing.tileIndex,
      turnPhase: 'BUY_PROMPT',
    }
  }

  if (landing.kind === 'rent') {
    next = transferMoney(next, player.id, landing.ownerId, landing.amount, 'Rent')
    return afterPaymentCheck(next)
  }

  if (landing.kind === 'tax') {
    next = transferMoney(next, player.id, 'bank', landing.amount, 'Tax')
    if (next.settings.freeParkingJackpot) {
      next = { ...next, freeParkingPot: next.freeParkingPot + landing.amount }
    }
    return afterPaymentCheck(next)
  }

  if (landing.kind === 'go_to_jail') {
    return sendToJail(next, player.id)
  }

  if (landing.kind === 'free_parking') {
    if (landing.amount > 0) {
      next = transferMoney(next, 'bank', player.id, landing.amount, 'Free Parking Jackpot')
      next = { ...next, freeParkingPot: 0 }
    }
    return next
  }

  if (landing.kind === 'card') {
    const cardState = (state as any).__cardState as MonopolyState | undefined
    if (!cardState) return next
    const applied = applyCardAction(cardState, player.id, landing.card, next.lastDice.total)
    ;(next as any).__followLanding = applied.landing
    return applied.state
  }

  if (landing.kind === 'auction') {
    return startAuction(next, landing.tileIndex)
  }

  return next
}

export function consumeFollowLanding(state: MonopolyState): LandingResult | null {
  const follow = (state as any).__followLanding as LandingResult | undefined
  if (!follow) return null
  delete (state as any).__followLanding
  return follow
}

export function buyCurrentPrompt(state: MonopolyState): MonopolyState {
  const tileIndex = state.buyPromptTile
  if (tileIndex === null) return state
  const tile = tileByIndex(tileIndex)
  const player = activePlayer(state)
  if (!tile.buyable) return { ...state, buyPromptTile: null }

  if (player.money < tile.buyable.cost) {
    return declineCurrentPrompt(state)
  }

  const players = [...state.players]
  const idx = state.currentPlayerIndex
  const updated = { ...players[idx], money: players[idx].money - tile.buyable.cost }
  players[idx] = updated

  return {
    ...state,
    players,
    ownership: {
      ...state.ownership,
      [tileIndex]: {
        ...(state.ownership[tileIndex] as OwnershipState),
        ownerId: updated.id,
      },
    },
    buyPromptTile: null,
    turnPhase: 'RESOLVE',
    eventLog: [`${updated.name} bought ${tile.name} for $${tile.buyable.cost}`, ...state.eventLog].slice(0, 10),
  }
}

export function declineCurrentPrompt(state: MonopolyState): MonopolyState {
  const tileIndex = state.buyPromptTile
  if (tileIndex === null) return state
  return startAuction({ ...state, buyPromptTile: null }, tileIndex)
}

export function startAuction(state: MonopolyState, tileIndex: number): MonopolyState {
  const alive = state.players.filter((p) => !p.bankrupt)
  if (alive.length <= 1) return { ...state, auction: null, turnPhase: 'RESOLVE' }
  const first = alive[0] as PlayerState
  const auction: AuctionState = {
    tileIndex,
    highestBid: 0,
    highestBidderId: null,
    activeBidderId: first.id,
    passedIds: [],
    done: false,
  }
  return {
    ...state,
    auction,
    turnPhase: 'AUCTION',
    eventLog: [`Auction started for ${tileByIndex(tileIndex).name}`, ...state.eventLog].slice(0, 10),
  }
}

function nextAuctionBidder(state: MonopolyState, auction: AuctionState) {
  const aliveIds = state.players.filter((p) => !p.bankrupt).map((p) => p.id)
  const activePool = aliveIds.filter((id) => !auction.passedIds.includes(id))
  if (activePool.length <= 1) return null

  const currentIndex = activePool.indexOf(auction.activeBidderId)
  if (currentIndex < 0) return activePool[0] as string
  return activePool[(currentIndex + 1) % activePool.length] as string
}

export function auctionBid(state: MonopolyState, amount: number): MonopolyState {
  if (!state.auction) return state
  const auction = { ...state.auction }
  const bidder = byId(state.players, auction.activeBidderId)
  if (!bidder) return state
  if (amount <= auction.highestBid || amount > bidder.money) return state

  auction.highestBid = amount
  auction.highestBidderId = bidder.id
  const nextBidder = nextAuctionBidder(state, auction)
  if (!nextBidder) auction.done = true
  else auction.activeBidderId = nextBidder

  return {
    ...state,
    auction,
    eventLog: [`${bidder.name} bid $${amount}`, ...state.eventLog].slice(0, 10),
  }
}

export function auctionPass(state: MonopolyState): MonopolyState {
  if (!state.auction) return state
  const auction = { ...state.auction }
  const passerId = auction.activeBidderId
  if (!auction.passedIds.includes(passerId)) {
    auction.passedIds = [...auction.passedIds, passerId]
  }

  const nextBidder = nextAuctionBidder(state, auction)
  if (!nextBidder) {
    auction.done = true
  } else {
    auction.activeBidderId = nextBidder
  }

  return {
    ...state,
    auction,
    eventLog: [`${byId(state.players, passerId)?.name ?? passerId} passed`, ...state.eventLog].slice(0, 10),
  }
}

export function finalizeAuction(state: MonopolyState): MonopolyState {
  const auction = state.auction
  if (!auction || !auction.done) return state

  if (!auction.highestBidderId) {
    const remainingQueue = state.bankAuctionQueue.filter((i) => i !== auction.tileIndex)
    const base: MonopolyState = {
      ...state,
      auction: null,
      turnPhase: 'RESOLVE',
      bankAuctionQueue: remainingQueue,
      eventLog: [`Auction ended without bids for ${tileByIndex(auction.tileIndex).name}`, ...state.eventLog].slice(0, 10),
    }
    if (remainingQueue.length > 0) {
      return startAuction(base, remainingQueue[0] as number)
    }
    return base
  }

  const winnerId = auction.highestBidderId
  const players = [...state.players]
  const idx = players.findIndex((p) => p.id === winnerId)
  if (idx < 0) return { ...state, auction: null, turnPhase: 'RESOLVE' }

  const winner = { ...players[idx], money: players[idx].money - auction.highestBid }
  players[idx] = winner

  const remainingQueue = state.bankAuctionQueue.filter((i) => i !== auction.tileIndex)
  let next: MonopolyState = {
    ...state,
    players,
    ownership: {
      ...state.ownership,
      [auction.tileIndex]: {
        ...(state.ownership[auction.tileIndex] as OwnershipState),
        ownerId: winner.id,
        mortgaged: false,
        level: 0,
      },
    },
    auction: null,
    bankAuctionQueue: remainingQueue,
    turnPhase: 'RESOLVE',
    eventLog: [`${winner.name} won auction for $${auction.highestBid}`, ...state.eventLog].slice(0, 10),
  }

  if (winner.money < 0) {
    next = {
      ...next,
      debt: {
        debtorId: winner.id,
        creditorId: 'bank',
        amount: Math.abs(winner.money),
        reason: 'Auction payment debt',
      },
      turnPhase: 'DEBT',
    }
  }

  if (next.bankAuctionQueue.length > 0 && !next.debt) {
    return startAuction(next, next.bankAuctionQueue[0] as number)
  }

  return next
}

export function endTurn(state: MonopolyState): MonopolyState {
  const player = activePlayer(state)
  const doubles = state.lastDice.d1 > 0 && state.lastDice.d1 === state.lastDice.d2

  if (player.inJail) {
    const nextIndex = nextAlivePlayerIndex(state.players, state.currentPlayerIndex)
    return {
      ...state,
      currentPlayerIndex: nextIndex,
      turnPhase: 'ROLL',
      lastDice: { d1: 0, d2: 0, total: 0 },
      pendingMovePath: [],
    }
  }

  if (doubles && !player.bankrupt) {
    const players = [...state.players]
    players[state.currentPlayerIndex] = { ...players[state.currentPlayerIndex], consecutiveDoubles: player.consecutiveDoubles }
    return {
      ...state,
      players,
      turnPhase: 'ROLL',
      pendingMovePath: [],
      eventLog: [`${player.name} rolled doubles and plays again`, ...state.eventLog].slice(0, 10),
    }
  }

  const players = [...state.players]
  players[state.currentPlayerIndex] = { ...players[state.currentPlayerIndex], consecutiveDoubles: 0 }

  const nextIndex = nextAlivePlayerIndex(players, state.currentPlayerIndex)
  const aliveCount = players.filter((p) => !p.bankrupt).length

  return {
    ...state,
    players,
    currentPlayerIndex: nextIndex,
    turnPhase: aliveCount <= 1 ? 'GAME_OVER' : 'ROLL',
    lastDice: { d1: 0, d2: 0, total: 0 },
    pendingMovePath: [],
  }
}

export function jailPayAndRoll(state: MonopolyState): RollResult {
  const p = activePlayer(state)
  if (!p.inJail) return rollDice(state)
  let next: MonopolyState = transferMoney(state, p.id, 'bank', 50, 'Jail fee')
  const players = [...next.players]
  const idx = next.currentPlayerIndex
  players[idx] = { ...players[idx], inJail: false, jailTurns: 0 }
  next = { ...next, players, turnPhase: 'ROLL' }
  return rollWithDice(next, PhaserLikeRand(1, 6), PhaserLikeRand(1, 6))
}

export function jailUseCardAndRoll(state: MonopolyState, deck: 'chance' | 'community'): RollResult {
  const players = [...state.players]
  const idx = state.currentPlayerIndex
  const p = { ...players[idx] }
  if (!p.inJail) return rollDice(state)

  if (deck === 'chance' && p.getOutOfJailFreeChance > 0) {
    p.getOutOfJailFreeChance -= 1
  }
  if (deck === 'community' && p.getOutOfJailFreeCommunity > 0) {
    p.getOutOfJailFreeCommunity -= 1
  }

  p.inJail = false
  p.jailTurns = 0
  players[idx] = p

  let next: MonopolyState = { ...state, players, turnPhase: 'ROLL' }
  if (deck === 'chance') {
    next.deckState = { ...next.deckState, chance: [...next.deckState.chance, 'ch-8'] }
    next.heldCards.chanceOwnerId = null
  } else {
    next.deckState = { ...next.deckState, community: [...next.deckState.community, 'cc-5'] }
    next.heldCards.communityOwnerId = null
  }

  return rollWithDice(next, PhaserLikeRand(1, 6), PhaserLikeRand(1, 6))
}

export function jailTryRoll(state: MonopolyState): RollResult {
  const p = activePlayer(state)
  if (!p.inJail) return rollDice(state)

  const d1 = PhaserLikeRand(1, 6)
  const d2 = PhaserLikeRand(1, 6)
  const total = d1 + d2
  const isDouble = d1 === d2

  let next: MonopolyState = {
    ...state,
    lastDice: { d1, d2, total },
    eventLog: [`${p.name} jail roll ${d1}+${d2}`, ...state.eventLog].slice(0, 10),
  }

  const players = [...next.players]
  const idx = next.currentPlayerIndex
  let player = { ...players[idx] }

  if (isDouble) {
    player.inJail = false
    player.jailTurns = 0
    players[idx] = player
    next = { ...next, players, turnPhase: 'ROLL' }
    return rollWithDice(next, d1, d2)
  }

  player.jailTurns += 1
  players[idx] = player
  next = { ...next, players }

  if (player.jailTurns >= 3) {
    next = transferMoney(next, player.id, 'bank', 50, 'Forced jail payment')
    const p2 = [...next.players]
    p2[idx] = { ...p2[idx], inJail: false, jailTurns: 0 }
    next = { ...next, players: p2, turnPhase: 'ROLL' }
    return rollWithDice(next, PhaserLikeRand(1, 6), PhaserLikeRand(1, 6))
  }

  return {
    state: endTurn({ ...next, turnPhase: 'RESOLVE' }),
    path: [] as number[],
  }
}

export function playerOwnedTiles(state: MonopolyState, playerId: string) {
  return Object.entries(state.ownership)
    .filter(([, own]) => own.ownerId === playerId)
    .map(([idx]) => Number(idx))
    .sort((a, b) => a - b)
}

function colorGroupOf(tileIndex: number) {
  const tile = tileByIndex(tileIndex)
  return tile.buyable?.colorGroup
}

export function canMortgage(state: MonopolyState, playerId: string, tileIndex: number) {
  const own = state.ownership[tileIndex]
  const tile = tileByIndex(tileIndex)
  if (!own || own.ownerId !== playerId || own.mortgaged) return false

  if (!tile.buyable) return false
  const group = tile.buyable.colorGroup
  if (!group) return true

  const hasBuildings = COLOR_GROUPS[group].some((idx) => (state.ownership[idx]?.level ?? 0) > 0)
  return !hasBuildings
}

export function mortgageTile(state: MonopolyState, playerId: string, tileIndex: number): MonopolyState {
  if (!canMortgage(state, playerId, tileIndex)) return state
  const tile = tileByIndex(tileIndex)
  const own = state.ownership[tileIndex] as OwnershipState

  return {
    ...state,
    ownership: {
      ...state.ownership,
      [tileIndex]: {
        ...own,
        mortgaged: true,
      },
    },
    players: state.players.map((p) => (p.id === playerId ? { ...p, money: p.money + (tile.buyable?.mortgageValue ?? 0) } : p)),
    eventLog: [`${byId(state.players, playerId)?.name} mortgaged ${tile.name}`, ...state.eventLog].slice(0, 10),
  }
}

export function unmortgageTile(state: MonopolyState, playerId: string, tileIndex: number): MonopolyState {
  const own = state.ownership[tileIndex]
  const tile = tileByIndex(tileIndex)
  if (!own || own.ownerId !== playerId || !own.mortgaged || !tile.buyable) return state
  const fee = ceil10p(tile.buyable.mortgageValue)
  const player = byId(state.players, playerId)
  if (!player || player.money < fee) return state

  return {
    ...state,
    ownership: {
      ...state.ownership,
      [tileIndex]: {
        ...own,
        mortgaged: false,
      },
    },
    players: state.players.map((p) => (p.id === playerId ? { ...p, money: p.money - fee } : p)),
    eventLog: [`${player.name} unmortgaged ${tile.name} for $${fee}`, ...state.eventLog].slice(0, 10),
  }
}

export function canBuild(state: MonopolyState, playerId: string, tileIndex: number) {
  const tile = tileByIndex(tileIndex)
  const own = state.ownership[tileIndex]
  if (!tile.buyable || tile.buyable.kind !== 'property' || !tile.buyable.colorGroup || !own) return false
  if (own.ownerId !== playerId || own.mortgaged) return false

  const group = tile.buyable.colorGroup
  if (!ownsFullGroup(state, playerId, group)) return false

  const levels = COLOR_GROUPS[group].map((idx) => state.ownership[idx]?.level ?? 0)
  const currentLevel = own.level
  const minLevel = Math.min(...levels)
  if (currentLevel > minLevel) return false
  if (currentLevel >= 5) return false

  const cost = tile.buyable.houseCost ?? 0
  const player = byId(state.players, playerId)
  if (!player || player.money < cost) return false

  if (!state.settings.unlimitedBuildings) {
    if (currentLevel <= 3 && state.housesLeft <= 0) return false
    if (currentLevel === 4 && state.hotelsLeft <= 0) return false
  }

  return true
}

export function buildOnTile(state: MonopolyState, playerId: string, tileIndex: number): MonopolyState {
  if (!canBuild(state, playerId, tileIndex)) return state
  const tile = tileByIndex(tileIndex)
  const own = state.ownership[tileIndex] as OwnershipState
  const cost = tile.buyable?.houseCost ?? 0

  let housesLeft = state.housesLeft
  let hotelsLeft = state.hotelsLeft

  if (!state.settings.unlimitedBuildings) {
    if (own.level <= 3) housesLeft -= 1
    if (own.level === 4) {
      hotelsLeft -= 1
      housesLeft += 4
    }
  }

  return {
    ...state,
    ownership: {
      ...state.ownership,
      [tileIndex]: {
        ...own,
        level: own.level + 1,
      },
    },
    players: state.players.map((p) => (p.id === playerId ? { ...p, money: p.money - cost } : p)),
    housesLeft,
    hotelsLeft,
    eventLog: [`${byId(state.players, playerId)?.name} built on ${tile.name}`, ...state.eventLog].slice(0, 10),
  }
}

export function canSellBuilding(state: MonopolyState, playerId: string, tileIndex: number) {
  const tile = tileByIndex(tileIndex)
  const own = state.ownership[tileIndex]
  if (!tile.buyable || tile.buyable.kind !== 'property' || !tile.buyable.colorGroup || !own) return false
  if (own.ownerId !== playerId) return false
  if (own.level <= 0) return false

  const group = tile.buyable.colorGroup
  const levels = COLOR_GROUPS[group].map((idx) => state.ownership[idx]?.level ?? 0)
  const currentLevel = own.level
  const maxLevel = Math.max(...levels)
  return currentLevel >= maxLevel
}

export function sellBuilding(state: MonopolyState, playerId: string, tileIndex: number): MonopolyState {
  if (!canSellBuilding(state, playerId, tileIndex)) return state
  const tile = tileByIndex(tileIndex)
  const own = state.ownership[tileIndex] as OwnershipState
  const refund = Math.floor((tile.buyable?.houseCost ?? 0) / 2)

  let housesLeft = state.housesLeft
  let hotelsLeft = state.hotelsLeft

  if (!state.settings.unlimitedBuildings) {
    if (own.level <= 4) housesLeft += 1
    if (own.level === 5) {
      hotelsLeft += 1
      housesLeft -= 4
    }
  }

  return {
    ...state,
    ownership: {
      ...state.ownership,
      [tileIndex]: {
        ...own,
        level: own.level - 1,
      },
    },
    players: state.players.map((p) => (p.id === playerId ? { ...p, money: p.money + refund } : p)),
    housesLeft,
    hotelsLeft,
    eventLog: [`${byId(state.players, playerId)?.name} sold building on ${tile.name}`, ...state.eventLog].slice(0, 10),
  }
}

export function proposeTrade(state: MonopolyState, offer: TradeOffer): MonopolyState {
  return {
    ...state,
    trade: offer,
    turnPhase: 'TRADE',
    eventLog: [`Trade proposed: ${byId(state.players, offer.fromId)?.name} ↔ ${byId(state.players, offer.toId)?.name}`, ...state.eventLog].slice(0, 10),
  }
}

function canTradeProperty(state: MonopolyState, ownerId: string, tileIndex: number) {
  const own = state.ownership[tileIndex]
  if (!own || own.ownerId !== ownerId) return false
  const group = colorGroupOf(tileIndex)
  if (!group) return true
  return COLOR_GROUPS[group].every((idx) => (state.ownership[idx]?.level ?? 0) === 0)
}

export function acceptTrade(state: MonopolyState, playerId: string): MonopolyState {
  if (!state.trade) return state
  const trade = { ...state.trade }
  if (playerId === trade.fromId) trade.acceptedByFrom = true
  if (playerId === trade.toId) trade.acceptedByTo = true

  if (!trade.acceptedByFrom || !trade.acceptedByTo) {
    return { ...state, trade }
  }

  const from = byId(state.players, trade.fromId)
  const to = byId(state.players, trade.toId)
  if (!from || !to) return { ...state, trade: null, turnPhase: 'RESOLVE' }

  if (
    trade.offerPropertyIndices.some((idx) => !canTradeProperty(state, trade.fromId, idx)) ||
    trade.requestPropertyIndices.some((idx) => !canTradeProperty(state, trade.toId, idx))
  ) {
    return {
      ...state,
      trade: null,
      turnPhase: 'RESOLVE',
      eventLog: ['Trade canceled: properties with buildings cannot be traded', ...state.eventLog].slice(0, 10),
    }
  }

  const players = state.players.map((p) => ({ ...p }))
  const fromIdx = players.findIndex((p) => p.id === from.id)
  const toIdx = players.findIndex((p) => p.id === to.id)

  if (players[fromIdx].money < trade.offerMoney || players[toIdx].money < trade.requestMoney) {
    return {
      ...state,
      trade: null,
      turnPhase: 'RESOLVE',
      eventLog: ['Trade canceled: insufficient funds', ...state.eventLog].slice(0, 10),
    }
  }

  players[fromIdx].money -= trade.offerMoney
  players[fromIdx].money += trade.requestMoney
  players[toIdx].money += trade.offerMoney
  players[toIdx].money -= trade.requestMoney

  if (trade.offerJailCardChance && players[fromIdx].getOutOfJailFreeChance > 0) {
    players[fromIdx].getOutOfJailFreeChance -= 1
    players[toIdx].getOutOfJailFreeChance += 1
  }
  if (trade.offerJailCardCommunity && players[fromIdx].getOutOfJailFreeCommunity > 0) {
    players[fromIdx].getOutOfJailFreeCommunity -= 1
    players[toIdx].getOutOfJailFreeCommunity += 1
  }
  if (trade.requestJailCardChance && players[toIdx].getOutOfJailFreeChance > 0) {
    players[toIdx].getOutOfJailFreeChance -= 1
    players[fromIdx].getOutOfJailFreeChance += 1
  }
  if (trade.requestJailCardCommunity && players[toIdx].getOutOfJailFreeCommunity > 0) {
    players[toIdx].getOutOfJailFreeCommunity -= 1
    players[fromIdx].getOutOfJailFreeCommunity += 1
  }

  const ownership = { ...state.ownership }
  for (const idx of trade.offerPropertyIndices) {
    ownership[idx] = { ...ownership[idx], ownerId: trade.toId }
  }
  for (const idx of trade.requestPropertyIndices) {
    ownership[idx] = { ...ownership[idx], ownerId: trade.fromId }
  }

  return {
    ...state,
    players,
    ownership,
    trade: null,
    turnPhase: 'RESOLVE',
    eventLog: [`Trade completed: ${from.name} ↔ ${to.name}`, ...state.eventLog].slice(0, 10),
  }
}

export function cancelTrade(state: MonopolyState): MonopolyState {
  if (!state.trade) return state
  return {
    ...state,
    trade: null,
    turnPhase: 'RESOLVE',
    eventLog: ['Trade canceled', ...state.eventLog].slice(0, 10),
  }
}

export function settleDebt(state: MonopolyState): MonopolyState {
  if (!state.debt) return state
  const debtor = byId(state.players, state.debt.debtorId)
  if (!debtor) return { ...state, debt: null, turnPhase: 'RESOLVE' }
  if (debtor.money >= 0) {
    return { ...state, debt: null, turnPhase: 'RESOLVE' }
  }
  return state
}

export function declareBankruptcy(state: MonopolyState): MonopolyState {
  if (!state.debt) return state
  const debt = state.debt
  const players = state.players.map((p) => ({ ...p }))
  const debtorIdx = players.findIndex((p) => p.id === debt.debtorId)
  if (debtorIdx < 0) return state

  const debtor = players[debtorIdx] as PlayerState
  const debtorCash = debtor.money
  debtor.bankrupt = true
  debtor.money = 0

  const ownership = { ...state.ownership }
  const debtorTiles = Object.keys(ownership)
    .map(Number)
    .filter((idx) => ownership[idx]?.ownerId === debtor.id)

  if (debt.creditorId === 'bank') {
    for (const idx of debtorTiles) {
      ownership[idx] = { ...ownership[idx], ownerId: null, mortgaged: false, level: 0 }
    }
  } else {
    const creditor = players.find((p) => p.id === debt.creditorId)
    if (creditor) {
      creditor.money += Math.max(0, debtorCash)
      for (const idx of debtorTiles) {
        ownership[idx] = { ...ownership[idx], ownerId: creditor.id }
      }
    }
  }

  const alive = players.filter((p) => !p.bankrupt)
  const gameOver = alive.length <= 1

  let next: MonopolyState = {
    ...state,
    players,
    ownership,
    debt: null,
    bankAuctionQueue: debt.creditorId === 'bank' ? debtorTiles : [],
    turnPhase: gameOver ? 'GAME_OVER' : 'RESOLVE',
    eventLog: [`${debtor.name} is bankrupt`, ...state.eventLog].slice(0, 10),
  }

  if (!gameOver && next.bankAuctionQueue.length > 0) {
    next = startAuction(next, next.bankAuctionQueue[0] as number)
  }

  return next
}

export function winner(state: MonopolyState) {
  const alive = state.players.filter((p) => !p.bankrupt)
  if (alive.length === 1) return alive[0]
  return [...state.players].sort((a, b) => b.money - a.money)[0] ?? null
}

function PhaserLikeRand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
