import type { LucideIcon } from 'lucide-react'
import {
  BellRing,
  Boxes,
  BrainCircuit,
  FileText,
  Gauge,
  GitBranch,
  Lock,
  Zap,
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Container } from '../ui/Container'
import { Reveal } from '../ui/Reveal'
import { SectionTitle } from '../ui/SectionTitle'

type Feature = {
  title: string
  description: string
  icon: LucideIcon
  className?: string
}

const features: Feature[] = [
  {
    title: 'Real vaqt sinxronlashuvi',
    description: 'Yangilanishlar ish maydoniga bir zumda uzatiladi, jamoa bir xil holatni ko‘radi.',
    icon: Zap,
    className: 'md:col-span-2',
  },
  {
    title: 'Aqlli ish oqimlari',
    description: 'Qoidalar, shablonlar va tasdiqlash yo‘nalishlari bilan takroriy ishlarni avtomatlashtiring.',
    icon: BrainCircuit,
  },
  {
    title: 'Reliz rejalash',
    description: 'Yo‘l xaritasi, bosqichlar va bog‘liqliklar bitta timeline ichida.',
    icon: GitBranch,
  },
  {
    title: 'Samaradorlik paneli',
    description: 'Keraksiz elementlarsiz, asosiy metrikalarga yo‘naltirilgan toza panel.',
    icon: Gauge,
    className: 'md:col-span-2',
  },
  {
    title: 'Standart bo‘yicha xavfsiz',
    description: 'Rolga asoslangan kirish, audit jurnallari va himoyalangan jamoa maydoni.',
    icon: Lock,
  },
  {
    title: 'Hujjat + Vazifa',
    description: 'Spetsifikatsiya yozing va qarorlarni kuzatiladigan ijro vazifasiga aylantiring.',
    icon: FileText,
  },
  {
    title: 'Integratsiyalar',
    description: 'Stekni toza API va event hooklar orqali ulang.',
    icon: Boxes,
  },
  {
    title: 'Faollik lentasi',
    description: 'Mentionlar, topshirish ogohlantirishlari va reliz yangiliklari bitta lentada.',
    icon: BellRing,
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
            title="Jamoani uzluksiz oqimda ushlash uchun yaratilgan"
            description="Minimal interfeys, yuqori signal zichligi va tez, ammo sokin interaksiya detallari."
          />
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Reveal key={feature.title} delay={Math.min(index * 0.04, 0.24)}>
                <Card className={`group h-full rounded-2xl p-5 ${feature.className ?? ''}`}>
                  <div className="flex h-full flex-col">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-violet-300 transition group-hover:scale-105 group-hover:text-blue-300">
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
