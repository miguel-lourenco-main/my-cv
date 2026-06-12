'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export interface IntroProps {
  onDone: () => void
  brand?: string
  tagline?: string
}

/**
 * Initial branded loading/intro sequence, shown over the scene on first arrival
 * and removed (revealing the 3D space) once it finishes — `onDone` fires after
 * the exit animation completes.
 *
 * This is the BASE / "minimal brand reveal" variant. Each intro-variant worktree
 * replaces this file with its own concept (visor boot, terminal, warp).
 */
export default function IntroSequence({
  onDone,
  brand = 'Miguel Lourenço',
  tagline = 'Full-stack Developer',
}: IntroProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), 2600)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-[#04060a] text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.85, ease: 'easeInOut' }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,.5) 0.6px, transparent 0.6px)',
              backgroundSize: '42px 42px',
            }}
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, #1b2a66, transparent 70%)' }}
          />

          <motion.div
            className="relative flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="font-brand text-base tracking-[0.5em] text-[#8af0ff]">✦</div>
            <h1 className="font-brand mt-4 text-5xl font-bold tracking-wide sm:text-6xl">{brand}</h1>
            <div className="font-brand mt-4 text-sm uppercase tracking-[0.38em] text-white/45">
              {tagline}
            </div>
            <div className="mt-12 flex items-center gap-3 text-white/45">
              <span className="size-4 animate-spin rounded-full border border-white/20 border-t-[#8af0ff]" />
              <span className="font-mono text-[11px] tracking-[0.3em]">LOADING</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
