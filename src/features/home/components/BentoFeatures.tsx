import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  BrainCircuit,
  Clock3,
  Crown,
  LayoutDashboard,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Container } from '../../../components/ui/Container'
import { Reveal } from '../../../components/ui/Reveal'
import { SectionTitle } from '../../../components/ui/SectionTitle'

type Feature = {
  title: string
  description: string
  icon: LucideIcon
  className?: string
}

const features: Feature[] = [
  {
    title: 'Tez setup, tez start',
    description: 'O‘yinni tanlash, classni tayyorlash va boshlash bir necha qadamda yakunlanadi.',
    icon: Clock3,
    className: 'md:col-span-2',
  },
  {
    title: 'Teacher controls',
    description: 'Savol oqimi, navbat va sinf tempini o‘qituvchi uchun boshqarish oson.',
    icon: BrainCircuit,
  },
  {
    title: 'Team competition',
    description: 'Jamoa formatlari o‘quvchilarni tezroq jalb qiladi va darsga energiya qo‘shadi.',
    icon: Users,
  },
  {
    title: 'Premium ko‘rinish',
    description: 'Landing ham, o‘yin sahifalari ham bir xil premium vizual ritmda ishlaydi.',
    icon: Sparkles,
    className: 'md:col-span-2',
  },
  {
    title: 'Teacher/admin access',
    description: 'Rolga asoslangan kirish va boshqaruv oqimi mavjud.',
    icon: Shield,
  },
  {
    title: 'Student-friendly UI',
    description: 'Soddalashtirilgan ekranlar tufayli o‘quvchi tez tushunadi va darhol ishtirok etadi.',
    icon: BadgeCheck,
  },
  {
    title: 'Dashboard overview',
    description: 'Mualliflik, premium access va classroom usage bir tizimda ko‘rinadi.',
    icon: LayoutDashboard,
  },
  {
    title: 'Premium game unlock',
    description: 'Maxsus o‘yinlar, boyroq flow va monetizatsiya uchun tayyor poydevor.',
    icon: Crown,
    className: 'md:col-span-2',
  },
]

export function BentoFeatures() {
  return (
    <section id="features" className="py-14 sm:py-16 lg:py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="Imkoniyatlar"
            title="Teacher, student va premium flow bir joyda ishlashi uchun yaratilgan"
            description="Faqat chiroyli ko‘rinish emas, balki dars ichida haqiqatan ishlaydigan navigatsiya, kontrol va ritm."
          />
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Reveal key={feature.title} delay={Math.min(index * 0.04, 0.24)}>
                <Card className={`group h-full rounded-2xl p-5 ${feature.className ?? ''}`}>
                  <div className="flex h-full flex-col">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#f4b16d] transition group-hover:scale-105 group-hover:text-[#7dd3fc]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">{feature.description}</p>
                    <div className="mt-auto pt-5">
                      <div className="h-px w-full bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
                    </div>
                  </div>
                </Card>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
