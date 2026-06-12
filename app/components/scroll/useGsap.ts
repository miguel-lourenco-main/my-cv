'use client'

import { useLayoutEffect, useRef, type DependencyList, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSmoothScroll } from './SmoothScrollProvider'

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
  // Wait for SmoothScrollProvider to publish the scroller: it configures
  // ScrollTrigger.defaults({ scroller }) in a parent effect that runs AFTER
  // child layout effects on first mount. Creating triggers before that point
  // binds them to the window — which never scrolls (the page scrolls inside
  // #page-scroll-container) — so below-the-fold `gsap.from` animations never
  // fire and their targets stay hidden in production builds.
  const { scroller } = useSmoothScroll()

  useLayoutEffect(() => {
    const scope = scopeRef.current
    if (!scope || !scroller) return

    const ctx = gsap.context((self) => setup(self, scope), scope)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroller, ...deps])

  return scopeRef
}

export { gsap, ScrollTrigger }
