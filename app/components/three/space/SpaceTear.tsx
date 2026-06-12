'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, DoubleSide, type ShaderMaterial } from 'three'
import { TEAR_YAW, slotFacingQuaternion, sphericalToPosition } from '../camera/layout'
import { BASE_VERT, TEAR_FRAG } from './glsl'

const TEAR_DIST = 34
const TEAR_PITCH = 0.04

/**
 * The "tear in space": a tall glowing rift directly behind the viewer (yaw 180°)
 * — the reveal when you turn around. A warped, crackling vertical slit on an
 * additive plane; the primary bloom target.
 */
export default function SpaceTear() {
  const mat = useRef<ShaderMaterial>(null)
  const pos = useMemo(() => sphericalToPosition(TEAR_YAW, TEAR_PITCH, TEAR_DIST), [])
  const quat = useMemo(() => slotFacingQuaternion(TEAR_YAW, TEAR_PITCH), [])
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorCore: { value: new Color('#eaf3ff') },
      uColorEdge: { value: new Color('#7a4dff') },
    }),
    []
  )

  useFrame((_, delta) => {
    if (mat.current) mat.current.uniforms.uTime.value += delta
  })

  return (
    <mesh position={[pos.x, pos.y, pos.z]} quaternion={quat}>
      <planeGeometry args={[18, 30]} />
      <shaderMaterial
        ref={mat}
        vertexShader={BASE_VERT}
        fragmentShader={TEAR_FRAG}
        uniforms={uniforms}
        side={DoubleSide}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}
