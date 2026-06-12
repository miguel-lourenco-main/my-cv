'use client'

import { useLayoutEffect, useRef, type DependencyList, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Run GSAP animations scoped to a ref with automatic, React-safe cleanup.
 *
 * The `setup` callback receives the live `gsap.Context` (`self`) and the scope
 * element. All tweens/ScrollTriggers created inside are reverted on unmount or
 * when `deps` change — the canonical pattern for GSAP in React/StrictMode.
 *
 * ScrollTriggers created here inherit the scroller configured by
 * `SmoothScrollProvider` via `ScrollTrigger.defaults`.
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  setup: (self: gsap.Context, scope: T) => void,
  deps: DependencyList = []
): RefObject<T> {
  const scopeRef = useRef<T>(null)

  useLayoutEffect(() => {
    const scope = scopeRef.current
    if (!scope) return

    const ctx = gsap.context((self) => setup(self, scope), scope)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scopeRef
}

export { gsap, ScrollTrigger }
