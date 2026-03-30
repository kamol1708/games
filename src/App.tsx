import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import HomePage from './pages/HomePage'
import DocsPage from './pages/DocsPage'
import QuizBattlePage from './pages/quiz-battle/QuizBattlePage'
import TreasureHuntPage from './pages/treasure-hunt/TreasureHuntPage'
import MemoryRushPage from './pages/memory-rush/MemoryRushPage'
import FootballChallengePage from './pages/FootballChallengePage'
import TugOfWarPage from './pages/TugOfWarPage'
import ImageQuizPage from './pages/ImageQuizPage'
import WordSearchPage from './pages/WordSearchPage'
import WheelOfFortunePage from './pages/wheel-of-fortune/WheelOfFortunePage'
import FlagRacePage from './pages/flag-race/FlagRacePage'
import FlagPlayerRacePage from './pages/flag-race/FlagPlayerRacePage'
import LearningPage from './pages/LearningPage'
import PaymentPage from './pages/PaymentPage'
import BilimPoyezdiPage from './pages/bilim-poyezdi/BilimPoyezdiPage'
import MarioMathEmbedPage from './pages/MarioMathEmbedPage'
import BumbuzzlePage from './pages/bumbuzzle/BumbuzzlePage'
import JungleBoard3DPage from './pages/JungleBoard3DPage'
import PacmanArcadePage from './pages/PacmanArcadePage'
import KimMillionerPage from './pages/kim-millioner/KimMillionerPage'
import ClassroomTeamQuizPage from './pages/ClassroomTeamQuizPage'
import MonopolyCalibrationPage from './pages/MonopolyCalibrationPage'
import FrogPondPage from './pages/frog-pond/FrogPondPage'
import GameFeedbackDock from './components/GameFeedbackDock'
import TeacherFeedbackInbox from './components/TeacherFeedbackInbox'
import TeacherQuestionAdmin from './components/TeacherQuestionAdmin'
import memoryRushCover from './assets/memoryrush-cover-new.webp'
import treasureHuntCover from './assets/15-single-default.jpg'
import footballChallengeCover from './assets/football-challenge-cover.png'
import tugOfWarCover from './assets/cute-man-playing-tug-war-indonesian-independence-day-cartoon-vector-icon-illustration-people_138676-8733.avif'
import wheelOfFortuneCover from './assets/wheel-of-fortune-cover.webp'
import flagRaceCover from './assets/word-search-cover.webp'
import wordSearchCover from './assets/word-search-cover.jpg'
import bumbuzzleCover from './assets/baamboozle.png'
import jungleBoardCover from './assets/jungle-board-cover.png'
import classroomTeamQuizCover from './assets/classroom-team-quiz-cover.webp'
import kimMillionerCover from './assets/kim-millioner-cover.jpg'
import imageQuizCover from './assets/360_F_290390054_92MXhhVdHu46JuZnl3xK9e7w2jlv33O3.jpg'
import jumperFrogThumbnail from './assets/jumperfrog_thumbnail.avif'
import monopoly from './assets/monomap.jpg'
import { cn } from './lib/utils'
import {
  getAuthSession,
  getRegisteredStudents,
  getRegisteredTeachers,
  isTeacherAuthenticated,
  isUserAuthenticated,
  loginTeacher,
  logout,
  registerTeacher,
} from './lib/localAuth'
import { getTeacherContentStore, syncAllTeacherContentFromBackend } from './lib/teacherContent'
import { getGameFeedbackStore } from './lib/gameFeedback'
import {
  formatPremiumExpiry,
  getPremiumSubscriptionInfo,
  hasPremiumSubscription,
  subscribeToPremium,
  syncPremiumFromBackend,
} from './lib/subscription'

