import { ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { GradientBlob } from '../ui/GradientBlob'
import { Reveal } from '../ui/Reveal'

type CTAProps = {
  onPrimaryClick?: () => void
}

export function CTA({ onPrimaryClick }: CTAProps) {
  return (
    <section id="cta" className="py-14 sm:py-16 lg:py-20">
      <Container>
        <Reveal>
          <div className="glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10">
            <GradientBlob color="violet" className="-left-12 top-0 h-40 w-40 opacity-70" />
            <GradientBlob color="blue" className="-right-8 bottom-0 h-48 w-48 opacity-60" />
            <div className="noise-overlay" />

            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Boshlang</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Toza ish oqimi bilan yanada tezroq ishlashga tayyormisiz?
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                  Bugun silliq demo tajribasi bilan boshlang, tayyor bo‘lgach haqiqiy ma’lumotlaringizni ulang.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button onClick={onPrimaryClick} className="w-full justify-center" size="lg">
                  Demo sinash
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button href="#pricing" variant="secondary" className="w-full justify-center" size="lg">
                  Narxlarni ko‘rish
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
