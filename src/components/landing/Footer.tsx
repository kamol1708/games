import { Github, Linkedin, Twitter } from 'lucide-react'
import { Container } from '../ui/Container'

const footerLinks = {
  Mahsulot: ['Imkoniyatlar', 'Yo‘l xaritasi', 'Yangilanishlar'],
  Kompaniya: ['Biz haqimizda', 'Vakansiyalar', 'Aloqa'],
  Resurslar: ['Qo‘llanma', 'Maqolalar', 'Yordam markazi'],
}

const socialLinks = [
  { label: 'Twitter', icon: Twitter },
  { label: 'GitHub', icon: Github },
  { label: 'LinkedIn', icon: Linkedin },
] as const

export function Footer() {
  return (
    <footer className="pb-8 pt-10 sm:pb-10">
      <Container>
        <div className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <div className="inline-flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500/80 to-blue-500/80 text-sm font-bold text-white">
                  GH
                </span>
                <span className="text-sm font-semibold tracking-[0.12em] text-white/90">GAME HUB</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
                Zamonaviy mahsulot vositalaridan ilhomlangan premium qorong‘i landing tajribasi. Qayta ishlatiladigan komponentlar va silliq interaksiyalar bilan qurilgan.
              </p>
              <div className="mt-4 flex items-center gap-2">
                {socialLinks.map(({ label, icon: Lucide }) => {
                  return (
                    <a
                      key={label}
                      href="#"
                      aria-label={label}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:text-white"
                    >
                      <Lucide className="h-4 w-4" />
                    </a>
                  )
                })}
              </div>
            </div>

            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <p className="text-sm font-medium text-white">{group}</p>
                <ul className="mt-3 space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/55 transition hover:text-white">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/40">
            © 2026 Game Hub. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </Container>
    </footer>
  )
}