const appUiStyles = `
  :root {
    --arcade-ink: #1f2740;
    --arcade-muted: #6d748b;
    --arcade-cream: #f8f6f1;
    --arcade-peach: #ffd99a;
    --arcade-orange: #ff9357;
    --arcade-blue: #2d3b57;
    --arcade-card: rgba(255,255,255,0.88);
    --arcade-stroke: rgba(35, 44, 72, 0.08);
    --arcade-shadow: 0 24px 60px rgba(35, 44, 72, 0.12);
  }

  .app-shell {
    min-height: 100vh;
    background:
      radial-gradient(circle at 16% 16%, rgba(255, 200, 103, 0.32), transparent 35%),
      radial-gradient(circle at 84% 22%, rgba(124, 176, 255, 0.20), transparent 38%),
      radial-gradient(circle at 74% 86%, rgba(255, 145, 92, 0.18), transparent 34%),
      linear-gradient(180deg, #fbfaf6 0%, #f2f4fb 100%);
    color: var(--arcade-ink);
  }

  .app-shell.game-shell {
    background:
      radial-gradient(circle at 12% 8%, rgba(255, 182, 84, 0.28), transparent 34%),
      radial-gradient(circle at 88% 10%, rgba(83, 135, 255, 0.18), transparent 30%),
      linear-gradient(180deg, #f8f7f2 0%, #eef2fb 100%);
  }

  .app-main-header {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 20px;
    backdrop-filter: blur(14px);
    background: rgba(43, 57, 86, 0.92);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .app-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-weight: 800;
    letter-spacing: 0.02em;
    text-decoration: none;
  }

  .app-brand-mark {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background:
      radial-gradient(circle at 30% 30%, #fff 0 12%, transparent 13%),
      radial-gradient(circle at 70% 72%, #fff 0 10%, transparent 11%),
      linear-gradient(135deg, #ffb85c, #ff7b55);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.35);
  }

  .app-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .app-nav-link {
    color: rgba(255,255,255,0.88);
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 14px;
    transition: background-color .2s ease, color .2s ease, transform .2s ease;
  }

  .app-nav-link:hover {
    background: rgba(255,255,255,0.12);
    color: #fff;
    transform: translateY(-1px);
  }

  .app-nav-link.cta {
    background: linear-gradient(135deg, #ffb356, #ff8658);
    color: #1f2740;
    box-shadow: 0 10px 25px rgba(255, 133, 78, 0.28);
  }

  .app-content {
    width: min(1120px, calc(100% - 32px));
    margin: 0 auto;
    padding: 22px 0 32px;
  }

  .hero-panel {
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    padding: 28px;
    border: 1px solid var(--arcade-stroke);
    background:
      radial-gradient(circle at 85% 20%, rgba(137, 184, 255, 0.22), transparent 42%),
      radial-gradient(circle at 15% 85%, rgba(255, 181, 95, 0.16), transparent 35%),
      linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,248,252,0.92));
    box-shadow: var(--arcade-shadow);
  }

  .hero-panel::before,
  .hero-panel::after {
    content: "";
    position: absolute;
    border-radius: 999px;
    filter: blur(1px);
    pointer-events: none;
  }

  .hero-panel::before {
    width: 210px;
    height: 210px;
    right: -40px;
    top: -45px;
    background: radial-gradient(circle, rgba(255, 170, 90, 0.28) 0%, rgba(255,170,90,0) 70%);
  }

  .hero-panel::after {
    width: 180px;
    height: 180px;
    left: -30px;
    bottom: -40px;
    background: radial-gradient(circle, rgba(93, 147, 255, 0.18) 0%, rgba(93,147,255,0) 72%);
  }

  .eyebrow {
    margin: 0 0 8px;
    color: #ff8f53;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .hero-title {
    margin: 0;
    font-size: clamp(28px, 4vw, 42px);
    line-height: 1.05;
    color: #24304d;
    letter-spacing: -0.02em;
  }

  .hero-copy {
    margin: 14px 0 0;
    color: var(--arcade-muted);
    max-width: 62ch;
    line-height: 1.5;
  }

  .chip-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.9);
    border: 1px solid var(--arcade-stroke);
    color: #36415d;
    font-weight: 700;
    font-size: 13px;
  }

  .tile-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-top: 18px;
  }

  .tile-card {
    text-decoration: none;
    color: inherit;
    border-radius: 22px;
    border: 1px solid var(--arcade-stroke);
    background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.78));
    box-shadow: 0 18px 34px rgba(31, 39, 64, 0.08);
    padding: 18px;
    display: grid;
    gap: 12px;
    transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
    position: relative;
    overflow: hidden;
  }

  .tile-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 22px 42px rgba(31, 39, 64, 0.14);
    border-color: rgba(255, 145, 92, 0.28);
  }

  .tile-card::after {
    content: "";
    position: absolute;
    inset: auto -30px -55px auto;
    width: 130px;
    height: 130px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(255, 173, 90, 0.18), rgba(255, 173, 90, 0));
    pointer-events: none;
  }

  .tile-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .tile-icon {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: linear-gradient(135deg, #fff4d7, #ffe3cb);
    font-size: 21px;
    box-shadow: inset 0 0 0 1px rgba(255, 158, 93, 0.25);
  }

  .tile-badge {
    border-radius: 999px;
    padding: 6px 10px;
    background: rgba(45, 59, 87, 0.08);
    font-size: 12px;
    font-weight: 700;
    color: #3a4662;
  }

  .tile-card h3 {
    margin: 0;
    font-size: 20px;
    line-height: 1.1;
    color: #24304d;
  }

  .tile-card p {
    margin: 0;
    color: var(--arcade-muted);
    line-height: 1.45;
    font-size: 14px;
  }

  .tile-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 4px;
  }

  .pill-btn {
    border: 0;
    border-radius: 999px;
    padding: 10px 14px;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: #24304d;
    background: linear-gradient(135deg, #ffd77f, #ff9c62);
    box-shadow: 0 12px 26px rgba(255, 151, 92, 0.24);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .surface-card {
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.10);
    background:
      radial-gradient(circle at 90% 12%, rgba(139, 92, 246, 0.12), transparent 45%),
      radial-gradient(circle at 10% 92%, rgba(59, 130, 246, 0.10), transparent 42%),
      rgba(255,255,255,0.04);
    box-shadow: 0 24px 70px rgba(2, 8, 23, 0.35);
    backdrop-filter: blur(14px);
    padding: 20px;
  }

  .form-shell {
    width: min(100%, 460px);
    border-radius: 28px;
    border: 1px solid rgba(255,255,255,0.25);
    background:
      radial-gradient(circle at 90% 8%, rgba(255,175,105,0.20), transparent 36%),
      radial-gradient(circle at 10% 90%, rgba(127,165,255,0.16), transparent 34%),
      rgba(255,255,255,0.92);
    box-shadow: 0 30px 60px rgba(31, 39, 64, 0.16);
    padding: 22px;
  }

  .auth-grid {
    display: grid;
    gap: 10px;
  }

  .auth-title {
    margin: 0;
    color: #24304d;
    font-size: 28px;
    letter-spacing: -0.02em;
  }

  .auth-note {
    margin: 0 0 4px;
    color: var(--arcade-muted);
    font-size: 14px;
  }

  .field {
    width: 100%;
    border-radius: 14px;
    border: 1px solid rgba(37, 49, 81, 0.12);
    background: rgba(255,255,255,0.9);
    padding: 12px 14px;
    font: inherit;
    color: #24304d;
    box-sizing: border-box;
  }

  .field:focus {
    outline: 2px solid rgba(255, 147, 87, 0.35);
    border-color: rgba(255, 147, 87, 0.32);
  }

  .sub-link {
    color: #ff8458;
    font-weight: 700;
    text-decoration: none;
  }

  .sub-link:hover { text-decoration: underline; }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 18px;
  }

  .stat-box {
    border-radius: 18px;
    border: 1px solid var(--arcade-stroke);
    background: rgba(255,255,255,0.78);
    padding: 14px;
  }

  .stat-label {
    margin: 0;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #7a8094;
    font-weight: 800;
  }

  .stat-value {
    margin: 8px 0 0;
    color: #24304d;
    font-weight: 800;
    font-size: 24px;
  }

  .admin-grid {
    display: grid;
    grid-template-columns: 1.3fr .7fr;
    gap: 16px;
    margin-top: 16px;
  }

  .task-list {
    display: grid;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .task-item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    border-radius: 14px;
    padding: 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
  }

  .task-item small {
    color: rgba(255,255,255,0.55);
    display: block;
    margin-top: 4px;
  }

  .task-status {
    border-radius: 999px;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 800;
    background: rgba(251, 146, 60, 0.14);
    color: #fed7aa;
    white-space: nowrap;
    border: 1px solid rgba(251, 146, 60, 0.18);
  }

  @media (max-width: 900px) {
    .tile-grid,
    .stats-grid,
    .admin-grid {
      grid-template-columns: 1fr;
    }

    .app-main-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .app-content {
      width: calc(100% - 20px);
      padding-top: 14px;
    }

    .hero-panel {
      padding: 20px;
      border-radius: 20px;
    }
  }

  @media (max-width: 430px) and (pointer: coarse) {
    .app-main-header {
      position: sticky;
      top: 0;
      gap: 10px;
      padding: calc(var(--safe-top, 0px) + 10px) calc(12px + var(--safe-right, 0px)) 12px calc(12px + var(--safe-left, 0px));
    }

    .app-brand {
      font-size: 14px;
    }

    .app-nav {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .app-nav-link {
      text-align: center;
      padding: 10px 12px;
      font-size: 13px;
    }

    .app-content {
      width: calc(100% - 16px);
      padding-top: 12px;
      padding-bottom: calc(20px + var(--safe-bottom, 0px));
    }

    .hero-panel,
    .surface-card,
    .form-shell {
      border-radius: 20px;
      padding: 16px;
    }

    .hero-title {
      font-size: 26px;
      line-height: 1.08;
    }

    .hero-copy {
      font-size: 14px;
      line-height: 1.55;
    }

    .tile-grid,
    .stats-grid,
    .admin-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .tile-card {
      border-radius: 18px;
      padding: 16px;
    }

    .tile-card h3 {
      font-size: 18px;
    }

    .tile-footer {
      align-items: stretch;
      flex-direction: column;
    }

    .pill-btn {
      width: 100%;
      min-height: 44px;
    }

    .auth-title {
      font-size: 24px;
    }
  }
`

