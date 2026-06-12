'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDeviceDetectionContext } from '../../../lib/device-detection-context'
import { useReducedMotion } from '../../../lib/use-reduced-motion'
import { hasWebGL } from './hasWebGL'

export type ShellMode = '2d' | '3d'

const OVERRIDE_KEY = 'cv-shell-override'

/**
 * Decides whether to render the immersive 3D shell or the classic 2D site.
 *
 * The immersive experience is desktop-only by design; everyone else (mobile,
 * low-power, reduced-motion, no-WebGL) keeps the polished 2D site. Resolution
 * is intentionally client-only — SSR/first paint always yields `'2d'`, so the
 * static export ships the 2D markup (SEO + no-JS) and the 3D bundle only loads
 * once the gate flips.
 *
 * Enablement:
 *  - `NEXT_PUBLIC_ENABLE_3D === 'true'` turns the feature on for capable devices.
 *  - `?shell=3d` / `?shell=2d` (persisted to localStorage) force a mode for QA;
 *    `3d` still requires actual WebGL support (we can't render without it).
 */
export function useShellMode(): ShellMode {
  const { isLaptop, mobile } = useDeviceDetectionContext()
  const reducedMotion = useReducedMotion()

  const [webglOk, setWebglOk] = useState<boolean | null>(null)
  const [webglBasic, setWebglBasic] = useState(false)
  const [override, setOverride] = useState<ShellMode | null>(null)
  const [cores, setCores] = useState<number | null>(null)
  const [memory, setMemory] = useState<number | null>(null)

  useEffect(() => {
    setWebglOk(hasWebGL())
    setWebglBasic(hasWebGL(true))

    if (typeof navigator !== 'undefined') {
      setCores(typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null)
      const mem = (navigator as { deviceMemory?: number }).deviceMemory
      setMemory(typeof mem === 'number' ? mem : null)
    }

    // URL override wins and is sticky (survives the locale redirect).
    try {
      const param = new URLSearchParams(window.location.search).get('shell')
      if (param === '3d' || param === '2d') {
        window.localStorage.setItem(OVERRIDE_KEY, param)
        setOverride(param)
      } else {
        const stored = window.localStorage.getItem(OVERRIDE_KEY)
        if (stored === '3d' || stored === '2d') setOverride(stored)
      }
    } catch {
      /* ignore storage/URL access errors */
    }
  }, [])

  const flagEnabled = process.env.NEXT_PUBLIC_ENABLE_3D === 'true'

  return useMemo<ShellMode>(() => {
    // Undecided (pre-mount / probing) → safe 2D default.
    if (webglOk === null) return '2d'
    if (override === '2d') return '2d'

    // Forced on for QA — needs only a working context (software GL is fine).
    if (override === '3d') return webglBasic ? '3d' : '2d'

    if (!webglOk) return '2d'
    if (!flagEnabled) return '2d'
    if (reducedMotion) return '2d'
    if (!isLaptop) return '2d'
    if (mobile.isPhone || (mobile.hasTouch && (mobile.screenSize?.width || 0) < 1024)) return '2d'

    const lowPower =
      (cores != null && cores < 4) || (memory != null && memory < 4) || mobile.isTablet
    if (lowPower) return '2d'

    return '3d'
  }, [
    webglOk,
    webglBasic,
    override,
    flagEnabled,
    reducedMotion,
    isLaptop,
    mobile.isPhone,
    mobile.isTablet,
    mobile.hasTouch,
    mobile.screenSize?.width,
    cores,
    memory,
  ])
}
