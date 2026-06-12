'use client'

import type { MutableRefObject } from 'react'
import SceneCanvas from '../webgl/SceneCanvas'
import GradientScene from '../webgl/GradientScene'

/** Code-split WebGL entry (dynamic ssr:false) for the Organic gradient. */
export default function GradientCanvas({
  maxDpr = 2,
  revealRef,
}: {
  maxDpr?: number
  revealRef?: MutableRefObject<number>
}) {
  return (
    <SceneCanvas
      maxDpr={maxDpr}
      className="absolute inset-0 h-full w-full"
      orthographic
      camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
    >
      <GradientScene revealRef={revealRef} />
    </SceneCanvas>
  )
}
