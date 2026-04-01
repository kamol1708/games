import { Container } from '../../../components/ui/Container'
import { Reveal } from '../../../components/ui/Reveal'

const logos = ['Cambridge Center', 'Najot School', 'Future Kids', 'Edu Lab', 'STEM House', 'Smart Class']

export function Logos() {
  return (
    <Container>
      <Reveal className="py-8 sm:py-10">
        <div className="glass-card rounded-2xl p-4 sm:p-5">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-white/45">
            Classroom tajribasini qadrlaydigan markazlar uchun mos
          </p>
          <div className="logo-marquee-shell mt-4">
            <div className="logo-marquee-track" aria-label="Ishonch bildirgan kompaniyalar">
              {[...logos, ...logos].map((logo, index) => (
                <div
                  key={`${logo}-${index}`}
                  className="logo-pill"
                  aria-hidden={index >= logos.length}
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </Container>
  )
}
