// @ts-nocheck
import type Phaser from 'phaser'
import { useEffect, useRef, useState } from 'react'
import { createGame } from './mario-math-platformer/game/Game'
import {
  getState,
  loadState,
  resetForNewGame,
  setCurrentLevel,
  setGradeMode,
  type GradeMode,
} from './mario-math-platformer/logic/state'
import './mario-math-platformer/style.css'

type Props = {
  onBack?: () => void
}

export default function MarioMathEmbedPage({ onBack }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const pageRef = useRef<HTMLElement | null>(null)
  const [gradeMode, setGradeModeState] = useState<GradeMode>('5-7')
  const [startLevel, setStartLevel] = useState<number>(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [touchControls, setTouchControls] = useState({ left: false, right: false, jump: false })

  useEffect(() => {
    loadState()
    setGradeModeState(getState().gradeMode)
    setStartLevel(getState().currentLevel)
  }, [])

  useEffect(() => {
    ;(window as any).__marioTouchControls = touchControls
    return () => {
      ;(window as any).__marioTouchControls = { left: false, right: false, jump: false }
    }
  }, [touchControls])

  useEffect(() => {
    if (!isFullscreen) {
      setTouchControls({ left: false, right: false, jump: false })
    }
  }, [isFullscreen])

  const holdControl = (key: 'left' | 'right' | 'jump', down: boolean) => {
    setTouchControls((prev) => ({ ...prev, [key]: down }))
  }

  useEffect(() => {
    if (!mountRef.current || gameRef.current) return
    gameRef.current = createGame(mountRef.current)
    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  useEffect(() => {
    document.body.classList.add('iphone-game-viewport')
    return () => {
      document.body.classList.remove('iphone-game-viewport')
    }
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    onFullscreenChange()
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [])

  return (
    <main ref={pageRef} className="mario-page relative min-h-screen overflow-hidden bg-[#05060a] p-0 text-white">
      <div className="pointer-events-none absolute left-6 top-6 h-44 w-44 rounded-full bg-violet-500/20 blur-[90px]" />
      <div className="pointer-events-none absolute right-6 top-8 h-48 w-48 rounded-full bg-blue-500/20 blur-[100px]" />

      <div className="mario-shell relative h-screen w-full">
        <div className={`absolute inset-x-2 top-2 z-20 sm:inset-x-3 sm:top-3 ${isFullscreen ? 'hidden' : ''}`}>
          <div className="mario-topbar rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-xl shadow-[0_18px_50px_rgba(2,8,23,0.35)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Phaser 3 Mini Game</p>
                <h1 className="mt-1 truncate text-lg font-semibold tracking-tight text-white sm:text-2xl">
                  Mario-style Platformer + Math Quiz
                </h1>
                <p className="mt-1 hidden text-xs text-white/60 sm:block">
                  Quiz Block / Gate savolini yeching va levelni tugating.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs text-white/70">
                  <span className="sr-only">Grade mode</span>
                  <select
                    value={gradeMode}
                    onChange={(e) => {
                      const next = e.target.value as GradeMode
                      setGradeModeState(next)
                      setGradeMode(next)
                    }}
                    className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-white"
                  >
                    <option value="5-7">5-7</option>
                    <option value="8-11">8-11</option>
                  </select>
                </label>
                <label className="text-xs text-white/70">
                  <span className="sr-only">Start level</span>
                  <select
                    value={startLevel}
                    onChange={(e) => {
                      const next = Number(e.target.value) || 1
                      setStartLevel(next)
                      setCurrentLevel(next)
                      gameRef.current?.scene.stop('LevelScene')
                      gameRef.current?.scene.start('LevelScene')
                    }}
                    className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-white"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Level {lvl}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    resetForNewGame()
                    setStartLevel(1)
                    gameRef.current?.scene.stop('LevelScene')
                    gameRef.current?.scene.start('LevelScene')
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!document.fullscreenElement) {
                      await pageRef.current?.requestFullscreen?.()
                    } else {
                      await document.exitFullscreen?.()
                    }
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
                >
                  Fullscreen
                </button>
                {onBack ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
                  >
                    ← Games
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mario-canvas-wrap h-full overflow-hidden bg-[#090d18]">
          <div ref={mountRef} id="game-root" className="mario-game-root" />
        </div>

        <div className="pointer-events-none absolute bottom-2 left-2 z-20 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/70 backdrop-blur-md sm:bottom-3 sm:left-3">
          Harakat: ← → / A D · Sakrash: ↑ / W / Space · Pause: P / Esc
        </div>

        <div className="mario-touch-controls">
          <button
            type="button"
            className={`mario-touch-btn ${touchControls.left ? 'is-active' : ''}`}
            onPointerDown={(e) => {
              e.preventDefault()
              holdControl('left', true)
            }}
            onPointerUp={(e) => {
              e.preventDefault()
              holdControl('left', false)
            }}
            onPointerCancel={() => holdControl('left', false)}
            onPointerLeave={() => holdControl('left', false)}
          >
            ←
          </button>
          <button
            type="button"
            className={`mario-touch-btn ${touchControls.right ? 'is-active' : ''}`}
            onPointerDown={(e) => {
              e.preventDefault()
              holdControl('right', true)
            }}
            onPointerUp={(e) => {
              e.preventDefault()
              holdControl('right', false)
            }}
            onPointerCancel={() => holdControl('right', false)}
            onPointerLeave={() => holdControl('right', false)}
          >
            →
          </button>
          <button
            type="button"
            className={`mario-touch-btn jump ${touchControls.jump ? 'is-active' : ''}`}
            onPointerDown={(e) => {
              e.preventDefault()
              holdControl('jump', true)
            }}
            onPointerUp={(e) => {
              e.preventDefault()
              holdControl('jump', false)
            }}
            onPointerCancel={() => holdControl('jump', false)}
            onPointerLeave={() => holdControl('jump', false)}
          >
            Jump
          </button>
        </div>
      </div>

      <div id="quiz-overlay" className="hidden" aria-hidden="true">
        <div className="quiz-backdrop">
          <div className="quiz-card" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
            <p className="quiz-eyebrow">Math Quiz</p>
            <h2 id="quiz-title">Savol</h2>
            <p id="quiz-meta" />
            <p id="quiz-prompt" />

            <form id="quiz-form">
              <input id="quiz-input" type="text" inputMode="numeric" autoComplete="off" />
              <button id="quiz-submit" type="submit">Submit</button>
            </form>

            <div className="quiz-footer">
              <div id="quiz-timer-pill">15s</div>
              <p id="quiz-error" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
