import { Container } from '../ui/Container'
import { Reveal } from '../ui/Reveal'

const logos = ['Rockstar', 'Unity', 'Activision Blizzard', 'EA', 'Epic Games', 'Ubisoft']

export function Logos() {
  return (
    <Container>
      <Reveal className="py-8 sm:py-10">
        <div className="glass-card rounded-2xl p-4 sm:p-5">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-white/45">
            Mahsulot, operatsiya va dasturlash jamoalari ishonadi
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
