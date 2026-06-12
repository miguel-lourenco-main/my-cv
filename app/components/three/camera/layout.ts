import { Matrix4, Quaternion, Vector3 } from 'three'

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
 * The four section screens form a 2×2 grid centered in front of the viewer:
 * two yaw columns (±COL) × two pitch rows (±ROW), filling left→right, top→bottom
 * (About, Tech / Projects, Contact). Spacing clears the panel's angular size at
 * SCREEN_RADIUS so the cells sit close without overlapping. The back
 * (~yaw ±π) is left clear for the tear in space.
 */
const COL = 0.34 // half the horizontal gap between columns (radians)
const ROW = 0.26 // half the vertical gap between rows (radians)

export const SCREEN_LAYOUT: readonly ScreenSlot[] = [
  { id: 'about', label: 'About', yaw: -COL, pitch: ROW }, // top-left
  { id: 'tech', label: 'Tech Stack', yaw: COL, pitch: ROW }, // top-right
  { id: 'projects', label: 'Projects', yaw: -COL, pitch: -ROW }, // bottom-left
  { id: 'contact', label: 'Contact', yaw: COL, pitch: -ROW }, // bottom-right
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

const WORLD_UP = new Vector3(0, 1, 0)
const _pos = new Vector3()
const _zAxis = new Vector3()
const _xAxis = new Vector3()
const _yAxis = new Vector3()
const _basis = new Matrix4()

/**
 * Orientation that makes a +Z-facing plane at the given slot face the viewer at
 * the origin, kept perfectly upright (world-up basis, no roll). Two consequences:
 *  - correct at any yaw, including past ±90° (fixes "Contact reversed 180°"),
 *  - when the camera dollies in to focus a screen it ends up 100% parallel to it
 *    (same view axis *and* same up), so the page reads as a flat rectangle.
 */
export function slotFacingQuaternion(
  yaw: number,
  pitch: number,
  target = new Quaternion()
): Quaternion {
  sphericalToPosition(yaw, pitch, 1, _pos)
  _zAxis.copy(_pos).multiplyScalar(-1).normalize() // front normal → origin
  _xAxis.crossVectors(WORLD_UP, _zAxis).normalize()
  _yAxis.crossVectors(_zAxis, _xAxis)
  _basis.makeBasis(_xAxis, _yAxis, _zAxis)
  return target.setFromRotationMatrix(_basis)
}

export type LookDirection = 'left' | 'right' | 'up' | 'down'

/**
 * The screen reached by stepping from `currentId` in a grid direction (used by
 * arrow-key navigation while focused). Right/Left move along yaw within the same
 * row; Up/Down move along pitch within the same column. Returns null if there's
 * no screen that way.
 */
export function neighborScreen(currentId: ScreenId, dir: LookDirection): ScreenId | null {
  const cur = SCREEN_LAYOUT.find((s) => s.id === currentId)
  if (!cur) return null
  const ROW_TOL = 0.25
  const COL_TOL = 0.25

  let best: ScreenSlot | null = null
  let bestDelta = Infinity
  for (const s of SCREEN_LAYOUT) {
    if (s.id === currentId) continue
    if (dir === 'left' || dir === 'right') {
      if (Math.abs(s.pitch - cur.pitch) > ROW_TOL) continue
      const d = s.yaw - cur.yaw
      const want = dir === 'right' ? d : -d
      if (want > 0 && want < bestDelta) {
        best = s
        bestDelta = want
      }
    } else {
      if (Math.abs(s.yaw - cur.yaw) > COL_TOL) continue
      const d = s.pitch - cur.pitch
      const want = dir === 'up' ? d : -d
      if (want > 0 && want < bestDelta) {
        best = s
        bestDelta = want
      }
    }
  }
  return best ? best.id : null
}
