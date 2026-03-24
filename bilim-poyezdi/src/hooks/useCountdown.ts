import { useEffect, useRef, useState } from 'react'

type Params = {
  durationSec: number
  active: boolean
  resetKey: string | number
  onExpire?: () => void
}

export function useCountdown({ durationSec, active, resetKey, onExpire }: Params) {
  const [secondsLeft, setSecondsLeft] = useState(durationSec)
  const expiredRef = useRef(false)

  useEffect(() => {
    setSecondsLeft(durationSec)
    expiredRef.current = false
  }, [durationSec, resetKey])

  useEffect(() => {
    if (!active) return
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      const remaining = Math.max(0, durationSec - elapsed)
      setSecondsLeft(remaining)
      if (remaining === 0 && !expiredRef.current) {
        expiredRef.current = true
        window.clearInterval(timer)
        onExpire?.()
      }
    }, 250)

    return () => window.clearInterval(timer)
  }, [active, durationSec, onExpire, resetKey])

  return secondsLeft
}

