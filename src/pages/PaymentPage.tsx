import { CreditCard, Lock, ShieldCheck, Wallet } from 'lucide-react'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Container } from '../components/ui/Container'
import { GradientBlob } from '../components/ui/GradientBlob'
import { cn } from '../lib/utils'
import { checkoutPremium } from '../lib/subscription'

type BillingCycle = 'monthly' | 'yearly'
type PlanKey = 'starter' | 'pro' | 'team'
type PaymentMethod = 'card' | 'click' | 'payme'

type PlanConfig = {
  key: PlanKey
  name: string
  description: string
  monthly: number
  yearly: number
  features: string[]
}

const plans: Record<PlanKey, PlanConfig> = {
  starter: {
    key: 'starter',
    name: 'Starter',
    description: 'Great for trying the workspace with a small team.',
    monthly: 0,
    yearly: 0,
    features: ['Core boards', 'Docs', 'Community support'],
  },
  pro: {
    key: 'pro',
    name: 'Pro',
    description: 'Best for growing teams that ship fast and need automation.',
    monthly: 19,
    yearly: 15,
    features: ['Unlimited projects', 'Automations', 'Advanced dashboards', 'Priority support'],
  },
  team: {
    key: 'team',
    name: 'Team',
    description: 'For organizations that need admin controls and enterprise readiness.',
    monthly: 49,
    yearly: 39,
    features: ['SSO + SCIM', 'Audit logs', 'Permissions', 'Dedicated onboarding'],
  },
}

const promoCodes: Record<string, { type: 'percent' | 'fixed'; value: number; label: string }> = {
  DEMO10: { type: 'percent', value: 10, label: '10% off (demo)' },
  PRO20: { type: 'percent', value: 20, label: '20% off for Pro promo' },
  SAVE5: { type: 'fixed', value: 5, label: '$5 off' },
}

function sanitizeCard(input: string) {
  return input.replace(/\D/g, '').slice(0, 16)
}

function formatCard(input: string) {
  return sanitizeCard(input)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()
}

