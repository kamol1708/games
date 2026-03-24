import type { MonopolyState } from './types'

export const MONOPOLY_SAVE_KEY = 'monopoly_save_v1'

export function saveMonopoly(state: MonopolyState) {
  window.localStorage.setItem(MONOPOLY_SAVE_KEY, JSON.stringify(state))
}

export function loadMonopoly(): MonopolyState | null {
  try {
    const raw = window.localStorage.getItem(MONOPOLY_SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<MonopolyState>
    if (!parsed || !Array.isArray(parsed.players)) return null
    return {
      ...(parsed as MonopolyState),
      bankAuctionQueue: Array.isArray(parsed.bankAuctionQueue) ? parsed.bankAuctionQueue : [],
    }
  } catch {
    return null
  }
}

export function clearMonopolySave() {
  window.localStorage.removeItem(MONOPOLY_SAVE_KEY)
}
