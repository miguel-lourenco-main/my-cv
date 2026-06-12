'use client'

import dynamic from 'next/dynamic'
import type { MutableRefObject } from 'react'
import { useRenderTier } from '../../lib/use-render-tier'

const GradientCanvas = dynamic(() => import('./GradientCanvas'), { ssr: false })

/**
 * Fixed full-page Organic backdrop. WebGL flowing gradient on capable devices;
 * an animated CSS gradient on phones / reduced-motion.
 */
export default function OrganicBackground({ revealRef }: { revealRef?: MutableRefObject<number> }) {
  const { webgl, maxDpr } = useRenderTier()

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      {webgl ? (
        <GradientCanvas maxDpr={maxDpr} revealRef={revealRef} />
      ) : (
        <div className="org-gradient-fallback absolute inset-0" />
      )}
      {/* subtle grain/darkening to seat glass UI */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(11,6,19,0.55))]" />
    </div>
  )
}
