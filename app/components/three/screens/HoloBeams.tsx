'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { damp } from 'maath/easing'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  ShaderMaterial,
  Vector3,
} from 'three'
import { SCREEN_LAYOUT, slotFacingQuaternion, sphericalToPosition } from '../camera/layout'
import { SCREEN_ACCENT } from './screen-theme'
import { PANEL_WORLD } from './screen-size'
import { useFocus } from './FocusContext'

/**
 * Prototype (#9): the windows are holograms projected from a device in the
 * visitor's hand. A faint light frustum runs from an emitter just below the
 * camera to the four corners of every screen, with scan bands travelling up
 * the beam. The emitter follows the camera (it's "in your hand"), so the beams
 * are rebuilt each frame from the camera pose. They fade out while a screen is
 * focused so reading stays clean.
 */

/** Emitter position in camera space: low and slightly ahead, like a wrist device. */
const EMITTER_LOCAL = new Vector3(0, -0.95, -0.9)
const TRIS_PER_SCREEN = 4 // four open faces of the frustum
const VERTS = SCREEN_LAYOUT.length * TRIS_PER_SCREEN * 3

const vertexShader = /* glsl */ `
  attribute float aT;
  attribute vec3 aColor;
  varying float vT;
  varying vec3 vColor;
  void main() {
    vT = aT;
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying float vT;
  varying vec3 vColor;
  void main() {
    // Brighter toward the screen, scan bands travelling from hand to screen.
    float body = smoothstep(0.0, 1.0, vT) * 0.55 + 0.08;
    float bands = 0.65 + 0.35 * sin(vT * 46.0 - uTime * 7.0);
    float flicker = 0.92 + 0.08 * sin(uTime * 31.0) * sin(uTime * 17.0);
    float a = body * bands * flicker * uOpacity * 0.16;
    gl_FragColor = vec4(vColor, a);
  }
`

export default function HoloBeams() {
  const { focusedId } = useFocus()
  const opacity = useRef({ v: 1 })

  // Static data: world-space corners of every panel + per-vertex colour / t.
  const { geometry, corners, material } = useMemo(() => {
    const geometry = new BufferGeometry()
    const positions = new Float32Array(VERTS * 3)
    const t = new Float32Array(VERTS)
    const colors = new Float32Array(VERTS * 3)

    const corners: Vector3[][] = SCREEN_LAYOUT.map((slot) => {
      const center = sphericalToPosition(slot.yaw, slot.pitch)
      const q = slotFacingQuaternion(slot.yaw, slot.pitch)
      const hw = PANEL_WORLD.w / 2
      const hh = PANEL_WORLD.h / 2
      return [
        new Vector3(-hw, -hh, 0),
        new Vector3(hw, -hh, 0),
        new Vector3(hw, hh, 0),
        new Vector3(-hw, hh, 0),
      ].map((c) => c.applyQuaternion(q).add(center))
    })

    SCREEN_LAYOUT.forEach((slot, s) => {
      const col = new Color(SCREEN_ACCENT[slot.id])
      for (let f = 0; f < TRIS_PER_SCREEN; f++) {
        const base = (s * TRIS_PER_SCREEN + f) * 3
        // vertex 0 = emitter (t=0), vertices 1-2 = an edge of the panel (t=1)
        t[base] = 0
        t[base + 1] = 1
        t[base + 2] = 1
        for (let k = 0; k < 3; k++) {
          colors[(base + k) * 3] = col.r
          colors[(base + k) * 3 + 1] = col.g
          colors[(base + k) * 3 + 2] = col.b
        }
      }
    })

    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setAttribute('aT', new BufferAttribute(t, 1))
    geometry.setAttribute('aColor', new BufferAttribute(colors, 3))

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
    })

    return { geometry, corners, material }
  }, [])

  const emitter = useRef(new Vector3())

  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05)
    damp(opacity.current, 'v', focusedId ? 0 : 1, 0.2, dt)
    material.uniforms.uOpacity.value = opacity.current.v
    material.uniforms.uTime.value += dt

    camera.updateMatrixWorld()
    const e = camera.localToWorld(emitter.current.copy(EMITTER_LOCAL))
    const pos = geometry.getAttribute('position') as BufferAttribute
    const arr = pos.array as Float32Array
    corners.forEach((c, s) => {
      for (let f = 0; f < TRIS_PER_SCREEN; f++) {
        const a = c[f]
        const b = c[(f + 1) % 4]
        const base = (s * TRIS_PER_SCREEN + f) * 9
        arr[base] = e.x
        arr[base + 1] = e.y
        arr[base + 2] = e.z
        arr[base + 3] = a.x
        arr[base + 4] = a.y
        arr[base + 5] = a.z
        arr[base + 6] = b.x
        arr[base + 7] = b.y
        arr[base + 8] = b.z
      }
    })
    pos.needsUpdate = true
    geometry.computeBoundingSphere()
  })

  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={-1} />
}
