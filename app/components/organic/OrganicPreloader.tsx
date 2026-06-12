'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../../lib/use-reduced-motion'

/**
 * Organic preloader: a soft gradient bloom with the name fading up, then a
 * gentle wipe to reveal the hero. Bypassed on reduced-motion.
 */
export default function OrganicPreloader({ onDone }: { onDone: () => void }) {
  const reducedMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)
  const done = useRef(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    onDone()
    setGone(true)
  }

  useEffect(() => {
    if (reducedMotion) {
      finish()
      return
    }
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish })
      tl.to('[data-bloom]', { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
        .from('[data-name]', { opacity: 0, y: 24, filter: 'blur(14px)', duration: 1.1, ease: 'power3.out' }, 0.25)
        .to('[data-name]', { opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=0.5')
        .to(root, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, '-=0.2')
    }, root)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion])

  if (gone) return null

  return (
    <div ref={rootRef} className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-[#0b0613]">
      <div
        data-bloom
        className="absolute h-[80vh] w-[80vh] scale-50 rounded-full opacity-0 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(120,60,180,0.6), rgba(30,80,120,0.35) 45%, transparent 70%)' }}
      />
      <h1 data-name className="org-display relative text-4xl font-semibold text-white sm:text-6xl">
        Miguel Lourenço
      </h1>
    </div>
  )
}
