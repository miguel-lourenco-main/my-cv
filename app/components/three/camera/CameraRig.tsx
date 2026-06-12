'use client'

import { useEffect, useRef, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { damp } from 'maath/easing'
import { Group, type PerspectiveCamera as PerspectiveCameraImpl } from 'three'
import {
  CAMERA_FOV,
  MAX_LOOK_SPEED,
  PITCH_LIMIT,
  steerAxis,
  type LookState,
} from './look-state'

/** Arrow keys pan at this fraction of the peak cursor speed. */
const KEY_SPEED = MAX_LOOK_SPEED * 0.8

/**
 * Camera that steers from the cursor's position and the arrow keys. The cursor's
 * offset from the screen centre sets a pan *velocity* (faster toward the edges,
 * still in a centre dead-zone); arrow keys add to that velocity. The camera sits
 * at the origin inside a rig group: yaw is unbounded (full 360°), pitch clamped,
 * and the whole thing is damped for a heavy, settling feel.
 */
export default function CameraRig({
  lookRef,
  revealed = true,
}: {
  lookRef: MutableRefObject<LookState>
  revealed?: boolean
}) {
  const rig = useRef<Group>(null)
  const cam = useRef<PerspectiveCameraImpl>(null)
  const idleFactor = useRef(0)
  const dollyZ = useRef(0)
  const introStart = useRef<number | null>(null)
  const keys = useRef({ left: false, right: false, up: false, down: false })
  const gl = useThree((s) => s.gl)

  // Cursor position → steering offset.
  useEffect(() => {
    const el = gl.domElement

    const onMove = (e: PointerEvent) => {
      const state = lookRef.current
      if (!state.enabled) return
      const r = el.getBoundingClientRect()
      state.pointerX = ((e.clientX - r.left) / r.width) * 2 - 1
      state.pointerY = ((e.clientY - r.top) / r.height) * 2 - 1
      state.active = true
      state.lastInteractionMs = performance.now()
    }
    const onLeave = () => {
      const state = lookRef.current
      state.active = false
      state.pointerX = 0
      state.pointerY = 0
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [gl, lookRef])

  // Arrow keys → steering.
  useEffect(() => {
    const set = (key: string, down: boolean): boolean => {
      switch (key) {
        case 'ArrowLeft': keys.current.left = down; return true
        case 'ArrowRight': keys.current.right = down; return true
        case 'ArrowUp': keys.current.up = down; return true
        case 'ArrowDown': keys.current.down = down; return true
        default: return false
      }
    }
    const onDown = (e: KeyboardEvent) => {
      if (!lookRef.current.enabled) return
      if (set(e.key, true)) {
        e.preventDefault()
        lookRef.current.lastInteractionMs = performance.now()
      }
    }
    const onUp = (e: KeyboardEvent) => set(e.key, false)
    const reset = () => { keys.current = { left: false, right: false, up: false, down: false } }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', reset)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', reset)
    }
  }, [lookRef])

  useFrame((threeState, delta) => {
    const group = rig.current
    if (!group) return
    const state = lookRef.current
    const dt = Math.min(delta, 0.05)
    const k = keys.current

    if (state.enabled) {
      // Cursor right → look right (yaw decreases); cursor up → look up.
      const keyX = (k.right ? 1 : 0) - (k.left ? 1 : 0)
      const keyY = (k.down ? 1 : 0) - (k.up ? 1 : 0)
      const velYaw = -(steerAxis(state.pointerX) * MAX_LOOK_SPEED + keyX * KEY_SPEED)
      const velPitch = -(steerAxis(state.pointerY) * MAX_LOOK_SPEED + keyY * KEY_SPEED)

      state.targetYaw += velYaw * dt
      state.targetPitch = Math.max(
        -PITCH_LIMIT,
        Math.min(PITCH_LIMIT, state.targetPitch + velPitch * dt)
      )
    }

    // Ease the shown angles toward their targets (heavy settle).
    damp(state, 'yaw', state.targetYaw, 0.18, dt)
    damp(state, 'pitch', state.targetPitch, 0.16, dt)

    // Idle breathing once the user has been still for a moment.
    const steering = state.active || k.left || k.right || k.up || k.down
    const idle = !steering && performance.now() - state.lastInteractionMs > 2600 ? 1 : 0
    damp(idleFactor, 'current', idle, 0.6, dt)
    const t = threeState.clock.elapsedTime
    const driftYaw = idleFactor.current * Math.sin(t * 0.06) * 0.03
    const driftPitch = idleFactor.current * Math.sin(t * 0.045 + 1.3) * 0.014

    // Establishing fly-in: held off-centre + pulled back during the intro, then
    // eases home over ~2.4s (easeOutCubic) once the intro reveals the scene.
    if (revealed && introStart.current === null) introStart.current = t
    const introP = introStart.current === null ? 0 : Math.min(1, (t - introStart.current) / 2.4)
    const introRemain = Math.pow(1 - introP, 3)
    const introYaw = introRemain * 0.55
    const introPitch = introRemain * 0.24
    const introBack = introRemain * 2.0

    group.rotation.set(
      state.pitch + driftPitch + introPitch,
      state.yaw + driftYaw + introYaw,
      0,
      'YXZ'
    )

    // Dolly the camera forward (−Z local) toward a focused screen, plus the
    // decaying intro pull-back.
    damp(dollyZ, 'current', -state.dolly, 0.22, dt)
    if (cam.current) cam.current.position.z = dollyZ.current + introBack
  })

  return (
    <group ref={rig} rotation-order="YXZ">
      <PerspectiveCamera ref={cam} makeDefault fov={CAMERA_FOV} position={[0, 0, 0]} near={0.05} far={200} />
    </group>
  )
}
