'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import { damp } from 'maath/easing'
import { Maximize2 } from 'lucide-react'
import {
  Vector3,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
} from 'three'
import { slotFacingQuaternion, sphericalToPosition, type ScreenSlot } from '../camera/layout'
import ScreenContextBridge, { type BridgedContexts } from '../ScreenContextBridge'
import { RevealStaticContext } from '../../Reveal'
import ScreenSection from './ScreenSections'
import { useFocus } from './FocusContext'
import { SCREEN_ACCENT } from './screen-theme'
import {
  FOCUS_SCALE,
  PANEL_PX,
  PANEL_WORLD,
  SCREEN_DISTANCE_FACTOR,
  focusCoverPx,
} from './screen-size'

/** Tracks the viewport size so a focused panel can be grown to cover it. */
function useViewportSize() {
  const [vp, setVp] = useState({ w: 1920, h: 1080 })
  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return vp
}

const BEZEL_PAD = 0.14
/** Max see-saw tilt (radians ≈ 7°). */
const MAX_TILT = 0.12
/** How far the panel pushes back into the scene on hover (world units). */
const HOVER_PUSH = 0.06

interface HoverState {
  hovered: boolean
  tiltX: number
  tiltY: number
  targetTiltX: number
  targetTiltY: number
  push: number
}

/**
 * A single floating section screen: a glass bezel (the 3D raycast target for
 * hover + focus) with the real section rendered as DOM mapped onto its face via
 * drei `<Html transform>`.
 *
 * Physics-feel feedback: hovering presses the touched part of the panel back
 * and lifts the opposite edge toward the viewer (a damped see-saw driven by the
 * local pointer position), plus a faint idle bob so the panel always floats.
 * While unfocused the DOM is click-through (look-drag passes through, a tap
 * focuses); while focused it's interactive and scrolls.
 */
