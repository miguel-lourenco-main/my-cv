'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A glowing HUD targeting reticle that replaces the native cursor in the
 * immersive shell. It fits the digital/space theme and — crucially — gives a
 * precise, always-visible aim point for steering toward and clicking the
 * floating windows. Shrinks to a tight reticle while a screen is focused so it
 * doesn't obstruct reading/interaction.
 */
export default function SpaceCursor({ focused }: { focused: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const target = useRef({ x: -100, y: -100 })
  const pos = useRef({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)
  const [down, setDown] = useState(false)

  useEffect(() => {
    let shown = false
    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
      if (!shown) {
        shown = true
        setVisible(true)
      }
    }
    const onLeave = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        shown = false
        setVisible(false)
      }
    }
    const onDown = () => setDown(true)
    const onUp = () => setDown(false)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('pointerleave', onLeave)

    let raf = 0
    const loop = () => {
      const p = pos.current
      const t = target.current
      p.x += (t.x - p.x) * 0.32
      p.y += (t.y - p.y) * 0.32
      if (ref.current) ref.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const scale = (focused ? 0.6 : 1) * (down ? 0.84 : 1)

  return (
    <div
      ref={ref}
      aria-hidden
      className="cv-cursor pointer-events-none fixed left-0 top-0 z-[70]"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="cv-cursor-inner" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <svg className="cv-cursor-ring" width="46" height="46" viewBox="-23 -23 46 46">
          <circle r="18" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 7" opacity="0.65" />
        </svg>
        <svg className="cv-cursor-reticle" width="46" height="46" viewBox="-23 -23 46 46">
          <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <circle r="10.5" opacity="0.95" />
            <line x1="0" y1="-14" x2="0" y2="-18.5" />
            <line x1="0" y1="14" x2="0" y2="18.5" />
            <line x1="-14" y1="0" x2="-18.5" y2="0" />
            <line x1="14" y1="0" x2="18.5" y2="0" />
          </g>
          <circle r="1.7" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}
