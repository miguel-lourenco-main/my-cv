'use client'

import { createContext, useContext, type MutableRefObject } from 'react'
import type { LookState } from './look-state'

/**
 * Shares the live {@link LookState} ref between the camera rig (which writes the
 * eased values) and the screens (which read `dragging` to drop pointer-events
 * so a look-drag started over a screen still rotates the view).
 */
export const LookControlsContext = createContext<MutableRefObject<LookState> | null>(null)

export function useLookControls(): MutableRefObject<LookState> {
  const ref = useContext(LookControlsContext)
  if (!ref) throw new Error('useLookControls must be used within LookControlsContext')
  return ref
}
