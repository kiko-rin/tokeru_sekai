import { useState, useCallback, useRef, useEffect } from 'react'

const COLLAPSE_TIMEOUT = 8000

export function useTabCollapse() {
  const [expanded, setExpanded] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      setExpanded(false)
    }, COLLAPSE_TIMEOUT)
  }, [])

  const resetTimer = useCallback(() => {
    setExpanded(true)
    startTimer()
  }, [startTimer])

  const onMouseEnter = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }, [])

  const onMouseLeave = useCallback(() => {
    startTimer()
  }, [startTimer])

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [startTimer])

  return { expanded, onMouseEnter, onMouseLeave, resetTimer }
}
