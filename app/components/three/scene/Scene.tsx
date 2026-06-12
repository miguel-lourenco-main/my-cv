'use client'

import { useEffect, useRef } from 'react'
import CameraRig from '../camera/CameraRig'
import { LookControlsContext } from '../camera/LookControlsContext'
import { createLookState, FOCUS_VIEW_DISTANCE, type LookState } from '../camera/look-state'
import { SCREEN_LAYOUT, SCREEN_RADIUS } from '../camera/layout'
import { FocusContext, type FocusValue } from '../screens/FocusContext'
import ScreensGroup from '../screens/ScreensGroup'
import SpaceEnvironment from '../space/SpaceEnvironment'
import PostFX from '../fx/PostFX'
import type { BridgedContexts } from '../ScreenContextBridge'

const TWO_PI = Math.PI * 2

/**
 * Root of the 3D scene graph. Owns the look-around state; the focus state is
 * lifted to {@link Shell3D} (so the DOM HUD can read it) and passed in here.
 *
 * On focus, the camera eases to center the chosen screen (taking the shortest
 * way around) and dollies in; drag input freezes so the user can interact with
 * the section. On clear, the dolly retracts and look-around resumes.
 */
export default function Scene({
  focus,
  bridged,
  greeting,
  revealed = true,
}: {
  focus: FocusValue
  bridged: BridgedContexts
  greeting: string
  /** True once the intro finishes — gates the camera fly-in. */
  revealed?: boolean
}) {
  const lookRef = useRef<LookState>(createLookState())
  const focusedId = focus.focusedId

  useEffect(() => {
    const state = lookRef.current
    if (focusedId) {
      const slot = SCREEN_LAYOUT.find((s) => s.id === focusedId)
      if (slot) {
        // Rig yaw is the negative of a screen's yaw (looking right reveals the
        // +yaw screens), so aim at -slot.yaw — and take the short way around.
        const aimYaw = -slot.yaw
        const k = Math.round((state.yaw - aimYaw) / TWO_PI)
        state.targetYaw = aimYaw + k * TWO_PI
        state.targetPitch = slot.pitch
      }
      // Dolly in so the panel fills ~90% of the view.
      state.dolly = SCREEN_RADIUS - FOCUS_VIEW_DISTANCE
      state.enabled = false
    } else {
      state.dolly = 0
      state.enabled = true
    }
  }, [focusedId])

  // Escape returns to the ambient view.
  useEffect(() => {
    if (!focusedId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') focus.clear()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusedId, focus])

  return (
    <LookControlsContext.Provider value={lookRef}>
      <FocusContext.Provider value={focus}>
        <CameraRig lookRef={lookRef} revealed={revealed} />

        <ambientLight intensity={0.45} />
        <pointLight position={[0, 2.5, 2.5]} intensity={30} />
        <pointLight position={[0, 1, -6]} intensity={20} color="#88aaff" />

        <ScreensGroup bridged={bridged} greeting={greeting} />
        <SpaceEnvironment />
        <PostFX />
      </FocusContext.Provider>
    </LookControlsContext.Provider>
  )
}
