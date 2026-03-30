import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import millionStartSound from '../../assets/Who_Wants_To_Be_A_Millionaire_Phone_A_Friend_Clock_Old_Format.mp3'
import { PRIZE_LADDER, createInitialState, DEFAULT_SETTINGS, gameReducer } from './gameReducer'
import { loadBestScore, loadSettings, saveBestScore, saveSession, saveSettings } from './storage'
import type { GradeBand, Subject, TeamColor } from './types'

type Props = {
  onBack?: () => void
}

const TEAM_COLORS: TeamColor[] = ['#22d3ee', '#fb7185', '#facc15', '#86efac', '#a78bfa', '#f97316']
const SUBJECTS: Subject[] = ['math', 'english', 'science', 'history', 'geography']
const GRADE_BANDS: GradeBand[] = ['5-7', '8-9', '10-11']
const LETTERS = ['A', 'B', 'C', 'D'] as const

export default function KimMillionerPage({ onBack }: Props) {
  const [state, dispatch] = useReducer(gameReducer, createInitialState(loadSettings(DEFAULT_SETTINGS)))
  const [teamNames, setTeamNames] = useState(['Jamoa 1', 'Jamoa 2', 'Jamoa 3', 'Jamoa 4'])
  const [teamColors, setTeamColors] = useState<TeamColor[]>(TEAM_COLORS.slice(0, 4))
  const [numericByTeam, setNumericByTeam] = useState<Record<string, string>>({})
  const [teacherOpen, setTeacherOpen] = useState(false)
  const [teacherPinInput, setTeacherPinInput] = useState('')
  const [bestScore, setBestScore] = useState(loadBestScore())
  const [confettiBurst, setConfettiBurst] = useState(0)
  const startAudioRef = useRef<HTMLAudioElement | null>(null)

  const activeTeam = state.teams.find((t) => t.id === state.activeTeamId) ?? null
  const currentStep = (activeTeam?.currentQuestionIndex ?? 0) + 1
  const gameTeams = state.teams

  useEffect(() => {
    if (![1, 2].includes(state.settings.teamCount)) {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { teamCount: 2 } })
    }
  }, [state.settings.teamCount])

  useEffect(() => {
    if (!state.settings.buzzerMode) {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { buzzerMode: true } })
    }
  }, [state.settings.buzzerMode])

  useEffect(() => {
    saveSettings(state.settings)
  }, [state.settings])

  useEffect(() => {
    if (state.phase !== 'SETUP') {
      saveSession(state)
      const max = Math.max(0, ...state.teams.map((t) => t.currentWinnings))
      if (max > bestScore) {
        setBestScore(max)
        saveBestScore(max)
      }
    }
  }, [state, bestScore])

  useEffect(() => {
    if (!state.settings.timerEnabled) return
    if (state.timerPaused) return
    if (state.phase !== 'QUESTION') return
    const id = window.setInterval(() => {
      if (state.timerLeft <= 1) {
        dispatch({ type: 'TIMEOUT' })
      } else {
        dispatch({ type: 'SET_TIMER', payload: state.timerLeft - 1 })
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [state.phase, state.timerPaused, state.settings.timerEnabled, state.timerLeft])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const k = event.key.toLowerCase()

      if (k === 'escape') {
        setTeacherOpen(false)
        dispatch({ type: 'CLOSE_LIFELINE_MODAL' })
        return
      }

      if (state.phase === 'QUESTION' && ['a', 'b', 'c', 'd'].includes(k)) {
        if (state.currentQuestion?.type === 'numeric') return
        const optionIndex = ['a', 'b', 'c', 'd'].indexOf(k)
        if (state.hiddenOptionIndexes.includes(optionIndex)) return
        dispatch({ type: 'SELECT_OPTION', payload: optionIndex })
        dispatch({ type: 'CONFIRM_OPTION' })
        return
      }

      if (k === 'enter' && state.phase === 'LOCKED') {
        dispatch({ type: 'CONFIRM_OPTION' })
        return
      }

      if (k === ' ' && teacherOpen) {
        event.preventDefault()
        dispatch({ type: 'REVEAL_ANSWER' })
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.phase, teacherOpen])

  useEffect(() => {
    if (state.phase !== 'REVEAL') return
    if (state.isCorrect && activeTeam && (activeTeam.currentQuestionIndex === 5 || activeTeam.currentQuestionIndex === 10 || activeTeam.currentQuestionIndex === 15)) {
      setConfettiBurst((v) => v + 1)
    }
  }, [state.phase, state.isCorrect, activeTeam])

  useEffect(() => {
    return () => {
      if (startAudioRef.current) {
        startAudioRef.current.pause()
        startAudioRef.current.currentTime = 0
      }
    }
  }, [])

  const enabledSubjects = useMemo(
    () => SUBJECTS.filter((s) => state.settings.enabledSubjects[s]),
    [state.settings.enabledSubjects],
  )

  const canUseLifeline = (kind: 'fiftyFifty' | 'askAudience' | 'phoneFriend') => {
    if (!activeTeam) return false
    if (state.phase !== 'QUESTION') return false
    if (state.settings.lifelineMode === 'SHARED') return !state.settings.sharedLifelinesUsed[kind]
    return !activeTeam.lifelinesUsed[kind]
  }

  const startGame = () => {
    if (!startAudioRef.current) {
      startAudioRef.current = new Audio(millionStartSound)
      startAudioRef.current.volume = 0.75
    }
    startAudioRef.current.currentTime = 0
    void startAudioRef.current.play().catch(() => {})

    dispatch({
      type: 'START_GAME',
      payload: {
        teamCount: state.settings.teamCount,
        teamNames: teamNames.slice(0, state.settings.teamCount),
        teamColors: teamColors.slice(0, state.settings.teamCount),
      },
    })
  }

  const exportResults = async () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      winnerTeamId: state.winnerTeamId,
      winnerReason: state.winnerReason,
      teams: state.teams,
      logs: state.logs,
      settings: state.settings,
      stats: state.stats,
    }
    const text = JSON.stringify(payload, null, 2)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const blob = new Blob([text], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'million-quiz-results.json'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const questionOptions = state.currentQuestion?.options ?? ['-', '-', '-', '-']

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060913] text-white">
      <style>{`
        @keyframes mq-pop { 0% { transform: scale(.94); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
        @keyframes mq-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        @keyframes mq-fall { 0% { transform: translateY(-30px) rotate(0deg); opacity: 1 } 100% { transform: translateY(340px) rotate(240deg); opacity: 0 } }
      `}</style>

      <div className="pointer-events-none absolute left-[-120px] top-[-100px] h-[320px] w-[320px] rounded-full bg-cyan-500/20 blur-[110px]" />
      <div className="pointer-events-none absolute right-[-100px] top-[20%] h-[280px] w-[280px] rounded-full bg-fuchsia-500/20 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[30%] h-[300px] w-[300px] rounded-full bg-blue-500/15 blur-[120px]" />

      {confettiBurst > 0 ? (
        <div key={confettiBurst} className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
          {Array.from({ length: 52 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-3 w-2 rounded-sm"
              style={{
                left: `${(i * 17) % 100}%`,
                top: `${-8 - (i % 8) * 7}%`,
                background: TEAM_COLORS[i % TEAM_COLORS.length],
                animation: `mq-fall ${1.6 + (i % 4) * 0.25}s ease-out forwards`,
              }}
            />
          ))}
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-[1400px] p-3 md:p-4">
        <header className="rounded-2xl border border-white/10 bg-[#0a1020]/85 p-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Million Quiz – Flexible Mode</p>
              <h1 className="text-2xl font-black sm:text-3xl">Projector Battle (1 yoki 2 o‘yinchi)</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {onBack ? (
                <button onClick={onBack} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm">
                  Orqaga
                </button>
              ) : null}
              <button
                onClick={() => setTeacherOpen(true)}
                className="rounded-lg border border-violet-300/40 bg-violet-500/20 px-3 py-2 text-sm font-semibold"
              >
                Teacher Panel
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
              <p className="text-xs text-white/60">Active Team</p>
              <p className="font-bold" style={{ color: activeTeam?.color ?? '#fff' }}>{activeTeam?.name ?? '-'}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
              <p className="text-xs text-white/60">Phase</p>
              <p className="font-bold">{state.phase}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
              <p className="text-xs text-white/60">Timer</p>
              <p className={`font-bold ${state.timerLeft <= 7 ? 'text-rose-300' : 'text-cyan-300'}`}>{state.settings.timerEnabled ? `${state.timerLeft}s` : 'OFF'}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
              <p className="text-xs text-white/60">Best Score</p>
              <p className="font-bold text-emerald-300">${bestScore.toLocaleString()}</p>
            </div>
          </div>
        </header>

        {state.phase === 'SETUP' ? (
          <section className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-[#0a1020]/85 p-4 backdrop-blur">
              <h2 className="text-xl font-bold">Setup</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="grid gap-1 text-sm">
                  <span className="text-white/70">Team count</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { teamCount: count as 1 | 2 } })}
                        className={`rounded-lg border px-2 py-2 font-semibold transition ${
                          state.settings.teamCount === count
                            ? 'border-cyan-300/50 bg-cyan-500/15 text-cyan-100'
                            : 'border-white/20 bg-black/30 text-white/75'
                        }`}
                      >
                        {count} kishilik
                      </button>
                    ))}
                  </div>
                </div>

                <label className="grid gap-1 text-sm">
                  <span className="text-white/70">Grade band</span>
                  <select
                    value={state.settings.gradeBand}
                    onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { gradeBand: e.target.value as GradeBand } })}
                    className="rounded-lg border border-white/20 bg-black/30 px-2 py-2"
                  >
                    {GRADE_BANDS.map((band) => (
                      <option key={band} value={band}>{band}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="text-white/70">Win mode</span>
                  <select
                    value={state.settings.winMode}
                    onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { winMode: e.target.value as any } })}
                    className="rounded-lg border border-white/20 bg-black/30 px-2 py-2"
                  >
                    <option value="FIRST_MILLION">First to 1,000,000</option>
                    <option value="HIGHEST_AFTER_N">Highest after N questions</option>
                    <option value="BEST_OF_ROUNDS">Best-of rounds</option>
                  </select>
                </label>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm">
                  <input type="checkbox" checked={state.settings.timerEnabled} onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { timerEnabled: e.target.checked } })} />
                  Timer
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm">
                  <span>Duration</span>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    value={state.settings.timerSeconds}
                    onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { timerSeconds: Number(e.target.value) } })}
                    className="flex-1"
                  />
                  <span>{state.settings.timerSeconds}s</span>
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm">
                  <input type="checkbox" checked={state.settings.negativeMarking} onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { negativeMarking: e.target.checked } })} />
                  Negative marking
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm">
                  <input type="checkbox" checked={state.settings.enableNumeric} onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { enableNumeric: e.target.checked } })} />
                  Numeric
                </label>
              </div>

              <div className="mt-3 grid gap-2">
                <label className="text-sm text-white/70">Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <label key={s} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={state.settings.enabledSubjects[s]}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_SETTINGS',
                            payload: {
                              enabledSubjects: {
                                ...state.settings.enabledSubjects,
                                [s]: e.target.checked,
                              },
                            },
                          })
                        }
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: state.settings.teamCount }, (_, idx) => (
                  <article key={idx} className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <label className="text-xs text-white/65">{state.settings.teamCount === 1 ? 'Player' : 'Team'} {idx + 1} name</label>
                    <input
                      value={teamNames[idx]}
                      onChange={(e) => {
                        const next = [...teamNames]
                        next[idx] = e.target.value
                        setTeamNames(next)
                      }}
                      className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 px-2 py-2"
                    />
                    <label className="mt-2 block text-xs text-white/65">Color</label>
                    <select
                      value={teamColors[idx]}
                      onChange={(e) => {
                        const next = [...teamColors]
                        next[idx] = e.target.value as TeamColor
                        setTeamColors(next)
                      }}
                      className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 px-2 py-2"
                    >
                      {TEAM_COLORS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </article>
                ))}
              </div>

              <button
                onClick={startGame}
                disabled={enabledSubjects.length === 0}
                className="mt-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2 font-bold text-black disabled:opacity-50"
              >
                Start Million Quiz
              </button>
            </div>

            <aside className="rounded-2xl border border-white/10 bg-[#0a1020]/85 p-4 backdrop-blur">
              <h3 className="text-lg font-bold">Prize Ladder</h3>
              <div className="mt-2 space-y-1 text-sm">
                {[...PRIZE_LADDER].reverse().map((value, ridx) => {
                  const step = PRIZE_LADDER.length - ridx
                  const safe = step === 5 || step === 10
                  return (
                    <div key={step} className={`rounded-lg border px-3 py-1.5 ${safe ? 'border-amber-300/50 bg-amber-500/15' : 'border-white/10 bg-black/25'}`}>
                      <span className="font-semibold">Q{step}</span> - ${value.toLocaleString()}
                    </div>
                  )
                })}
              </div>
            </aside>
          </section>
        ) : (
          <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_360px]">
            <div className="space-y-4">
              <div className={`grid gap-2 ${gameTeams.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                {gameTeams.map((team) => (
                  <article
                    key={team.id}
                    className={`rounded-xl border p-3 ${team.id === state.activeTeamId ? 'border-cyan-300/60 bg-cyan-500/15' : 'border-white/10 bg-[#0a1020]/85'} ${team.eliminated ? 'opacity-45' : ''}`}
                  >
                    <p className="text-sm font-semibold" style={{ color: team.color }}>{team.name}</p>
                    <p className="text-xl font-black text-emerald-300">${team.currentWinnings.toLocaleString()}</p>
                    <p className="text-xs text-white/65">Step: {team.currentQuestionIndex}/15</p>
                    <p className="text-xs text-white/65">Round wins: {team.roundsWon}</p>
                  </article>
                ))}
              </div>

              <article className="rounded-2xl border border-white/10 bg-[#0a1020]/90 p-4 backdrop-blur">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-white/70">Active: <span className="font-bold" style={{ color: activeTeam?.color ?? '#fff' }}>{activeTeam?.name ?? '-'}</span></p>
                  <div className={`rounded-lg border px-3 py-1 text-sm font-bold ${state.timerLeft <= 7 ? 'border-rose-300/50 bg-rose-500/20 text-rose-200' : 'border-cyan-300/40 bg-cyan-500/15 text-cyan-100'}`}>
                    {state.settings.timerEnabled ? `${state.timerLeft}s` : 'Timer OFF'}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Q{currentStep} • {state.currentQuestion?.subject ?? '-'} • {state.currentQuestion?.difficulty ?? '-'}</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{state.currentQuestion?.text ?? 'Savol mavjud emas'}</h2>
                </div>

                <div className={`mt-3 grid gap-3 ${gameTeams.length > 1 ? 'lg:grid-cols-2' : ''}`}>
                  {gameTeams.map((team) => {
                    const lockedByOther = Boolean(state.buzzedTeamId && state.buzzedTeamId !== team.id)
                    const isAnswerOwner = state.buzzedTeamId === team.id
                    return (
                      <section
                        key={`team-card-${team.id}`}
                        className={`rounded-xl border p-3 ${
                          isAnswerOwner
                            ? 'border-emerald-300/60 bg-emerald-500/12'
                            : 'border-white/15 bg-white/5'
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-base font-bold" style={{ color: team.color }}>{team.name}</p>
                          <span className="text-xs text-white/70">
                            {isAnswerOwner ? 'JAVOB EGA' : lockedByOther ? 'LOCKED' : 'READY'}
                          </span>
                        </div>

                        {state.currentQuestion?.type === 'numeric' && state.phase === 'QUESTION' ? (
                          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                            <label className="text-sm text-white/70">Numeric answer</label>
                            <div className="mt-2 flex gap-2">
                              <input
                                value={numericByTeam[team.id] ?? ''}
                                onChange={(e) => setNumericByTeam((prev) => ({ ...prev, [team.id]: e.target.value }))}
                                className="h-12 flex-1 rounded-lg border border-white/20 bg-black/35 px-3 py-2 text-base"
                                inputMode="numeric"
                                disabled={lockedByOther}
                              />
                              <button
                                onClick={() => {
                                  dispatch({ type: 'BUZZ_IN', payload: team.id })
                                  const n = Number(numericByTeam[team.id] ?? '')
                                  if (!Number.isFinite(n)) return
                                  dispatch({ type: 'SUBMIT_NUMERIC', payload: n })
                                  setNumericByTeam((prev) => ({ ...prev, [team.id]: '' }))
                                }}
                                disabled={state.phase !== 'QUESTION' || lockedByOther}
                                className="touch-manipulation rounded-lg bg-cyan-500 px-4 py-2 text-base font-bold text-black active:scale-[0.98] disabled:opacity-40"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {questionOptions.map((option, idx) => {
                              const hidden = state.hiddenOptionIndexes.includes(idx)
                              if (hidden) return <div key={idx} className="rounded-xl border border-white/10 bg-black/10 p-4 opacity-20" />

                              const selected = state.selectedOptionIndex === idx
                              const correct = state.answerRevealed && state.currentQuestion && idx === state.currentQuestion.correctIndex
                              const wrong = state.answerRevealed && selected && !correct

                              return (
                                <button
                                  key={`${team.id}-${idx}`}
                                  disabled={state.phase !== 'QUESTION' || lockedByOther}
                                  onClick={() => {
                                    dispatch({ type: 'BUZZ_IN', payload: team.id })
                                    dispatch({ type: 'SELECT_OPTION', payload: idx })
                                    dispatch({ type: 'CONFIRM_OPTION' })
                                  }}
                                  className={`touch-manipulation select-none rounded-xl border p-5 text-left text-base transition active:scale-[0.98] ${selected && isAnswerOwner ? 'border-cyan-300/70 bg-cyan-500/15' : 'border-white/15 bg-white/5 hover:bg-white/10'} ${correct && isAnswerOwner ? 'border-emerald-300/70 bg-emerald-500/20' : ''} ${wrong && isAnswerOwner ? 'border-rose-300/70 bg-rose-500/20' : ''} ${wrong && isAnswerOwner ? 'animate-[mq-shake_0.36s_linear]' : ''}`}
                                >
                                  <span className="mr-2 font-black text-cyan-300">{LETTERS[idx]}.</span> {option}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </section>
                    )
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => dispatch({ type: 'USE_5050' })}
                    disabled={!canUseLifeline('fiftyFifty')}
                    className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-2 text-sm font-semibold disabled:opacity-40"
                  >
                    50:50
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'USE_AUDIENCE' })}
                    disabled={!canUseLifeline('askAudience')}
                    className="rounded-lg border border-violet-300/40 bg-violet-500/15 px-3 py-2 text-sm font-semibold disabled:opacity-40"
                  >
                    Ask Audience
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'USE_FRIEND' })}
                    disabled={!canUseLifeline('phoneFriend')}
                    className="rounded-lg border border-amber-300/40 bg-amber-500/15 px-3 py-2 text-sm font-semibold disabled:opacity-40"
                  >
                    Phone Friend
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'PASS' })}
                    disabled={!state.settings.allowPass || state.phase !== 'QUESTION'}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm"
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'WALK_AWAY' })}
                    disabled={state.phase !== 'QUESTION'}
                    className="rounded-lg border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-sm"
                  >
                    Walk Away
                  </button>

                  {state.phase === 'REVEAL' ? (
                    <button
                      onClick={() => dispatch({ type: 'ROUND_NEXT_TEAM' })}
                      className="rounded-lg bg-gradient-to-r from-fuchsia-400 to-violet-500 px-4 py-2 text-sm font-bold text-black"
                    >
                      Next Round
                    </button>
                  ) : null}
                </div>

                {state.phase === 'REVEAL' && state.settings.showExplanationAfterReveal && state.currentQuestion ? (
                  <p className="mt-3 rounded-lg border border-white/10 bg-black/25 p-3 text-sm text-white/80" style={{ animation: 'mq-pop .2s ease-out' }}>
                    Izoh: {state.currentQuestion.explanation}
                  </p>
                ) : null}
              </article>

            </div>

            <aside className="rounded-2xl border border-white/10 bg-[#0a1020]/85 p-4">
              <h3 className="text-lg font-bold">Prize Ladder</h3>
              <div className="mt-2 space-y-1">
                {[...PRIZE_LADDER].reverse().map((value, idx) => {
                  const step = PRIZE_LADDER.length - idx
                  const isCurrent = currentStep === step
                  const safe = step === 5 || step === 10
                  return (
                    <div
                      key={step}
                      className={`rounded-lg border px-3 py-1.5 text-sm ${safe ? 'border-amber-300/50 bg-amber-500/15' : 'border-white/10 bg-black/25'} ${isCurrent ? 'ring-1 ring-cyan-300/70' : ''}`}
                    >
                      <span className="font-semibold">Q{step}</span> - ${value.toLocaleString()}
                    </div>
                  )
                })}
              </div>
            </aside>
          </section>
        )}

        {state.audiencePoll ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-xl rounded-2xl border border-violet-300/40 bg-[#0a1020] p-5">
              <h3 className="text-xl font-bold text-violet-200">Ask the Audience</h3>
              <div className="mt-3 space-y-2">
                {state.audiencePoll.map((value, idx) => (
                  <div key={idx}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{LETTERS[idx]}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-3 rounded bg-black/40">
                      <div className="h-3 rounded bg-violet-400" style={{ width: `${value}%`, transition: 'width .4s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => dispatch({ type: 'CLOSE_LIFELINE_MODAL' })} className="mt-4 rounded-lg bg-violet-500 px-4 py-2 font-semibold text-black">
                Close
              </button>
            </div>
          </div>
        ) : null}

        {state.friendSuggestion ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-amber-300/40 bg-[#0a1020] p-5">
              <h3 className="text-xl font-bold text-amber-200">Phone a Friend</h3>
              <p className="mt-2 text-white/80">
                Friend tavsiyasi: <span className="font-bold text-amber-200">{LETTERS[state.friendSuggestion.optionIndex]}</span> ({state.friendSuggestion.confidence}% ishonch)
              </p>
              <button onClick={() => dispatch({ type: 'CLOSE_LIFELINE_MODAL' })} className="mt-4 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-black">
                Close
              </button>
            </div>
          </div>
        ) : null}

        {teacherOpen ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-cyan-300/30 bg-[#070e1f] p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-black">Teacher Controls</h3>
                <button onClick={() => setTeacherOpen(false)} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm">
                  Close
                </button>
              </div>

              {state.settings.teacherPinEnabled && !state.teacherVerified ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="text-sm text-white/70">PIN kiriting</p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="password"
                      value={teacherPinInput}
                      onChange={(e) => setTeacherPinInput(e.target.value)}
                      className="flex-1 rounded-lg border border-white/20 bg-black/35 px-3 py-2"
                    />
                    <button
                      onClick={() => dispatch({ type: 'TEACHER_VERIFY', payload: teacherPinInput })}
                      className="rounded-lg bg-cyan-500 px-4 py-2 font-bold text-black"
                    >
                      Unlock
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button onClick={() => dispatch({ type: 'TEACHER_SKIP' })} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm">Skip question</button>
                  <button onClick={() => dispatch({ type: 'REVEAL_ANSWER' })} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm">Reveal answer (Space)</button>
                  <button onClick={() => dispatch({ type: 'TEACHER_FORCE_CORRECT' })} className="rounded-lg border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-sm">Force correct</button>
                  <button onClick={() => dispatch({ type: 'TEACHER_FORCE_WRONG' })} className="rounded-lg border border-rose-300/40 bg-rose-500/15 px-3 py-2 text-sm">Force wrong</button>
                  <button onClick={() => dispatch({ type: 'ROUND_NEXT_TEAM' })} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm">Next team</button>
                  <button onClick={() => dispatch({ type: 'RESET_GAME' })} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm">Reset game</button>
                  <button onClick={() => exportResults()} className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-2 text-sm">Export JSON</button>
                  <button onClick={() => dispatch({ type: 'TEACHER_LOGOUT' })} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm">Lock panel</button>
                </div>
              )}

              {state.teacherVerified ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="text-sm font-semibold">Manual Adjust</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {state.teams.map((t) => (
                      <div key={t.id} className="rounded-lg border border-white/10 bg-black/25 p-2">
                        <p className="text-sm" style={{ color: t.color }}>{t.name}</p>
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => dispatch({ type: 'TEACHER_ADJUST_MONEY', payload: { teamId: t.id, delta: 1000 } })} className="rounded bg-emerald-500/20 px-2 py-1 text-xs">+1000</button>
                          <button onClick={() => dispatch({ type: 'TEACHER_ADJUST_MONEY', payload: { teamId: t.id, delta: -1000 } })} className="rounded bg-rose-500/20 px-2 py-1 text-xs">-1000</button>
                          <button onClick={() => dispatch({ type: 'TEACHER_SWITCH_TEAM', payload: t.id })} className="rounded bg-cyan-500/20 px-2 py-1 text-xs">Set active</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <label className="mt-3 inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={state.settings.showExplanationAfterReveal}
                      onChange={(e) => dispatch({ type: 'TEACHER_TOGGLE_EXPLANATION', payload: e.target.checked })}
                    />
                    Show explanation after reveal
                  </label>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {state.phase === 'GAME_END' ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-xl rounded-2xl border border-emerald-300/40 bg-[#071122] p-6 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Game End</p>
              <h3 className="mt-2 text-3xl font-black text-emerald-200">
                {state.teams.find((t) => t.id === state.winnerTeamId)?.name ?? 'No Winner'}
              </h3>
              <p className="mt-2 text-white/80">{state.winnerReason ?? 'Game finished'}</p>
              <button
                onClick={() => dispatch({ type: 'RESET_GAME' })}
                className="mt-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2 font-bold text-black"
              >
                New Game
              </button>
            </div>
          </div>
        ) : null}

      </div>
    </main>
  )
}
