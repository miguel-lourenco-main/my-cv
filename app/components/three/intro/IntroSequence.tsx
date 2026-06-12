'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export interface IntroProps {
  onDone: () => void
  brand?: string
  tagline?: string
}

const DEPTH = 1200
const STAR_COUNT = 700
const TOTAL_MS = 4000

/** Warp arrival — a hyperspace star-streak that accelerates, decelerates and
 *  flashes, the brand resolves, then it fades into the space. */
export default function IntroSequence({
  onDone,
  brand = 'Miguel Lourenço',
  tagline = 'full-stack developer',
}: IntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(true)
  const [showBrand, setShowBrand] = useState(false)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    type Star = { x: number; y: number; z: number }
    const rand = () => Math.random()
    const reset = (s: Star) => {
      s.x = (rand() - 0.5) * w * 1.4
      s.y = (rand() - 0.5) * h * 1.4
      s.z = rand() * DEPTH
    }
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => {
      const s = { x: 0, y: 0, z: 0 }
      reset(s)
      return s
    })

    const ease = (t: number) => t * t * (3 - 2 * t)
    let start: number | null = null
    let raf = 0

    const frame = (now: number) => {
      if (start === null) start = now
      const t = (now - start) / 1000 // seconds
      const focal = w * 0.55
      const cx = w / 2
      const cy = h / 2

      // Speed envelope: accelerate → peak → decelerate.
      let speed: number
      const MAX = 1700
      if (t < 1.5) speed = ease(Math.min(1, t / 1.5)) * MAX
      else if (t < 2.4) speed = MAX
      else speed = MAX * (1 - ease(Math.min(1, (t - 2.4) / 1.0)))

      // Trail fade.
      ctx.fillStyle = 'rgba(4,6,10,0.32)'
      ctx.fillRect(0, 0, w, h)

      const dt = 1 / 60
      for (const s of stars) {
        const sx0 = cx + (s.x / s.z) * focal
        const sy0 = cy + (s.y / s.z) * focal
        s.z -= speed * dt
        let skip = false
        if (s.z < 1) {
          reset(s)
          skip = true
        }
        const sx1 = cx + (s.x / s.z) * focal
        const sy1 = cy + (s.y / s.z) * focal
        if (skip) continue
        const depthT = 1 - s.z / DEPTH
        const lw = 0.4 + depthT * 2.4
        const a = 0.25 + depthT * 0.75
        ctx.strokeStyle = `rgba(${180 + depthT * 60}, ${210 + depthT * 45}, 255, ${a})`
        ctx.lineWidth = lw
        ctx.beginPath()
        ctx.moveTo(sx0, sy0)
        ctx.lineTo(sx1, sy1)
        ctx.stroke()
      }

      if (t < TOTAL_MS / 1000) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const tFlash = window.setTimeout(() => setFlash(true), 2350)
    const tFlashOff = window.setTimeout(() => setFlash(false), 2750)
    const tBrand = window.setTimeout(() => setShowBrand(true), 2550)
    const tEnd = window.setTimeout(() => setVisible(false), TOTAL_MS)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(tFlash)
      window.clearTimeout(tFlashOff)
      window.clearTimeout(tBrand)
      window.clearTimeout(tEnd)
    }
  }, [])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[80] overflow-hidden bg-[#04060a]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 size-full" />

          <AnimatePresence>
            {flash && (
              <motion.div
                key="flash"
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            )}
          </AnimatePresence>

          {showBrand && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center text-center text-white"
              initial={{ opacity: 0, scale: 1.12 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1
                className="font-brand text-5xl font-bold tracking-wide sm:text-7xl"
                style={{ textShadow: '0 0 24px rgba(138,240,255,0.5)' }}
              >
                {brand}
              </h1>
              <div className="font-brand mt-3 text-sm uppercase tracking-[0.4em] text-white/55">
                {tagline}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
