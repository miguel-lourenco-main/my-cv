'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export interface IntroProps {
  onDone: () => void
  brand?: string
  tagline?: string
}

const ACCENT = '#8af0ff'
const BOOT_LINES: [string, string][] = [
  ['SYSTEM BOOT', 'v2.0'],
  ['LIFE SUPPORT', 'ONLINE'],
  ['NEURAL LINK', 'SYNCED'],
  ['OPTICS CALIBRATION', 'OK'],
]

/** HUD visor boot-up — POV of a helmet powering on, then the visor irises open. */
export default function IntroSequence({ onDone, brand = 'Miguel Lourenço' }: IntroProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), 3600)
    return () => window.clearTimeout(t)
  }, [])

  const bracket = 'pointer-events-none absolute size-10'
  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div key="intro" className="fixed inset-0 z-[80] overflow-hidden">
          {/* Visor halves — slide apart on exit to reveal the space. */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-[#04060a]"
            exit={{ y: '-101%' }}
            transition={{ duration: 0.95, ease: [0.7, 0, 0.25, 1] }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-[#04060a]"
            exit={{ y: '101%' }}
            transition={{ duration: 0.95, ease: [0.7, 0, 0.25, 1] }}
          />

          {/* HUD glass overlay (fades just before the visor opens). */}
          <motion.div
            className="cv-scanlines absolute inset-0 text-white"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: 'inset 0 0 240px 70px rgba(0,0,0,0.92)' }}
            />
            <span className={`${bracket} left-6 top-6 border-l-2 border-t-2`} style={{ borderColor: ACCENT }} />
            <span className={`${bracket} right-6 top-6 border-r-2 border-t-2`} style={{ borderColor: ACCENT }} />
            <span className={`${bracket} bottom-6 left-6 border-b-2 border-l-2`} style={{ borderColor: ACCENT }} />
            <span className={`${bracket} bottom-6 right-6 border-b-2 border-r-2`} style={{ borderColor: ACCENT }} />
            <div
              className="absolute inset-x-0 top-1/2 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`, boxShadow: `0 0 14px ${ACCENT}` }}
            />

            <div className="absolute left-1/2 top-1/2 w-[min(560px,82vw)] -translate-x-1/2 -translate-y-1/2 font-mono text-sm">
              {BOOT_LINES.map((l, i) => (
                <motion.div
                  key={i}
                  className="flex justify-between border-b border-white/5 py-1.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.3 }}
                >
                  <span style={{ color: ACCENT }}>{'›'} {l[0]}</span>
                  <span className="text-white/45">{l[1]}</span>
                </motion.div>
              ))}

              <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>
                <div className="flex justify-between text-[11px] tracking-[0.2em] text-white/40">
                  <span>OPERATOR</span>
                  <span>ID-0001</span>
                </div>
                <div className="font-brand mt-1 text-3xl font-bold text-white sm:text-4xl">{brand}</div>
              </motion.div>

              <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: ACCENT, boxShadow: `0 0 14px ${ACCENT}` }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.7, ease: 'easeInOut', delay: 0.3 }}
                />
              </div>

              <motion.div
                className="font-brand mt-7 text-center tracking-[0.45em] text-white/85"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ delay: 3.0, duration: 0.7, repeat: Infinity }}
              >
                {'▸'} WAKE {'◂'}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
