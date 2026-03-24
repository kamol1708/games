import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'

type TeamState = {
  name: string
  score: number
}

type ClassroomState = {
  teams: [TeamState, TeamState]
  activeTeam: 0 | 1
  minimized: boolean
}

const STORAGE_KEY = 'classroom_mode_session_v1'

const DEFAULT_STATE: ClassroomState = {
  teams: [
    { name: 'Jamoa 1', score: 0 },
    { name: 'Jamoa 2', score: 0 },
  ],
  activeTeam: 0,
  minimized: false,
}

function loadState(): ClassroomState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as ClassroomState
    if (!parsed?.teams?.[0] || !parsed?.teams?.[1]) return DEFAULT_STATE
    return {
      teams: [
        { name: parsed.teams[0].name || 'Jamoa 1', score: Number(parsed.teams[0].score) || 0 },
        { name: parsed.teams[1].name || 'Jamoa 2', score: Number(parsed.teams[1].score) || 0 },
      ],
      activeTeam: parsed.activeTeam === 1 ? 1 : 0,
      minimized: Boolean(parsed.minimized),
    }
  } catch {
    return DEFAULT_STATE
  }
}

type ClassroomModeOverlayProps = PropsWithChildren<{
  gameLabel?: string
}>

export default function ClassroomModeOverlay({ children, gameLabel }: ClassroomModeOverlayProps) {
  const [state, setState] = useState<ClassroomState>(() => loadState())
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement))
    sync()
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  const active = state.teams[state.activeTeam]
  const nextTeamName = state.teams[state.activeTeam === 0 ? 1 : 0].name

  const headerLabel = useMemo(
    () => (gameLabel ? `${gameLabel} • 2 jamoa rejim` : '2 jamoa rejim'),
    [gameLabel],
  )

  const updateTeam = (index: 0 | 1, patch: Partial<TeamState>) => {
    setState((prev) => {
      const nextTeams: [TeamState, TeamState] = [...prev.teams] as [TeamState, TeamState]
      nextTeams[index] = { ...nextTeams[index], ...patch }
      return { ...prev, teams: nextTeams }
    })
  }

  const addScore = (delta: number) => {
    setState((prev) => {
      const nextTeams: [TeamState, TeamState] = [...prev.teams] as [TeamState, TeamState]
      const current = nextTeams[prev.activeTeam]
      nextTeams[prev.activeTeam] = { ...current, score: current.score + delta }
      return { ...prev, teams: nextTeams }
    })
  }

  const goNextTurn = () => {
    setState((prev) => ({ ...prev, activeTeam: prev.activeTeam === 0 ? 1 : 0 }))
  }

  const resetClassroom = () => {
    setState({
      teams: [
        { name: state.teams[0].name || 'Jamoa 1', score: 0 },
        { name: state.teams[1].name || 'Jamoa 2', score: 0 },
      ],
      activeTeam: 0,
      minimized: false,
    })
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      return
    }
    await document.exitFullscreen()
  }

  return (
    <div className="relative min-h-screen">
      {children}

      <div className="pointer-events-none fixed left-2 top-2 z-[70] sm:left-4 sm:top-4">
        <div className="pointer-events-auto w-[min(92vw,360px)] rounded-2xl border border-white/15 bg-black/80 p-3 text-white shadow-[0_18px_45px_rgba(2,8,23,0.55)] backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Classroom</p>
              <p className="text-sm font-semibold">{headerLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, minimized: !prev.minimized }))}
              className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold hover:bg-white/15"
            >
              {state.minimized ? 'Ochish' : 'Yig‘ish'}
            </button>
          </div>

          {state.minimized ? null : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1].map((idx) => {
                  const teamIndex = idx as 0 | 1
                  const isActive = state.activeTeam === teamIndex
                  const team = state.teams[teamIndex]
                  return (
                    <div
                      key={teamIndex}
                      className={`rounded-xl border p-2 ${
                        isActive
                          ? 'border-cyan-300/70 bg-cyan-500/15'
                          : 'border-white/15 bg-white/5'
                      }`}
                    >
                      <input
                        value={team.name}
                        onChange={(e) => updateTeam(teamIndex, { name: e.target.value })}
                        className="w-full rounded-md border border-white/15 bg-black/35 px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/80"
                        maxLength={20}
                      />
                      <p className="mt-1 text-xl font-bold leading-none">{team.score}</p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs">
                Navbat: <span className="font-semibold text-cyan-200">{active.name}</span>
              </div>

              <div className="mt-2 grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => addScore(1)}
                  className="rounded-lg bg-emerald-500 px-2 py-2 text-xs font-semibold text-black active:scale-[0.98]"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => addScore(5)}
                  className="rounded-lg bg-emerald-400 px-2 py-2 text-xs font-semibold text-black active:scale-[0.98]"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => addScore(-1)}
                  className="rounded-lg bg-rose-500 px-2 py-2 text-xs font-semibold text-white active:scale-[0.98]"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => addScore(-5)}
                  className="rounded-lg bg-rose-400 px-2 py-2 text-xs font-semibold text-black active:scale-[0.98]"
                >
                  -5
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={goNextTurn}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 text-sm font-semibold text-white active:scale-[0.98]"
                >
                  Navbat: {nextTeamName}
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white active:scale-[0.98]"
                >
                  {isFullscreen ? 'Fullscreen chiqish' : 'Fullscreen'}
                </button>
              </div>

              <button
                type="button"
                onClick={resetClassroom}
                className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 active:scale-[0.99]"
              >
                Hisobni tozalash
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
