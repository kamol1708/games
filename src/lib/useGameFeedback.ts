import { useEffect, useState } from 'react'
import {
  getGameFeedbackByKey,
  getGameFeedbackStore,
  subscribeGameFeedback,
  syncGameFeedbackFromBackend,
  type GameFeedbackGameKey,
  type GameFeedbackThread,
} from './gameFeedback'

export function useGameFeedback(gameKey?: GameFeedbackGameKey) {
  const read = () => (gameKey ? getGameFeedbackByKey(gameKey) : getGameFeedbackStore())
  const [items, setItems] = useState<GameFeedbackThread[]>(read)

  useEffect(() => {
    setItems(read())

    const syncLocal = () => setItems(read())
    const unsubscribe = subscribeGameFeedback(syncLocal)

    void syncGameFeedbackFromBackend().then(syncLocal).catch(() => {
      syncLocal()
    })

    return unsubscribe
  }, [gameKey])

  return items
}
