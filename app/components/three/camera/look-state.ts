import { HOME_YAW } from './layout'

/**
 * Mutable, render-free state for the gyroscopic look-around. Lives in a ref and
 * is mutated by pointer handlers + read in `useFrame`, so dragging never causes
 * React re-renders.
 */
export interface LookState {
  /** Where the view is easing toward. */
  targetYaw: number
  targetPitch: number
  /** The current eased values (what the camera actually shows). */
  yaw: number
  pitch: number
  /** True while a pointer drag is in progress. */
  dragging: boolean
  /** True once the current/last drag moved beyond the click threshold. */
  dragMoved: boolean
  /** performance.now() of the last user interaction — gates idle drift. */
  lastInteractionMs: number
  /** When false, drag input is ignored (e.g. while a screen is focused). */
  enabled: boolean
  /** Forward dolly distance toward the focused screen (0 = ambient). */
  dolly: number
}

export function createLookState(): LookState {
  return {
    targetYaw: HOME_YAW,
    targetPitch: 0,
    yaw: HOME_YAW,
    pitch: 0,
    dragging: false,
    dragMoved: false,
    lastInteractionMs: 0,
    enabled: true,
    dolly: 0,
  }
}

/** How far the camera eases forward toward a focused screen (world units). */
export const FOCUS_DOLLY = 1.25

/** Vertical look limits — never flip over the poles. */
export const PITCH_LIMIT = 0.62
/** Radians of view rotation per pixel of drag. */
export const LOOK_SENSITIVITY = 0.0042
