import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import Setup from './pages/Setup'
import GameBoard from './pages/GameBoard'
import { createInitialGame } from './logic/gameEngine'
import { clearSavedGame, loadHighScore, loadSavedGame, saveGame } from './logic/storage'
import type { GameSettings, QuizGameState } from './logic/types'

type Props = {
  onBack?: () => void
}

export default function ClassroomTeamQuizApp({ onBack }: Props) {
  const [state, setState] = useState<QuizGameState | null>(() => {
    const saved = loadSavedGame()
    if (!saved) return null
    return {
      ...saved,
      highScore: loadHighScore(),
    }
  })

  useEffect(() => {
    if (!state) return
    saveGame(state)
  }, [state])

  const startGame = (settings: GameSettings) => {
    const initial = createInitialGame(settings)
    initial.highScore = loadHighScore()
    setState(initial)
  }

  const resetGame = () => {
    clearSavedGame()
    setState(null)
  }

  const setGameState: Dispatch<SetStateAction<QuizGameState>> = (updater) => {
    setState((prev) => {
      if (!prev) return prev
      if (typeof updater === 'function') {
        return (updater as (prevState: QuizGameState) => QuizGameState)(prev)
      }
      return updater
    })
  }

  if (!state) {
    return <Setup onStart={startGame} />
  }

  return <GameBoard state={state} setState={setGameState} onReset={resetGame} onBack={onBack} />
}
