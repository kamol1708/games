import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import SceneRoot from './game/SceneRoot'
import HUD from './ui/HUD'
import SettingsModal from './ui/SettingsModal'
import WinModal from './ui/WinModal'
import Toast from './ui/Toast'
import { createInitialState, gameReducer } from './logic/gameState'
import { canRoll } from './logic/turnMachine'
import { animateStepMovement, computeTargetStep } from './logic/movement'
import { loadSettings, saveSettings, type GameSettings } from './logic/storage'
import { SPECIALS_BY_FROM } from './logic/specials'
import { TILE_COUNT } from './game/constants'

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms))
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState(loadSettings()))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(!!document.fullscreenElement)
  const [rollRequestId, setRollRequestId] = useState(0)
  const [landedStep, setLandedStep] = useState<number | null>(1)
  const [eventBurst, setEventBurst] = useState<{ trigger: number; step: number | null; tone: 'trap' | 'ladder' | null }>({
    trigger: 0,
    step: null,
    tone: null,
  })

  const activeStateRef = useRef(state)
  const diceResolveRef = useRef<((value: number) => void) | null>(null)
  const busyRef = useRef(false)

  useEffect(() => {
    activeStateRef.current = state
  }, [state])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    if (!state.toast) return
    const id = window.setTimeout(() => dispatch({ type: 'SET_TOAST', toast: null }), 1400)
    return () => window.clearTimeout(id)
  }, [state.toast])

  const requestDiceRoll = useCallback(() => {
    return new Promise<number>((resolve) => {
      diceResolveRef.current = resolve
      setRollRequestId((x) => x + 1)
    })
  }, [])

  const handleDiceSettled = useCallback((value: number) => {
    dispatch({ type: 'SET_DICE', value })
    dispatch({ type: 'SET_ROLLING_STATUS', text: `Dice settled: ${value}` })
    const resolver = diceResolveRef.current
    diceResolveRef.current = null
    if (resolver) resolver(value)
  }, [])

  const applySettings = useCallback((next: GameSettings) => {
    dispatch({ type: 'SET_SETTINGS', settings: next })
    saveSettings(next)
  }, [])

  const restartGame = useCallback(() => {
    busyRef.current = false
    diceResolveRef.current = null
    setRollRequestId(0)
    setLandedStep(1)
    setEventBurst({ trigger: 0, step: null, tone: null })
    dispatch({ type: 'RESET_GAME' })
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      // ignore fullscreen errors (browser policy)
    }
  }, [])

  const runTurn = useCallback(async () => {
    const snap = activeStateRef.current
    if (!canRoll(snap.phase) || busyRef.current || snap.winnerId) return
    busyRef.current = true

    const currentPlayerIndex = snap.currentPlayerIndex
    const player = snap.players[currentPlayerIndex]

    dispatch({ type: 'SET_PHASE', phase: 'ROLLING' })
    dispatch({ type: 'SET_ROLLING_STATUS', text: 'Dice rolling…' })
    dispatch({ type: 'ADD_LOG', text: `${player.name} rolling dice…` })
    dispatch({ type: 'SET_TOAST', toast: { text: 'Dice rolling…', tone: 'info' } })

    const dice = await requestDiceRoll()
    const latestAfterRoll = activeStateRef.current
    const actor = latestAfterRoll.players[currentPlayerIndex]

    dispatch({ type: 'ADD_LOG', text: `${actor.name} rolled ${dice}` })
    dispatch({ type: 'SET_PHASE', phase: 'MOVING' })
    dispatch({ type: 'SET_ROLLING_STATUS', text: `${actor.name} moving ${dice} tiles` })

    const target = computeTargetStep(actor.step, dice, latestAfterRoll.settings.exactRollToFinish)
    if (target === actor.step && latestAfterRoll.settings.exactRollToFinish && actor.step + dice > TILE_COUNT) {
      dispatch({ type: 'ADD_LOG', text: `${actor.name} needs exact roll to finish. Stayed on ${actor.step}.` })
      dispatch({ type: 'SET_TOAST', toast: { text: 'Exact roll required!', tone: 'info' } })
      await wait(700)
      dispatch({ type: 'SET_PHASE', phase: 'NEXT_TURN' })
      dispatch({ type: 'NEXT_TURN' })
      dispatch({ type: 'ADD_LOG', text: `${activeStateRef.current.players[activeStateRef.current.currentPlayerIndex].name} turn` })
      busyRef.current = false
      return
    }

    const stepDelay = Math.max(90, Math.round(260 / latestAfterRoll.settings.movementSpeed))
    await animateStepMovement({
      fromStep: actor.step,
      toStep: target,
      setStep: (step) => {
        dispatch({ type: 'SET_PLAYER_STEP', playerIndex: currentPlayerIndex, step })
        setLandedStep(step)
      },
      delayMs: stepDelay,
    })

    let finalStep = target

    if (target >= TILE_COUNT) {
      dispatch({ type: 'SET_PHASE', phase: 'WIN' })
      dispatch({ type: 'SET_WINNER', winnerId: actor.id })
      dispatch({ type: 'SET_TOAST', toast: { text: `${actor.name} reached 100!`, tone: 'win' } })
      dispatch({ type: 'ADD_LOG', text: `${actor.name} reached tile 100 and wins!` })
      busyRef.current = false
      return
    }

    dispatch({ type: 'SET_PHASE', phase: 'RESOLVING' })
    const special = SPECIALS_BY_FROM.get(target)
    if (special) {
      const delta = special.to - special.from
      const tone = special.type === 'trap' ? 'trap' : 'ladder'
      const msg = special.type === 'trap' ? `TRAP! ${delta} steps` : `BOOST! +${delta} steps`
      dispatch({ type: 'SET_TOAST', toast: { text: msg, tone } })
      dispatch({ type: 'ADD_LOG', text: `${actor.name} landed on ${special.from}: ${special.type === 'trap' ? 'TRAP' : 'BOOST'} ${delta > 0 ? '+' : ''}${delta}` })
      setEventBurst((prev) => ({ trigger: prev.trigger + 1, step: special.from, tone }))
      dispatch({ type: 'SET_ROLLING_STATUS', text: msg })
      await wait(450)

      await animateStepMovement({
        fromStep: special.from,
        toStep: special.to,
        setStep: (step) => {
          dispatch({ type: 'SET_PLAYER_STEP', playerIndex: currentPlayerIndex, step })
          setLandedStep(step)
        },
        delayMs: Math.max(85, Math.round(240 / latestAfterRoll.settings.movementSpeed)),
      })
      finalStep = special.to
    } else {
      dispatch({ type: 'ADD_LOG', text: `${actor.name} landed on tile ${target}` })
      dispatch({ type: 'SET_ROLLING_STATUS', text: `Landed on tile ${target}` })
    }

    if (finalStep >= TILE_COUNT) {
      const finisher = activeStateRef.current.players[currentPlayerIndex]
      dispatch({ type: 'SET_PHASE', phase: 'WIN' })
      dispatch({ type: 'SET_WINNER', winnerId: finisher.id })
      dispatch({ type: 'SET_TOAST', toast: { text: `${finisher.name} wins!`, tone: 'win' } })
      dispatch({ type: 'ADD_LOG', text: `${finisher.name} reached tile 100 and wins!` })
      busyRef.current = false
      return
    }

    await wait(550)
    dispatch({ type: 'SET_PHASE', phase: 'NEXT_TURN' })
    dispatch({ type: 'NEXT_TURN' })
    const next = activeStateRef.current.players[activeStateRef.current.currentPlayerIndex]
    dispatch({ type: 'SET_ROLLING_STATUS', text: `${next.name} turn` })
    dispatch({ type: 'ADD_LOG', text: `${next.name} turn` })
    busyRef.current = false
  }, [requestDiceRoll])

  const playersForScene = useMemo(
    () => state.players.map((p) => ({ id: p.id, color: p.color, step: p.step })),
    [state.players],
  )

  const tokenPulse: [number, number] = [
    state.phase === 'MOVING' && state.currentPlayerIndex === 0 ? 1 : 0,
    state.phase === 'MOVING' && state.currentPlayerIndex === 1 ? 1 : 0,
  ]

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#04070a]">
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_50%,transparent_45%,rgba(0,0,0,0.36)_100%)]" />

      <SceneRoot
        phase={state.phase}
        players={playersForScene}
        currentPlayerIndex={state.currentPlayerIndex}
        onDiceSettled={handleDiceSettled}
        rollRequestId={rollRequestId}
        specialsByFrom={SPECIALS_BY_FROM}
        landedStep={landedStep}
        eventBurst={eventBurst}
        tokenPulse={tokenPulse}
      />

      <HUD
        phase={state.phase}
        currentPlayer={state.players[state.currentPlayerIndex]}
        players={state.players}
        diceValue={state.diceValue}
        rollingStatus={state.rollingStatus}
        canRoll={canRoll(state.phase) && !busyRef.current && !state.winnerId}
        onRoll={() => {
          void runTurn()
        }}
        onRestart={restartGame}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleFullscreen={() => {
          void toggleFullscreen()
        }}
        isFullscreen={isFullscreen}
        eventLog={state.eventLog}
      />

      <Toast toast={state.toast} />
      <SettingsModal open={settingsOpen} settings={state.settings} onClose={() => setSettingsOpen(false)} onChange={applySettings} />
      <WinModal open={state.phase === 'WIN'} winner={state.winnerId ? state.players.find((p) => p.id === state.winnerId) ?? null : null} players={state.players} onRestart={restartGame} />
    </div>
  )
}
