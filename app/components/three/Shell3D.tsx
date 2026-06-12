'use client'

import { useCallback, useMemo, useState } from 'react'
import SceneCanvas from './SceneCanvas'
import Scene from './scene/Scene'
import AmbientHud from './hud/AmbientHud'
import { useI18n } from '../../lib/i18n'
import { useProjectImagesManifest } from '../../lib/project-images-context'
import { useDeviceDetectionContext } from '../../lib/device-detection-context'
import type { BridgedContexts } from './ScreenContextBridge'
import type { FocusValue } from './screens/FocusContext'
import type { ScreenId } from './camera/layout'

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

  const [focusedId, setFocusedId] = useState<ScreenId | null>(null)
  const clear = useCallback(() => setFocusedId(null), [])
  const focus = useMemo<FocusValue>(
    () => ({ focusedId, focus: setFocusedId, clear }),
    [focusedId, clear]
  )

  return (
    <div className="fixed inset-0 z-0 h-screen w-screen touch-none select-none bg-[#05060a]">
      {/* Keep the greeting in the a11y/SEO tree even in the WebGL shell. */}
      <h1 className="sr-only">{greeting}</h1>
      <SceneCanvas>
        <Scene focus={focus} bridged={bridged} greeting={greeting} />
      </SceneCanvas>
      <AmbientHud focusedId={focusedId} onBack={clear} />
    </div>
  )
}
