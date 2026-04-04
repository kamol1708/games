import { apiRequest } from './apiClient'
import { getAccessToken, getAuthSession } from './localAuth'

export type GameFeedbackGameKey =
  | 'quiz-battle'
  | 'frog-pond'
  | 'treasure-hunt'
  | 'memory-rush'
  | 'football-challenge'
  | 'tug-of-war'
  | 'image-quiz'
  | 'word-search'
  | 'wheel-of-fortune'
  | 'flag-race'
  | 'flag-player-race'
  | 'bilim-poyezdi'
  | 'mario-math-platformer'
  | 'bumbuzzle'
  | 'jungle-board-3d'
  | 'pac-grid-arcade'
  | 'kim-millioner'
  | 'classroom-team-quiz'
  | 'monopoly-calibration'
  | 'learning'

export type GameFeedbackThread = {
  id: string
  gameKey: GameFeedbackGameKey
  gameTitle: string
  userId: string
  userName: string
  message: string
  status: 'pending' | 'approved'
  createdAt: number
  approvedBy?: string
  approvedByName?: string
  approvedAt?: number
}

type FeedbackListResponse = {
  items: GameFeedbackThread[]
}

type SubmitFeedbackPayload = {
  game_key: GameFeedbackGameKey
  game_title: string
  message: string
}

type SubmitGameFeedbackArgs = {
  gameKey: GameFeedbackGameKey
  gameTitle: string
  message: string
}

type ApproveGameFeedbackArgs = {
  id: string
}

type RouteMeta = {
  key: GameFeedbackGameKey
  title: string
  soloReady: boolean
}

const STORAGE_KEY = 'game-feedback-threads-v1'
const CHANGE_EVENT = 'game-feedback:changed'

const routeMetaByPath: Record<string, RouteMeta> = {
  '/games/quiz-battle': { key: 'quiz-battle', title: 'Quiz Battle', soloReady: true },
  '/games/frog-pond': { key: 'frog-pond', title: 'Frog Pond Quiz', soloReady: true },
  '/games/treasure-hunt': { key: 'treasure-hunt', title: 'Treasure Hunt', soloReady: true },
  '/games/memory-rush': { key: 'memory-rush', title: 'Memory Rush', soloReady: true },
  '/games/football-challenge': { key: 'football-challenge', title: 'Football Challenge', soloReady: true },
  '/games/tug-of-war': { key: 'tug-of-war', title: 'Tug of War', soloReady: false },
  '/games/image-quiz': { key: 'image-quiz', title: 'Image Quiz', soloReady: true },
  '/games/word-search': { key: 'word-search', title: 'Word Search', soloReady: true },
  '/games/wheel-of-fortune': { key: 'wheel-of-fortune', title: 'Wheel of Fortune', soloReady: false },
  '/games/flag-race': { key: 'flag-race', title: 'Flag Race', soloReady: false },
  '/games/flag-player-race': { key: 'flag-player-race', title: 'Flag Player Race', soloReady: true },
  '/games/bilim-poyezdi': { key: 'bilim-poyezdi', title: 'Bilim Poyezdi', soloReady: false },
  '/games/mario-math-platformer': { key: 'mario-math-platformer', title: 'Mario Math Platformer', soloReady: true },
  '/games/bumbuzzle': { key: 'bumbuzzle', title: 'Bumbuzzle', soloReady: false },
  '/games/jungle-board-3d': { key: 'jungle-board-3d', title: 'Jungle Board 3D', soloReady: true },
  '/games/pac-grid-arcade': { key: 'pac-grid-arcade', title: 'Pac Grid Arcade', soloReady: true },
  '/games/kim-millioner': { key: 'kim-millioner', title: 'Kim Millioner', soloReady: false },
  '/games/classroom-team-quiz': { key: 'classroom-team-quiz', title: 'Classroom Team Quiz', soloReady: false },
  '/games/monopoly-calibration': { key: 'monopoly-calibration', title: 'School City Monopoly', soloReady: false },
  '/games/learning': { key: 'learning', title: 'Learning Hub', soloReady: true },
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizeThread(input: unknown): GameFeedbackThread | null {
  if (!input || typeof input !== 'object') return null
  const value = input as Partial<GameFeedbackThread>
  if (!value.id || !value.gameKey || !value.gameTitle || !value.userId || !value.userName || !value.message) {
    return null
  }

  return {
    id: String(value.id),
    gameKey: value.gameKey as GameFeedbackGameKey,
    gameTitle: String(value.gameTitle),
    userId: String(value.userId),
    userName: String(value.userName),
    message: String(value.message),
    status: value.status === 'approved' ? 'approved' : 'pending',
    createdAt: Number(value.createdAt) || Date.now(),
    approvedBy: value.approvedBy ? String(value.approvedBy) : undefined,
    approvedByName: value.approvedByName ? String(value.approvedByName) : undefined,
    approvedAt: value.approvedAt ? Number(value.approvedAt) : undefined,
  }
}

function readThreads() {
  if (!canUseStorage()) return [] as GameFeedbackThread[]
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown[]
    return Array.isArray(parsed)
      ? parsed.map((item) => normalizeThread(item)).filter((item): item is GameFeedbackThread => Boolean(item))
      : []
  } catch {
    return []
  }
}

