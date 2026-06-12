'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../../lib/use-reduced-motion'

const LINES = [
  '$ ./boot --portfolio',
  'mounting modules ......... ok',
  'frontend backend devops .. ok',
  'testing automation ai .... ok',
  'rendering miguel_lourenço ',
]

// Module-level flag: persists across React remounts (e.g. locale switches) within
// the same JS session. Ensures the boot animation only plays once per page load.
let preloaderShown = false

export const wasPreloaderShown = () => preloaderShown

/** Terminal boot preloader: types lines on a black console, then wipes away. */
export default function BrutalistPreloader({ onDone }: { onDone: () => void }) {
  const reducedMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  // Skip preloader immediately if already shown (locale switch) or reduced motion.
  const [gone, setGone] = useState(preloaderShown)
  const done = useRef(preloaderShown)

  const finish = useCallback(() => {
    if (done.current) return
    done.current = true
    preloaderShown = true
    onDone()
    setGone(true)
  }, [onDone])

  useEffect(() => {
    if (preloaderShown || reducedMotion) {
      finish()
      return
    }
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish })
      tl.to('[data-line]', { opacity: 1, duration: 0.12, ease: 'steps(1)', stagger: 0.28 })
        .to('[data-cursor]', { opacity: 0, duration: 0.1, repeat: 3, yoyo: true }, '>')
        .to(root, { yPercent: -100, duration: 0.5, ease: 'steps(6)' }, '+=0.1')
    }, root)
    return () => ctx.revert()
  }, [reducedMotion, finish])

  if (gone) return null

  return (
    <div ref={rootRef} className="fixed inset-0 z-[60] flex flex-col justify-center bg-[#0d0d0d] px-6 font-mono text-[var(--br-paper)]">
      <div className="mx-auto w-full max-w-2xl">
        {LINES.map((l, i) => (
          <div key={i} data-line className="text-sm opacity-0 sm:text-base">
            {l.startsWith('$') ? <span className="text-[var(--br-accent)]">{l}</span> : l}
            {i === LINES.length - 1 && <span data-cursor className="text-[var(--br-accent)]">_</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
