'use client'

import { useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import { damp } from 'maath/easing'
import { Vector3, type Group, type Mesh } from 'three'
import { slotFacingRotation, sphericalToPosition, type ScreenSlot } from '../camera/layout'
import { useLookControls } from '../camera/LookControlsContext'
import ScreenContextBridge, { type BridgedContexts } from '../ScreenContextBridge'
import { RevealStaticContext } from '../../Reveal'
import ScreenSection from './ScreenSections'
import { useFocus } from './FocusContext'
import {
  FOCUS_SCALE,
  PANEL_PX,
  PANEL_WORLD,
  SCREEN_DISTANCE_FACTOR,
} from './screen-size'

const BEZEL_PAD = 0.14
/** Max see-saw tilt (radians ≈ 7°). */
const MAX_TILT = 0.12
/** How far the panel pushes back into the scene on hover (world units). */
const HOVER_PUSH = 0.06

const ACCENT: Record<string, string> = {
  about: '#5b8bff',
  tech: '#36d6c3',
  projects: '#c084fc',
  contact: '#ffb454',
}

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
  const scale = useRef(1)
  const hover = useRef<HoverState>({
    hovered: false,
    tiltX: 0,
    tiltY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    push: 0,
  })
  const localHit = useRef(new Vector3())

  const lookRef = useLookControls()
  const { focusedId, focus } = useFocus()
  const isFocused = focusedId === slot.id
  const phase = slot.yaw * 3.1 // de-sync the idle bob per screen

  const pos = sphericalToPosition(slot.yaw, slot.pitch)
  const rot = slotFacingRotation(slot.yaw, slot.pitch)
  const accent = ACCENT[slot.id] ?? '#5b8bff'

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (lookRef.current.dragMoved) return // ignore the click that ends a drag
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
    <group ref={group} position={[pos.x, pos.y, pos.z]} rotation={rot}>
      <group ref={tilt}>
        {/* Glass bezel — also the raycast target for hover/focus. */}
        <RoundedBox
          ref={bezel}
          args={[PANEL_WORLD.w + BEZEL_PAD, PANEL_WORLD.h + BEZEL_PAD, 0.08]}
          radius={0.06}
          smoothness={4}
          onClick={handleClick}
          onPointerMove={handleMove}
          onPointerOut={handleOut}
        >
          <meshStandardMaterial
            color="#0a0e1a"
            emissive={accent}
            emissiveIntensity={isFocused ? 0.5 : 0.22}
            metalness={0.6}
            roughness={0.35}
          />
        </RoundedBox>

        {/* Real section DOM mapped onto the screen face. */}
        <Html
          transform
          distanceFactor={SCREEN_DISTANCE_FACTOR}
          position={[0, 0, 0.06]}
          occlude={false}
          zIndexRange={[20, 0]}
          pointerEvents={isFocused ? 'auto' : 'none'}
        >
          <ScreenContextBridge values={bridged}>
            <RevealStaticContext.Provider value={true}>
              <div
                data-screen={slot.id}
                className="cv-screen-surface rounded-[10px] bg-background text-foreground"
                style={{
                  width: PANEL_PX.w,
                  height: PANEL_PX.h,
                  overflowY: isFocused ? 'auto' : 'hidden',
                  overflowX: 'hidden',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  cursor: isFocused ? 'auto' : 'pointer',
                  boxShadow: `0 0 60px -12px ${accent}55`,
                }}
              >
                <div className="min-h-full px-2 py-6">
                  <ScreenSection id={slot.id} greeting={greeting} />
                </div>
              </div>
            </RevealStaticContext.Provider>
          </ScreenContextBridge>
        </Html>
      </group>
    </group>
  )
}
