'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../lib/use-reduced-motion'

type SmoothScrollContextValue = {
  lenis: Lenis | null
  scroller: HTMLElement | null
  /** Smoothly scroll to an element/selector/offset within the scroller. */
  scrollTo: (target: string | HTMLElement | number, options?: Record<string, unknown>) => void
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scroller: null,
  scrollTo: () => {},
})

export function useSmoothScroll(): SmoothScrollContextValue {
  return useContext(SmoothScrollContext)
}

let pluginRegistered = false

/**
 * One-shot scroll position handoff across page remounts (e.g. locale
 * navigation). Written right before the navigation, consumed on the next
 * provider mount so the user keeps their place instead of snapping to top.
 */
export const SCROLL_RESTORE_KEY = 'sys:scroll-restore'

function consumeSavedScroll(): number | null {
  try {
    const raw = sessionStorage.getItem(SCROLL_RESTORE_KEY)
    if (raw === null) return null
    sessionStorage.removeItem(SCROLL_RESTORE_KEY)
    const top = Number(raw)
    return Number.isFinite(top) && top > 0 ? top : null
  } catch {
    return null
  }
}

/**
 * Wraps the app in a Lenis smooth-scroll instance bound to the custom scroll
 * container (`#page-scroll-container`) and wires GSAP ScrollTrigger to it via a
 * single shared ticker. On reduced-motion, Lenis is skipped (native scroll) but
 * ScrollTrigger is still synced so scroll animations keep working.
 *
 * Because Lenis drives the element's native `scrollTop` (no transform), fixed
 * elements and `position: fixed` navigation continue to behave normally, and
 * ScrollTrigger can use the element directly as its `scroller`.
 */
export function SmoothScrollProvider({
  children,
  scrollerId = 'page-scroll-container',
}: {
  children: ReactNode
  scrollerId?: string
}) {
  const reducedMotion = useReducedMotion()
  const [value, setValue] = useState<SmoothScrollContextValue>({
    lenis: null,
    scroller: null,
    scrollTo: () => {},
  })

  useEffect(() => {
    if (!pluginRegistered) {
      gsap.registerPlugin(ScrollTrigger)
      pluginRegistered = true
    }

    const wrapper = document.getElementById(scrollerId)
    if (!wrapper) return

    const content =
      wrapper.querySelector<HTMLElement>('[data-lenis-content]') ??
      (wrapper.firstElementChild as HTMLElement | null) ??
      undefined

    // Route ScrollTrigger reads/writes through this element.
    ScrollTrigger.defaults({ scroller: wrapper })

    // Reduced motion: native scroll, no Lenis — but keep ScrollTrigger synced.
    if (reducedMotion) {
      const onScroll = () => ScrollTrigger.update()
      wrapper.addEventListener('scroll', onScroll, { passive: true })
      const nativeScrollTo = (target: string | HTMLElement | number) => {
        if (typeof target === 'number') {
          wrapper.scrollTo({ top: target, behavior: 'smooth' })
        } else {
          const el = typeof target === 'string' ? wrapper.querySelector<HTMLElement>(target) : target
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
      setValue({ lenis: null, scroller: wrapper, scrollTo: nativeScrollTo })
      const savedTop = consumeSavedScroll()
      if (savedTop !== null) wrapper.scrollTop = savedTop
      ScrollTrigger.refresh()
      return () => {
        wrapper.removeEventListener('scroll', onScroll)
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    }

    const lenis = new Lenis({
      wrapper,
      content: content ?? wrapper,
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    setValue({
      lenis,
      scroller: wrapper,
      scrollTo: (target, options) => lenis.scrollTo(target as never, options),
    })

    // Recalculate once content/images have settled.
    const savedTop = consumeSavedScroll()
    if (savedTop !== null) lenis.scrollTo(savedTop, { immediate: true, force: true })
    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh()
      if (savedTop !== null) lenis.scrollTo(savedTop, { immediate: true, force: true })
    }, 200)

    return () => {
      window.clearTimeout(refreshTimer)
      lenis.off('scroll', ScrollTrigger.update)
      gsap.ticker.remove(tick)
      lenis.destroy()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [reducedMotion, scrollerId])

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>
}
