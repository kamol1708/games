import { apiRequest } from './apiClient'
import { getAccessToken } from './localAuth'

export type TeacherGameKey =
  | 'treasure-hunt'
  | 'quiz-battle'
  | 'wheel-of-fortune'
  | 'tug-of-war'
  | 'football-challenge'
  | 'word-search'
  | 'memory-rush'
  | 'flag-race'
  | 'flag-player-race'
  | 'learning'
  | 'bilim-poyezdi'

type StoreShape = Partial<Record<TeacherGameKey, unknown[]>>
type GameQuestionsPayload = { game_key: string; questions: unknown[] }

const STORAGE_KEY = 'teacher-content-bank-v1'

export const SYNCABLE_GAME_KEYS: TeacherGameKey[] = [
  'treasure-hunt',
  'quiz-battle',
  'wheel-of-fortune',
  'tug-of-war',
  'football-challenge',
  'word-search',
  'memory-rush',
  'flag-race',
  'flag-player-race',
  'learning',
  'bilim-poyezdi',
]

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readStore(): StoreShape {
  if (!canUseStorage()) {
    return {}
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw) as StoreShape
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function getTeacherContentStore(): StoreShape {
  return readStore()
}

function writeStore(store: StoreShape) {
  if (!canUseStorage()) {
    return
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // ignore storage write errors (quota/private mode)
  }
}

export function getTeacherItems<T>(key: TeacherGameKey): T[] {
  const store = readStore()
  const list = store[key]
  return Array.isArray(list) ? (list as T[]) : []
}

export function setTeacherItems<T>(key: TeacherGameKey, items: T[]) {
  const store = readStore()
  store[key] = items
  writeStore(store)
}

export function addTeacherItem<T>(key: TeacherGameKey, item: T) {
  const prev = getTeacherItems<T>(key)
  setTeacherItems(key, [...prev, item])
}

export function clearTeacherItems(key: TeacherGameKey) {
  const store = readStore()
  delete store[key]
  writeStore(store)
}

export function removeTeacherItemAt(key: TeacherGameKey, index: number) {
  const prev = getTeacherItems(key)
  if (index < 0 || index >= prev.length) {
    return
  }
  const next = [...prev.slice(0, index), ...prev.slice(index + 1)]
  setTeacherItems(key, next)
}

function requireToken() {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Session topilmadi. Qayta login qiling.')
  }
  return token
}

export async function syncTeacherItemsFromBackend<T>(key: TeacherGameKey) {
  const token = requireToken()
  const payload = await apiRequest<GameQuestionsPayload>(`/game-questions/${encodeURIComponent(key)}`, { method: 'GET' }, token)
  const next = Array.isArray(payload.questions) ? (payload.questions as T[]) : []
  setTeacherItems(key, next)
  return next
}

export async function saveTeacherItemsToBackend<T>(key: TeacherGameKey, items: T[]) {
  const token = requireToken()
  const payload = await apiRequest<GameQuestionsPayload>(
    `/game-questions/${encodeURIComponent(key)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ questions: items }),
    },
    token,
  )
  const next = Array.isArray(payload.questions) ? (payload.questions as T[]) : items
  setTeacherItems(key, next)
  return next
}

export async function syncAllTeacherContentFromBackend(keys: TeacherGameKey[] = SYNCABLE_GAME_KEYS) {
  await Promise.all(
    keys.map(async (key) => {
      try {
        await syncTeacherItemsFromBackend(key)
      } catch {
        // leave local copy as-is if one key fails
      }
    }),
  )
}
