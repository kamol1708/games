import { Card } from '../ui/Card'
import { Container } from '../ui/Container'
import { Reveal } from '../ui/Reveal'
import { SectionTitle } from '../ui/SectionTitle'

const items = [
  {
    name: 'Maya Chen',
    role: 'Mahsulot rahbari, Northstar',
    quote:
      'Uchta alohida vositani va tartibsiz status jarayonini almashtirdik. Interfeys tez va toza, haftalik rejalash vaqti esa yarmiga tushdi.',
  },
  {
    name: 'Aziz Karimov',
    role: 'Dasturlash menejeri, Orbital Labs',
    quote:
      'Ish oqimi premium darajada, lekin ishga xalal bermaydi. Ma’lumotlar zichligi foydali bo‘lgani uchun jamoa tez moslashdi.',
  },
  {
    name: 'Sofia Rahman',
    role: 'Operatsiyalar yetakchisi, Craftline',
    quote:
      'Reliz va handoff jarayoni o‘tkazib yuborilgan bosqichlarni keskin kamaytirdi. Dizayn, dasturlash va support bo‘yicha aniq tizim yaratdi.',
  },
]

export function Testimonials() {
  return (
    <section className="py-14 sm:py-16 lg:py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="Fikrlar"
            title="Jamoalar farqni birinchi haftadanoq sezadi"
            description="Hozircha namunaviy matnlar. Keyin haqiqiy mijoz fikrlari va logotiplariga almashtirishingiz mumkin."
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
