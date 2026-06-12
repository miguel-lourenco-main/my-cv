'use client'

import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'

/**
 * Post-processing for the immersive shell. Bloom is tuned with a luminance
 * threshold so only the bright, tone-mapping-disabled space content (stars,
 * nebula, the tear, planet halos) glows — the screens are DOM and never reach
 * the WebGL framebuffer, so they stay crisp. A soft vignette focuses the eye.
 *
 * Only mounted on the full-quality tier; `PerformanceMonitor`/`AdaptiveDpr` in
 * SceneCanvas still degrade resolution under load.
 */
export default function PostFX() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.9}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.7}
      />
      <Vignette eskil={false} offset={0.25} darkness={0.72} />
    </EffectComposer>
  )
}
