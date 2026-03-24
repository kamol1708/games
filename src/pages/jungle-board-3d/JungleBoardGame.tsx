import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import JungleBoardScene from './components/JungleBoardScene'
import { PLAYER_COLORS } from './game/constants'
import { createTiles, resolveTileEvent, TILE_COUNT } from './game/board'
import { buildSingleQuestion, pickDifficultyByStep, type QuizDifficulty, type RaceQuestion } from './game/questions'
import type { GamePhase, PlayerDef, TileDef } from './game/types'
import HUD from './ui/HUD'
import { clamp, randInt, sleep } from './utils/math'

type TurnQuizState = {
  difficulty: QuizDifficulty
  timerLeft: number
  question: RaceQuestion
  selected: number | null
  locked: boolean
  currentPlayerIdx: 0 | 1
  turn: number
}

function createPlayers(): PlayerDef[] {
  return [
    { id: 1, name: 'Jamoa 1', color: PLAYER_COLORS[0], tileIndex: 0, score: 0 },
    { id: 2, name: 'Jamoa 2', color: PLAYER_COLORS[1], tileIndex: 0, score: 0 },
  ]
}

export default function JungleBoardGame() {
  const tilesRef = useRef<TileDef[]>(createTiles())
  const [players, setPlayers] = useState<PlayerDef[]>(() => createPlayers())
  const [activePlayerIndex, setActivePlayerIndex] = useState<0 | 1>(0)
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [diceValue, setDiceValue] = useState<number | null>(null)
  const [diceRolling, setDiceRolling] = useState(false)
  const [diceSpinSeed, setDiceSpinSeed] = useState(0)
  const [message, setMessage] = useState("Jungle safari boshlandi. Har navbatda 1 ta savol!")
  const [lastEventLabel, setLastEventLabel] = useState('')
  const [winnerId, setWinnerId] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(!!document.fullscreenElement)
  const [turnQuiz, setTurnQuiz] = useState<TurnQuizState | null>(null)

  const actionLockRef = useRef(false)
  const quizResolverRef = useRef<((isCorrect: boolean) => void) | null>(null)

  const tiles = tilesRef.current
  const canRoll = phase === 'idle' && !actionLockRef.current

  const trapCount = useMemo(() => tiles.filter((t) => t.eventType === 'trap').length, [tiles])
  const boostCount = useMemo(() => tiles.filter((t) => t.eventType === 'boost').length, [tiles])
  const treasureCount = useMemo(() => tiles.filter((t) => t.eventType === 'treasure').length, [tiles])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const completeQuiz = useCallback((isCorrect: boolean) => {
    const resolver = quizResolverRef.current
    if (!resolver) return
    quizResolverRef.current = null
    setTurnQuiz(null)
    resolver(isCorrect)
  }, [])

  useEffect(() => {
    if (!turnQuiz || phase !== 'quiz') return
    const id = window.setInterval(() => {
      setTurnQuiz((prev) => {
        if (!prev) return prev
        return { ...prev, timerLeft: Math.max(0, prev.timerLeft - 1) }
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [turnQuiz, phase])

  useEffect(() => {
    if (!turnQuiz || phase !== 'quiz') return
    if (turnQuiz.timerLeft > 0) return
    setMessage(`${players[turnQuiz.currentPlayerIdx].name}: vaqt tugadi. Navbat almashadi.`)
    setLastEventLabel('QUIZ TIMEOUT')
    completeQuiz(false)
  }, [completeQuiz, phase, players, turnQuiz])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      // ignore browser blocking
    }
  }, [])

  const setPlayerTile = useCallback((playerIdx: number, tileIndex: number) => {
    setPlayers((prev) => prev.map((p, idx) => (idx === playerIdx ? { ...p, tileIndex } : p)))
  }, [])

  const bumpPlayerScore = useCallback((playerIdx: number, delta: number) => {
    setPlayers((prev) => prev.map((p, idx) => (idx === playerIdx ? { ...p, score: Math.max(0, p.score + delta) } : p)))
  }, [])

  const nextTurn = useCallback(() => {
    setActivePlayerIndex((prev) => (prev === 0 ? 1 : 0))
    setPhase('idle')
    setMessage('Keyingi jamoa uchun Zar Tashlash tugmasini bosing.')
  }, [])

  const resetBoard = useCallback(() => {
    tilesRef.current = createTiles()
    setPlayers(createPlayers())
    setActivePlayerIndex(0)
    setPhase('idle')
    setDiceValue(null)
    setDiceRolling(false)
    setDiceSpinSeed((s) => s + 1)
    setWinnerId(null)
    setLastEventLabel('')
    setTurnQuiz(null)
    quizResolverRef.current = null
    setMessage("Yangi 100-qadamli jungle xarita yaratildi. Har navbatda 1 ta savol beriladi.")
    actionLockRef.current = false
  }, [])

  const runTileEvent = useCallback(async (playerIdx: number, tileIndex: number) => {
    const tile = tilesRef.current[tileIndex]
    if (!tile) return

    setPhase('resolving')
    const result = resolveTileEvent(tile)

    if (result.scoreDelta !== 0) bumpPlayerScore(playerIdx, result.scoreDelta)

    let eventMsg = `${players[playerIdx].name}: ${result.message}`
    if (tile.eventType === 'treasure') eventMsg += `${Math.max(0, result.scoreDelta)}`
    if (tile.eventType === 'trap' && typeof result.moveTo === 'number') eventMsg += ` (${tile.step} → ${result.moveTo + 1})`
    if (tile.eventType === 'boost' && typeof result.moveTo === 'number') eventMsg += ` (${tile.step} → ${result.moveTo + 1})`

    setLastEventLabel(tile.eventType.toUpperCase())
    setMessage(eventMsg)

    if (typeof result.moveTo === 'number' && result.moveTo !== tileIndex) {
      await sleep(650)
      setPlayerTile(playerIdx, result.moveTo)
      await sleep(700)
      if (result.moveTo >= TILE_COUNT - 1) {
        setWinnerId(players[playerIdx].id)
        setPhase('finished')
        setMessage(`${players[playerIdx].name} finalga boost bilan yetib keldi!`)
        return
      }
    }

    if (tileIndex >= TILE_COUNT - 1) {
      setWinnerId(players[playerIdx].id)
      setPhase('finished')
      setMessage(`${players[playerIdx].name} 100-qadamga yetib g'olib bo'ldi!`)
      return
    }

    await sleep(850)
    nextTurn()
  }, [bumpPlayerScore, nextTurn, players, setPlayerTile])

  const performRollFor = useCallback(async (playerIdx: number) => {
    const actor = players[playerIdx]

    setActivePlayerIndex(playerIdx as 0 | 1)
    setPhase('rolling')
    setDiceRolling(true)
    setLastEventLabel('ROLL')

    const rolled = randInt(1, 6)
    setDiceSpinSeed((s) => s + 1)
    setMessage(`${actor.name} zar tashlamoqda...`)

    await sleep(1200)

    setDiceRolling(false)
    setDiceValue(rolled)
    setPhase('moving')
    setMessage(`${actor.name} ga ${rolled} tushdi. Yurmoqda...`)

    let current = players[playerIdx].tileIndex
    for (let step = 0; step < rolled; step += 1) {
      current = clamp(current + 1, 0, TILE_COUNT - 1)
      setPlayerTile(playerIdx, current)
      await sleep(220)
      if (current >= TILE_COUNT - 1) break
    }

    await runTileEvent(playerIdx, current)
  }, [players, runTileEvent, setPlayerTile])

  const startTurnQuiz = useCallback((difficulty: QuizDifficulty, playerIdx: 0 | 1) => {
    return new Promise<boolean>((resolve) => {
      quizResolverRef.current = resolve
      const question = buildSingleQuestion(difficulty)
      setTurnQuiz({
        difficulty,
        timerLeft: 10,
        question,
        selected: null,
        locked: false,
        currentPlayerIdx: playerIdx,
        turn: playerIdx === 0 ? 1 : 2,
      })
      setMessage(`${players[playerIdx].name} uchun savol (${difficulty.toUpperCase()})`) 
    })
  }, [players])

  const handleTurnAnswer = (optionIdx: number) => {
    if (!turnQuiz || phase !== 'quiz') return
    if (turnQuiz.locked) return

    const isCorrect = optionIdx === turnQuiz.question.correctIndex
    setTurnQuiz({ ...turnQuiz, selected: optionIdx, locked: true })

    if (isCorrect) {
      setMessage(`${players[turnQuiz.currentPlayerIdx].name} to'g'ri topdi. Zar tashlaydi!`)
      setLastEventLabel(`QUIZ ${turnQuiz.difficulty.toUpperCase()}`)
      window.setTimeout(() => completeQuiz(true), 200)
      return
    }

    setMessage(`${players[turnQuiz.currentPlayerIdx].name} xato javob berdi. Navbat almashadi.`)
    setLastEventLabel('QUIZ FAIL')
    window.setTimeout(() => completeQuiz(false), 250)
  }

  const handleRoll = useCallback(async () => {
    if (phase !== 'idle' || actionLockRef.current) return
    actionLockRef.current = true

    const playerIdx = activePlayerIndex
    const maxStep = Math.max(players[0].tileIndex + 1, players[1].tileIndex + 1)
    const difficulty = pickDifficultyByStep(maxStep)

    setPhase('quiz')
    setMessage('Savol bosqichi boshlandi...')

    const isCorrect = await startTurnQuiz(difficulty, playerIdx)

    if (!isCorrect) {
      await sleep(250)
      nextTurn()
      actionLockRef.current = false
      return
    }

    await performRollFor(playerIdx)
    actionLockRef.current = false
  }, [activePlayerIndex, nextTurn, performRollFor, phase, players, startTurnQuiz])

  useEffect(() => {
    if (phase === 'finished') {
      actionLockRef.current = false
      quizResolverRef.current = null
      setTurnQuiz(null)
    }
  }, [phase])

  return (
    <div className="jb3d-shell">
      <JungleBoardScene
        tiles={tiles}
        players={players}
        activePlayerIndex={activePlayerIndex}
        phase={phase}
        diceValue={diceValue}
        diceRolling={diceRolling}
        diceSpinSeed={diceSpinSeed}
      />

      <HUD
        players={players}
        activePlayerIndex={activePlayerIndex}
        phase={phase}
        diceValue={diceValue}
        message={message}
        onRoll={handleRoll}
        canRoll={canRoll}
        onReset={resetBoard}
        onToggleFullscreen={() => {
          void toggleFullscreen()
        }}
        isFullscreen={isFullscreen}
        trapCount={trapCount}
        boostCount={boostCount}
        treasureCount={treasureCount}
        lastEventLabel={lastEventLabel}
        winnerId={winnerId}
      />

      {turnQuiz ? (
        <div className="jb3d-quiz-overlay">
          <div className="jb3d-race-card" role="dialog" aria-modal="true" aria-labelledby="jb3d-race-title">
            <div className="jb3d-race-head">
              <p className="jb3d-quiz-meta">NAVBAT SAVOLI · 10s · {turnQuiz.difficulty.toUpperCase()}</p>
              <h3 id="jb3d-race-title">{players[turnQuiz.currentPlayerIdx].name} uchun savol</h3>
              <span className={`jb3d-race-timer${turnQuiz.timerLeft <= 3 ? ' danger' : ''}`}>{turnQuiz.timerLeft}s</span>
            </div>

            <section className="jb3d-race-team" style={{ borderColor: `${players[turnQuiz.currentPlayerIdx].color}55` }}>
              <div className="jb3d-race-team-head">
                <span className="jb3d-dot" style={{ background: players[turnQuiz.currentPlayerIdx].color, color: players[turnQuiz.currentPlayerIdx].color }} />
                <strong>{players[turnQuiz.currentPlayerIdx].name}</strong>
              </div>

              <p className="jb3d-race-prompt">{turnQuiz.question.prompt}</p>

              <div className="jb3d-race-options">
                {turnQuiz.question.options.map((opt, optIdx) => {
                  const picked = turnQuiz.selected === optIdx
                  const isCorrect = picked && optIdx === turnQuiz.question.correctIndex
                  const isWrong = picked && optIdx !== turnQuiz.question.correctIndex
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      className={`jb3d-race-opt${picked ? ' picked' : ''}${isCorrect ? ' good' : ''}${isWrong ? ' bad' : ''}`}
                      disabled={turnQuiz.locked || phase !== 'quiz'}
                      onClick={() => handleTurnAnswer(optIdx)}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>

              {turnQuiz.locked ? (
                <p className={`jb3d-race-result ${turnQuiz.selected === turnQuiz.question.correctIndex ? 'good' : 'bad'}`}>
                  {turnQuiz.selected === turnQuiz.question.correctIndex ? 'To‘g‘ri ✅' : 'Xato ❌'}
                </p>
              ) : null}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  )
}
