import { apiRequest } from './apiClient'
import { getAccessToken } from './localAuth'

export const PREMIUM_ACCESS_STORAGE_KEY = 'gamehub_premium_active'
export const PREMIUM_ACCESS_EXPIRY_KEY = 'gamehub_premium_until'
const PREMIUM_CHANGE_EVENT = 'gamehub-premium:changed'

type BillingStatusPayload = {
  active: boolean
  plan: string
  expires_at: number | null
}

type CheckoutPayload = {
  ok: boolean
  transaction_id: string
  active: boolean
  plan: string
  expires_at: number | null
}

export type CheckoutInput = {
  plan: 'starter' | 'pro' | 'team'
  billingCycle: 'monthly' | 'yearly'
  method: 'card' | 'click' | 'payme'
  fullName: string
  email: string
  seats: number
  promoCode?: string | null
}

function emitPremiumChange() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(PREMIUM_CHANGE_EVENT))
  window.dispatchEvent(new Event('storage'))
}

export function setPremiumSubscription(active: boolean, expiresAt: number | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (!active || !expiresAt || expiresAt <= Date.now()) {
    window.localStorage.removeItem(PREMIUM_ACCESS_STORAGE_KEY)
    window.localStorage.removeItem(PREMIUM_ACCESS_EXPIRY_KEY)
    emitPremiumChange()
    return
  }

  window.localStorage.setItem(PREMIUM_ACCESS_STORAGE_KEY, 'true')
  window.localStorage.setItem(PREMIUM_ACCESS_EXPIRY_KEY, String(expiresAt))
  emitPremiumChange()
}

export function getPremiumSubscriptionInfo() {
  if (typeof window === 'undefined') {
    return { active: false, expiresAt: null as number | null }
  }

  const rawExpiry = window.localStorage.getItem(PREMIUM_ACCESS_EXPIRY_KEY)
  const legacyActive = window.localStorage.getItem(PREMIUM_ACCESS_STORAGE_KEY) === 'true'

  if (rawExpiry) {
    const expiresAt = Number(rawExpiry)
    if (Number.isFinite(expiresAt) && expiresAt > Date.now()) {
      return { active: true, expiresAt }
    }

    setPremiumSubscription(false, null)
    return { active: false, expiresAt: null }
  }

  return { active: legacyActive, expiresAt: null }
}

export function hasPremiumSubscription() {
  return getPremiumSubscriptionInfo().active
}

export function formatPremiumExpiry(expiresAt: number | null) {
  if (!expiresAt) return 'No expiry set'
  return new Date(expiresAt).toLocaleDateString()
}

export function subscribeToPremium(listener: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  window.addEventListener('storage', listener)
  window.addEventListener(PREMIUM_CHANGE_EVENT, listener)

  return () => {
    window.removeEventListener('storage', listener)
    window.removeEventListener(PREMIUM_CHANGE_EVENT, listener)
  }
}

export async function syncPremiumFromBackend() {
  const token = getAccessToken()
  if (!token) {
    return getPremiumSubscriptionInfo()
  }

  const payload = await apiRequest<BillingStatusPayload>('/billing/status', { method: 'GET' }, token)
  setPremiumSubscription(Boolean(payload.active), payload.expires_at)
  return getPremiumSubscriptionInfo()
}

export async function checkoutPremium(input: CheckoutInput) {
  const token = getAccessToken()
  const payload = await apiRequest<CheckoutPayload>(
    '/billing/checkout',
    {
      method: 'POST',
      body: JSON.stringify({
        plan: input.plan,
        billingCycle: input.billingCycle,
        method: input.method,
        fullName: input.fullName,
        email: input.email,
        seats: input.seats,
        promoCode: input.promoCode ?? null,
      }),
    },
    token || undefined,
  )

  setPremiumSubscription(Boolean(payload.active), payload.expires_at)
  return payload
}

export async function cancelPremiumSubscription() {
  const token = getAccessToken()
  if (token) {
    await apiRequest('/billing/cancel', { method: 'POST' }, token)
  }
  setPremiumSubscription(false, null)
}
