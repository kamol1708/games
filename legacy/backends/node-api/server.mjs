import { createServer } from 'node:http'
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json')
const GAME_QUESTIONS_FILE = path.join(DATA_DIR, 'game-questions.json')
const GAME_FEEDBACK_FILE = path.join(DATA_DIR, 'game-feedback.json')
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'subscriptions.json')
const PORT = Number(process.env.API_PORT || 8000)
const HOST = process.env.API_HOST || '127.0.0.1'
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173'
const ALLOWED_ORIGINS = Array.from(
  new Set([
    CLIENT_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:8010',
    'http://127.0.0.1:8010',
  ]),
)
const SEED_ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || 'admin@gamehub.local').trim().toLowerCase()
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin1234'
const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000

function getCorsOrigin(request) {
  const origin = request.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin
  }
  return ALLOWED_ORIGINS[0]
}

function json(request, response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': getCorsOrigin(request),
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  })
  response.end(JSON.stringify(payload))
}

function noContent(request, response) {
  response.writeHead(204, {
    'Access-Control-Allow-Origin': getCorsOrigin(request),
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  })
  response.end()
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) {
    return false
  }

  const [salt, existingHash] = stored.split(':')
  const nextHash = scryptSync(password, salt, 64).toString('hex')
  return timingSafeEqual(Buffer.from(existingHash, 'hex'), Buffer.from(nextHash, 'hex'))
}

async function ensureFile(filePath, fallback) {
  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2))
  }
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

async function writeJson(filePath, payload) {
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2))
}

async function readBody(request) {
  const chunks = []
  for await (const chunk of request) {
    chunks.push(chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('JSON body noto‘g‘ri formatda.')
  }
}

async function loadUsers() {
  return readJson(USERS_FILE, [])
}

async function saveUsers(users) {
  await writeJson(USERS_FILE, users)
}

async function loadSessions() {
  return readJson(SESSIONS_FILE, [])
}

async function saveSessions(sessions) {
  await writeJson(SESSIONS_FILE, sessions)
}

async function loadGameQuestions() {
  return readJson(GAME_QUESTIONS_FILE, {})
}

async function saveGameQuestions(data) {
  await writeJson(GAME_QUESTIONS_FILE, data)
}

async function loadSubscriptions() {
  return readJson(SUBSCRIPTIONS_FILE, [])
}

async function saveSubscriptions(items) {
  await writeJson(SUBSCRIPTIONS_FILE, items)
}

async function loadGameFeedback() {
  return readJson(GAME_FEEDBACK_FILE, [])
}

async function saveGameFeedback(items) {
  await writeJson(GAME_FEEDBACK_FILE, items)
}

function getBearerToken(request) {
  const raw = request.headers.authorization || ''
  if (!raw.startsWith('Bearer ')) {
    return ''
  }
  return raw.slice('Bearer '.length).trim()
}

async function getSessionUser(request) {
  const token = getBearerToken(request)
  if (!token) {
    return null
  }

  const sessions = await loadSessions()
  const session = sessions.find((item) => item.accessToken === token)
  if (!session) {
    return null
  }

  const users = await loadUsers()
  const user = users.find((item) => item.id === session.userId)
  if (!user) {
    return null
  }

  return { user, session, sessions }
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    roles: user.roles,
  }
}

async function seedAdmin() {
  const users = await loadUsers()
  const hasSeedAdmin = users.some((item) => item.email === SEED_ADMIN_EMAIL)
  if (hasSeedAdmin) {
    return
  }

  users.unshift({
    id: randomUUID(),
    email: SEED_ADMIN_EMAIL,
    username: 'Admin',
    passwordHash: hashPassword(SEED_ADMIN_PASSWORD),
    roles: ['admin', 'teacher'],
    createdAt: Date.now(),
  })
  await saveUsers(users)
}

async function bootstrap() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await ensureFile(USERS_FILE, [])
  await ensureFile(SESSIONS_FILE, [])
  await ensureFile(GAME_QUESTIONS_FILE, {})
  await ensureFile(GAME_FEEDBACK_FILE, [])
  await ensureFile(SUBSCRIPTIONS_FILE, [])
  await seedAdmin()
}

function isTeacherLike(user) {
  return Array.isArray(user?.roles) && user.roles.some((role) => role === 'teacher' || role === 'admin')
}