function emitChange() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

function writeThreads(items: GameFeedbackThread[]) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    emitChange()
  } catch {
    // ignore local storage failures
  }
}

function sortThreads(items: GameFeedbackThread[]) {
  return [...items].sort((a, b) => {
    const aStamp = a.approvedAt ?? a.createdAt
    const bStamp = b.approvedAt ?? b.createdAt
    return bStamp - aStamp
  })
}

function upsertThreads(items: GameFeedbackThread[]) {
  const merged = new Map(readThreads().map((item) => [item.id, item]))
  items.forEach((item) => merged.set(item.id, item))
  writeThreads(sortThreads(Array.from(merged.values())))
}

export function getGameFeedbackStore() {
  return sortThreads(readThreads())
}

export function getGameFeedbackByKey(gameKey: GameFeedbackGameKey) {
  return getGameFeedbackStore().filter((item) => item.gameKey === gameKey)
}

export function subscribeGameFeedback(listener: () => void) {
  if (typeof window === 'undefined') return () => {}

  const onStorage = () => listener()
  const onChange = () => listener()

  window.addEventListener('storage', onStorage)
  window.addEventListener(CHANGE_EVENT, onChange)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

export function getFeedbackMetaByPath(pathname: string) {
  return routeMetaByPath[pathname] ?? null
}

export async function syncGameFeedbackFromBackend() {
  const token = getAccessToken()
  if (!token) {
    return getGameFeedbackStore()
  }

  try {
    const payload = await apiRequest<FeedbackListResponse>('/game-feedback', { method: 'GET' }, token)
    const items = Array.isArray(payload.items)
      ? payload.items.map((item) => normalizeThread(item)).filter((item): item is GameFeedbackThread => Boolean(item))
      : []
    upsertThreads(items)
  } catch {
    // keep local cache if backend sync is unavailable
  }

  return getGameFeedbackStore()
}

export async function submitGameFeedback({ gameKey, gameTitle, message }: SubmitGameFeedbackArgs) {
  const session = getAuthSession()
  if (!session) {
    throw new Error('Izoh yuborish uchun login kerak.')
  }

  const cleanMessage = message.trim()
  if (!cleanMessage) {
    throw new Error('Izoh matnini kiriting.')
  }

  const optimistic: GameFeedbackThread = {
    id: `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    gameKey,
    gameTitle,
    userId: session.userId,
    userName: session.fullName || session.email,
    message: cleanMessage,
    status: 'approved',
    createdAt: Date.now(),
    approvedBy: session.userId,
    approvedByName: session.fullName || session.email,
    approvedAt: Date.now(),
  }

  upsertThreads([optimistic])

  const token = getAccessToken()
  if (!token) {
    return optimistic
  }

  try {
    const payload = await apiRequest<GameFeedbackThread>(
      '/game-feedback',
      {
        method: 'POST',
        body: JSON.stringify({
          game_key: gameKey,
          game_title: gameTitle,
          message: cleanMessage,
        } satisfies SubmitFeedbackPayload),
      },
      token,
    )

    const saved = normalizeThread(payload)
    if (saved) {
      upsertThreads([saved])
      return saved
    }
  } catch {
    // keep optimistic local item if backend is temporarily unavailable
  }

  return optimistic
}

export async function approveGameFeedback({ id }: ApproveGameFeedbackArgs) {
  const session = getAuthSession()
  if (!session) {
    throw new Error('Teacher sessiya topilmadi.')
  }

  const local = readThreads()
  const current = local.find((item) => item.id === id)
  if (!current) {
    throw new Error('Xabar topilmadi.')
  }

  const optimistic: GameFeedbackThread = {
    ...current,
    status: 'approved',
    approvedBy: session.userId,
    approvedByName: session.fullName || session.email,
    approvedAt: Date.now(),
  }

  upsertThreads([optimistic])

  const token = getAccessToken()
  if (!token) {
    return optimistic
  }

  try {
    const payload = await apiRequest<GameFeedbackThread>(
      `/game-feedback/${encodeURIComponent(id)}/approve`,
      {
        method: 'PUT',
      },
      token,
    )

    const saved = normalizeThread(payload)
    if (saved) {
      upsertThreads([saved])
      return saved
    }
  } catch {
    // keep optimistic local update
  }

  return optimistic
}
