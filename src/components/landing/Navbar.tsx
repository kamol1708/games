import { Menu, LogOut, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '../ui/Container'
import { getAuthSession, logout, type AuthSession } from '../../lib/localAuth'

const links = [
  { label: 'Mahsulot', href: '#product' },
  { label: 'Imkoniyatlar', href: '#features' },
  { label: 'Narxlar', href: '#pricing' },
  { label: 'Qo‘llanma', href: '/docs' },
  { label: 'Maqolalar', href: '#blog' },
]

export function Navbar() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
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
    <Container className="pt-4 sm:pt-6">
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
              {session.role === 'teacher' || session.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-sm font-medium text-amber-100"
                >
                  <Shield className="h-4 w-4" />
                  O‘qituvchi paneli
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-xl border border-blue-300/20 bg-blue-400/10 px-3 py-2 text-sm font-medium text-blue-100">
                  🎓 {session.fullName.split(' ')[0] || 'O‘quvchi'}
                </span>
              )}
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
                className="glass-card inline-flex h-9 items-center justify-center rounded-xl px-3 text-sm text-white/90 hover:bg-white/10"
              >
                Kirish
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80 md:hidden"
          aria-label="Menyuni ochish"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {showRoleModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-modal-title"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0f18]/95 p-5 text-white shadow-[0_24px_70px_rgba(2,8,23,0.55)] backdrop-blur-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Kirish</p>
            <h3 id="role-modal-title" className="mt-2 text-xl font-semibold">
              Hisobingizga kiring
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/65">
              O‘qituvchi/admin paneliga kirish va savollarni boshqarish shu yerda.
            </p>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRoleModal(false)
                  navigate('/login')
                }}
                className="rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-left text-sm font-medium text-amber-100 hover:bg-amber-400/15"
              >
                Kirish
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
