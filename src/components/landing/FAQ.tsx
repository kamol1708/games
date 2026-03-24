import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Container } from '../ui/Container'
import { Reveal } from '../ui/Reveal'
import { SectionTitle } from '../ui/SectionTitle'
import { cn } from '../../lib/utils'

const faqs = [
  {
    q: 'Bu haqiqiy backend mahsulotimi?',
    a: 'Yo‘q. Bu integratsiyaga tayyor, premium ko‘rinishdagi landing sahifa bo‘lib, hozircha namunaviy kontent bilan to‘ldirilgan.',
  },
  {
    q: 'Buni mavjud React ilovam bilan ishlatsam bo‘ladimi?',
    a: 'Ha. Komponent tuzilmasi modulli, uni Vite loyihasiga qo‘shish yoki Next.js App Routerga ko‘chirish oson.',
  },
  {
    q: 'Mobil ekranlar uchun ham mosmi?',
    a: 'Ha. Dizayn mobile-first yondashuvda tuzilgan va responsiv gridlar orqali planshet hamda desktopga moslashadi.',
  },
  {
    q: 'Animatsiyalar accessibility talablariga mosmi?',
    a: 'Animatsiyalar yengil berilgan va Framer Motion sozlanganda reduced-motion tanlovini hisobga oladi.',
  },
  {
    q: 'Keyin docs yoki blogga ulasam bo‘ladimi?',
    a: 'Ha. Navbar va CTA havolalari hozircha placeholder, sahifalar tayyor bo‘lgach real routelarga almashtirasiz.',
  },
  {
    q: 'Dizaynni o‘z brendimga moslashtirsam bo‘ladimi?',
    a: 'Albatta. Umumiy UI komponentlari va global uslublarda gradient ranglar, tipografiya va card stillarini o‘zgartiring.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0)

  return (
    <section className="py-14 sm:py-16 lg:py-20">
      <Container className="max-w-4xl">
        <Reveal>
          <SectionTitle eyebrow="FAQ" title="Ko‘p so‘raladigan savollar" align="center" />
        </Reveal>

        <div className="mt-8 space-y-3">
          {faqs.map((item, index) => {
            const open = openIndex === index
            return (
              <Reveal key={item.q} delay={index * 0.03}>
                <div className="glass-card overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
                    onClick={() => setOpenIndex(open ? -1 : index)}
                    aria-expanded={open}
                  >
                    <span className="text-sm font-medium text-white sm:text-base">{item.q}</span>
                    <ChevronDown className={cn('h-4 w-4 text-white/60 transition', open && 'rotate-180')} />
                  </button>

                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="border-t border-white/10 px-4 py-4 text-sm leading-6 text-white/65 sm:px-5">
                          {item.a}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