function sanitizeExpiry(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function sanitizeCvc(input: string) {
  return input.replace(/\D/g, '').slice(0, 4)
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams()
  const requestedPlan = (searchParams.get('plan') ?? 'pro').toLowerCase() as PlanKey
  const initialCycle = (searchParams.get('cycle') ?? 'monthly').toLowerCase() as BillingCycle

  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    initialCycle === 'yearly' ? 'yearly' : 'monthly',
  )
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [successRef, setSuccessRef] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const plan = plans[requestedPlan] ?? plans.pro
  const unitPrice = billingCycle === 'monthly' ? plan.monthly : plan.yearly
  const effectiveSeats = 1
  const subtotal = unitPrice * effectiveSeats
  const appliedPromo = appliedPromoCode ? promoCodes[appliedPromoCode] : null
  const discount =
    appliedPromo == null
      ? 0
      : appliedPromo.type === 'percent'
        ? Math.round(subtotal * (appliedPromo.value / 100) * 100) / 100
        : Math.min(subtotal, appliedPromo.value)
  const discountedSubtotal = Math.max(0, subtotal - discount)
  const tax = Math.round(discountedSubtotal * 0.1 * 100) / 100
  const total = Math.max(0, discountedSubtotal + tax)

  const amountLabel = useMemo(() => {
    const suffix = billingCycle === 'monthly' ? '/mo' : '/mo (annual billing)'
    return `$${unitPrice}${plan.key === 'starter' ? '' : suffix}`
  }, [unitPrice, billingCycle, plan.key])

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!fullName.trim()) return setError('Full name is required.')
    if (!validateEmail(email)) return setError('Enter a valid email.')
    if (plan.key !== 'starter' && method === 'card') {
      if (sanitizeCard(cardNumber).length < 16) return setError('Card number must be 16 digits.')
      if (!/^\d{2}\/\d{2}$/.test(expiry)) return setError('Expiry format must be MM/YY.')
      if (sanitizeCvc(cvc).length < 3) return setError('CVC must be at least 3 digits.')
    }

    setIsProcessing(true)
    try {
      const result = await checkoutPremium({
        plan: plan.key,
        billingCycle,
        method,
        fullName,
        email,
        promoCode: appliedPromoCode,
      })
      setSuccessRef(result.transaction_id)
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Payment xatoligi.')
    } finally {
      setIsProcessing(false)
    }
  }

  const applyPromo = () => {
    const normalized = promoInput.trim().toUpperCase()
    if (!normalized) {
      setAppliedPromoCode(null)
      setError(null)
      return
    }
    if (!(normalized in promoCodes)) {
      setError('Promo code not found.')
      return
    }
    setAppliedPromoCode(normalized)
    setError(null)
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#05060a] text-white">
      <GradientBlob color="violet" className="fixed -left-16 top-10 h-72 w-72 opacity-70 sm:h-96 sm:w-96" />
      <GradientBlob color="blue" className="fixed -right-20 top-16 h-72 w-72 opacity-60 sm:h-[28rem] sm:w-[28rem]" />
      <div className="noise-overlay fixed inset-0 z-0" />

      <div className="relative z-10 py-6 sm:py-8">
        <Container>
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link
              to="/home#pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 backdrop-blur hover:bg-white/10"
            >
              ← Back to pricing
            </Link>
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Secure checkout (demo)
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="glass-card rounded-3xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Checkout</p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Complete your {plan.name} plan payment
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">{plan.description}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                  <p className="text-xs text-white/45">Price</p>
                  <p className="text-lg font-semibold text-white">{amountLabel}</p>
                </div>
              </div>

              {successRef ? (
                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <p className="text-sm font-semibold text-emerald-300">Payment successful</p>
                  <p className="mt-1 text-sm text-white/80">
                    {plan.name} plan activated for <span className="font-medium">{email}</span>
                  </p>
                  <p className="mt-1 text-xs text-white/60">Transaction: {successRef}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button href="/home" size="sm">Go to home</Button>
                    <Button href="/games" variant="secondary" size="sm">Open games</Button>
                  </div>
                </div>
              ) : (
                <form className="mt-6 space-y-5" onSubmit={submitPayment}>
                  <div>
                    <p className="text-sm font-medium text-white">Billing cycle</p>
                    <div className="mt-2 inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
                      {(['monthly', 'yearly'] as const).map((cycle) => (
                        <button
                          key={cycle}
                          type="button"
                          onClick={() => setBillingCycle(cycle)}
                          className={cn(
                            'rounded-lg px-3 py-2 text-sm transition',
                            billingCycle === cycle ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white',
                          )}
                        >
                          {cycle === 'monthly' ? 'Monthly' : 'Yearly (-20%)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="mb-1.5 block text-white/75">Full name</span>
                      <input
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none transition placeholder:text-white/35 focus:border-violet-400/60"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Kamol Mamurov"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1.5 block text-white/75">Email</span>
                      <input
                        type="email"
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none transition placeholder:text-white/35 focus:border-violet-400/60"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                      />
                    </label>
                  </div>

                  {plan.key !== 'starter' ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-white">Payment method</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => setMethod('card')}
                            className={cn(
                              'flex items-center gap-2 rounded-xl border px-3 py-3 text-sm transition',
                              method === 'card'
                                ? 'border-violet-400/45 bg-violet-400/10 text-white'
                                : 'border-white/10 bg-white/5 text-white/70 hover:text-white',
                            )}
                          >
                            <CreditCard className="h-4 w-4" />
                            Card
                          </button>
                          <button
                            type="button"
                            onClick={() => setMethod('click')}
                            className={cn(
                              'flex items-center gap-2 rounded-xl border px-3 py-3 text-sm transition',
                              method === 'click'
                                ? 'border-amber-400/45 bg-amber-400/10 text-white'
                                : 'border-white/10 bg-white/5 text-white/70 hover:text-white',
                            )}
                          >
                            <Wallet className="h-4 w-4" />
                            Click
                          </button>
                          <button
                            type="button"
                            onClick={() => setMethod('payme')}
                            className={cn(
                              'flex items-center gap-2 rounded-xl border px-3 py-3 text-sm transition sm:col-span-2',
                              method === 'payme'
                                ? 'border-cyan-400/45 bg-cyan-400/10 text-white'
                                : 'border-white/10 bg-white/5 text-white/70 hover:text-white',
                            )}
                          >
                            <Wallet className="h-4 w-4" />
                            Payme
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <label className="block text-sm sm:col-span-2">
                          <span className="mb-1.5 block text-white/75">Promo code</span>
                          <input
                            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white uppercase outline-none transition placeholder:text-white/35 focus:border-violet-400/60"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            placeholder="DEMO10 / PRO20"
                          />
                        </label>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={applyPromo}
                            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-white/85 transition hover:bg-white/10"
                          >
                            Apply promo
                          </button>
                        </div>
                      </div>

                      {appliedPromo ? (
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
                          Promo applied: <span className="font-semibold">{appliedPromoCode}</span> ({appliedPromo.label})
                        </div>
                      ) : null}

                      <div className="grid gap-4 sm:grid-cols-3">
                        <label className="block text-sm sm:col-span-3">
                          <span className="mb-1.5 block text-white/75">Card number</span>
                          <input
                            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none transition placeholder:text-white/35 focus:border-violet-400/60"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCard(e.target.value))}
                            placeholder="4242 4242 4242 4242"
                            disabled={method !== 'card'}
                          />
                        </label>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm">
                          <span className="mb-1.5 block text-white/75">Expiry (MM/YY)</span>
                          <input
                            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none transition placeholder:text-white/35 focus:border-violet-400/60"
                            value={expiry}
                            onChange={(e) => setExpiry(sanitizeExpiry(e.target.value))}
                            placeholder="12/28"
                            disabled={method !== 'card'}
                          />
                        </label>
                        <label className="block text-sm">
                          <span className="mb-1.5 block text-white/75">CVC</span>
                          <input
                            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none transition placeholder:text-white/35 focus:border-violet-400/60"
                            value={cvc}
                            onChange={(e) => setCvc(sanitizeCvc(e.target.value))}
                            placeholder="123"
                            disabled={method !== 'card'}
                          />
                        </label>
                      </div>

                      {method !== 'card' ? (
                        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/70">
                          {method === 'click'
                            ? 'Click demo flow selected. Press Pay to simulate redirect + confirmation.'
                            : 'Payme demo flow selected. Press Pay to simulate provider confirmation.'}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
                      Starter plan is free. Submit to create your starter workspace.
                    </div>
                  )}

                  {error ? (
                    <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
                      {error}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-xs text-white/50">
                      <Lock className="h-3.5 w-3.5" />
                      Demo checkout. No real payment is charged.
                    </div>
                    <Button type="submit" disabled={isProcessing}>
                      {isProcessing ? 'Processing...' : plan.key === 'starter' ? 'Create workspace' : `Pay $${total.toFixed(2)}`}
                    </Button>
                  </div>
                </form>
              )}
            </section>

            <aside className="glass-card rounded-3xl p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white">Order summary</h2>
              <p className="mt-1 text-sm text-white/60">Selected plan and pricing breakdown.</p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{plan.name}</p>
                    <p className="mt-1 text-xs text-white/50">Single workspace access</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
                    {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm text-white/75">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                <div className="flex items-center justify-between text-white/65">
                  <span>Unit price</span>
                  <span>${unitPrice.toFixed(2)}</span>
                </div>
                {discount > 0 ? (
                  <div className="flex items-center justify-between text-emerald-300">
                    <span>Discount{appliedPromoCode ? ` (${appliedPromoCode})` : ''}</span>
                    <span>- ${discount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-white/65">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="mt-2 border-t border-white/10 pt-2 text-base font-semibold text-white">
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Payment system (demo)</p>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Frontend checkout flow is ready. To make it real, connect this page to Stripe / Click / Payme via a backend
                  endpoint that creates a payment intent and verifies webhook completion.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </div>
    </div>
  )
}