type GameCardProps = {
  to: string
  title: string
  badge: string
  icon: string
  text: string
  cover?: string
}

const PREMIUM_LOCKED_GAMES = new Set([
  '/games/tug-of-war',
  '/games/word-search',
  '/games/memory-rush',
  '/games/bilim-poyezdi',
])

function PremiumLockedGameGuard({
  children,
}: PropsWithChildren) {
  const location = useLocation()

  if (hasPremiumSubscription()) {
    return <>{children}</>
  }

  return (
    <Navigate
      to="/games"
      replace
      state={{
        premiumLockedModal: true,
        premiumLockedFrom: location.pathname,
      }}
    />
  )
}

function isPremiumLockedPath(path: string) {
  return PREMIUM_LOCKED_GAMES.has(path)
}

function AnyUserGameGuard({ children }: PropsWithChildren) {
  const location = useLocation()
  if (isUserAuthenticated()) return <>{children}</>

  return (
    <Navigate
      to="/games"
      replace
      state={{
        authRequiredModal: true,
        authRequiredFrom: location.pathname,
      }}
    />
  )
}

function AppUiStyleTag() {
  return <style>{appUiStyles}</style>
}

function SiteLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      Loading...
    </div>
  )
}

function ProtectedRoute({
  children,
  role,
}: PropsWithChildren<{ role?: 'admin' | 'user' }>) {
  const location = useLocation()
  const isAuthenticated = role ? isTeacherAuthenticated() : true
  const isAdmin = isTeacherAuthenticated()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (role === 'admin' && !isAdmin) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

function AuthLayout() {
  return (
    <main className="app-shell" style={{ display: 'grid', placeItems: 'center', padding: 16 }}>
      <section className="form-shell">
        <Outlet />
      </section>
    </main>
  )
}

function MainLayout() {
  const session = getAuthSession()
  return (
    <div className="app-shell">
      <header className="app-main-header">
        <Link className="app-brand" to="/home">
          <span className="app-brand-mark" aria-hidden="true" />
          <span>Edu Games</span>
        </Link>
        <nav className="app-nav" aria-label="Main navigation">
          <Link className="app-nav-link" to="/home">Home</Link>
          <Link className="app-nav-link" to="/profile">Profile</Link>
          <Link className="app-nav-link" to="/games">Games</Link>
          {session ? (
            <>
              {session.role === 'teacher' || session.role === 'admin' ? (
                <Link className="app-nav-link cta" to="/admin">Teacher Panel</Link>
              ) : (
                <span className="app-nav-link cta" aria-label="Student session">Student</span>
              )}
              <button
                type="button"
                className="app-nav-link"
                onClick={async () => {
                  await logout()
                  window.location.href = '/home'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link className="app-nav-link cta" to="/login">Teacher Login</Link>
          )}
        </nav>
      </header>
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  )
}

function AdminLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04050a] text-white">
      <div className="pointer-events-none absolute -left-10 top-0 h-64 w-64 rounded-full bg-violet-500/20 blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-10 h-72 w-72 rounded-full bg-sky-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:16px_16px]" />

      <div className="relative px-3 py-3 sm:px-5 sm:py-5">
        <section className="relative min-h-[calc(100vh-24px)] overflow-hidden rounded-[28px] border border-white/10 bg-[#080b14]/95 shadow-[0_30px_120px_rgba(0,0,0,.45)] sm:min-h-[calc(100vh-40px)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
          <div className="relative border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">Teacher Control Center</p>
                <h1 className="mt-2 bg-gradient-to-r from-white via-sky-100 to-violet-200 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-4xl">
                  Teacher Admin Panel
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60 sm:text-base">
                  O&apos;yinlar savollari, teacher kontenti va boshqaruv sozlamalarini bitta premium paneldan boshqaring.
                </p>
              </div>

              <div className="grid min-w-[240px] gap-2 sm:min-w-[280px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <p className="text-xs text-white/45">Panel holati</p>
                  <p className="mt-1 text-sm font-semibold text-white">Online • LocalStorage Sync</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('teacher-question-admin:open-add-modal'))}
                  className="rounded-2xl border border-sky-300/20 bg-gradient-to-r from-sky-400/15 to-indigo-500/15 px-4 py-2.5 text-left transition hover:from-sky-400/20 hover:to-indigo-500/20"
                >
                  <div className="text-sm font-semibold text-sky-100">+ Savol qo‘shish</div>
                  <div className="mt-0.5 text-[11px] text-sky-100/70">O‘yin tanlash modal ichida</div>
                </button>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">Savollar</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">Teacher tools</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">Analytics</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative px-4 py-4 sm:px-6 sm:py-6">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  )
}

function GameLayout() {
  return (
    <div className="min-h-screen bg-[#05060a]">
      <Outlet />
      <GameFeedbackDock />
    </div>
  )
}

function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/admin'

  const handleLogin = async () => {
    setIsSubmitting(true)
    const result = await loginTeacher({ email, password })
    if (!result.ok) {
      setError(result.message)
      setIsSubmitting(false)
      return
    }
    try {
      await syncAllTeacherContentFromBackend()
    } catch {
      // keep app usable even if question sync fails
    }
    setError('')
    navigate(from, { replace: true })
    setIsSubmitting(false)
  }

  return (
    <div className="auth-grid">
      <p className="eyebrow">Teacher/Admin Kirishi</p>
      <h2 className="auth-title">Teacher Login</h2>
      <p className="auth-note">
        Teacher panelga kirib barcha o'yinlarga savol qo'shing.
      </p>
      <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        className="field"
        type="password"
        placeholder="Parol"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? <p className="auth-note" style={{ color: '#ff8f8f', marginTop: -4 }}>{error}</p> : null}
      <button className="pill-btn" type="button" onClick={() => void handleLogin()} disabled={isSubmitting}>
        {isSubmitting ? 'Kirilmoqda...' : 'Kirish'}
      </button>
      <p className="auth-note" style={{ marginTop: 2 }}>
        Akkaunt yo&apos;qmi? <Link className="sub-link" to="/register">Ro&apos;yxatdan o&apos;tish</Link>
      </p>
    </div>
  )
}

