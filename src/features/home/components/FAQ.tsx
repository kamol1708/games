import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Container } from '../../../components/ui/Container'
import { Reveal } from '../../../components/ui/Reveal'
import { SectionTitle } from '../../../components/ui/SectionTitle'
import { cn } from '../../../lib/utils'

const faqs = [
  {
    q: 'Bu sahifa real product flowga mosmi?',
    a: 'Ha. Home endi game library, teacher control, pricing va premium oqimlarni bitta story ichida ko‘rsatadi.',
  },
  {
    q: 'Buni mavjud React ilovam bilan ishlatsam bo‘ladimi?',
    a: 'Ha. Komponentlar modulli, shu sabab home ichidagi sectionlarni keyin ham alohida-alohida almashtirish oson.',
  },
  {
    q: 'Mobil ekranlar uchun ham mosmi?',
    a: 'Ha. Sectionlar responsiv grid bilan qayta yig‘ilgan, hero va kartalar mobil ekranda ham toza tushadi.',
  },
  {
    q: 'Animatsiyalar accessibility talablariga mosmi?',
    a: 'Ha. Framer Motion reduced-motion holatini inobatga oladi, animatsiyalar esa yengil va bezovta qilmaydigan darajada.',
  },
  {
    q: 'Keyin docs yoki boshqa sahifalarga ulasam bo‘ladimi?',
    a: 'Ha. Navbar va CTA linklari real routelar bilan ishlaydi, qolgan anchor bo‘limlar esa home ichida qoladi.',
  },
  {
    q: 'Dizaynni keyin yana brandga moslashtirsam bo‘ladimi?',
    a: 'Albatta. Ranglar, tipografiya va CTA matnlarini global va komponent darajasida oson o‘zgartirish mumkin.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0)

  return (
    <section id="faq" className="py-14 sm:py-16 lg:py-20">
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
