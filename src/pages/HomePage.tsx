import { ArrowUpRight, Crown, Gamepad2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  BentoFeatures,
  CTA,
  FAQ,
  Footer,
  Hero,
  Logos,
  Navbar,
  Pricing,
  ProductShowcase,
  Testimonials,
} from '../features/home/components'
import { Card } from '../components/ui/Card'
import { Container } from '../components/ui/Container'
import { Reveal } from '../components/ui/Reveal'
import { SectionTitle } from '../components/ui/SectionTitle'

type HomePageProps = {
  onPlayNow: () => void
}

const gameHighlights = [
  {
    title: 'Memory Rush',
    description: 'Tez fikrlash, juft topish va attention training uchun dinamik challenge.',
    tag: 'Speed + focus',
    href: '/games?view=brain',
  },
  {
    title: 'Wheel of Fortune',
    description: 'Sinf oldida savol-javobni show formatida olib borish uchun qulay sahna.',
    tag: 'Stage mode',
    href: '/games?view=classroom',
  },
  {
    title: 'Bilim Poyezdi',
    description: 'Jamoaviy yurish, checkpoint va quiz progression bir sahifada boshqariladi.',
    tag: 'Team race',
    href: '/games?view=team',
  },
  {
    title: 'Word Search',
    description: 'Premium puzzle ko‘rinishida lug‘at, termin va tezkor topish vazifalari.',
    tag: 'Premium',
    href: '/games?view=premium',
  },
]

const journeySteps = [
  {
    step: '1-qadam',
    title: 'Bosh sahifada yo‘nalishni tanlang',
    description: 'Platforma nima berishini ko‘ring va to‘g‘ridan-to‘g‘ri Games sahifasiga o‘ting.',
    href: '/games',
    action: 'Games sahifasini ochish',
  },
  {
    step: '2-qadam',
    title: 'O‘yin kutubxonasidan mos format toping',
    description: 'Search va filter bilan jamoaviy, premium yoki classroom game’larni tez ajrating.',
    href: '/games?view=classroom',
    action: 'Classroom game’larni ko‘rish',
  },
  {
    step: '3-qadam',
    title: 'Teacher bo‘lsangiz savol qo‘shing',
    description: 'Teacher panel orqali savollarni o‘zgartirib, o‘yinni darsingizga moslab oling.',
    href: '/teacher',
    action: 'Teacher panelga o‘tish',
  },
]

function HomePage({ onPlayNow }: HomePageProps) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#05060a] text-white">
      <div className="relative z-10">
        <Navbar fullBleed />
        <main>
          <Hero onPrimaryClick={onPlayNow} fullScreen />
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="section-divider mx-auto max-w-7xl" />
          </div>
          <Logos />
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="section-divider mx-auto max-w-7xl" />
          </div>
          <section className="py-14 sm:py-16 lg:py-20">
            <Container>
              <Reveal>
                <SectionTitle
                  eyebrow="Boshlash yo‘li"
                  title="Foydalanuvchi uchun eng to‘g‘ri oqim"
                  description="Yangi user avval Home’dan qiymatni ko‘radi, keyin Games’da mos formatni topadi, teacher bo‘lsa oxirida panelga o‘tib savollarini moslaydi."
                />
              </Reveal>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {journeySteps.map((item, index) => (
                  <Reveal key={item.title} delay={Math.min(index * 0.06, 0.18)}>
                    <Link to={item.href} className="block">
                      <Card className="rounded-[1.75rem] p-6">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/55">
                          {item.step}
                        </span>
                        <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-white/62">{item.description}</p>
                        <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#7dd3fc]">
                          {item.action}
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </Card>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </Container>
          </section>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="section-divider mx-auto max-w-7xl" />
          </div>
          <BentoFeatures />
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="section-divider mx-auto max-w-7xl" />
          </div>
          <ProductShowcase />
          <section id="games" className="py-14 sm:py-16 lg:py-20">
            <Container>
              <Reveal>
                <SectionTitle
                  eyebrow="O‘yin kutubxonasi"
                  title="Har xil dars uslublari uchun turli formatdagi tajribalar"
                  description="Sizda faqat bitta demo emas, balki teacher-led, premium va team-based ssenariylarni yopadigan to‘liq game lineup borligini ko‘rsatadi."
                />
              </Reveal>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {gameHighlights.map((game, index) => (
                  <Reveal key={game.title} delay={Math.min(index * 0.05, 0.2)}>
                    <Link to={game.href} className="block">
                      <Card className="group rounded-[1.75rem] p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#f4b16d]/20 to-[#7dd3fc]/15 text-[#f4b16d]">
                            {index === 3 ? <Crown className="h-5 w-5" /> : <Gamepad2 className="h-5 w-5" />}
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/52">
                            {game.tag}
                          </span>
                        </div>

                        <h3 className="mt-6 text-xl font-semibold text-white">{game.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-white/62">{game.description}</p>
                        <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#7dd3fc] transition group-hover:translate-x-1">
                          Shu kolleksiyani ko‘rish
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </Card>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </Container>
          </section>
          <Testimonials />
          <Pricing />
          <FAQ />
          <CTA onPrimaryClick={onPlayNow} />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default HomePage
