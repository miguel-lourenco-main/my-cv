'use client'

import dynamic from 'next/dynamic'
import type { MutableRefObject } from 'react'
import { useRenderTier } from '../../lib/use-render-tier'

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false })

/**
 * Tier-gated hero background. On capable devices it mounts the WebGL blueprint
 * grid; on phones / reduced-motion it falls back to a static CSS grid + radial
 * glow so the hero still reads without a canvas.
 */
export default function SystemeBackdrop({
  revealRef,
  scrollRef,
}: {
  revealRef?: MutableRefObject<number>
  scrollRef?: MutableRefObject<number>
}) {
  const { webgl, maxDpr } = useRenderTier()

  if (!webgl) {
    return (
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="sys-grid-bg absolute inset-0 opacity-40" />
        <div
          className="absolute left-1/2 top-1/3 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(92,242,196,0.12), transparent 70%)' }}
        />
      </div>
    )
  }

  return (
    <div className="absolute inset-0" aria-hidden>
      <HeroCanvas maxDpr={maxDpr} revealRef={revealRef} scrollRef={scrollRef} />
    </div>
  )
}
