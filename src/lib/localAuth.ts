import { apiRequest } from './apiClient'

export type LocalUserRole = 'teacher' | 'admin'

export type LocalUser = {
  id: string
  fullName: string
  email: string
  password?: string
  role: LocalUserRole
  createdAt: number
}

export type AuthSession = {
  userId: string
  email: string
  role: LocalUserRole
  roles: string[]
  fullName: string
  accessToken: string
  refreshToken: string
}

type AuthResult =
  | { ok: true; session: AuthSession }
  | { ok: false; message: string }

type LoginPayload = {
  access_token: string
  refresh_token: string
  token_type: string
}

type CurrentUserPayload = {
  id: string
  email: string
  username: string
  roles: string[]
}

const SESSION_KEY = 'gamehub_auth_session_v2'
const USERS_CACHE_KEY = 'gamehub_users_cache_v2'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readUsersCache(): LocalUser[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(USERS_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalUser[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeUsersCache(users: LocalUser[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(users))
}

function saveUserToCache(user: LocalUser) {
  const prev = readUsersCache()
  const existingIdx = prev.findIndex((item) => item.id === user.id)
  if (existingIdx < 0) {
    writeUsersCache([user, ...prev])
    return
  }
  const next = [...prev]
  next[existingIdx] = user
  writeUsersCache(next)
}

function detectRole(roles: string[]): LocalUserRole | null {
  if (roles.includes('admin')) return 'admin'
  if (roles.includes('teacher')) return 'teacher'
  return null
}

function normalizeUsername(name: string, email: string) {
  const clean = name.trim()
  if (clean.length >= 2) return clean
  return email.split('@')[0] || 'teacher'
}

function setSession(session: AuthSession | null) {
  if (!canUseStorage()) return
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY)
  } else {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
  window.dispatchEvent(new Event('storage'))
}

async function fetchCurrentUser(accessToken: string) {
  return apiRequest<CurrentUserPayload>('/users/me', { method: 'GET' }, accessToken)
}

async function buildSession(email: string, payload: LoginPayload): Promise<AuthSession> {
  const me = await fetchCurrentUser(payload.access_token)
  const roles = Array.isArray(me.roles) ? me.roles : []
  const role = detectRole(roles)

  if (!role) {
    throw new Error('Akkountda teacher/admin roli topilmadi.')
  }

  const session: AuthSession = {
    userId: me.id,
    email: me.email || email,
    role,
    roles,
    fullName: me.username || normalizeUsername('', me.email || email),
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
  }

  saveUserToCache({
    id: session.userId,
    fullName: session.fullName,
    email: session.email,
    role: session.role,
    createdAt: Date.now(),
  })

  setSession(session)
  return session
}

export function getRegisteredTeachers() {
  return readUsersCache().filter((u) => u.role === 'teacher' || u.role === 'admin')
}

export function getRegisteredStudents() {
  return [] as LocalUser[]
}

export function getAuthSession(): AuthSession | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed?.accessToken || !parsed.userId || !parsed.role) return null
    return parsed
  } catch {
    return null
  }
}

export function getAccessToken() {
  return getAuthSession()?.accessToken ?? ''
}

export async function logout() {
  const session = getAuthSession()
  if (session?.accessToken) {
    try {
      await apiRequest('/auth/logout', { method: 'POST' }, session.accessToken)
    } catch {
      // ignore network/logout API failures
    }
  }
  setSession(null)
}

export async function registerTeacher(input: { fullName: string; email: string; password: string }): Promise<AuthResult> {
  const fullName = input.fullName.trim()
  const email = input.email.trim().toLowerCase()
  const password = input.password

  if (!fullName) return { ok: false, message: 'Ism kiriting.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Email noto'g'ri." }
  if (password.length < 4) return { ok: false, message: "Parol kamida 4 ta belgi bo'lsin." }

  try {
    await apiRequest('/users/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        username: normalizeUsername(fullName, email),
        password,
      }),
    })
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Ro'yxatdan o'tishda xatolik." }
  }

  return loginTeacher({ email, password })
}

export async function loginTeacher(input: { email: string; password: string }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase()
  const password = input.password

  if (!email || !password) {
    return { ok: false, message: 'Email va parol kiriting.' }
  }

  try {
    const payload = await apiRequest<LoginPayload>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    const session = await buildSession(email, payload)
    return { ok: true, session }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Kirishda xatolik." }
  }
}

export async function registerStudent(input: { fullName: string; email: string; password: string }) {
  return registerTeacher(input)
}

export async function loginStudent(input: { email: string; password: string }) {
  return loginTeacher(input)
}

export function isTeacherAuthenticated() {
  const session = getAuthSession()
  return Boolean(session && (session.role === 'teacher' || session.role === 'admin'))
}

export function isUserAuthenticated() {
  return Boolean(getAuthSession())
}