export default function ScreenPlane({
  slot,
  bridged,
  greeting,
}: {
  slot: ScreenSlot
  bridged: BridgedContexts
  greeting: string
}) {
  const group = useRef<Group>(null)
  const tilt = useRef<Group>(null)
  const bezel = useRef<Mesh>(null)
  const bezelMat = useRef<MeshStandardMaterial>(null)
  const rimMat = useRef<MeshBasicMaterial>(null)
  const scale = useRef(1)
  const fade = useRef(1)
  const hover = useRef<HoverState>({
    hovered: false,
    tiltX: 0,
    tiltY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    push: 0,
  })
  const localHit = useRef(new Vector3())

  const { focusedId, focus } = useFocus()
  const isFocused = focusedId === slot.id
  // When another screen is focused, fade this one out so the zoom isn't a jumble
  // of overlapping windows.
  const dimmed = focusedId !== null && !isFocused
  const phase = slot.yaw * 3.1 // de-sync the idle bob per screen

  // Grow the focused panel to cover the whole viewport; revert when leaving.
  const vp = useViewportSize()
  const cover = useMemo(() => focusCoverPx(vp.w, vp.h), [vp.w, vp.h])
  const surfacePx = isFocused ? cover : PANEL_PX

  const pos = sphericalToPosition(slot.yaw, slot.pitch)
  const quat = slotFacingQuaternion(slot.yaw, slot.pitch)
  const accent = SCREEN_ACCENT[slot.id] ?? '#5b8bff'

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (!isFocused) focus(slot.id)
  }

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    if (isFocused || !group.current) return
    // Local-space hit point → normalized [-1,1] across the panel.
    const local = group.current.worldToLocal(localHit.current.copy(e.point))
    const nx = Math.max(-1, Math.min(1, local.x / (PANEL_WORLD.w / 2)))
    const ny = Math.max(-1, Math.min(1, local.y / (PANEL_WORLD.h / 2)))
    const h = hover.current
    h.hovered = true
    // Touched edge recedes; opposite edge lifts toward the eye (see-saw).
    h.targetTiltX = -ny * MAX_TILT
    h.targetTiltY = nx * MAX_TILT
  }

  const handleOut = () => {
    const h = hover.current
    h.hovered = false
    h.targetTiltX = 0
    h.targetTiltY = 0
  }

  useFrame((three, delta) => {
    const g = group.current
    const t = tilt.current
    if (!g || !t) return
    const dt = Math.min(delta, 0.05)
    const h = hover.current

    // Focus scale on the outer group.
    damp(scale, 'current', isFocused ? FOCUS_SCALE : 1, 0.18, dt)
    g.scale.setScalar(scale.current)

    // Fade non-focused screens out during a focus so the zoom stays clean.
    damp(fade, 'current', dimmed ? 0 : 1, 0.12, dt)
    if (bezelMat.current) bezelMat.current.opacity = fade.current
    if (rimMat.current) rimMat.current.opacity = fade.current
    g.visible = fade.current > 0.01 || isFocused

    // See-saw tilt (zeroed while focused) on the inner group.
    if (isFocused) {
      h.targetTiltX = 0
      h.targetTiltY = 0
    }
    damp(h, 'tiltX', h.targetTiltX, 0.12, dt)
    damp(h, 'tiltY', h.targetTiltY, 0.12, dt)
    damp(h, 'push', h.hovered && !isFocused ? HOVER_PUSH : 0, 0.16, dt)

    // Idle bob, only when resting (not hovered/focused).
    const resting = !h.hovered && !isFocused
    const time = three.clock.elapsedTime
    const bobY = resting ? Math.sin(time * 0.7 + phase) * 0.02 : 0
    const bobRot = resting ? Math.sin(time * 0.5 + phase) * 0.012 : 0

    t.rotation.set(h.tiltX + bobRot, h.tiltY, 0)
    t.position.set(0, bobY, -h.push)
  })

  return (
    <group ref={group} position={[pos.x, pos.y, pos.z]} quaternion={quat}>
      <group ref={tilt}>
        {/* Glowing accent rim — peeks out behind the dark bezel as a neon frame. */}
        <RoundedBox
          args={[PANEL_WORLD.w + BEZEL_PAD + 0.07, PANEL_WORLD.h + BEZEL_PAD + 0.07, 0.05]}
          radius={0.08}
          smoothness={4}
          position={[0, 0, -0.02]}
        >
          <meshBasicMaterial ref={rimMat} color={accent} toneMapped={false} transparent />
        </RoundedBox>

        {/* Sleek dark bezel — also the raycast target for hover/focus. */}
        <RoundedBox
          ref={bezel}
          args={[PANEL_WORLD.w + BEZEL_PAD, PANEL_WORLD.h + BEZEL_PAD, 0.09]}
          radius={0.07}
          smoothness={4}
          onClick={handleClick}
          onPointerMove={handleMove}
          onPointerOut={handleOut}
        >
          <meshStandardMaterial
            ref={bezelMat}
            color="#05070d"
            emissive={accent}
            emissiveIntensity={isFocused ? 0.28 : 0.1}
            metalness={0.85}
            roughness={0.28}
            transparent
          />
        </RoundedBox>

        {/* Real section DOM mapped onto the screen face, in modern window chrome.
            Non-interactive — it's the zoom-in preview; a real 2D page takes over
            at full-screen (see FocusedPage). */}
        <Html
          transform
          distanceFactor={SCREEN_DISTANCE_FACTOR}
          position={[0, 0, 0.065]}
          occlude={false}
          zIndexRange={[20, 0]}
          pointerEvents="none"
        >
          <ScreenContextBridge values={bridged}>
            <RevealStaticContext.Provider value={true}>
              <div
                data-screen={slot.id}
                className={`flex flex-col overflow-hidden bg-background text-foreground ${
                  isFocused ? '' : 'rounded-2xl ring-1 ring-white/10'
                }`}
                style={{
                  width: surfacePx.w,
                  height: surfacePx.h,
                  opacity: dimmed ? 0 : 1,
                  transition:
                    'width 0.5s cubic-bezier(0.22,1,0.36,1), height 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  cursor: isFocused ? 'auto' : 'pointer',
                  boxShadow: isFocused
                    ? 'none'
                    : `inset 0 0 0 1px ${accent}33, 0 24px 70px -24px ${accent}cc, 0 0 50px -16px ${accent}66`,
                }}
              >
                {/* Window chrome header */}
                <div
                  className="sticky top-0 z-20 flex items-center gap-2.5 border-b border-white/10 px-5 py-3 backdrop-blur-md"
                  style={{ background: `linear-gradient(180deg, ${accent}24, ${accent}08 60%, transparent)` }}
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: accent, boxShadow: `0 0 10px ${accent}, 0 0 4px ${accent}` }}
                  />
                  <span className="text-sm font-semibold tracking-wide text-foreground/90">
                    {slot.label}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-foreground/45">
                    {isFocused ? 'Esc to close' : 'Click to open'}
                    <Maximize2 className="size-3.5" />
                  </span>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-hidden">
                  <ScreenSection id={slot.id} greeting={greeting} showName={false} />
                </div>
              </div>
            </RevealStaticContext.Provider>
          </ScreenContextBridge>
        </Html>
      </group>
    </group>
  )
}
