'use client'

import type { MutableRefObject } from 'react'
import SceneCanvas from '../webgl/SceneCanvas'
import BlueprintGridScene from '../webgl/BlueprintGridScene'

/**
 * Code-split entry for the Systeme hero WebGL — imported via
 * `dynamic(() => import('./HeroCanvas'), { ssr: false })` so Three.js never
 * reaches the SSG pass or the main bundle.
 */
export default function HeroCanvas({
  maxDpr = 2,
  revealRef,
  scrollRef,
}: {
  maxDpr?: number
  revealRef?: MutableRefObject<number>
  scrollRef?: MutableRefObject<number>
}) {
  return (
    <SceneCanvas
      maxDpr={maxDpr}
      className="absolute inset-0 h-full w-full"
      orthographic
      camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
    >
      <BlueprintGridScene revealRef={revealRef} scrollRef={scrollRef} />
    </SceneCanvas>
  )
}
