import { apiRequest } from './apiClient'
import { getAccessToken } from './localAuth'

export type TeacherGameKey =
  | 'treasure-hunt'
  | 'quiz-battle'
  | 'wheel-of-fortune'
  | 'tug-of-war'
  | 'frog-pond'
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
const DIRTY_KEYS_STORAGE = 'teacher-content-dirty-v1'
const CHANGE_EVENT = 'teacher-content:changed'

export const SYNCABLE_GAME_KEYS: TeacherGameKey[] = [
  'treasure-hunt',
  'quiz-battle',
  'wheel-of-fortune',
  'tug-of-war',
  'frog-pond',
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

function emitChange(key?: TeacherGameKey) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }))
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
    emitChange()
  } catch {
    // ignore storage write errors (quota/private mode)
  }
}

function readDirtyKeys(): TeacherGameKey[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(DIRTY_KEYS_STORAGE)
    if (!raw) return []
    const parsed = JSON.parse(raw) as TeacherGameKey[]
    return Array.isArray(parsed) ? parsed.filter((key): key is TeacherGameKey => SYNCABLE_GAME_KEYS.includes(key as TeacherGameKey)) : []
  } catch {
    return []
  }
}

function writeDirtyKeys(keys: TeacherGameKey[]) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(DIRTY_KEYS_STORAGE, JSON.stringify(Array.from(new Set(keys))))
  } catch {
    // ignore storage write errors
  }
}

function markKeyDirty(key: TeacherGameKey) {
  writeDirtyKeys([...readDirtyKeys(), key])
}

function clearDirtyKey(key: TeacherGameKey) {
  writeDirtyKeys(readDirtyKeys().filter((item) => item !== key))
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
  emitChange(key)
}

export function addTeacherItem<T>(key: TeacherGameKey, item: T) {
  const prev = getTeacherItems<T>(key)
  setTeacherItems(key, [...prev, item])
}

export function clearTeacherItems(key: TeacherGameKey) {
  const store = readStore()
  delete store[key]
  writeStore(store)
  emitChange(key)
}

export function removeTeacherItemAt(key: TeacherGameKey, index: number) {
  const prev = getTeacherItems(key)
  if (index < 0 || index >= prev.length) {
    return
  }
  const next = [...prev.slice(0, index), ...prev.slice(index + 1)]
  setTeacherItems(key, next)
}

export function subscribeTeacherContent(listener: (key?: TeacherGameKey) => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const onStorage = () => listener()
  const onChange = (event: Event) => {
    const custom = event as CustomEvent<{ key?: TeacherGameKey }>
    listener(custom.detail?.key)
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener(CHANGE_EVENT, onChange as EventListener)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(CHANGE_EVENT, onChange as EventListener)
  }
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
  clearDirtyKey(key)
  return next
}

export async function saveTeacherItemsToBackend<T>(key: TeacherGameKey, items: T[]) {
  // Keep a local durable copy first so questions don't disappear on refresh/network hiccups.
  setTeacherItems(key, items)
  markKeyDirty(key)
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
  clearDirtyKey(key)
  return next
}

export async function flushDirtyTeacherContent(keys: TeacherGameKey[] = readDirtyKeys()) {
  for (const key of keys) {
    const items = getTeacherItems<unknown>(key)
    try {
      await saveTeacherItemsToBackend(key, items)
    } catch {
      // keep dirty flag for next retry
    }
  }
}

export async function syncAllTeacherContentFromBackend(keys: TeacherGameKey[] = SYNCABLE_GAME_KEYS) {
  await flushDirtyTeacherContent(readDirtyKeys())
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