function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegister = async () => {
    setIsSubmitting(true)
    const result = await registerTeacher({ fullName, email, password })
    if (!result.ok) {
      setError(result.message)
      setIsSubmitting(false)
      return
    }
    try {
      await syncAllTeacherContentFromBackend()
    } catch {
      // keep app usable even if question sync fails
    }
    setError('')
    navigate('/admin', { replace: true })
    setIsSubmitting(false)
  }

  return (
    <div className="auth-grid">
      <p className="eyebrow">Teacher Account</p>
      <h2 className="auth-title">Register Teacher</h2>
      <p className="auth-note">
        {"Ro'yxatdan o'tsangiz akkaunt avtomatik teacher rolida ochiladi."}
      </p>
      <input
        className="field"
        type="text"
        placeholder="Ism familiya"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        className="field"
        type="password"
        placeholder="Parol (min 4)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? <p className="auth-note" style={{ color: '#ff8f8f', marginTop: -4 }}>{error}</p> : null}
      <button className="pill-btn" type="button" onClick={() => void handleRegister()} disabled={isSubmitting}>
        {isSubmitting ? 'Yaratilmoqda...' : "Teacher akkaunt yaratish"}
      </button>
      <p className="auth-note" style={{ marginTop: 2 }}>
        Akkaunt bormi? <Link className="sub-link" to="/login">Kirish</Link>
      </p>
    </div>
  )
}

