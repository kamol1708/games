import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Container } from '../../../components/ui/Container'
import { Reveal } from '../../../components/ui/Reveal'
import { SectionTitle } from '../../../components/ui/SectionTitle'
import { cn } from '../../../lib/utils'
import {
  cancelPremiumSubscription,
  getPremiumSubscriptionInfo,
  subscribeToPremium,
  syncPremiumFromBackend,
} from '../../../lib/subscription'

const plans = [
  {
    name: 'Boshlang‘ich',
    price: '$0',
    period: '/oy',
    description: 'Platformani ko‘rib chiqayotgan kichik sinf yoki test usage uchun.',
    features: ['Asosiy o‘yinlarga kirish', 'Oddiy classroom usage', 'Hamjamiyat yordami'],
    cta: 'Bepul boshlash',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/o‘rin',
    description: 'Teacherlar va o‘quv markazlari uchun eng mos balans.',
    features: ['Premium o‘yinlar', 'Teacher flow tools', 'Kengaytirilgan dashboardlar', 'Ustuvor yordam'],
    cta: 'Pro olish',
    popular: true,
  },
  {
    name: 'Jamoa',
    price: '$49',
    period: '/o‘rin',
    description: 'Bir nechta guruh yoki katta markazlar uchun.',
    features: ['Bir nechta teacher hisoblari', 'Rolga oid ruxsatlar', 'Onboarding yordami', 'Ustuvor aloqa'],
    cta: 'Sotuv bo‘limiga yozish',
  },
]

export function Pricing() {
  const [premiumActive, setPremiumActive] = useState(false)
  const [premiumExpiry, setPremiumExpiry] = useState<number | null>(null)

  useEffect(() => {
    const apply = () => {
      const info = getPremiumSubscriptionInfo()
      setPremiumActive(info.active)
      setPremiumExpiry(info.expiresAt)
    }

    apply()
    const unsubscribe = subscribeToPremium(apply)
    void syncPremiumFromBackend().then(apply).catch(() => {})

    return unsubscribe
  }, [])

  const cancelSubscription = async () => {
    await cancelPremiumSubscription().catch(() => {})
  }

  return (
    <section id="pricing" className="py-14 sm:py-16 lg:py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="Narxlar"
            title="Sodda tariflar, premium game tajribasi"
            description="Pricing blok landingning pastki qismida ishonchni actionga aylantirish uchun joylashtirildi."
            align="center"
          />
        </Reveal>

        {premiumActive ? (
          <Reveal delay={0.03}>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm">
              <div>
                <p className="font-semibold text-emerald-200">Premium obuna faol</p>
                <p className="mt-1 text-white/70">
                  Premium o&apos;yinlar ochiq (Tug of War, Word Search, Memory Rush, Bilim Poyezdi).
                  {premiumExpiry ? ` Amal qilish muddati: ${new Date(premiumExpiry).toLocaleDateString()}.` : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={cancelSubscription}
                className="justify-center border-rose-300/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
              >
                Pullik obunani bekor qilish
              </Button>
            </div>
          </Reveal>
        ) : null}

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.04}>
              <Card
                className={cn(
                  'relative h-full rounded-2xl p-5',
                  plan.popular && 'border-violet-400/35 bg-gradient-to-b from-violet-500/10 to-white/5 shadow-violet',
                )}
              >
                {plan.popular ? (
                  <span className="absolute right-4 top-4 rounded-full border border-violet-300/30 bg-violet-400/10 px-2.5 py-1 text-xs font-medium text-violet-200">
                    Eng ommabop
                  </span>
                ) : null}

                <p className="text-sm font-medium text-white">{plan.name}</p>
                <p className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-semibold text-white">{plan.price}</span>
                  <span className="pb-1 text-sm text-white/45">{plan.period}</span>
                </p>
                <p className="mt-2 text-sm leading-6 text-white/60">{plan.description}</p>

                <ul className="mt-5 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-white/75">
                      <Check className="h-4 w-4 text-blue-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {(() => {
                    const href =
                      plan.name === 'Pro'
                        ? '/payment?plan=pro'
                        : plan.name === 'Boshlang‘ich'
                          ? '/payment?plan=starter'
                          : '/payment?plan=team'
                    return (
                  <Button
                    href={href}
                    variant={plan.popular ? 'primary' : 'secondary'}
                    className="w-full justify-center"
                  >
                    {plan.cta}
                  </Button>
                    )
                  })()}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
