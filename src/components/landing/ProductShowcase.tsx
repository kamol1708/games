import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../ui/Card'
import { Container } from '../ui/Container'
import { Reveal } from '../ui/Reveal'
import { SectionTitle } from '../ui/SectionTitle'
import { cn } from '../../lib/utils'

type StepKey = 'plan' | 'track' | 'ship'

const stepContent: Record<
  StepKey,
  { title: string; copy: string; bullets: string[]; metrics: Array<[string, string]> }
> = {
  plan: {
    title: 'Tartib bilan rejalang, chalkashliksiz',
    copy: 'Spetsifikatsiya, ustuvorlik va muddatlarni bitta umumiy maydonda jamlang. G‘oyalarni vosita almashtirmasdan aniq ijroga o‘tkazing.',
    bullets: ['Yo‘l xaritasi va bosqichlar', 'Vazifalarga bog‘langan specs', 'Bog‘liqlikni inobatga olgan reja'],
    metrics: [
      ['Faol tashabbuslar', '12'],
      ['Sikl qamrovi', '94%'],
      ['Tugallangan spec', '31'],
    ],
  },
  track: {
    title: 'Jarayonni real vaqt ko‘rinishida kuzating',
    copy: 'Toza dashboard va fokuslangan lentalar orqali jamoa bloklar, mas’ullar va yetkazish tezligini bir zumda ko‘radi.',
    bullets: ['Moslashtiriladigan status va yo‘laklar', 'Mas’ul va muddat signallari', 'Real vaqt yangilanishlari va mentionlar'],
    metrics: [
      ['Ochiq vazifalar', '148'],
      ['Rejada', '86%'],
      ['Bloklangan', '7'],
    ],
  },
  ship: {
    title: 'Har bir relizni ishonch bilan chiqaring',
    copy: 'Handoff, QA va reliz izohlarini bitta oqimda boshqaring, ishga tushirish hammaga aniq va ko‘rinadigan bo‘lsin.',
    bullets: ['Reliz checklistlari', 'QA topshirish jarayonlari', 'Izohlar va rollout yangilanishlari'],
    metrics: [
      ['Reliz / oy', '26'],
      ['Xatoli deploy', '0'],
      ['O‘rtacha lead time', '1.8 kun'],
    ],
  },
}

const stepLabels: Array<{ key: StepKey; label: string }> = [
  { key: 'plan', label: 'Reja' },
  { key: 'track', label: 'Kuzatish' },
  { key: 'ship', label: 'Chiqarish' },
]

export function ProductShowcase() {
  const [active, setActive] = useState<StepKey>('plan')
  const content = stepContent[active]

  return (
    <section id="product" className="py-14 sm:py-16 lg:py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="Mahsulot ko‘rinishi"
            title="Rejadan relizgacha olib boradigan ish maydoni"
            description="Uchta fokuslangan rejim. Bitta vizual tizim. Mahsulot, dasturlash va operatsiyada sur’atni ushlab turish uchun."
          />
        </Reveal>

        <Reveal delay={0.05} className="mt-8">
          <div className="glass-card rounded-2xl p-3 sm:p-4">
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                <div className="inline-flex rounded-xl border border-white/10 bg-black/20 p-1">
                  {stepLabels.map((step) => (
                    <button
                      key={step.key}
                      type="button"
                      onClick={() => setActive(step.key)}
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm transition',
                        active === step.key
                          ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
                          : 'text-white/60 hover:text-white',
                      )}
                      aria-pressed={active === step.key}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>

                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-xl font-semibold text-white">{content.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/65">{content.copy}</p>
                  <ul className="mt-4 space-y-2">
                    {content.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm text-white/75">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              <div className="grid gap-4">
                <Card className="rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Jonli umumiy holat</p>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">
                      Sinxron
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {content.metrics.map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-white/45">{label}</p>
                        <p className="mt-2 text-xl font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="mb-3 flex items-center justify-between text-xs text-white/50">
                      <span>Ijro timeline</span>
                      <span>So‘nggi 14 kun</span>
                    </div>
                    <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0.3, scaleY: 0.4 }}
                          whileInView={{ opacity: 1, scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.03, duration: 0.25 }}
                          className="h-16 origin-bottom rounded-md bg-gradient-to-t from-violet-500/40 to-blue-400/60"
                          style={{ height: `${35 + ((i * 17) % 45)}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/45">Jamoa lentasi</p>
                    <div className="mt-3 space-y-3">
                      {['API tekshiruvi yakunlandi', 'Dizayn handoff qabul qilindi', 'Reliz checklist boshlandi'].map((item) => (
                        <div key={item} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75">
                          {item}
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card className="rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/45">Keyingi bosqichlar</p>
                    <ul className="mt-3 space-y-2">
                      {['v2 onboarding', 'Mobil QA', 'Ommaviy changelog'].map((item) => (
                        <li key={item} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                          <span className="text-white/75">{item}</span>
                          <span className="text-xs text-white/45">Tez orada</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
