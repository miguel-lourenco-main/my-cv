'use client'

import { Canvas, type CanvasProps } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface SceneCanvasProps extends Omit<CanvasProps, 'children' | 'dpr'> {
  children: ReactNode
  /** Upper bound for device pixel ratio (from `useRenderTier().maxDpr`). */
  maxDpr?: number
  className?: string
}

/**
 * Shared `<Canvas>` wrapper with the performance guardrails every WebGL scene
 * needs under static export:
 *  - DPR clamped to `[1, maxDpr]` and auto-degraded under load.
 *  - rAF paused when the canvas scrolls offscreen or the tab is hidden.
 *  - `alpha` enabled so scenes composite over the page background.
 *
 * The whole `webgl/` folder is meant to be imported via
 * `dynamic(() => import(...), { ssr: false })`, keeping Three.js out of the
 * SSG render pass and out of the main bundle.
 */
export default function SceneCanvas({
  children,
  maxDpr = 2,
  className,
  ...rest
}: SceneCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(true)
  const [dpr, setDpr] = useState(maxDpr)

  useEffect(() => setDpr(maxDpr), [maxDpr])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    let onScreen = true
    const sync = () => setActive(onScreen && !document.hidden)

    let io: IntersectionObserver | undefined
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting
          sync()
        },
        { rootMargin: '120px' }
      )
      io.observe(el)
    }

    const onVisibility = () => sync()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      io?.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div ref={wrapperRef} className={className}>
      <Canvas
        dpr={[1, dpr]}
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        {...rest}
      >
        <PerformanceMonitor
          onDecline={() => setDpr((current) => Math.max(1, current - 0.5))}
        >
          <AdaptiveDpr pixelated />
          {children}
        </PerformanceMonitor>
      </Canvas>
    </div>
  )
}
