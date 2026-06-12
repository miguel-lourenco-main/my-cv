'use client'

import { Canvas, type CanvasProps } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface SceneCanvasProps extends Omit<CanvasProps, 'children' | 'dpr'> {
  children: ReactNode
  /** Upper bound for device pixel ratio (auto-degraded under load). */
  maxDpr?: number
  className?: string
}

/**
 * Shared `<Canvas>` wrapper with the performance guardrails the immersive scene
 * needs under static export:
 *  - DPR clamped to `[1, maxDpr]`, dropped by `PerformanceMonitor` under load.
 *  - rAF paused when the tab is hidden (offscreen never happens — the canvas is
 *    full-viewport — but visibility still matters).
 *
 * The whole `three/` folder is imported via `dynamic(ssr:false)`, keeping
 * Three.js out of the SSG render pass and out of the 2D fallback bundle.
 */
export default function SceneCanvas({
  children,
  maxDpr = 1.75,
  className,
  ...rest
}: SceneCanvasProps) {
  const [active, setActive] = useState(true)
  const [dpr, setDpr] = useState(maxDpr)
  const dprRef = useRef(maxDpr)

  useEffect(() => {
    dprRef.current = maxDpr
    setDpr(maxDpr)
  }, [maxDpr])

  useEffect(() => {
    const onVisibility = () => setActive(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return (
    <Canvas
      className={className}
      dpr={[1, dpr]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      {...rest}
    >
      <PerformanceMonitor
        onDecline={() => setDpr((current) => Math.max(1, current - 0.25))}
        onIncline={() => setDpr((current) => Math.min(dprRef.current, current + 0.25))}
      >
        <AdaptiveDpr pixelated />
        {children}
      </PerformanceMonitor>
    </Canvas>
  )
}
