'use client'

import { useEffect, useRef, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { damp } from 'maath/easing'
import { Group, type PerspectiveCamera as PerspectiveCameraImpl } from 'three'
import {
  LOOK_SENSITIVITY,
  PITCH_LIMIT,
  type LookState,
} from './look-state'

/**
 * Gyroscopic "swivel chair" camera. The camera sits at the origin inside a rig
 * group; pointer drags rotate the rig (yaw unbounded for a full 360, pitch
 * clamped so you never flip over the poles). Motion is critically damped for a
 * heavy, settling feel, and a faint idle drift keeps the scene alive when the
 * user lets go.
 */
export default function CameraRig({ lookRef }: { lookRef: MutableRefObject<LookState> }) {
  const rig = useRef<Group>(null)
  const cam = useRef<PerspectiveCameraImpl>(null)
  const gl = useThree((s) => s.gl)
  const idleFactor = useRef(0)

  // Pointer-drag wiring on the canvas element (so a drag anywhere rotates view).
  useEffect(() => {
    const el = gl.domElement
    let lastX = 0
    let lastY = 0
    let downX = 0
    let downY = 0
    let pointerId: number | null = null

    const onDown = (e: PointerEvent) => {
      const state = lookRef.current
      if (!state.enabled || e.button !== 0) return
      state.dragging = true
      state.dragMoved = false
      state.lastInteractionMs = performance.now()
      lastX = e.clientX
      lastY = e.clientY
      downX = e.clientX
      downY = e.clientY
      pointerId = e.pointerId
      el.setPointerCapture?.(e.pointerId)
      el.style.cursor = 'grabbing'
    }

    const onMove = (e: PointerEvent) => {
      const state = lookRef.current
      if (!state.dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      // Drag right → look right; drag up → look up (chair swivel).
      state.targetYaw -= dx * LOOK_SENSITIVITY
      state.targetPitch -= dy * LOOK_SENSITIVITY
      state.targetPitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, state.targetPitch))
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) state.dragMoved = true
      state.lastInteractionMs = performance.now()
    }

    const endDrag = () => {
      const state = lookRef.current
      if (!state.dragging) return
      state.dragging = false
      state.lastInteractionMs = performance.now()
      if (pointerId != null) el.releasePointerCapture?.(pointerId)
      pointerId = null
      el.style.cursor = 'grab'
    }

    el.style.cursor = 'grab'
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', endDrag)
    el.addEventListener('pointercancel', endDrag)
    window.addEventListener('blur', endDrag)

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', endDrag)
      el.removeEventListener('pointercancel', endDrag)
      window.removeEventListener('blur', endDrag)
      el.style.cursor = ''
    }
  }, [gl, lookRef])

  useFrame((threeState, delta) => {
    const group = rig.current
    if (!group) return
    const state = lookRef.current
    const dt = Math.min(delta, 0.05)

    // Ease the shown angles toward their targets (heavy settle).
    damp(state, 'yaw', state.targetYaw, 0.28, dt)
    damp(state, 'pitch', state.targetPitch, 0.24, dt)

    // Idle breathing once the user has been still for a moment.
    const idle = !state.dragging && performance.now() - state.lastInteractionMs > 2600 ? 1 : 0
    damp(idleFactor, 'current', idle, 0.6, dt)
    const t = threeState.clock.elapsedTime
    const driftYaw = idleFactor.current * Math.sin(t * 0.06) * 0.03
    const driftPitch = idleFactor.current * Math.sin(t * 0.045 + 1.3) * 0.014

    group.rotation.set(state.pitch + driftPitch, state.yaw + driftYaw, 0, 'YXZ')

    // Dolly the camera forward (−Z local) toward a focused screen.
    if (cam.current) damp(cam.current.position, 'z', -state.dolly, 0.22, dt)
  })

  return (
    <group ref={rig} rotation-order="YXZ">
      <PerspectiveCamera ref={cam} makeDefault fov={60} position={[0, 0, 0]} near={0.05} far={200} />
    </group>
  )
}
