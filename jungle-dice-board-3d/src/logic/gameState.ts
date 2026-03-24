import type { GameSettings } from './storage'
import type { GamePhase } from './turnMachine'

export type PlayerState = {
  id: 1 | 2
  name: string
  color: string
  step: number
}

export type EventLogItem = {
  id: number
  text: string
}

export type ToastState = {
  text: string
  tone: 'info' | 'trap' | 'ladder' | 'win'
} | null

export type GameState = {
  phase: GamePhase
  currentPlayerIndex: 0 | 1
  players: [PlayerState, PlayerState]
  diceValue: number | null
  rollingStatus: string
  eventLog: EventLogItem[]
  toast: ToastState
  winnerId: 1 | 2 | null
  settings: GameSettings
}

export type GameAction =
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'SET_DICE'; value: number | null }
  | { type: 'SET_ROLLING_STATUS'; text: string }
  | { type: 'SET_PLAYER_STEP'; playerIndex: 0 | 1; step: number }
  | { type: 'NEXT_TURN' }
  | { type: 'ADD_LOG'; text: string }
  | { type: 'SET_TOAST'; toast: ToastState }
  | { type: 'SET_WINNER'; winnerId: 1 | 2 | null }
  | { type: 'SET_SETTINGS'; settings: GameSettings }
  | { type: 'RESET_GAME' }

let nextLogId = 1

export function createInitialState(settings: GameSettings): GameState {
  return {
    phase: 'IDLE',
    currentPlayerIndex: 0,
    players: [
      { id: 1, name: 'Player 1', color: '#38bdf8', step: 1 },
      { id: 2, name: 'Player 2', color: '#fb923c', step: 1 },
    ],
    diceValue: null,
    rollingStatus: 'Ready',
    eventLog: [{ id: nextLogId++, text: 'Game started. Player 1 turn.' }],
    toast: null,
    winnerId: null,
    settings,
  }
}

function addLog(state: GameState, text: string): EventLogItem[] {
  const next = [{ id: nextLogId++, text }, ...state.eventLog]
  return next.slice(0, 5)
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase }
    case 'SET_DICE':
      return { ...state, diceValue: action.value }
    case 'SET_ROLLING_STATUS':
      return { ...state, rollingStatus: action.text }
    case 'SET_PLAYER_STEP': {
      const players = [...state.players] as GameState['players']
      players[action.playerIndex] = { ...players[action.playerIndex], step: action.step }
      return { ...state, players }
    }
    case 'NEXT_TURN':
      return {
        ...state,
        currentPlayerIndex: state.currentPlayerIndex === 0 ? 1 : 0,
        phase: 'IDLE',
        rollingStatus: 'Ready',
      }
    case 'ADD_LOG':
      return { ...state, eventLog: addLog(state, action.text) }
    case 'SET_TOAST':
      return { ...state, toast: action.toast }
    case 'SET_WINNER':
      return { ...state, winnerId: action.winnerId }
    case 'SET_SETTINGS':
      return { ...state, settings: action.settings }
    case 'RESET_GAME':
      return createInitialState(state.settings)
    default:
      return state
  }
}
