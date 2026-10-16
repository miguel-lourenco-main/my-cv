'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export interface IntroProps {
  onDone: () => void
  /** Fired when the second warp (out of the name, into the screens) starts:
   *  the scene behind should begin its arrival then. */
  onReveal?: () => void
  brand?: string
  tagline?: string
}

const DEPTH = 1200
const STAR_COUNT = 700
/** The second warp — out of the name and into the screens — starts here. */
const WARP_OUT_MS = 3700
/** Seconds the overlay takes to dissolve into the 3D scene once warp-out starts. */
const WARP_OUT_FADE_S = 1.3
const TOTAL_MS = WARP_OUT_MS + WARP_OUT_FADE_S * 1000

/** Warp arrival — a hyperspace star-streak that accelerates, decelerates and
 *  flashes, and the brand resolves. Then a second warp punches through the
 *  name: the streaks accelerate again while the overlay dissolves, handing
 *  straight over to the 3D camera flying in to the screens (`onReveal`). */
export default function IntroSequence({
  onDone,
  onReveal,
  brand = 'Miguel Lourenço',
  tagline = 'full-stack developer',
}: IntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(true)
  const [showBrand, setShowBrand] = useState(false)
  const [flash, setFlash] = useState(false)
  const [warpOut, setWarpOut] = useState(false)
  const onRevealRef = useRef(onReveal)
  onRevealRef.current = onReveal

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

      // Speed envelope: accelerate → peak → decelerate → (warp-out) accelerate.
      let speed: number
      const MAX = 1700
      const outT = t - WARP_OUT_MS / 1000
      if (t < 1.5) speed = ease(Math.min(1, t / 1.5)) * MAX
      else if (t < 2.4) speed = MAX
      else if (outT < 0) speed = MAX * (1 - ease(Math.min(1, (t - 2.4) / 1.0)))
      else speed = ease(Math.min(1, outT / 0.45)) * MAX * 1.3

      // Trail fade. Erase (rather than paint dark) so the canvas stays
      // transparent and the 3D scene can show through once the backdrop fades.
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.32)'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
      // During warp-out the streaks themselves fade with the overlay.
      const streakAlpha = outT < 0 ? 1 : Math.max(0, 1 - outT / WARP_OUT_FADE_S)

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
        const a = (0.25 + depthT * 0.75) * streakAlpha
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
    const tWarpOut = window.setTimeout(() => {
      setWarpOut(true)
      onRevealRef.current?.()
    }, WARP_OUT_MS)
    const tEnd = window.setTimeout(() => setVisible(false), TOTAL_MS)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(tFlash)
      window.clearTimeout(tFlashOff)
      window.clearTimeout(tBrand)
      window.clearTimeout(tWarpOut)
      window.clearTimeout(tEnd)
    }
  }, [])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="intro"
          className={`fixed inset-0 z-[80] overflow-hidden ${warpOut ? 'pointer-events-none' : ''}`}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Backdrop: dissolves on warp-out to reveal the 3D arrival behind. */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-[#04060a]"
            initial={false}
            animate={{ opacity: warpOut ? 0 : 1 }}
            transition={{ duration: WARP_OUT_FADE_S * 0.8, ease: [0.4, 0, 0.2, 1] }}
          />
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
              // Warp-out flies the camera *through* the name: it rushes toward
              // the viewer, blurring out as the streaks take over.
              animate={
                warpOut
                  ? { opacity: 0, scale: 4, filter: 'blur(10px)' }
                  : { opacity: 1, scale: 1, filter: 'blur(0px)' }
              }
              transition={
                warpOut
                  ? { duration: 0.7, ease: [0.55, 0, 0.75, 0.25] }
                  : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
              }
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
