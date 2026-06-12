'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Points } from 'three'

/**
 * Generates star positions on a spherical shell. `backBias` (0..1) pushes points
 * toward the back hemisphere (+Z, where the tear lives) so that side reads dense
 * while the screen-facing side stays sparse.
 */
function makeStars(count: number, rMin: number, rMax: number, backBias = 0): Float32Array {
  const arr = new Float32Array(count * 3)
  let i = 0
  let guard = 0
  while (i < count && guard < count * 40) {
    guard++
    // Uniform direction on the sphere.
    const u = Math.random() * 2 - 1
    const theta = Math.random() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    let x = s * Math.cos(theta)
    let y = u
    let z = s * Math.sin(theta)
    // Rejection-sample toward the back hemisphere when biased.
    if (backBias > 0) {
      const frontness = (1 - z) * 0.5 // 1 at front (-Z), 0 at back (+Z)
      if (Math.random() < frontness * backBias) continue
    }
    const r = rMin + Math.random() * (rMax - rMin)
    arr[i * 3] = x * r
    arr[i * 3 + 1] = y * r
    arr[i * 3 + 2] = z * r
    i++
  }
  return arr
}

export default function Starfield() {
  const group = useRef<Points>(null)
  const ambient = useMemo(() => makeStars(1400, 48, 70), [])
  const dense = useMemo(() => makeStars(3600, 40, 66, 0.96), [])

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.004
  })

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[ambient, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          sizeAttenuation
          color="#cdd8ff"
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </points>
      <points ref={group as never}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dense, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          sizeAttenuation
          color="#ffffff"
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  )
}
