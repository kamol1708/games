import { Menu, LogOut, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '../../../components/ui/Container'
import { getAuthSession, logout, type AuthSession } from '../../../lib/localAuth'

const links = [
  { label: 'Mahsulot', href: '#product' },
  { label: 'O‘yinlar', href: '#games' },
  { label: 'Imkoniyatlar', href: '#features' },
  { label: 'Narxlar', href: '#pricing' },
  { label: 'Qo‘llanma', href: '/docs' },
  { label: 'Savollar', href: '#faq' },
]

type NavbarProps = {
  fullBleed?: boolean
}

export function Navbar({ fullBleed = false }: NavbarProps) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const sync = () => setSession(getAuthSession())
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  return (
    <Container className={fullBleed ? 'max-w-[112rem] px-4 pt-1 sm:px-6 sm:pt-2 lg:px-8' : 'pt-4 sm:pt-6'}>
      <div className="glass-card relative flex items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:px-5">
        <Link to="/home" aria-label="Game Hub bosh sahifasi" className="inline-flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500/80 to-blue-500/80 text-sm font-bold text-white">
            GH
          </span>
          <span className="text-sm font-semibold tracking-[0.12em] text-white/90">GAME HUB</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Asosiy navigatsiya">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              {session.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-sm font-medium text-amber-100"
                >
                  <Shield className="h-4 w-4" />
                  Admin paneli
                </Link>
              ) : null}
              {session.role === 'teacher' ? (
                <Link
                  to="/teacher"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-sm font-medium text-amber-100"
                >
                  <Shield className="h-4 w-4" />
                  O‘qituvchi paneli
                </Link>
              ) : null}
              {session.role === 'student' ? (
                <span className="inline-flex items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-400/10 px-3 py-2 text-sm font-medium text-sky-100">
                  {session.fullName.split(' ')[0] || 'O‘quvchi'}
                </span>
              ) : null}
              <button
                type="button"
                onClick={async () => {
                  await logout()
                  setSession(null)
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Chiqish
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowRoleModal(true)}
                className="glass-card inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm text-white/90 hover:bg-white/10"
              >
                Kirish
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80 md:hidden"
          aria-label={mobileMenuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="glass-card mt-3 rounded-2xl border border-white/10 p-3 md:hidden">
          <nav className="grid gap-1" aria-label="Mobil navigatsiya">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-3 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
            >
              Hujjatlar
            </Link>
          </nav>

          <div className="mt-3 grid gap-2 border-t border-white/10 pt-3">
            {session ? (
              <>
                {session.role === 'admin' ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-3 text-sm font-medium text-amber-100"
                  >
                    <Shield className="h-4 w-4" />
                    Admin paneli
                  </Link>
                ) : null}
                {session.role === 'teacher' ? (
                  <Link
                    to="/teacher"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-3 text-sm font-medium text-amber-100"
                  >
                    <Shield className="h-4 w-4" />
                    O‘qituvchi paneli
                  </Link>
                ) : null}
                {session.role === 'student' ? (
                  <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300/20 bg-sky-400/10 px-3 py-3 text-sm font-medium text-sky-100">
                    {session.fullName.split(' ')[0] || 'O‘quvchi'}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={async () => {
                    await logout()
                    setSession(null)
                    setMobileMenuOpen(false)
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80 hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                  Chiqish
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setShowRoleModal(true)
                }}
                className="glass-card inline-flex h-11 items-center justify-center rounded-xl px-3 text-sm text-white/90 hover:bg-white/10"
              >
                Kirish
              </button>
            )}
          </div>
        </div>
      ) : null}

      {showRoleModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-modal-title"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0f18]/95 p-5 text-white shadow-[0_24px_70px_rgba(2,8,23,0.55)] backdrop-blur-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4b16d]/85">Kirish</p>
            <h3 id="role-modal-title" className="mt-2 text-xl font-semibold">
              Hisobingizga kiring
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Rolni tanlang. Keyingi sahifada shu tanlov bo‘yicha kirish yoki ro‘yxatdan o‘tish mumkin bo‘ladi.
            </p>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRoleModal(false)
                  navigate('/login?role=teacher')
                }}
                className="rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-left text-sm font-medium text-amber-100 hover:bg-amber-400/15"
              >
                O‘qituvchi bo‘lib kirish
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRoleModal(false)
                  navigate('/login?role=student')
                }}
                className="rounded-xl border border-sky-300/20 bg-sky-400/10 px-4 py-3 text-left text-sm font-medium text-sky-100 hover:bg-sky-400/15"
              >
                O‘quvchi bo‘lib kirish
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowRoleModal(false)}
              className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/75 hover:bg-white/10"
            >
              Yopish
            </button>
          </div>
        </div>
      ) : null}
    </Container>
  )
}
