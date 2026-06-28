import { useRef, useState, useCallback } from 'react'
import type { RPARow } from '../types/rpa.types'

export const usePausePlay = (onFlush: (batch: RPARow[]) => void) => {
  const [isPaused, setIsPaused] = useState(false)
  const isPausedRef = useRef(false)
  const queueRef = useRef<RPARow[]>([])

  const checkPaused = useCallback(() => isPausedRef.current, [])

  const enqueue = useCallback((batch: RPARow[]) => {
    queueRef.current.push(...batch)
  }, [])

  const pause = useCallback(() => {
    isPausedRef.current = true
    setIsPaused(true)
  }, [])

  const play = useCallback(() => {
    isPausedRef.current = false
    setIsPaused(false)
    // Flush entire queue at once — no dropped records
    if (queueRef.current.length > 0) {
      const flushed = [...queueRef.current]
      queueRef.current = []
      onFlush(flushed)
    }
  }, [onFlush])

  return { isPaused, checkPaused, enqueue, pause, play }
}
