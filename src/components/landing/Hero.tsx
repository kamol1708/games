import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Container } from '../ui/Container'
import { GlowBorder } from '../ui/GlowBorder'

type HeroProps = {
  onPrimaryClick?: () => void
}

const chipItems = ['Real vaqt hamkorlik', 'Tezkor ish oqimi', 'Premium interfeys', 'Jamoalar uchun']

export function Hero({ onPrimaryClick }: HeroProps) {
  const reduced = useReducedMotion()
  const navigate = useNavigate()
  const [showProjectBar, setShowProjectBar] = useState(true)

  return (
    <Container className="relative py-8 sm:py-12 lg:py-16">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-6 lg:gap-10">
        <motion.div
          initial={reduced ? false : 'hidden'}
          animate={reduced ? undefined : 'show'}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
          className="relative"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            Premium qorong‘i tajriba
          </motion.div>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            className="hero-title mb-3 text-[clamp(2.3rem,8vw,3.6rem)] font-semibold tracking-tight text-white md:text-[clamp(2.5rem,4.4vw,4.2rem)] xl:text-[clamp(4.6rem,6vw,7.5rem)]"
          >
            <span className="hero-title-line">Jamoalar uchun yagona platforma,</span>
            <span className="hero-title-line">
              tezlik uchun yaratilgan.
            </span>
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base"
          >
            Zamonaviy jamoalar uchun yagona ish maydonida rejalang, hamkorlik qiling, jarayonni kuzating va tezroq natija chiqaring.
            Toza layout, tezkor fikr-mulohaza va oqimga yo‘naltirilgan interaksiyalar jamoani fokusda ushlab turadi.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Button onClick={onPrimaryClick} size="lg">
              Demo sinash
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button href="/docs" variant="secondary" size="lg">
              Hujjatlarni ko‘rish
            </Button>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {chipItems.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70"
              >
                {chip}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="relative"
        >
          <GlowBorder className="shadow-violet">
            <motion.div layout className="relative overflow-hidden rounded-2xl p-4 sm:p-5">
              <div className="noise-overlay" />
              <motion.div layout className="space-y-4">
                <AnimatePresence initial={false}>
                  {showProjectBar ? (
                    <motion.div
                      layout
                      initial={reduced ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
                      animate={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
                      exit={reduced ? undefined : { opacity: 0, y: -14, scale: 0.96, filter: 'blur(2px)' }}
                      transition={{ duration: 0.24, ease: 'easeOut' }}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Panelni yopish"
                          onClick={() => setShowProjectBar(false)}
                          className="h-2 w-2 rounded-full bg-rose-400 transition hover:scale-110"
                        />
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        <button
                          type="button"
                          aria-label="Hujjatlarni ochish"
                          onClick={() => navigate('/docs')}
                          className="h-2 w-2 rounded-full bg-emerald-400 transition hover:scale-110"
                        />
                      </div>
                      <span className="text-xs text-white/50">loyiha-sharhi.tsx</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <motion.div layout className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                  <Card className="relative overflow-hidden bg-white/5 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/50">Sprint holati</p>
                      <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-xs text-emerald-300">+12%</span>
                    </div>
                    <div className="space-y-2">
                      {[72, 58, 84, 66, 93].map((h, i) => (
                        <div key={h} className="flex items-center gap-2">
                          <div className="w-12 text-xs text-white/40">W{i + 1}</div>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                            <motion.div
                              initial={reduced ? false : { width: 0 }}
                              animate={reduced ? undefined : { width: `${h}%` }}
                              transition={{ delay: 0.45 + i * 0.08, duration: 0.5 }}
                              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-blue-400"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="grid gap-3">
                    <Card className="p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/50">Vazifalar</p>
                      <p className="mt-2 text-2xl font-semibold text-white">148</p>
                      <p className="mt-1 text-xs text-white/50">Bu hafta 24 ta muddatli</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/50">Deploylar</p>
                      <p className="mt-2 text-2xl font-semibold text-white">9</p>
                      <p className="mt-1 text-xs text-white/50">14 kunda 0 ta xato</p>
                    </Card>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div layout className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  ['Reja', 'Roadmap, prioritet, hujjatlar'],
                  ['Kuzatuv', 'Sikl, issue, egalik'],
                  ['Chiqarish', 'Reliz izohi, rollout, tekshiruv'],
                ].map(([title, desc], i) => (
                  <Card
                    key={title}
                    className="animate-float p-4"
                    style={{ animationDelay: `${i * 0.35}s`, animationDuration: `${5.5 + i}s` }}
                  >
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/55">{desc}</p>
                  </Card>
                ))}
              </motion.div>
            </motion.div>
          </GlowBorder>
        </motion.div>
      </div>
    </Container>
  )
}
