import { useEffect } from 'react'
import JungleBoardGame from './jungle-board-3d/JungleBoardGame'
import './jungle-board-3d/style.css'
import jumanjiArt from '../assets/jumanji.avif'

type Props = {
  onBack?: () => void
}

export default function JungleBoard3DPage({ onBack }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020305] text-white">
      <div className="pointer-events-none absolute inset-0">
        <img
          src={jumanjiArt}
          alt=""
          className="h-full w-full object-cover opacity-10 grayscale saturate-50 brightness-[0.45]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/82 via-[#020305]/84 to-[#020305]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.14),transparent_40%),radial-gradient(circle_at_80%_12%,rgba(168,85,247,0.12),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(234,179,8,0.06),transparent_50%)]" />
      </div>
      {onBack ? (
        <div className="pointer-events-none absolute left-4 top-4 z-50">
          <button
            type="button"
            onClick={onBack}
            className="pointer-events-auto rounded-2xl border border-white/15 bg-black/75 px-4 py-2.5 text-base font-semibold text-white/95 backdrop-blur hover:bg-black/85"
          >
            ← Games
          </button>
        </div>
      ) : null}
      <div className="relative z-10">
        <JungleBoardGame />
      </div>
    </main>
  )
}