function buildSubscriptionPayload(subscription) {
  if (!subscription) {
    return {
      active: false,
      plan: 'starter',
      expires_at: null,
    }
  }

  return {
    active: subscription.active && subscription.expiresAt > Date.now(),
    plan: subscription.plan,
    expires_at: subscription.expiresAt,
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || `${HOST}:${PORT}`}`)
  const pathname = url.pathname.replace(/\/+$/, '') || '/'

  if (request.method === 'OPTIONS') {
    noContent(request, response)
    return
  }

  try {
    if (pathname === '/health' && request.method === 'GET') {
      json(request, response, 200, { status: 'ok', service: 'gamehub-api' })
      return
    }

    if (pathname === '/' && request.method === 'GET') {
      json(request, response, 200, {
        status: 'ok',
        service: 'gamehub-api',
        message: 'Backend ishlayapti. Frontend uchun http://127.0.0.1:5173 ni oching.',
        endpoints: [
          'GET /health',
          'POST /users/',
          'POST /auth/login',
          'POST /auth/logout',
          'GET /users/me',
          'GET /game-questions/:key',
          'PUT /game-questions/:key',
          'GET /game-feedback',
          'POST /game-feedback',
          'PUT /game-feedback/:id/approve',
          'GET /billing/status',
          'POST /billing/checkout',
          'POST /billing/cancel',
        ],
      })
      return
    }

    if (pathname === '/users' && request.method === 'POST') {
      const body = await readBody(request)
      const email = normalizeEmail(body.email)
      const username = String(body.username || '').trim()
      const password = String(body.password || '')

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        json(request, response, 400, { detail: "Email noto'g'ri." })
        return
      }
      if (username.length < 2) {
        json(request, response, 400, { detail: 'Username kamida 2 belgi bo‘lsin.' })
        return
      }
      if (password.length < 4) {
        json(request, response, 400, { detail: "Parol kamida 4 ta belgi bo'lsin." })
        return
      }

      const users = await loadUsers()
      if (users.some((item) => item.email === email)) {
        json(request, response, 409, { detail: 'Bu email bilan foydalanuvchi mavjud.' })
        return
      }

      const user = {
        id: randomUUID(),
        email,
        username,
        passwordHash: hashPassword(password),
        roles: ['teacher'],
        createdAt: Date.now(),
      }

      users.unshift(user)
      await saveUsers(users)
      json(request, response, 201, publicUser(user))
      return
    }

    if (pathname === '/auth/login' && request.method === 'POST') {
      const body = await readBody(request)
      const email = normalizeEmail(body.email)
      const password = String(body.password || '')
      const users = await loadUsers()
      const user = users.find((item) => item.email === email)

      if (!user || !verifyPassword(password, user.passwordHash)) {
        json(request, response, 401, { detail: "Email yoki parol noto'g'ri." })
        return
      }

      const sessions = await loadSessions()
      const accessToken = randomBytes(32).toString('hex')
      const refreshToken = randomBytes(32).toString('hex')
      sessions.push({
        id: randomUUID(),
        userId: user.id,
        accessToken,
        refreshToken,
        createdAt: Date.now(),
      })
      await saveSessions(sessions)

      json(request, response, 200, {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
      })
      return
    }

    if (pathname === '/auth/logout' && request.method === 'POST') {
      const token = getBearerToken(request)
      if (!token) {
        noContent(request, response)
        return
      }

      const sessions = await loadSessions()
      await saveSessions(sessions.filter((item) => item.accessToken !== token))
      noContent(request, response)
      return
    }

    if (pathname === '/users/me' && request.method === 'GET') {
      const auth = await getSessionUser(request)
      if (!auth) {
        json(request, response, 401, { detail: 'Session topilmadi. Qayta login qiling.' })
        return
      }

      json(request, response, 200, publicUser(auth.user))
      return
    }

    if (pathname.startsWith('/game-questions/') && request.method === 'GET') {
      const auth = await getSessionUser(request)
      if (!auth) {
        json(request, response, 401, { detail: 'Session topilmadi. Qayta login qiling.' })
        return
      }

      const key = decodeURIComponent(pathname.slice('/game-questions/'.length))
      const store = await loadGameQuestions()
      const questions = Array.isArray(store[key]?.questions) ? store[key].questions : []
      json(request, response, 200, { game_key: key, questions })
      return
    }

    if (pathname.startsWith('/game-questions/') && request.method === 'PUT') {
      const auth = await getSessionUser(request)
      if (!auth) {
        json(request, response, 401, { detail: 'Session topilmadi. Qayta login qiling.' })
        return
      }

      const key = decodeURIComponent(pathname.slice('/game-questions/'.length))
      const body = await readBody(request)
      const questions = Array.isArray(body.questions) ? body.questions : []
      const store = await loadGameQuestions()
      store[key] = {
        questions,
        updatedAt: Date.now(),
        updatedBy: auth.user.id,
      }
      await saveGameQuestions(store)
      json(request, response, 200, { game_key: key, questions })
      return
    }

    if (pathname === '/game-feedback' && request.method === 'GET') {
      const auth = await getSessionUser(request)
      if (!auth) {
        json(request, response, 401, { detail: 'Session topilmadi. Qayta login qiling.' })
        return
      }

      const items = await loadGameFeedback()
      const visible = isTeacherLike(auth.user)
        ? items
        : items.filter((item) => item?.status === 'approved' || item?.userId === auth.user.id)
      json(request, response, 200, { items: Array.isArray(visible) ? visible : [] })
      return
    }

    if (pathname === '/game-feedback' && request.method === 'POST') {
      const auth = await getSessionUser(request)
      if (!auth) {
        json(request, response, 401, { detail: 'Session topilmadi. Qayta login qiling.' })
        return
      }

      const body = await readBody(request)
      const gameKey = String(body.game_key || '').trim()
      const message = String(body.message || '').trim()

      if (!gameKey) {
        json(request, response, 400, { detail: 'game_key kerak.' })
        return
      }
      if (!message) {
        json(request, response, 400, { detail: 'message kerak.' })
        return
      }

      const item = {
        id: randomUUID(),
        gameKey,
        gameTitle: String(body.game_title || gameKey).trim() || gameKey,
        userId: auth.user.id,
        userName: auth.user.username || auth.user.email,
        message,
        status: 'pending',
        createdAt: Date.now(),
      }

      const items = await loadGameFeedback()
      items.unshift(item)
      await saveGameFeedback(items)
      json(request, response, 201, item)
      return
    }

    if (pathname.startsWith('/game-feedback/') && pathname.endsWith('/approve') && request.method === 'PUT') {
      const auth = await getSessionUser(request)
      if (!auth) {
        json(request, response, 401, { detail: 'Session topilmadi. Qayta login qiling.' })
        return
      }
      if (!isTeacherLike(auth.user)) {
        json(request, response, 403, { detail: 'Faqat teacher tasdiqlay oladi.' })
        return
      }

      const id = decodeURIComponent(pathname.slice('/game-feedback/'.length, -'/approve'.length))
      const items = await loadGameFeedback()
      const index = items.findIndex((item) => item.id === id)
      if (index < 0) {
        json(request, response, 404, { detail: 'Feedback topilmadi.' })
        return
      }

      const next = {
        ...items[index],
        status: 'approved',
        approvedBy: auth.user.id,
        approvedByName: auth.user.username || auth.user.email,
        approvedAt: Date.now(),
      }
      items[index] = next
      await saveGameFeedback(items)
      json(request, response, 200, next)
      return
    }

    if (pathname === '/billing/status' && request.method === 'GET') {
      const auth = await getSessionUser(request)
      if (!auth) {
        json(request, response, 401, { detail: 'Session topilmadi. Qayta login qiling.' })
        return
      }

      const subscriptions = await loadSubscriptions()
      const subscription = subscriptions.find((item) => item.userId === auth.user.id)
      json(request, response, 200, buildSubscriptionPayload(subscription))
      return
    }

    if (pathname === '/billing/checkout' && request.method === 'POST') {
      const body = await readBody(request)
      const auth = await getSessionUser(request)
      const now = Date.now()
      const plan = ['starter', 'pro', 'team'].includes(body.plan) ? body.plan : 'starter'
      const billingCycle = body.billingCycle === 'yearly' ? 'yearly' : 'monthly'
      const seats = Math.max(1, Math.min(500, Number(body.seats) || 1))
      const method = ['card', 'click', 'payme'].includes(body.method) ? body.method : 'card'
      const email = normalizeEmail(body.email || auth?.user?.email)
      const fullName = String(body.fullName || auth?.user?.username || '').trim()

      if (!email) {
        json(request, response, 400, { detail: 'Email kerak.' })
        return
      }
      if (!fullName) {
        json(request, response, 400, { detail: 'Full name kerak.' })
        return
      }

      const transactionId = `PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      const active = plan === 'pro' || plan === 'team'
      const expiresAt = active ? now + PREMIUM_DURATION_MS : null

      if (auth) {
        const subscriptions = await loadSubscriptions()
        const nextSubscription = {
          userId: auth.user.id,
          email,
          fullName,
          plan,
          billingCycle,
          seats,
          method,
          active,
          expiresAt,
          updatedAt: now,
          transactionId,
        }
        const index = subscriptions.findIndex((item) => item.userId === auth.user.id)
        if (index >= 0) {
          subscriptions[index] = nextSubscription
        } else {
          subscriptions.unshift(nextSubscription)
        }
        await saveSubscriptions(subscriptions)
      }

      json(request, response, 200, {
        ok: true,
        transaction_id: transactionId,
        active,
        plan,
        expires_at: expiresAt,
      })
      return
    }

    if (pathname === '/billing/cancel' && request.method === 'POST') {
      const auth = await getSessionUser(request)
      if (!auth) {
        json(request, response, 401, { detail: 'Session topilmadi. Qayta login qiling.' })
        return
      }

      const subscriptions = await loadSubscriptions()
      const next = subscriptions.map((item) =>
        item.userId === auth.user.id
          ? {
              ...item,
              active: false,
              expiresAt: null,
              updatedAt: Date.now(),
            }
          : item,
      )
      await saveSubscriptions(next)
      json(request, response, 200, { ok: true })
      return
    }

    json(request, response, 404, { detail: 'Endpoint topilmadi.' })
  } catch (error) {
    json(request, response, 500, { detail: error instanceof Error ? error.message : 'Server xatoligi.' })
  }
})

await bootstrap()

server.listen(PORT, HOST, () => {
  console.log(`GameHub API running at http://${HOST}:${PORT}`)
  console.log(`Seed admin: ${SEED_ADMIN_EMAIL} / ${SEED_ADMIN_PASSWORD}`)
})
