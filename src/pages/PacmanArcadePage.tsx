// @ts-nocheck
import type Phaser from 'phaser'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPacGame } from './pacman-arcade/game/Game'
import {
  DEFAULT_EDU_SETTINGS,
  loadEduSettings,
  normalizeEduSettings,
  saveEduSettings,
  type EduSettings,
} from './pacman-arcade/game/eduSettings'
import { QUESTION_COUNT, type EduQuestion } from './pacman-arcade/game/quizData'
import type { QuizOpenRequest, QuizOpenResult, QuizTrigger } from './pacman-arcade/game/quizManager'
import './pacman-arcade/style.css'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

type Props = {
  onBack?: () => void
}

type QuizModalState = {
  open: boolean
  request: QuizOpenRequest | null
  left: number
  selected: number | null
  value: string
  resolver: ((result: QuizOpenResult) => void) | null
}

const TRIGGER_LABEL: Record<QuizTrigger, string> = {
  'power-pellet': 'Power Pellet Quiz',
  'pellet-milestone': 'Milestone Quiz',
  'quiz-gate': 'Quiz Gate',
}

export default function PacmanArcadePage({ onBack }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const pageRef = useRef<HTMLElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [touchHold, setTouchHold] = useState<Direction>('none')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [settings, setSettings] = useState<EduSettings>(() => loadEduSettings())
  const [showSettings, setShowSettings] = useState(false)

  const [quizModal, setQuizModal] = useState<QuizModalState>({
    open: false,
    request: null,
    left: 0,
    selected: null,
    value: '',
    resolver: null,
  })

  const [activeTeamIdx, setActiveTeamIdx] = useState(0)
  const [teamScores, setTeamScores] = useState<number[]>(() => new Array(loadEduSettings().classroom.teams.length).fill(0))
  const [turnLeft, setTurnLeft] = useState(loadEduSettings().classroom.turnSeconds)

  useEffect(() => {
    setSettings((prev) => normalizeEduSettings(prev))
  }, [])

  useEffect(() => {
    saveEduSettings(settings)
  }, [settings])

  useEffect(() => {
    setTeamScores((prev) => {
      const next = [...prev]
      while (next.length < settings.classroom.teams.length) next.push(0)
      return next.slice(0, settings.classroom.teams.length)
    })
    setActiveTeamIdx((idx) => Math.min(idx, settings.classroom.teams.length - 1))
    setTurnLeft(settings.classroom.turnSeconds)
  }, [settings.classroom.teams.length, settings.classroom.turnSeconds])

  useEffect(() => {
    if (!settings.classroom.enabled) return
    const id = window.setInterval(() => {
      setTurnLeft((prev) => {
        if (quizModal.open) return prev
        if (prev <= 1) {
          setActiveTeamIdx((t) => (t + 1) % settings.classroom.teams.length)
          return settings.classroom.turnSeconds
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [quizModal.open, settings.classroom.enabled, settings.classroom.teams.length, settings.classroom.turnSeconds])

  useEffect(() => {
    ;(window as any).__pacTouchInput = { hold: touchHold, swipe: null }
    return () => {
      ;(window as any).__pacTouchInput = { hold: null, swipe: null }
    }
  }, [touchHold])

  useEffect(() => {
    ;(window as any).__pacGetEduSettings = () => settings
    ;(window as any).__pacGetActiveTeamIndex = () => activeTeamIdx
    ;(window as any).__pacOnQuizResult = (payload: { teamIdx: number | null; pointsDelta: number }) => {
      if (!settings.classroom.enabled) return
      const idx = typeof payload.teamIdx === 'number' ? payload.teamIdx : activeTeamIdx
      setTeamScores((prev) => {
        const next = [...prev]
        next[idx] = Math.max(0, (next[idx] ?? 0) + payload.pointsDelta)
        return next
      })
    }

    ;(window as any).__pacOpenQuiz = (request: QuizOpenRequest) => {
      return new Promise<QuizOpenResult>((resolve) => {
        setTouchHold('none')
        ;(window as any).__pacTouchInput = { hold: null, swipe: null }
        setQuizModal({
          open: true,
          request,
          left: request.timerSeconds,
          selected: null,
          value: '',
          resolver: resolve,
        })
      })
    }

    return () => {
      delete (window as any).__pacGetEduSettings
      delete (window as any).__pacGetActiveTeamIndex
      delete (window as any).__pacOnQuizResult
      delete (window as any).__pacOpenQuiz
    }
  }, [activeTeamIdx, settings])

  useEffect(() => {
    if (!quizModal.open) return
    const id = window.setInterval(() => {
      setQuizModal((prev) => {
        if (!prev.open) return prev
        if (prev.left <= 1) {
          prev.resolver?.({ status: 'timeout' })
          return { open: false, request: null, left: 0, selected: null, value: '', resolver: null }
        }
        return { ...prev, left: prev.left - 1 }
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [quizModal.open])

  useEffect(() => {
    if (!quizModal.open || !quizModal.request) return
    if (quizModal.request.question.type === 'numeric') {
      window.setTimeout(() => inputRef.current?.focus(), 50)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && settings.allowEscClose) {
        e.preventDefault()
        closeQuizAs('skip')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [quizModal.open, quizModal.request, settings.allowEscClose])

  useEffect(() => {
    if (!mountRef.current || gameRef.current) return
    gameRef.current = createPacGame(mountRef.current)
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
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    onFs()
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const onSwipeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (quizModal.open) return
    swipeStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const onSwipeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (quizModal.open) return
    const start = swipeStartRef.current
    swipeStartRef.current = null
    if (!start) return

    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.hypot(dx, dy) < 28) return

    let dir: Direction
    if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 'right' : 'left'
    else dir = dy > 0 ? 'down' : 'up'

    const prev = (window as any).__pacTouchInput ?? { hold: touchHold, swipe: null }
    ;(window as any).__pacTouchInput = { ...prev, swipe: dir }
  }

  const quizQuestion = quizModal.request?.question ?? null

  const closeQuizAs = (status: 'skip' | 'timeout') => {
    if (!quizModal.open) return
    quizModal.resolver?.({ status })
    setQuizModal({ open: false, request: null, left: 0, selected: null, value: '', resolver: null })
  }

  const submitQuiz = () => {
    if (!quizModal.open) return
    if (quizQuestion?.type === 'mcq') {
      if (quizModal.selected === null) return
      quizModal.resolver?.({ status: 'answered', choiceIndex: quizModal.selected })
    } else {
      const value = quizModal.value.trim()
      if (!value) return
      quizModal.resolver?.({ status: 'answered', value })
    }
    setQuizModal({ open: false, request: null, left: 0, selected: null, value: '', resolver: null })
  }

  const subjectStats = useMemo(
    () => `Math ${QUESTION_COUNT.math} • English ${QUESTION_COUNT.english} • Science ${QUESTION_COUNT.science}`,
    [],
  )

  return (
    <main ref={pageRef} className="pac-page relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      <div className="pointer-events-none absolute left-8 top-8 h-52 w-52 rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-8 top-10 h-56 w-56 rounded-full bg-cyan-400/15 blur-[120px]" />

      <div className="pac-shell relative mx-auto h-screen w-full max-w-[1200px] p-2 sm:p-3">
        <div className={`pac-topbar ${isFullscreen ? 'hidden' : ''}`}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Phaser 3 EDU</p>
            <h1 className="text-lg font-semibold sm:text-2xl">Pac Grid Arcade Classroom</h1>
            <p className="text-[11px] text-white/55">{subjectStats}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="pac-btn" onClick={() => setShowSettings(true)}>⚙️ Settings</button>
            <button
              type="button"
              className="pac-btn"
              onClick={async () => {
                if (!document.fullscreenElement) await pageRef.current?.requestFullscreen?.()
                else await document.exitFullscreen?.()
              }}
            >
              Fullscreen
            </button>
            {onBack ? (
              <button type="button" className="pac-btn" onClick={onBack}>
                ← Games
              </button>
            ) : null}
          </div>
        </div>

        {settings.classroom.enabled ? (
          <div className="pac-classroom-bar">
            <div className="pac-turn-pill">Navbat: {settings.classroom.teams[activeTeamIdx]}</div>
            <div className="pac-turn-pill">Vaqt: {turnLeft}s</div>
            <div className="pac-team-score-row">
              {settings.classroom.teams.map((team, idx) => (
                <span key={team + idx} className={`pac-team-score ${idx === activeTeamIdx ? 'active' : ''}`}>
                  {team}: {teamScores[idx] ?? 0}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="pac-canvas-wrap" onPointerDown={onSwipeStart} onPointerUp={onSwipeEnd}>
          <div ref={mountRef} id="pac-root" className="pac-root" />
        </div>

        <div className="pac-help">Harakat: Arrow / WASD · Touch D-pad / Swipe · Debug: G</div>

        <div className="pac-dpad">
          <button
            type="button"
            className={`pac-dpad-btn up ${touchHold === 'up' ? 'is-active' : ''}`}
            onPointerDown={() => !quizModal.open && setTouchHold('up')}
            onPointerUp={() => setTouchHold('none')}
            onPointerCancel={() => setTouchHold('none')}
            onPointerLeave={() => setTouchHold('none')}
          >
            ↑
          </button>
          <button
            type="button"
            className={`pac-dpad-btn left ${touchHold === 'left' ? 'is-active' : ''}`}
            onPointerDown={() => !quizModal.open && setTouchHold('left')}
            onPointerUp={() => setTouchHold('none')}
            onPointerCancel={() => setTouchHold('none')}
            onPointerLeave={() => setTouchHold('none')}
          >
            ←
          </button>
          <button
            type="button"
            className={`pac-dpad-btn right ${touchHold === 'right' ? 'is-active' : ''}`}
            onPointerDown={() => !quizModal.open && setTouchHold('right')}
            onPointerUp={() => setTouchHold('none')}
            onPointerCancel={() => setTouchHold('none')}
            onPointerLeave={() => setTouchHold('none')}
          >
            →
          </button>
          <button
            type="button"
            className={`pac-dpad-btn down ${touchHold === 'down' ? 'is-active' : ''}`}
            onPointerDown={() => !quizModal.open && setTouchHold('down')}
            onPointerUp={() => setTouchHold('none')}
            onPointerCancel={() => setTouchHold('none')}
            onPointerLeave={() => setTouchHold('none')}
          >
            ↓
          </button>
        </div>
      </div>

      {quizModal.open && quizQuestion ? (
        <div className="pac-modal-overlay">
          <div className="pac-quiz-modal" role="dialog" aria-modal="true" aria-labelledby="pac-quiz-title">
            <div className="pac-quiz-head">
              <p>{TRIGGER_LABEL[quizModal.request!.trigger]}</p>
              <span className={`pac-timer ${quizModal.left <= 5 ? 'danger' : ''}`}>{quizModal.left}s</span>
            </div>
            <h3 id="pac-quiz-title">{quizModal.request?.teamName ? `${quizModal.request.teamName} uchun savol` : 'Savol'}</h3>
            <p className="pac-quiz-prompt">{quizQuestion.prompt}</p>

            {quizQuestion.type === 'mcq' ? (
              <div className="pac-choices">
                {quizQuestion.choices?.map((choice, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`pac-choice ${quizModal.selected === idx ? 'active' : ''}`}
                    onClick={() => setQuizModal((prev) => ({ ...prev, selected: idx }))}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            ) : (
              <input
                ref={inputRef}
                className="pac-input"
                inputMode="numeric"
                value={quizModal.value}
                onChange={(e) => setQuizModal((prev) => ({ ...prev, value: e.target.value }))}
                placeholder="Javobni kiriting"
              />
            )}

            <div className="pac-quiz-actions">
              <button type="button" className="pac-btn primary" onClick={submitQuiz}>Submit</button>
              {quizModal.request?.allowSkip ? (
                <button type="button" className="pac-btn" onClick={() => closeQuizAs('skip')}>
                  Skip (-{settings.skipCost})
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {showSettings ? (
        <div className="pac-modal-overlay">
          <div className="pac-settings-modal" role="dialog" aria-modal="true" aria-labelledby="pac-settings-title">
            <div className="pac-settings-head">
              <h3 id="pac-settings-title">Teacher Dashboard</h3>
              <button type="button" className="pac-btn" onClick={() => setShowSettings(false)}>Yopish</button>
            </div>

            <div className="pac-settings-grid">
              <label className="pac-field">
                Grade band
                <select
                  value={settings.gradeBand}
                  onChange={(e) => setSettings((prev) => ({ ...prev, gradeBand: e.target.value as EduSettings['gradeBand'] }))}
                >
                  <option value="5-7">5-7</option>
                  <option value="8-9">8-9</option>
                  <option value="10-11">10-11</option>
                </select>
              </label>

              <div className="pac-field">
                Subjects
                <div className="pac-check-row">
                  <label><input type="checkbox" checked={settings.subjects.math} onChange={(e) => setSettings((p) => ({ ...p, subjects: { ...p.subjects, math: e.target.checked } }))} /> Math</label>
                  <label><input type="checkbox" checked={settings.subjects.english} onChange={(e) => setSettings((p) => ({ ...p, subjects: { ...p.subjects, english: e.target.checked } }))} /> English</label>
                  <label><input type="checkbox" checked={settings.subjects.science} onChange={(e) => setSettings((p) => ({ ...p, subjects: { ...p.subjects, science: e.target.checked } }))} /> Science</label>
                </div>
              </div>

              <div className="pac-field">
                Quiz triggers
                <div className="pac-check-col">
                  <label><input type="checkbox" checked={settings.triggers.powerPellet} onChange={(e) => setSettings((p) => ({ ...p, triggers: { ...p.triggers, powerPellet: e.target.checked } }))} /> Power Pellet</label>
                  <label><input type="checkbox" checked={settings.triggers.pelletMilestone} onChange={(e) => setSettings((p) => ({ ...p, triggers: { ...p.triggers, pelletMilestone: e.target.checked } }))} /> Every N pellets</label>
                  <label><input type="checkbox" checked={settings.triggers.quizGate} onChange={(e) => setSettings((p) => ({ ...p, triggers: { ...p.triggers, quizGate: e.target.checked } }))} /> Quiz Gate tile</label>
                </div>
                <label className="pac-inline-field">
                  N
                  <input
                    type="number"
                    min={5}
                    max={40}
                    value={settings.triggers.pelletMilestoneEvery}
                    onChange={(e) => setSettings((p) => ({ ...p, triggers: { ...p.triggers, pelletMilestoneEvery: Number(e.target.value) || 15 } }))}
                  />
                </label>
              </div>

              <label className="pac-field">
                Timer seconds
                <input
                  type="number"
                  min={10}
                  max={25}
                  value={settings.timerSeconds}
                  onChange={(e) => setSettings((p) => ({ ...p, timerSeconds: Number(e.target.value) || 15 }))}
                />
              </label>

              <label className="pac-field">
                Wrong penalty
                <select
                  value={settings.wrongPenalty}
                  onChange={(e) => setSettings((p) => ({ ...p, wrongPenalty: e.target.value as EduSettings['wrongPenalty'] }))}
                >
                  <option value="lose-points">Lose points</option>
                  <option value="lose-life">Lose life</option>
                  <option value="slow-player">Slow player 3s</option>
                  <option value="end-frightened">End frightened mode</option>
                </select>
              </label>

              <div className="pac-field">
                Skip options
                <div className="pac-check-col">
                  <label><input type="checkbox" checked={settings.allowSkip} onChange={(e) => setSettings((p) => ({ ...p, allowSkip: e.target.checked }))} /> Allow skip</label>
                  <label><input type="checkbox" checked={settings.allowEscClose} onChange={(e) => setSettings((p) => ({ ...p, allowEscClose: e.target.checked }))} /> ESC close (teacher)</label>
                </div>
                <label className="pac-inline-field">
                  Skip cost
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={settings.skipCost}
                    onChange={(e) => setSettings((p) => ({ ...p, skipCost: Number(e.target.value) || 40 }))}
                  />
                </label>
              </div>

              <div className="pac-field">
                Classroom mode
                <div className="pac-check-col">
                  <label><input type="checkbox" checked={settings.classroom.enabled} onChange={(e) => setSettings((p) => ({ ...p, classroom: { ...p.classroom, enabled: e.target.checked } }))} /> Enable classroom</label>
                </div>

                <label className="pac-inline-field">
                  Turn seconds
                  <input
                    type="number"
                    min={30}
                    max={60}
                    value={settings.classroom.turnSeconds}
                    onChange={(e) => setSettings((p) => ({ ...p, classroom: { ...p.classroom, turnSeconds: Number(e.target.value) || 45 } }))}
                  />
                </label>

                <label className="pac-inline-field">
                  Team count
                  <select
                    value={settings.classroom.teams.length}
                    onChange={(e) => {
                      const count = Number(e.target.value)
                      setSettings((p) => {
                        const current = [...p.classroom.teams]
                        while (current.length < count) current.push(`Jamoa ${current.length + 1}`)
                        return { ...p, classroom: { ...p.classroom, teams: current.slice(0, count) } }
                      })
                    }}
                  >
                    {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>

                <div className="pac-team-inputs">
                  {settings.classroom.teams.map((team, idx) => (
                    <input
                      key={idx}
                      value={team}
                      onChange={(e) =>
                        setSettings((p) => {
                          const teams = [...p.classroom.teams]
                          teams[idx] = e.target.value
                          return { ...p, classroom: { ...p.classroom, teams } }
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
