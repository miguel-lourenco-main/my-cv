'use client'

import { useEffect, useState } from 'react'

/**
 * Tracks the user's `prefers-reduced-motion` setting and reacts to changes.
 * Centralizes the inline `matchMedia` checks scattered across the app.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)

    const handler = (event: MediaQueryListEvent) => setReduced(event.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])

  return reduced
}
