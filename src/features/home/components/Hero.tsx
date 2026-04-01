import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Container } from '../../../components/ui/Container'
import { GlowBorder } from '../../../components/ui/GlowBorder'

type HeroProps = {
  onPrimaryClick?: () => void
  fullScreen?: boolean
}

const chipItems = ['Teacher mode', 'Premium games', 'Classroom control', 'Fast setup']

export function Hero({ onPrimaryClick, fullScreen = false }: HeroProps) {
  const reduced = useReducedMotion()
  const navigate = useNavigate()
  const [showProjectBar, setShowProjectBar] = useState(true)

  return (
    <Container
      className={
        fullScreen
          ? 'relative max-w-[112rem] px-4 pt-1 pb-0 sm:px-6 sm:pt-1 sm:pb-0 lg:px-8 lg:pt-1 lg:pb-0'
          : 'relative py-8 sm:py-12 lg:py-16'
      }
    >
      <div
        className={
          fullScreen
            ? 'grid items-center gap-8 pt-3 md:grid-cols-[minmax(0,1.02fr)_minmax(24rem,0.98fr)] md:gap-8 md:pt-4 xl:gap-12 xl:pt-6'
            : 'grid items-center gap-8 md:grid-cols-2 md:gap-6 lg:gap-10'
        }
      >
        <motion.div
          initial={reduced ? false : 'hidden'}
          animate={reduced ? undefined : 'show'}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
          className={
            fullScreen
              ? 'relative flex min-h-[clamp(38rem,72vh,52rem)] min-w-0 max-w-[54rem] flex-col justify-center py-8 lg:py-12'
              : 'relative'
          }
        >
          <div>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#f4b16d]" />
              Premium classroom game platform
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              className="hero-title mb-10 max-w-[16ch] text-[clamp(2.6rem,4vw,5.4rem)] font-semibold tracking-tight text-white md:mb-12 md:text-[clamp(3.2rem,4.2vw,5rem)] xl:text-[clamp(4rem,4.5vw,6rem)]"
            >
              {fullScreen ? (
                <>
                  <span className="hero-title-line">Darsni o‘yinga</span>
                  <span className="hero-title-line">aylantiradigan</span>
                  <span className="hero-title-line">ideal platforma.</span>
                </>
              ) : (
                <span className="hero-title-line">Darsni o‘yinga aylantiradigan ideal platforma.</span>
              )}
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              className="max-w-[42rem] text-[1.02rem] leading-[1.7] text-white/70 sm:text-[1.14rem] sm:leading-[1.75] xl:max-w-[46rem]"
            >
              Teacher uchun boshqaruv oddiy, o‘quvchi uchun esa tajriba qiziqarli bo‘lishi kerak. Game Hub quiz, memory,
              wheel, race va boshqa formatlarni bitta chiroyli sahifada jamlab, darsni tez boshlash va energiyani ushlab turishni osonlashtiradi.
            </motion.p>
          </div>

          <div className="mt-12">
            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              className="flex flex-wrap items-center gap-4"
            >
              <Button onClick={onPrimaryClick} size="lg" className="h-16 rounded-[1.65rem] px-10 text-lg sm:text-[1.05rem]">
                O‘yinlarni ko‘rish
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button href="/docs" variant="secondary" size="lg" className="h-16 rounded-[1.65rem] px-10 text-lg sm:text-[1.05rem]">
                Qanday ishlashini ko‘rish
              </Button>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              className="mt-10 flex flex-wrap gap-4"
            >
              {chipItems.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70"
                >
                  {chip}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="relative mx-auto w-full max-w-[42rem] md:mx-0 md:justify-self-end"
        >
          <GlowBorder className="shadow-violet">
            <motion.div layout className="relative overflow-hidden rounded-2xl p-4 sm:p-5">
              <div className="noise-overlay" />
              <motion.div layout className="flex flex-col space-y-4">
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
                      <span className="text-xs text-white/50">classroom-session.tsx</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <motion.div layout className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                  <Card className="relative overflow-hidden bg-white/5 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/50">Sinf faolligi</p>
                      <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-xs text-emerald-300">+18%</span>
                    </div>
                    <div className="space-y-2">
                      {[72, 58, 84, 66, 93].map((h, i) => (
                        <div key={h} className="flex items-center gap-2">
                          <div className="w-12 text-xs text-white/40">G{i + 1}</div>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                            <motion.div
                              initial={reduced ? false : { width: 0 }}
                              animate={reduced ? undefined : { width: `${h}%` }}
                              transition={{ delay: 0.45 + i * 0.08, duration: 0.5 }}
                              className="h-full rounded-full bg-gradient-to-r from-[#f4b16d] to-[#7dd3fc]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="grid gap-3">
                    <Card className="p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/50">O‘yinlar</p>
                      <p className="mt-2 text-2xl font-semibold text-white">12</p>
                      <p className="mt-1 text-xs text-white/50">Bittadan ortiq game mode mavjud</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/50">Premium</p>
                      <p className="mt-2 text-2xl font-semibold text-white">4</p>
                      <p className="mt-1 text-xs text-white/50">Maxsus formatlar obuna bilan ochiladi</p>
                    </Card>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div layout className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  ['Teacher panel', 'Savollar, studentlar va classroom nazorati'],
                  ['Live game', 'Leaderboards, navbat va instant feedback'],
                  ['Premium access', 'To‘lov, unlock va kengaytirilgan tajriba'],
                ].map(([title, desc], i) => (
                  <Card
                    key={title}
                    className="animate-float min-h-[8.8rem] p-4"
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
