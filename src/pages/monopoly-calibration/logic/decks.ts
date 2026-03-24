import type { DeckCard } from './types'

export const CHANCE_CARDS: DeckCard[] = [
  { id: 'ch-1', deck: 'chance', text: 'Advance to GO', action: { type: 'MOVE_TO', tile: 0 } },
  { id: 'ch-2', deck: 'chance', text: 'Go to Illinois Avenue', action: { type: 'MOVE_TO', tile: 24 } },
  { id: 'ch-3', deck: 'chance', text: 'Go to St. Charles Place', action: { type: 'MOVE_TO', tile: 11 } },
  { id: 'ch-4', deck: 'chance', text: 'Advance token to nearest Utility', action: { type: 'MOVE_NEAREST_UTILITY' } },
  { id: 'ch-5', deck: 'chance', text: 'Advance token to nearest Railroad and pay double rent', action: { type: 'MOVE_NEAREST_RAILROAD', doubleRent: true } },
  { id: 'ch-6', deck: 'chance', text: 'Advance token to nearest Railroad and pay double rent', action: { type: 'MOVE_NEAREST_RAILROAD', doubleRent: true } },
  { id: 'ch-7', deck: 'chance', text: 'Bank pays you dividend of $50', action: { type: 'MONEY', amount: 50 } },
  { id: 'ch-8', deck: 'chance', text: 'Get Out of Jail Free', action: { type: 'GET_OUT_OF_JAIL' } },
  { id: 'ch-9', deck: 'chance', text: 'Go Back 3 Spaces', action: { type: 'MOVE_BACK', steps: 3 } },
  { id: 'ch-10', deck: 'chance', text: 'Go to Jail', action: { type: 'GO_TO_JAIL' } },
  { id: 'ch-11', deck: 'chance', text: 'Make general repairs: $25 per house, $100 per hotel', action: { type: 'REPAIRS', houseCost: 25, hotelCost: 100 } },
  { id: 'ch-12', deck: 'chance', text: 'Pay poor tax of $15', action: { type: 'MONEY', amount: -15 } },
  { id: 'ch-13', deck: 'chance', text: 'Take a trip to Reading Railroad', action: { type: 'MOVE_TO', tile: 5 } },
  { id: 'ch-14', deck: 'chance', text: 'Take a walk on Boardwalk', action: { type: 'MOVE_TO', tile: 39 } },
  { id: 'ch-15', deck: 'chance', text: 'Elected chairman: pay each player $50', action: { type: 'MONEY', amount: -50, toEachPlayer: true } },
  { id: 'ch-16', deck: 'chance', text: 'Building loan matures. Collect $150', action: { type: 'MONEY', amount: 150 } },
]

export const COMMUNITY_CARDS: DeckCard[] = [
  { id: 'cc-1', deck: 'community', text: 'Advance to GO', action: { type: 'MOVE_TO', tile: 0 } },
  { id: 'cc-2', deck: 'community', text: 'Bank error in your favor. Collect $200', action: { type: 'MONEY', amount: 200 } },
  { id: 'cc-3', deck: 'community', text: 'Doctor fee. Pay $50', action: { type: 'MONEY', amount: -50 } },
  { id: 'cc-4', deck: 'community', text: 'From sale of stock you get $50', action: { type: 'MONEY', amount: 50 } },
  { id: 'cc-5', deck: 'community', text: 'Get Out of Jail Free', action: { type: 'GET_OUT_OF_JAIL' } },
  { id: 'cc-6', deck: 'community', text: 'Go to Jail', action: { type: 'GO_TO_JAIL' } },
  { id: 'cc-7', deck: 'community', text: 'Grand Opera opening. Collect $50 from every player', action: { type: 'MONEY', amount: 50, fromEachPlayer: true } },
  { id: 'cc-8', deck: 'community', text: 'Holiday Fund matures. Receive $100', action: { type: 'MONEY', amount: 100 } },
  { id: 'cc-9', deck: 'community', text: 'Income tax refund. Collect $20', action: { type: 'MONEY', amount: 20 } },
  { id: 'cc-10', deck: 'community', text: 'It is your birthday. Collect $10 from each player', action: { type: 'MONEY', amount: 10, fromEachPlayer: true } },
  { id: 'cc-11', deck: 'community', text: 'Life insurance matures. Collect $100', action: { type: 'MONEY', amount: 100 } },
  { id: 'cc-12', deck: 'community', text: 'Pay hospital fees of $100', action: { type: 'MONEY', amount: -100 } },
  { id: 'cc-13', deck: 'community', text: 'Pay school fees of $150', action: { type: 'MONEY', amount: -150 } },
  { id: 'cc-14', deck: 'community', text: 'Receive $25 consultancy fee', action: { type: 'MONEY', amount: 25 } },
  { id: 'cc-15', deck: 'community', text: 'You are assessed for street repairs: $40 per house, $115 per hotel', action: { type: 'REPAIRS', houseCost: 40, hotelCost: 115 } },
  { id: 'cc-16', deck: 'community', text: 'You inherit $100', action: { type: 'MONEY', amount: 100 } },
]

export const CARD_BY_ID = new Map<string, DeckCard>([...CHANCE_CARDS, ...COMMUNITY_CARDS].map((c) => [c.id, c]))

function shuffle<T>(items: T[]) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j] as T
    arr[j] = temp as T
  }
  return arr
}

export function createShuffledDeckState() {
  return {
    chance: shuffle(CHANCE_CARDS.map((c) => c.id)),
    community: shuffle(COMMUNITY_CARDS.map((c) => c.id)),
  }
}
