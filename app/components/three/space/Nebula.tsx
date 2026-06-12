'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BackSide, Color, type ShaderMaterial } from 'three'
import { BASE_VERT, NEBULA_FRAG } from './glsl'

/**
 * A large inward-facing sphere painted with animated fbm clouds, concentrated
 * on the back hemisphere so the screen side stays clean. Additive + tone-mapping
 * off so it blooms.
 */
export default function Nebula() {
  const mat = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new Color('#3a1d6e') },
      uColorB: { value: new Color('#16608f') },
      uIntensity: { value: 0.9 },
    }),
    []
  )

  useFrame((_, delta) => {
    if (mat.current) mat.current.uniforms.uTime.value += delta
  })

  return (
    <mesh>
      <sphereGeometry args={[92, 48, 48]} />
      <shaderMaterial
        ref={mat}
        vertexShader={BASE_VERT}
        fragmentShader={NEBULA_FRAG}
        uniforms={uniforms}
        side={BackSide}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}