function HelloAdmin() {
  const [activeTab, setActiveTab] = useState<'questions' | 'feedback' | 'games' | 'users' | 'analytics'>('questions')
  const [refreshKey, setRefreshKey] = useState(0)
  const [gameSettings, setGameSettings] = useState<Record<string, { enabled: boolean; timerSec: number }>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      return JSON.parse(window.localStorage.getItem('teacher-game-settings-v1') ?? '{}') as Record<
        string,
        { enabled: boolean; timerSec: number }
      >
    } catch {
      return {}
    }
  })

  const tabs = [
    { key: 'questions', label: 'Questions' },
    { key: 'feedback', label: 'Feedback' },
    { key: 'games', label: 'Games' },
    { key: 'users', label: 'Users' },
    { key: 'analytics', label: 'Analytics' },
  ] as const

  const teacherList = useMemo(() => getRegisteredTeachers(), [refreshKey])
  const studentList = useMemo(() => getRegisteredStudents(), [refreshKey])
  const teacherStore = useMemo(() => getTeacherContentStore(), [refreshKey])
  const feedbackItems = useMemo(() => getGameFeedbackStore(), [refreshKey])
  const contentEntries = useMemo<{ gameKey: string; count: number }[]>(
    () =>
      Object.entries(teacherStore).map(([gameKey, items]) => ({
        gameKey,
        count: Array.isArray(items) ? items.length : 0,
      })),
    [teacherStore],
  )
  const totalTeacherQuestions = contentEntries.reduce((sum: number, entry) => sum + entry.count, 0)
  const gamesWithContent = contentEntries.filter((entry) => entry.count > 0).length
  const pendingFeedbackCount = feedbackItems.filter((item) => item.status === 'pending').length
  const totalFeedbackCount = feedbackItems.length

  useEffect(() => {
    const sync = () => setRefreshKey((v) => v + 1)
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    window.addEventListener('game-feedback:changed', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
      window.removeEventListener('game-feedback:changed', sync)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('teacher-game-settings-v1', JSON.stringify(gameSettings))
  }, [gameSettings])

  const managedGames = [
    'quiz-battle',
    'treasure-hunt',
    'memory-rush',
    'tug-of-war',
    'word-search',
    'wheel-of-fortune',
    'football-challenge',
    'flag-race',
    'flag-player-race',
    'learning',
    'bilim-poyezdi',
  ]

  const gameConfig = (key: string) => gameSettings[key] ?? { enabled: true, timerSec: 120 }

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_40px_rgba(0,0,0,.2)] backdrop-blur-xl">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-400/15 to-violet-500/10 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">Session</p>
          <p className="mt-2 text-lg font-semibold text-white">Teacher Mode</p>
          <p className="mt-1 text-xs leading-5 text-white/60">Savollar, o‘yinlar va foydalanuvchilarni boshqarish paneli.</p>
        </div>

        <div className="mt-4 grid gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm transition',
                activeTab === tab.key
                  ? 'border-sky-300/30 bg-gradient-to-r from-sky-500/15 to-violet-500/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.05)]'
                  : 'border-white/10 bg-black/20 text-white/70 hover:bg-white/5',
              )}
            >
              <span className="font-medium">{tab.label}</span>
              <span className={cn('text-xs', activeTab === tab.key ? 'text-sky-200' : 'text-white/35')}>●</span>
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs text-white/45">Teacherlar</p>
            <p className="mt-1 text-2xl font-semibold text-white">{teacherList.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs text-white/45">Qo‘shilgan savollar</p>
            <p className="mt-1 text-2xl font-semibold text-white">{totalTeacherQuestions}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs text-white/45">Pending feedback</p>
            <p className="mt-1 text-2xl font-semibold text-white">{pendingFeedbackCount}</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 space-y-4">
        <div className="grid gap-4 2xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">Dashboard</p>
                <h3 className="mt-1 text-lg font-semibold text-white">Bugungi vazifalar</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/70">3 ta task</span>
            </div>
            <div className="space-y-3">
              {[
                ['Quiz Battle savollarini tekshirish', 'Kontent moderatsiya', 'Pending'],
                ['Treasure Hunt reward balans', 'Game economy', 'Review'],
                ['Memory Rush analytics', 'Daily stats', 'Ready'],
              ].map(([title, subtitle, status]) => (
                <div key={title} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-xs text-white/55">{subtitle}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium',
                      status === 'Pending' && 'border-amber-300/20 bg-amber-400/10 text-amber-200',
                      status === 'Review' && 'border-sky-300/20 bg-sky-400/10 text-sky-200',
                      status === 'Ready' && 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200',
                    )}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-4 backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Quick stats</h3>
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/65">Live</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs text-white/45">Teacherlar</p>
                <p className="mt-2 text-3xl font-semibold text-white">{teacherList.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs text-white/45">Studentlar</p>
                <p className="mt-2 text-3xl font-semibold text-white">{studentList.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs text-white/45">Qo‘shilgan savollar</p>
                <p className="mt-2 text-3xl font-semibold text-white">{totalTeacherQuestions}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs text-white/45">Kontentli o‘yinlar</p>
                <p className="mt-2 text-3xl font-semibold text-white">{gamesWithContent}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs text-white/45">Feedback inbox</p>
                <p className="mt-2 text-3xl font-semibold text-white">{totalFeedbackCount}</p>
              </div>
            </div>
          </aside>
        </div>

        {activeTab === 'questions' ? (
          <TeacherQuestionAdmin />
        ) : null}

        {activeTab === 'feedback' ? (
          <TeacherFeedbackInbox />
        ) : null}

        {activeTab === 'games' ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">Games</p>
                <h3 className="mt-1 text-lg font-semibold text-white">Games Management</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/65">{managedGames.length} ta o‘yin</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {managedGames.map((key) => {
                const cfg = gameConfig(key)
                const qCount = contentEntries.find((e) => e.gameKey === key)?.count ?? 0
                return (
                  <div key={key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{key}</p>
                      <label className="inline-flex items-center gap-2 text-xs text-white/70">
                        <input
                          type="checkbox"
                          checked={cfg.enabled}
                          onChange={(e) =>
                            setGameSettings((prev) => ({
                              ...prev,
                              [key]: { ...gameConfig(key), enabled: e.target.checked },
                            }))
                          }
                        />
                        Enabled
                      </label>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-white/60">Teacher savollar: {qCount} ta</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-white/60">Default timer</span>
                      <select
                        value={cfg.timerSec}
                        onChange={(e) =>
                          setGameSettings((prev) => ({
                            ...prev,
                            [key]: { ...gameConfig(key), timerSec: Number(e.target.value) },
                          }))
                        }
                        className="h-8 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white"
                      >
                        <option value={60}>60s</option>
                        <option value={90}>90s</option>
                        <option value={120}>120s</option>
                        <option value={180}>180s</option>
                      </select>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        {activeTab === 'users' ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">Users</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Teacher / Users</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">Teachers</p>
                <p className="mt-2 text-2xl font-semibold text-white">{teacherList.length}</p>
                <p className="mt-1 text-sm text-white/60">Faol kontent yaratuvchilar</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">Students</p>
                <p className="mt-2 text-2xl font-semibold text-white">{studentList.length}</p>
                <p className="mt-1 text-sm text-white/60">Bugungi activity bilan</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="mb-3 text-sm font-semibold text-white">Ro‘yxatdan o‘tgan teacherlar</p>
              <div className="space-y-2">
                {teacherList.length === 0 ? (
                  <p className="text-sm text-white/55">Hozircha teacher ro‘yxati bo‘sh.</p>
                ) : (
                  teacherList.map((teacher: (typeof teacherList)[number]) => (
                    <div key={teacher.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-white">{teacher.fullName}</p>
                        <p className="text-xs text-white/55">{teacher.email}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/65">
                        {new Date(teacher.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === 'analytics' ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">Analytics</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Analytics</h3>
            </div>
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-white/45">Total content items</p>
                <p className="mt-2 text-2xl font-semibold text-white">{totalTeacherQuestions}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-white/45">Games with content</p>
                <p className="mt-2 text-2xl font-semibold text-white">{gamesWithContent}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-white/45">Avg per game</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {contentEntries.length ? (totalTeacherQuestions / contentEntries.length).toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {contentEntries
                .slice()
                .sort((a, b) => b.count - a.count || a.gameKey.localeCompare(b.gameKey))
                .map((entry) => {
                  const max = Math.max(1, ...contentEntries.map((e) => e.count))
                  const width = Math.max(6, Math.round((entry.count / max) * 100))
                  return (
                    <div key={entry.gameKey} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <div className="mb-2 flex items-center justify-between text-xs text-white/60">
                        <span>{entry.gameKey}</span>
                        <span>{entry.count} ta savol</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-blue-400" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}

function Profile() {
  const premium = getPremiumSubscriptionInfo()

  return (
    <section className="hero-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Player Profile</p>
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
            premium.active
              ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100'
              : 'border-white/10 bg-white/5 text-white/70',
          )}
        >
          <span aria-hidden="true">{premium.active ? '✨' : '🔒'}</span>
          {premium.active ? 'Premium active' : 'Free plan'}
        </div>
      </div>
      <h2 className="hero-title">Sizning O&apos;yin Kabinetingiz</h2>
      <p className="hero-copy">
        Natijalar, coin va progress shu yerda ko&apos;rinadi. Keyin real backend ulanganda
        bu joylar haqiqiy ma&apos;lumot bilan to&apos;ladi.
      </p>
      <div className="chip-row" style={{ marginTop: 12 }}>
        <span className="chip">
          Plan: <strong style={{ marginLeft: 4 }}>{premium.active ? 'Premium' : 'Free'}</strong>
        </span>
        <span className="chip">
          Premium expiry:
          <strong style={{ marginLeft: 4 }}>{formatPremiumExpiry(premium.expiresAt)}</strong>
        </span>
      </div>
      <div className="stats-grid">
        <article className="stat-box">
          <p className="stat-label">Level</p>
          <p className="stat-value">12</p>
        </article>
        <article className="stat-box">
          <p className="stat-label">Coins</p>
          <p className="stat-value">3,420</p>
        </article>
        <article className="stat-box">
          <p className="stat-label">Win Rate</p>
          <p className="stat-value">78%</p>
        </article>
      </div>
    </section>
  )
}

function GameCard({
  to,
  title,
  badge,
  icon,
  text,
  cover,
  locked = false,
  lockKind = 'premium',
  onLockedClick,
}: GameCardProps & { locked?: boolean; lockKind?: 'premium' | 'auth'; onLockedClick?: () => void }) {
  const commonCardClass =
    'group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 text-white shadow-[0_18px_50px_rgba(2,8,23,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.075] hover:shadow-[0_24px_70px_rgba(2,8,23,0.5)]'

  const content = (
    <>
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gradient-to-br from-violet-400/20 to-blue-400/10 blur-2xl transition duration-300 group-hover:scale-110" />
      <div className="pointer-events-none absolute -bottom-10 right-8 h-20 w-20 rounded-full bg-gradient-to-br from-blue-400/15 to-cyan-300/10 blur-2xl" />

      {locked ? (
        <div className="pointer-events-none absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
      ) : null}

      <div className="relative mb-4 overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <img
          src={cover ?? memoryRushCover}
          alt={`${title} preview`}
          loading="lazy"
          className="h-[11.25rem] w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      </div>

      <div className="relative flex items-center justify-between gap-3">
        <span
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 text-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]"
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="flex items-center gap-2">
          {locked ? (
            <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
              {lockKind === 'premium' ? 'Premium' : 'Login'}
            </span>
          ) : null}
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
            {badge}
          </span>
        </div>
      </div>

      <div className="relative mt-4">
        <h3 className="text-xl font-semibold tracking-tight text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
      </div>

      <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="text-sm font-medium text-white/60 transition group-hover:text-white/80">
          {locked ? (lockKind === 'premium' ? 'Premium unlock' : "Avval ro'yxatdan o'ting") : 'Play now'}
        </span>
        <span
          className={cn(
            'inline-flex items-center rounded-xl border px-3 py-2 text-sm font-semibold transition',
            locked
              ? 'border-amber-300/30 bg-amber-300/15 text-amber-100'
              : 'shine-button border-violet-300/25 bg-gradient-to-r from-violet-500/80 to-blue-500/80 text-white shadow-[0_8px_24px_rgba(79,70,229,0.35)] group-hover:scale-105',
          )}
        >
          {locked ? (lockKind === 'premium' ? '🔒 Locked' : '🔐 Login') : 'Start'}
        </span>
      </div>
    </>
  )

  if (locked) {
    return (
      <button
        type="button"
        className={`${commonCardClass} cursor-pointer text-left`}
        onClick={onLockedClick}
        aria-label={
          lockKind === 'premium'
            ? `${title} premium game locked. Open subscription modal`
            : `${title} requires login. Open auth modal`
        }
      >
        {content}
      </button>
    )
  }

  return (
    <Link className={commonCardClass} to={to}>
      {content}
    </Link>
  )
}

function Games() {
  const location = useLocation()
  const authRedirectTarget =
    (location.state as { authRequiredFrom?: string } | null)?.authRequiredFrom ?? '/games'
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isUserAuthenticated())
  const [premiumUnlocked, setPremiumUnlocked] = useState<boolean>(() => hasPremiumSubscription())
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    setIsLoggedIn(isUserAuthenticated())
    setPremiumUnlocked(hasPremiumSubscription())
    const sync = () => {
      setIsLoggedIn(isUserAuthenticated())
      setPremiumUnlocked(hasPremiumSubscription())
    }
    const unsubscribePremium = subscribeToPremium(sync)
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    void syncPremiumFromBackend().then(() => setPremiumUnlocked(hasPremiumSubscription())).catch(() => {})
    return () => {
      unsubscribePremium()
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  useEffect(() => {
    if ((location.state as { premiumLockedModal?: boolean } | null)?.premiumLockedModal) {
      setShowPremiumModal(true)
    }
    if ((location.state as { authRequiredModal?: boolean } | null)?.authRequiredModal) {
      setShowAuthModal(true)
    }
  }, [location.state])

  const games: GameCardProps[] = [
    {
      to: '/games/quiz-battle',
      title: 'Quiz Battle',
      badge: 'Knowledge',
      icon: '🧠',
      text: "Jamoaviy savol-javob o'yini. Tez fikrlang, combo qiling va yuqori ball to'plang.",
    },
    {
      to: '/games/frog-pond',
      title: 'Frog Pond Quiz',
      badge: 'Nature Adventure',
      icon: '🐸',
      cover: jumperFrogThumbnail,
      text: "Qurbaqa bilan nilufarlar ustidan sakrab 5 darajali pond adventure o'ynang. Har pad ortida yashirin savol, 10 soniyalik timer va yutqazishda suvga cho'kish animatsiyasi bor.",
    },
    {
      to: '/games/treasure-hunt',
      title: 'Treasure Hunt',
      badge: 'Adventure',
      icon: '🗺️',
      cover: treasureHuntCover,
      text: "Topishmoqlarni yechib clue bo'ylab harakatlaning va xazinani birinchi bo'lib toping.",
    },
    {
      to: '/games/memory-rush',
      title: 'Memory Rush',
      badge: 'Focus',
      icon: '✨',
      text: "Kartalarni yodlab juftliklarni toping. Vaqt va hayotlar tugamasidan rekord yangilang.",
    },
    {
      to: '/games/football-challenge',
      title: 'Football Challenge',
      badge: 'Sport',
      icon: '⚽',
      cover: footballChallengeCover,
      text: "Futbol bilimingizni sinovdan o'tkazing. Savollarga javob bering va darvozani himoya qiling.",
    },
    {
      to: '/games/tug-of-war',
      title: 'Tug of War',
      badge: 'Strategy',
      icon: '🤼',
      cover: tugOfWarCover,
      text: "Savollar orqali raqib jamoaga qarshi tortishuv. Jamoaviy strategiya va tezkor javoblar muhim.",
    },
    {
      to: '/games/image-quiz',
      title: 'Image Quiz',
      badge: 'Classroom',
      icon: '🖼️',
      cover: imageQuizCover,
      text: 'Rasmga qarab 4 variantdan to‘g‘ri javobni tanlang. Kategoriya, timer va progress bilan sinf uchun qulay viktorina.',
    },
    {
      to: '/games/word-search',
      title: 'Word Search',
      badge: "So'z",
      icon: '🔤',
      cover: wordSearchCover,
      text: "Harflar ichidan berilgan so'zlarni toping. Tezlik va diqqat bu o'yinda asosiy kuch.",
    },
    {
      to: '/games/wheel-of-fortune',
      title: 'Wheel of Fortune',
      badge: 'Classroom',
      icon: '🎡',
      cover: wheelOfFortuneCover,
      text: "Talabalar uchun spinning wheel va savollar bilan interaktiv dars-o'yin formati.",
    },
    {
      to: '/games/flag-race',
      title: 'Flag Race',
      badge: 'Geography',
      icon: '🏁',
      cover: flagRaceCover,
      text: "Bayroqlarni tanib, jamoaviy poygada raqibdan oldin to'g'ri javobni toping.",
    },
    {
      to: '/games/flag-player-race',
      title: 'Flag Player Race',
      badge: 'Football',
      icon: '🌍',
      text: "Davlat bayrog'iga mos futbolchini toping. Sport va geografiya bir o'yinda.",
    },
    {
      to: '/games/bilim-poyezdi',
      title: 'Bilim Poyezdi',
      badge: 'Team Quiz',
      icon: '🚂',
      text: "2-6 jamoa bilan stansiyalar bo'ylab bilim poygasi. Track tanlang, savolga javob bering va poyezdni finishga olib boring.",
    },
    {
      to: '/games/mario-math-platformer',
      title: 'Mario Math Platformer',
      badge: 'Phaser 3',
      icon: '🕹️',
      text: "Mario-style platformer va matematika quiz overlay. Quiz Block va Gate savollari bilan leveldan o'ting.",
    },
    {
      to: '/games/bumbuzzle',
      title: 'Bumbuzzle',
      badge: 'English Team',
      icon: '💣',
      cover: bumbuzzleCover,
      text: "Jamoaviy English mystery box o'yini: puzzle, bonus va bombalar bilan ball yig'ing. Classroom uchun mos interaktiv format.",
    },
    {
      to: '/games/jungle-board-3d',
      title: 'Jungle Board 3D',
      badge: 'Cinematic 3D',
      icon: '🌿',
      cover: jungleBoardCover,
      text: "Three.js + React Three Fiber bilan 3D jungle board adventure: dice roll, token movement, quiz tile, trap, treasure va portal eventlar.",
    },
    {
      to: '/games/pac-grid-arcade',
      title: 'Pac Grid Arcade',
      badge: 'Arcade',
      icon: '🟡',
      text: "Classic maze-chase uslubidagi Pac game: grid movement, ghost chase, pellet va touch/swipe boshqaruv.",
    },
    {
      to: '/games/kim-millioner',
      title: "Kim Millioner",
      badge: '2 Team Quiz',
      icon: '💰',
      cover: kimMillionerCover,
      text: "2 jamoalik game-show format: 15 bosqich, prize ladder, 50:50/Audience/Skip yordamlar va navbat bilan o'ynash tizimi.",
    },
    {
      to: '/games/classroom-team-quiz',
      title: 'Classroom Team Quiz',
      badge: 'Jeopardy Style',
      icon: '🎯',
      cover: classroomTeamQuizCover,
      text: "2-4 jamoa uchun professional quiz board: 150/250/400 point tilelar, combo bonus, double points, timer va teacher controls.",
    },
    {
      to: '/games/monopoly-calibration',
      title: 'School City Monopoly',
      badge: '2 Team Board Game',
      icon: '🎲',
      cover: monopoly,
      text: "Eng kuchli ta'limiy monopoly: 2 jamoa school city board bo'ylab yuradi, fan hududlarini egallaydi va bilim coin bilan g'oliblikka chiqadi.",
    },
    {
      to: '/games/learning',
      title: 'Learning Hub',
      badge: 'All-in-One',
      icon: '📚',
      text: "Oldingi learning sahifa ichidagi barcha o'yinlar katalogi va tanlash ekrani.",
    },
  ]

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#05060a] p-4 text-white sm:p-5 lg:p-6">
      <div className="pointer-events-none absolute left-6 top-4 h-40 w-40 rounded-full bg-violet-500/20 blur-[80px]" />
      <div className="pointer-events-none absolute right-6 top-8 h-44 w-44 rounded-full bg-blue-500/20 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-20 left-1/3 h-36 w-36 rounded-full bg-cyan-400/10 blur-[90px]" />

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent p-6 shadow-[0_20px_70px_rgba(2,8,23,0.45)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_20%_20%,white_0.8px,transparent_1px)] [background-size:14px_14px]" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">Game Hub</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Playgroundga Xush Kelibsiz
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
              O&apos;yinlarni buzmasdan faqat dizayn yangilandi: premium dark, glow effektlar va glass kartalar bilan
              tanlash sahifasi. Quyidagi o&apos;yinlardan birini tanlab darhol boshlashingiz mumkin.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">Games</p>
              <p className="mt-1 text-lg font-semibold text-white">{games.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">Mode</p>
              <p className="mt-1 text-lg font-semibold text-white">Fast Play</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">Device</p>
              <p className="mt-1 text-lg font-semibold text-white">Mobile Ready</p>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70">
            {games.length} ta game tayyor
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70">
            Fast play mode
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70">
            Mobile friendly
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70">
            Classroom ready
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => {
          const authLocked = !isLoggedIn
          const premiumLocked = isPremiumLockedPath(game.to) && !premiumUnlocked
          const locked = authLocked || premiumLocked
          const lockKind = authLocked ? 'auth' : 'premium'
          return (
            <GameCard
              key={game.to}
              {...game}
              locked={locked}
              lockKind={lockKind}
              onLockedClick={() => (authLocked ? setShowAuthModal(true) : setShowPremiumModal(true))}
            />
          )
        })}
      </div>

      {showAuthModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-lock-title"
            className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0b0f18]/95 p-6 text-white shadow-[0_24px_70px_rgba(2,8,23,0.65)] backdrop-blur-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/80">Kirish talab qilinadi</p>
            <h3 id="auth-lock-title" className="mt-2 text-2xl font-semibold tracking-tight">
              Iltimos, o‘ynash uchun birinchi ro‘yxatdan o‘ting
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/70">
              O‘yinlarni boshlashdan oldin akkaunt bilan kiring. Ro‘yxatdan o‘tsangiz akkaunt avtomatik teacher rolida ochiladi.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/register"
                state={{ from: { pathname: authRedirectTarget } }}
                className="shine-button inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white"
                onClick={() => setShowAuthModal(false)}
              >
                Ro‘yxatdan o‘tish
              </Link>
              <Link
                to="/login"
                state={{ from: { pathname: authRedirectTarget } }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10"
                onClick={() => setShowAuthModal(false)}
              >
                Kirish
              </Link>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showPremiumModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-lock-title"
            className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0b0f18]/95 p-6 text-white shadow-[0_24px_70px_rgba(2,8,23,0.65)] backdrop-blur-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/80">Premium Access</p>
            <h3 id="premium-lock-title" className="mt-2 text-2xl font-semibold tracking-tight">
              Pullik obuna sotib oling
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/70">
              `Tug of War`, `Word Search`, `Memory Rush` va `Bilim Poyezdi` premium o&apos;yinlar.
              To&apos;lov qilgandan keyin darhol ochiladi.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/payment?plan=pro&cycle=monthly&source=games"
                className="shine-button inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(79,70,229,0.35)]"
                onClick={() => setShowPremiumModal(false)}
              >
                Obuna sotib olish
              </Link>
              <button
                type="button"
                onClick={() => setShowPremiumModal(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function Home() {
  const navigate = useNavigate()
  return <HomePage onPlayNow={() => navigate('/games')} />
}

function QuizBattleRoute() {
  const navigate = useNavigate()
  return <QuizBattlePage onBack={() => navigate('/games')} />
}

function TreasureHuntRoute() {
  const navigate = useNavigate()
  return <TreasureHuntPage onBack={() => navigate('/games')} />
}

function MemoryRushRoute() {
  const navigate = useNavigate()
  return <MemoryRushPage onBack={() => navigate('/games')} />
}

function FootballRoute() {
  const navigate = useNavigate()
  return <FootballChallengePage onBack={() => navigate('/games')} />
}

function TugOfWarRoute() {
  return <TugOfWarPage />
}

function FrogPondRoute() {
  return <FrogPondPage />
}

function ImageQuizRoute() {
  return <ImageQuizPage />
}

function WordSearchRoute() {
  const navigate = useNavigate()
  return <WordSearchPage onBack={() => navigate('/games')} />
}

function WheelOfFortuneRoute() {
  const navigate = useNavigate()
  return <WheelOfFortunePage onBack={() => navigate('/games')} />
}

function FlagRaceRoute() {
  const navigate = useNavigate()
  return <FlagRacePage onBack={() => navigate('/games')} />
}

function FlagPlayerRaceRoute() {
  const navigate = useNavigate()
  return <FlagPlayerRacePage onBack={() => navigate('/games')} />
}

function LearningRoute() {
  return <LearningPage />
}

function MarioMathPlatformerRoute() {
  const navigate = useNavigate()
  return <MarioMathEmbedPage onBack={() => navigate('/games')} />
}

function BumbuzzleRoute() {
  const navigate = useNavigate()
  return <BumbuzzlePage onBack={() => navigate('/games')} />
}

function JungleBoard3DRoute() {
  const navigate = useNavigate()
  return <JungleBoard3DPage onBack={() => navigate('/games')} />
}

function PacmanArcadeRoute() {
  const navigate = useNavigate()
  return <PacmanArcadePage onBack={() => navigate('/games')} />
}

function KimMillionerRoute() {
  const navigate = useNavigate()
  return <KimMillionerPage onBack={() => navigate('/games')} />
}

function ClassroomTeamQuizRoute() {
  const navigate = useNavigate()
  return <ClassroomTeamQuizPage onBack={() => navigate('/games')} />
}

function MonopolyCalibrationRoute() {
  const navigate = useNavigate()
  return <MonopolyCalibrationPage onBack={() => navigate('/games')} />
}

function BilimPoyezdiRoute() {
  const navigate = useNavigate()
  return <BilimPoyezdiPage onBack={() => navigate('/games')} />
}

function App() {
  const isLoading = false

  useEffect(() => {
    if (!isTeacherAuthenticated()) return
    void syncAllTeacherContentFromBackend()
  }, [])

  if (isLoading) return <SiteLoader />

  return (
    <>
      <AppUiStyleTag />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/learning" element={<Navigate to="/games/learning" replace />} />
        <Route path="/quiz-battle" element={<Navigate to="/games/quiz-battle" replace />} />
        <Route path="/treasure-hunt" element={<Navigate to="/games/treasure-hunt" replace />} />
        <Route path="/memory-rush" element={<Navigate to="/games/memory-rush" replace />} />
        <Route path="/football-challenge" element={<Navigate to="/games/football-challenge" replace />} />
        <Route path="/tug-of-war" element={<Navigate to="/games/tug-of-war" replace />} />
        <Route path="/frog-pond" element={<Navigate to="/games/frog-pond" replace />} />
        <Route path="/image-quiz" element={<Navigate to="/games/image-quiz" replace />} />
        <Route path="/word-search" element={<Navigate to="/games/word-search" replace />} />
        <Route path="/wheel-of-fortune" element={<Navigate to="/games/wheel-of-fortune" replace />} />
        <Route path="/flag-race" element={<Navigate to="/games/flag-race" replace />} />
        <Route path="/flag-player-race" element={<Navigate to="/games/flag-player-race" replace />} />
        <Route path="/bilim-poyezdi" element={<Navigate to="/games/bilim-poyezdi" replace />} />
        <Route path="/mario-math-platformer" element={<Navigate to="/games/mario-math-platformer" replace />} />
        <Route path="/bumbuzzle" element={<Navigate to="/games/bumbuzzle" replace />} />
        <Route path="/jungle-board-3d" element={<Navigate to="/games/jungle-board-3d" replace />} />
        <Route path="/pac-grid-arcade" element={<Navigate to="/games/pac-grid-arcade" replace />} />
        <Route path="/kim-millioner" element={<Navigate to="/games/kim-millioner" replace />} />
        <Route path="/classroom-team-quiz" element={<Navigate to="/games/classroom-team-quiz" replace />} />
        <Route path="/monopoly-calibration" element={<Navigate to="/games/monopoly-calibration" replace />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HelloAdmin />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <GameLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/games" element={<Games />} />
          <Route
            path="/games/quiz-battle"
            element={
              <AnyUserGameGuard>
                <QuizBattleRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/treasure-hunt"
            element={
              <AnyUserGameGuard>
                <TreasureHuntRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/memory-rush"
            element={
              <AnyUserGameGuard>
                <PremiumLockedGameGuard>
                  <MemoryRushRoute />
                </PremiumLockedGameGuard>
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/football-challenge"
            element={
              <AnyUserGameGuard>
                <FootballRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/tug-of-war"
            element={
              <AnyUserGameGuard>
                <PremiumLockedGameGuard>
                  <TugOfWarRoute />
                </PremiumLockedGameGuard>
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/frog-pond"
            element={
              <AnyUserGameGuard>
                <FrogPondRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/image-quiz"
            element={
              <AnyUserGameGuard>
                <ImageQuizRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/word-search"
            element={
              <AnyUserGameGuard>
                <PremiumLockedGameGuard>
                  <WordSearchRoute />
                </PremiumLockedGameGuard>
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/wheel-of-fortune"
            element={
              <AnyUserGameGuard>
                <WheelOfFortuneRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/flag-race"
            element={
              <AnyUserGameGuard>
                <FlagRaceRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/flag-player-race"
            element={
              <AnyUserGameGuard>
                <FlagPlayerRaceRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/bilim-poyezdi"
            element={
              <AnyUserGameGuard>
                <PremiumLockedGameGuard>
                  <BilimPoyezdiRoute />
                </PremiumLockedGameGuard>
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/mario-math-platformer"
            element={
              <AnyUserGameGuard>
                <MarioMathPlatformerRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/bumbuzzle"
            element={
              <AnyUserGameGuard>
                <BumbuzzleRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/jungle-board-3d"
            element={
              <AnyUserGameGuard>
                <JungleBoard3DRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/pac-grid-arcade"
            element={
              <AnyUserGameGuard>
                <PacmanArcadeRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/kim-millioner"
            element={
              <AnyUserGameGuard>
                <KimMillionerRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/classroom-team-quiz"
            element={
              <AnyUserGameGuard>
                <ClassroomTeamQuizRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/monopoly-calibration"
            element={
              <AnyUserGameGuard>
                <MonopolyCalibrationRoute />
              </AnyUserGameGuard>
            }
          />
          <Route
            path="/games/learning"
            element={
              <AnyUserGameGuard>
                <LearningRoute />
              </AnyUserGameGuard>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  )
}

export default App
