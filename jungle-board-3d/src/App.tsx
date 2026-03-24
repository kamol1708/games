import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import JungleBoardScene from './components/JungleBoardScene'
import { PLAYER_COLORS, PLAYER_NAMES } from './game/constants'
import { createTiles, resolveTileEvent, TILE_COUNT } from './game/board'
import { generateQuizQuestion } from './game/questions'
import type { GamePhase, PendingQuiz, PlayerDef, TileDef } from './game/types'
import QuizModal from './ui/QuizModal'
import HUD from './ui/HUD'
import { clamp, randInt, sleep } from './utils/math'

function createPlayers(count: number): PlayerDef[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: PLAYER_NAMES[i],
    color: PLAYER_COLORS[i],
    tileIndex: 0,
    score: 0,
  }))
}

export default function App() {
  const tilesRef = useRef<TileDef[]>(createTiles())
  const [playerCount, setPlayerCount] = useState(4)
  const [players, setPlayers] = useState<PlayerDef[]>(() => createPlayers(4))
  const [activePlayerIndex, setActivePlayerIndex] = useState(0)
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [diceValue, setDiceValue] = useState<number | null>(null)
  const [diceRolling, setDiceRolling] = useState(false)
  const [diceSpinSeed, setDiceSpinSeed] = useState(0)
  const [message, setMessage] = useState('Roll the dice to begin your jungle adventure.')
  const [pendingQuiz, setPendingQuiz] = useState<PendingQuiz | null>(null)
  const quizResolvedRef = useRef(false)

  const tiles = tilesRef.current
  const canRoll = phase === 'idle'

  const activePlayer = players[activePlayerIndex]
  const turnOrderLabel = useMemo(() => players.map((p, i) => `${i === activePlayerIndex ? '▶' : '•'} ${p.name}`).join('  '), [players, activePlayerIndex])

  useEffect(() => {
    if (!pendingQuiz) return
    const id = window.setInterval(() => {
      setPendingQuiz((prev) => (prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : prev))
    }, 1000)
    return () => window.clearInterval(id)
  }, [pendingQuiz])

  useEffect(() => {
    if (!pendingQuiz || pendingQuiz.timeLeft > 0 || quizResolvedRef.current) return
    quizResolvedRef.current = true
    resolveQuiz(false)
  }, [pendingQuiz])

  const bumpPlayerScore = useCallback((playerIdx: number, delta: number) => {
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === playerIdx ? { ...p, score: Math.max(0, p.score + delta) } : p)),
    )
  }, [])

  const setPlayerTile = useCallback((playerIdx: number, tileIndex: number) => {
    setPlayers((prev) => prev.map((p, idx) => (idx === playerIdx ? { ...p, tileIndex } : p)))
  }, [])

  const nextTurn = useCallback(() => {
    setActivePlayerIndex((prev) => (prev + 1) % players.length)
    setPhase('idle')
    setMessage(`Next turn. ${turnOrderLabel}`)
  }, [players.length, turnOrderLabel])

  const handleReset = useCallback((nextCount?: number) => {
    const count = nextCount ?? playerCount
    tilesRef.current = createTiles()
    setPlayers(createPlayers(count))
    setActivePlayerIndex(0)
    setPhase('idle')
    setDiceValue(null)
    setDiceRolling(false)
    setPendingQuiz(null)
    setMessage('New jungle board generated. Roll the dice to begin.')
  }, [playerCount])

  const resolveQuiz = useCallback(
    async (correct: boolean) => {
      const quiz = pendingQuiz
      if (!quiz) return
      setPendingQuiz(null)
      setPhase('resolving')

      if (correct) {
        bumpPlayerScore(activePlayerIndex, 10)
        setMessage(`${players[activePlayerIndex].name} answered correctly! +10 points`)
      } else {
        bumpPlayerScore(activePlayerIndex, -6)
        const current = players[activePlayerIndex].tileIndex
        const backTo = Math.max(0, current - 1)
        setPlayerTile(activePlayerIndex, backTo)
        setMessage(`${players[activePlayerIndex].name} missed the quiz. -6 and move back 1 tile`)
      }

      await sleep(900)

      const finalTile = correct ? quiz.tileIndex : Math.max(0, quiz.tileIndex - 1)
      if (finalTile >= TILE_COUNT - 1) {
        setPhase('finished')
        setMessage(`${players[activePlayerIndex].name} reached the Finish tile and wins the jungle board!`)
        return
      }

      nextTurn()
    },
    [activePlayerIndex, bumpPlayerScore, nextTurn, pendingQuiz, players, setPlayerTile],
  )

  const handleTileEvent = useCallback(
    async (playerIdx: number, tileIndex: number) => {
      const tile = tiles[tileIndex]
      if (!tile) return
      setPhase('resolving')
      const result = resolveTileEvent(tile.eventType, tileIndex, tile.portalTarget)

      if (result.requiresQuiz) {
        quizResolvedRef.current = false
        setPendingQuiz({ tileIndex, question: generateQuizQuestion(), timeLeft: 15 })
        setPhase('quiz')
        setMessage(`${players[playerIdx].name} landed on QUIZ tile. Solve within 15s.`)
        return
      }

      if (result.scoreDelta) {
        bumpPlayerScore(playerIdx, result.scoreDelta)
      }
      setMessage(`${players[playerIdx].name}: ${result.message}${result.scoreDelta > 0 && tile.eventType === 'treasure' ? `${result.scoreDelta}` : ''}`)

      if (typeof result.moveTo === 'number' && result.moveTo !== tileIndex) {
        await sleep(500)
        setPlayerTile(playerIdx, result.moveTo)
        await sleep(650)
      }

      const endTile = typeof result.moveTo === 'number' ? result.moveTo : tileIndex
      if (endTile >= TILE_COUNT - 1) {
        setPhase('finished')
        setMessage(`${players[playerIdx].name} reached the Finish tile and wins the jungle board!`)
        return
      }

      await sleep(800)
      nextTurn()
    },
    [bumpPlayerScore, nextTurn, players, setPlayerTile, tiles],
  )

  const handleRoll = useCallback(async () => {
    if (!canRoll) return
    setPhase('rolling')
    setDiceRolling(true)
    const rolled = randInt(1, 6)
    setDiceSpinSeed((s) => s + 1)
    setMessage(`${activePlayer.name} rolls the jungle dice...`)

    await sleep(1150)

    setDiceRolling(false)
    setDiceValue(rolled)
    setPhase('moving')
    setMessage(`${activePlayer.name} rolled ${rolled}. Moving...`)

    let current = players[activePlayerIndex].tileIndex
    for (let step = 0; step < rolled; step += 1) {
      current = clamp(current + 1, 0, TILE_COUNT - 1)
      setPlayerTile(activePlayerIndex, current)
      await sleep(360)
      if (current >= TILE_COUNT - 1) break
    }

    await handleTileEvent(activePlayerIndex, current)
  }, [activePlayer, activePlayerIndex, canRoll, handleTileEvent, players, setPlayerTile])

  return (
    <div className="app-shell">
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
        playerCount={playerCount}
        onPlayerCountChange={(count) => {
          setPlayerCount(count)
          handleReset(count)
        }}
        onReset={() => handleReset()}
      />

      {pendingQuiz ? (
        <QuizModal
          quiz={pendingQuiz}
          onSubmit={(answer) => {
            if (!pendingQuiz || quizResolvedRef.current) return
            quizResolvedRef.current = true
            const ok = answer.trim().toLowerCase() === pendingQuiz.question.answer.trim().toLowerCase()
            void resolveQuiz(ok)
          }}
          onTimeout={() => {
            if (quizResolvedRef.current) return
            quizResolvedRef.current = true
            void resolveQuiz(false)
          }}
        />
      ) : null}
    </div>
  )
}
