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
export const PIXELS_PER_UNIT = 440

export const SCREEN_DISTANCE_FACTOR = 400 / PIXELS_PER_UNIT // ≈ 0.909

/** World dimensions of a screen panel (and its bezel). */
export const PANEL_WORLD = { w: 2.74, h: 1.82 }

/** CSS pixel size the section renders at, derived from the world size. */
export const PANEL_PX = {
  w: Math.round(PANEL_WORLD.w * PIXELS_PER_UNIT),
  h: Math.round(PANEL_WORLD.h * PIXELS_PER_UNIT),
}

/** How much a focused screen scales up. */
export const FOCUS_SCALE = 1.08
