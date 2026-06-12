import { Euler, Vector3 } from 'three'

export type ScreenId = 'about' | 'tech' | 'projects' | 'contact'

export interface ScreenSlot {
  id: ScreenId
  /** Short label for the bezel / HUD. */
  label: string
  /** Horizontal angle in radians; 0 = dead ahead, +right, -left. */
  yaw: number
  /** Vertical angle in radians; +up, -down. */
  pitch: number
}

/** Distance from the viewer (origin) to each floating screen. */
export const SCREEN_RADIUS = 4.6

/** Yaw the viewer faces at rest (centered on the screens). */
export const HOME_YAW = 0

/** The dense field / planets / tear live behind the viewer. */
export const TEAR_YAW = Math.PI

/**
 * The four section screens, arranged as a gentle arc across the front
 * hemisphere so they all sit comfortably in view at rest, with a slight
 * upward bias on the outer two for a "cockpit" feel.
 */
export const SCREEN_LAYOUT: readonly ScreenSlot[] = [
  { id: 'about', label: 'About', yaw: -0.62, pitch: 0.05 },
  { id: 'tech', label: 'Tech Stack', yaw: -0.21, pitch: -0.02 },
  { id: 'projects', label: 'Projects', yaw: 0.21, pitch: -0.02 },
  { id: 'contact', label: 'Contact', yaw: 0.62, pitch: 0.05 },
] as const

/**
 * World position of a point at the given yaw/pitch on the viewing sphere.
 * Dead-ahead (yaw 0, pitch 0) is -Z, matching the default camera look direction.
 */
export function sphericalToPosition(
  yaw: number,
  pitch: number,
  radius = SCREEN_RADIUS,
  target = new Vector3()
): Vector3 {
  const cosPitch = Math.cos(pitch)
  return target.set(
    radius * Math.sin(yaw) * cosPitch,
    radius * Math.sin(pitch),
    -radius * Math.cos(yaw) * cosPitch
  )
}

/**
 * Rotation that makes a +Z-facing plane at the given slot face the viewer at
 * the origin. Yaw rotates around Y; pitch tilts around X (negated so the screen
 * leans toward the eye).
 */
export function slotFacingRotation(yaw: number, pitch: number, target = new Euler()): Euler {
  return target.set(-pitch, yaw, 0, 'YXZ')
}
