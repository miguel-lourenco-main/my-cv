import { HOME_YAW } from './layout'

/**
 * Mutable, render-free state for the look-around. Lives in a ref, mutated by
 * pointer handlers + read in `useFrame`, so steering never causes React
 * re-renders.
 *
 * Steering model: the cursor's offset from the screen centre sets a rotation
 * *velocity* (not a drag delta) — push the cursor right and the view pans right,
 * faster toward the edges, still in the centre dead-zone.
 */
export interface LookState {
  /** Where the view is easing toward (integrated from velocity). */
  targetYaw: number
  targetPitch: number
  /** The current eased values (what the camera actually shows). */
  yaw: number
  pitch: number
  /** Normalized cursor offset from centre, −1..1 (0 = centre). */
  pointerX: number
  pointerY: number
  /** True while the cursor is over the canvas. */
  active: boolean
  /** performance.now() of the last user interaction — gates idle drift. */
  lastInteractionMs: number
  /** When false, steering is ignored (e.g. while a screen is focused). */
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
    pointerX: 0,
    pointerY: 0,
    active: false,
    lastInteractionMs: 0,
    enabled: true,
    dolly: 0,
  }
}

/** Vertical camera field of view (degrees) — shared with the focus-cover math. */
export const CAMERA_FOV = 60
/** Vertical look limits — never flip over the poles. */
export const PITCH_LIMIT = 0.62
/** Peak pan speed (rad/s) when the cursor is at the very edge. */
export const MAX_LOOK_SPEED = 1.35
/** Centre fraction where the view holds still. */
export const LOOK_DEADZONE = 0.1
/** Camera-to-screen distance when focused — tuned so the panel fills ~90% of
 *  the viewport height (smaller = closer/bigger). */
export const FOCUS_VIEW_DISTANCE = 1.8

/**
 * Maps a normalized cursor axis offset (−1..1) to a 0-centred steering factor:
 * zero inside the dead-zone, then an eased (quadratic) ramp to ±1 at the edge.
 */
export function steerAxis(n: number): number {
  const a = Math.abs(n)
  if (a <= LOOK_DEADZONE) return 0
  const t = (a - LOOK_DEADZONE) / (1 - LOOK_DEADZONE)
  return Math.sign(n) * t * t
}
