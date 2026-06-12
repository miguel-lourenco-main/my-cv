'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDeviceDetectionContext } from './device-detection-context'
import { useReducedMotion } from './use-reduced-motion'

export type RenderTier = 'full' | 'lite' | 'off'

export interface RenderTierInfo {
  /** `full` desktop, `lite` constrained, `off` no WebGL at all. */
  tier: RenderTier
  /** Whether a WebGL `<Canvas>` should be mounted. */
  webgl: boolean
  /** Upper bound for device pixel ratio passed to the renderer. */
  maxDpr: number
  /** User prefers reduced motion. */
  reducedMotion: boolean
}

/**
 * Single shared decision for how heavy the experience should be, composed from
 * the existing device-detection context, reduced-motion preference, and coarse
 * hardware hints. Drives whether WebGL mounts and at what DPR, and lets GSAP
 * choreography downgrade to simple fades on `off`.
 */
export function useRenderTier(): RenderTierInfo {
  const { mobile } = useDeviceDetectionContext()
  const reducedMotion = useReducedMotion()
  const [cores, setCores] = useState<number | null>(null)
  const [memory, setMemory] = useState<number | null>(null)

  useEffect(() => {
    if (typeof navigator === 'undefined') return
    setCores(typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null)
    const mem = (navigator as { deviceMemory?: number }).deviceMemory
    setMemory(typeof mem === 'number' ? mem : null)
  }, [])

  return useMemo<RenderTierInfo>(() => {
    const smallTouch = mobile.hasTouch && (mobile.screenSize?.width || 0) < 768

    if (reducedMotion || mobile.isPhone || smallTouch) {
      return { tier: 'off', webgl: false, maxDpr: 1, reducedMotion }
    }

    const lowPower =
      (cores != null && cores <= 4) || (memory != null && memory <= 4) || mobile.isTablet

    if (lowPower) {
      return { tier: 'lite', webgl: true, maxDpr: 1.5, reducedMotion }
    }

    return { tier: 'full', webgl: true, maxDpr: 2, reducedMotion }
  }, [
    reducedMotion,
    mobile.isPhone,
    mobile.isTablet,
    mobile.hasTouch,
    mobile.screenSize?.width,
    cores,
    memory,
  ])
}
