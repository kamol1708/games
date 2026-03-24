export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/+$/, '') ||
  'http://127.0.0.1:8000'

type ApiErrorPayload = {
  detail?: string
}

function buildUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload = (isJson ? await response.json().catch(() => null) : null) as ApiErrorPayload | null

  if (!response.ok) {
    throw new Error(payload?.detail || `Request failed (${response.status})`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (payload ?? ({} as T)) as T
}
