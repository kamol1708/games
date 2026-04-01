const LOCAL_API_BASE_URL = 'http://127.0.0.1:8010'
const DEV_PROXY_API_BASE_URL = '/api'
const PROD_API_BASE_URL = 'https://gamehub-fastapi.onrender.com'

function detectDefaultApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/+$/, '')
  if (configured) {
    return configured
  }

  if (typeof window === 'undefined') {
    return LOCAL_API_BASE_URL
  }

  const hostname = window.location.hostname
  const isLocalHost = hostname === '127.0.0.1' || hostname === 'localhost'
  return isLocalHost ? LOCAL_API_BASE_URL : PROD_API_BASE_URL
}

export const API_BASE_URL = detectDefaultApiBaseUrl()

type ApiErrorPayload = {
  detail?: string
}

function getCandidateBaseUrls() {
  const urls =
    typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
      ? [DEV_PROXY_API_BASE_URL, API_BASE_URL]
      : [API_BASE_URL]

  try {
    const current = new URL(API_BASE_URL)
    const isLocalHost =
      current.hostname === '127.0.0.1' ||
      current.hostname === 'localhost'

    if (isLocalHost) {
      const fallbackPort = current.port === '8010' ? '8000' : current.port === '8000' ? '8010' : ''
      if (fallbackPort) {
        const fallback = new URL(API_BASE_URL)
        fallback.port = fallbackPort
        urls.push(fallback.toString().replace(/\/+$/, ''))
      }

      // When the local API is down, keep localhost dev usable by retrying the deployed backend.
      urls.push(PROD_API_BASE_URL)
    }
  } catch {
    // ignore malformed base urls and keep the configured value only
  }

  return [...new Set(urls)]
}

function isNetworkError(error: unknown) {
  return error instanceof TypeError
}

function shouldRetryFailedResponse(requestUrl: string, status: number) {
  const isLocalAttempt =
    requestUrl.startsWith('/api/') ||
    requestUrl.startsWith('http://127.0.0.1:') ||
    requestUrl.startsWith('http://localhost:')

  if (!isLocalAttempt) {
    return false
  }

  return status === 404 || status >= 500
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const candidateUrls = path.startsWith('http://') || path.startsWith('https://')
    ? [path]
    : getCandidateBaseUrls().map((baseUrl) => `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`)

  let lastError: unknown = null

  for (let index = 0; index < candidateUrls.length; index += 1) {
    const requestUrl = candidateUrls[index]
    const canRetry = index < candidateUrls.length - 1

    try {
      const response = await fetch(requestUrl, {
        ...init,
        headers,
      })

      const contentType = response.headers.get('content-type') ?? ''
      const isJson = contentType.includes('application/json')
      const payload = (isJson ? await response.json().catch(() => null) : null) as ApiErrorPayload | null

      if (!response.ok) {
        if (canRetry && shouldRetryFailedResponse(requestUrl, response.status)) {
          continue
        }
        throw new Error(payload?.detail || `Request failed (${response.status})`)
      }

      if (response.status === 204) {
        return undefined as T
      }

      return (payload ?? ({} as T)) as T
    } catch (error) {
      lastError = error
      if (canRetry && isNetworkError(error)) {
        continue
      }
      throw error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('API request failed.')
}
