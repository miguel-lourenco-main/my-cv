/**
 * Sizing for the DOM-in-3D screens.
 *
 * drei `<Html transform>` maps DOM pixels to world units as
 * `worldSize = pixels * (distanceFactor / 400)` (see drei/web/Html.js). Solving
 * for a fixed pixels-per-unit makes `distanceFactor` constant regardless of
 * panel size: `distanceFactor = 400 / PIXELS_PER_UNIT`. We then render each
 * section at `worldSize * PIXELS_PER_UNIT` CSS pixels so it stays crisp and
 * never reflows as the camera moves.
 */
import { CAMERA_FOV, FOCUS_VIEW_DISTANCE } from '../camera/look-state'

export const PIXELS_PER_UNIT = 440

export const SCREEN_DISTANCE_FACTOR = 400 / PIXELS_PER_UNIT // ≈ 0.909

/** World dimensions of a screen panel (and its bezel). */
export const PANEL_WORLD = { w: 2.74, h: 1.82 }

/** CSS pixel size the section renders at, derived from the world size. */
export const PANEL_PX = {
  w: Math.round(PANEL_WORLD.w * PIXELS_PER_UNIT),
  h: Math.round(PANEL_WORLD.h * PIXELS_PER_UNIT),
}

/** Focused screens keep their group scale — dolly + dimension growth enlarge them. */
export const FOCUS_SCALE = 1.0

/** Slight overscan so the focused page fully bleeds past the viewport edges. */
const FOCUS_COVER_MARGIN = 1.04

/**
 * CSS pixel size that makes a focused panel cover the whole viewport at
 * FOCUS_VIEW_DISTANCE. Matches the viewport aspect so the page reflows to fill
 * (rather than stretch), then reverts to PANEL_PX on leaving focus.
 */
export function focusCoverPx(vw: number, vh: number): { w: number; h: number } {
  const worldH =
    2 * FOCUS_VIEW_DISTANCE * Math.tan(((CAMERA_FOV * Math.PI) / 180) / 2) * FOCUS_COVER_MARGIN
  const worldW = worldH * (vw / Math.max(1, vh))
  return {
    w: Math.round(worldW * PIXELS_PER_UNIT),
    h: Math.round(worldH * PIXELS_PER_UNIT),
  }
}
