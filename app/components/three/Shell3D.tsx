'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import SceneCanvas from './SceneCanvas'
import Scene from './scene/Scene'
import AmbientHud from './hud/AmbientHud'
import SpaceCursor from './hud/SpaceCursor'
import FocusedPage, { type SlideDir } from './hud/FocusedPage'
import IntroSequence from './intro/IntroSequence'
import { useI18n } from '../../lib/i18n'
import { useProjectImagesManifest } from '../../lib/project-images-context'
import { useDeviceDetectionContext } from '../../lib/device-detection-context'
import type { BridgedContexts } from './ScreenContextBridge'
import type { FocusValue } from './screens/FocusContext'
import { neighborScreen, type LookDirection, type ScreenId } from './camera/layout'

const ARROW_DIR: Record<string, LookDirection> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
}

/** Slide vector for a switch in each direction (new page enters from here). */
const DIR_VEC: Record<LookDirection, SlideDir> = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  down: { x: 0, y: 1 },
  up: { x: 0, y: -1 },
}

/** Roughly how long the 3D dolly takes to reach full-screen before the real
 *  2D page crossfades in. */
const ZOOM_HANDOFF_MS = 560

/**
 * The immersive first-person "digital ball" shell: the visitor floats in space
 * surrounded by interactable section screens, drags to look around, and turns
 * 180° to find the dense starfield and the tear in space.
 *
 * This component lives OUTSIDE the R3F `<Canvas>` but UNDER the app providers,
 * so it reads the live i18n / project-images / device contexts here and passes
 * them down as `bridged` — re-provided inside each screen's <Html> portal, which
 * would otherwise lose all React context across the renderer boundary. Focus
 * state is owned here too, so the DOM HUD (outside the canvas) can read it.
 */
export default function Shell3D({ greeting }: { greeting: string }) {
  const i18n = useI18n()
  const manifest = useProjectImagesManifest()
  const device = useDeviceDetectionContext()

  const bridged = useMemo<BridgedContexts>(
    () => ({ i18n, manifest, device }),
    [i18n, manifest, device]
  )

  // Initial branded intro/loading sequence; the scene reveal (camera fly-in)
  // waits until it finishes.
  const [introDone, setIntroDone] = useState(false)
  const handleIntroDone = useCallback(() => setIntroDone(true), [])

  const [focusedId, setFocusedId] = useState<ScreenId | null>(null)
  const clear = useCallback(() => setFocusedId(null), [])
  const focus = useMemo<FocusValue>(
    () => ({ focusedId, focus: setFocusedId, clear }),
    [focusedId, clear]
  )

  // The 2D page that takes over once the 3D window has zoomed to full-screen.
  // It lags the focus by the dolly duration so the zoom plays first, then swaps
  // instantly when arrow-navigating between already-open pages. `slideDir` makes
  // page-to-page switches slide on a shared plane (null = fade for open/close).
  const [pageId, setPageId] = useState<ScreenId | null>(null)
  const [slideDir, setSlideDir] = useState<SlideDir>(null)
  useEffect(() => {
    if (focusedId == null) {
      setSlideDir(null)
      setPageId(null)
      return
    }
    if (pageId != null) {
      // Already open → an arrow switch; slideDir was set by the key handler.
      setPageId(focusedId)
      return
    }
    const t = window.setTimeout(() => {
      setSlideDir(null) // opening: fade in over the 3D zoom
      setPageId(focusedId)
    }, ZOOM_HANDOFF_MS)
    return () => window.clearTimeout(t)
  }, [focusedId, pageId])

  // Once the 2D page has fully covered the screen, hide + freeze the 3D scene
  // behind it: kills the duplicate window DOM bleeding through and stops wasted
  // rendering. Re-shown immediately when closing so the dolly-out animates.
  const [hide3D, setHide3D] = useState(false)
  useEffect(() => {
    if (!pageId) {
      setHide3D(false)
      return
    }
    const t = window.setTimeout(() => setHide3D(true), 360)
    return () => window.clearTimeout(t)
  }, [pageId])

  // While focused, arrow keys jump to the adjacent screen in that direction.
  useEffect(() => {
    if (!focusedId) return
    const onKey = (e: KeyboardEvent) => {
      const dir = ARROW_DIR[e.key]
      if (!dir) return
      const next = neighborScreen(focusedId, dir)
      if (next) {
        e.preventDefault()
        setSlideDir(DIR_VEC[dir])
        setFocusedId(next)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusedId])

  // Debug/QA hooks so the focus flow can be driven headlessly (e.g. Playwright).
  useEffect(() => {
    const w = window as typeof window & {
      __cvFocus?: (id: ScreenId) => void
      __cvClear?: () => void
    }
    w.__cvFocus = (id) => setFocusedId(id)
    w.__cvClear = clear
    return () => {
      delete w.__cvFocus
      delete w.__cvClear
    }
  }, [clear])

  return (
    <div
      className={`cv-shell-3d fixed inset-0 z-0 h-screen w-screen touch-none select-none bg-[#05060a] ${
        pageId ? 'cv-page-open' : ''
      }`}
    >
      {/* Keep the greeting in the a11y/SEO tree even in the WebGL shell. */}
      <h1 className="sr-only">{greeting}</h1>
      <SceneCanvas className={hide3D ? 'cv-3d-hidden' : ''} paused={hide3D}>
        <Scene focus={focus} bridged={bridged} greeting={greeting} revealed={introDone} />
      </SceneCanvas>

      {/* Real 2D page takes over at full-screen; switches slide on a shared plane. */}
      <AnimatePresence custom={slideDir}>
        {pageId && <FocusedPage key={pageId} id={pageId} greeting={greeting} dir={slideDir} />}
      </AnimatePresence>

      <AmbientHud focusedId={focusedId} onBack={clear} />
      {/* The themed reticle is for steering; on the real page use the native
          cursor, and hide it entirely during the intro. */}
      {!pageId && introDone && <SpaceCursor focused={!!focusedId} />}

      {/* Branded loading/intro sequence, revealing the space when it finishes. */}
      {!introDone && <IntroSequence onDone={handleIntroDone} />}
    </div>
  )
}
