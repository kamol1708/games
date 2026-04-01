import { Card } from '../../../components/ui/Card'
import { Container } from '../../../components/ui/Container'
import { Reveal } from '../../../components/ui/Reveal'
import { SectionTitle } from '../../../components/ui/SectionTitle'

const items = [
  {
    name: 'Dilnoza Axmedova',
    role: 'Academic coordinator, Future Kids',
    quote:
      'Landingni ochgan ota-onalar va teacherlar platformada nima borligini darhol tushuna boshladi. O‘yinlar ko‘rinishi ishonchni oshirdi.',
  },
  {
    name: 'Azizbek Karimov',
    role: 'Teacher, Smart Class',
    quote:
      'Eng yoqqani, sahifa uzun bo‘lsa ham charchatmaydi. Har section keyingisini mantiqan ochib beradi.',
  },
  {
    name: 'Malika Rahmonova',
    role: 'Founder, Edu Lab',
    quote:
      'Premium plan va game lineup bir sahifada chiroyli ko‘ringani uchun konversiya tomoni ham ancha tabiiy sezildi.',
  },
]

export function Testimonials() {
  return (
    <section className="py-14 sm:py-16 lg:py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="Fikrlar"
            title="Teacherlar va markazlar buni bir qarashda professional deb his qiladi"
            description="Hozircha namunaviy social proof. Keyin real feedback va markaz nomlariga almashtirish oson."
            align="center"
          />
        </Reveal>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.05}>
              <Card className="h-full rounded-2xl p-5">
                <p className="text-sm leading-7 text-white/70">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-violet-500/30 to-blue-500/30 text-sm font-semibold text-white">
                    {item.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-white/45">{item.role}</p>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
