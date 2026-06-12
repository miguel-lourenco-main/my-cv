'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BackSide, Color, type Group } from 'three'
import { sphericalToPosition } from '../camera/layout'

const ATMO_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`
const ATMO_FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vN;
  varying vec3 vView;
  uniform vec3 uColor;
  uniform float uPower;
  void main() {
    float f = pow(1.0 - max(dot(vN, vView), 0.0), uPower);
    gl_FragColor = vec4(uColor * f, f);
  }
`

interface PlanetDef {
  yaw: number
  pitch: number
  dist: number
  radius: number
  color: string
  atmo: string
  spin: number
}

// A few bodies scattered across the back/side hemisphere.
const PLANETS: PlanetDef[] = [
  { yaw: Math.PI - 0.7, pitch: 0.22, dist: 40, radius: 5.2, color: '#b66a3e', atmo: '#ffb27a', spin: 0.03 },
  { yaw: Math.PI + 0.55, pitch: -0.18, dist: 52, radius: 7.5, color: '#3f5f8a', atmo: '#7fb6ff', spin: 0.018 },
  { yaw: Math.PI + 0.05, pitch: 0.4, dist: 64, radius: 4.0, color: '#5a4e7c', atmo: '#c8a6ff', spin: 0.025 },
  { yaw: -Math.PI + 0.35, pitch: -0.32, dist: 33, radius: 2.6, color: '#7c7f88', atmo: '#cfe0ff', spin: 0.04 },
]

function Planet({ def }: { def: PlanetDef }) {
  const body = useRef<Group>(null)
  const pos = useMemo(() => sphericalToPosition(def.yaw, def.pitch, def.dist), [def])
  const atmoUniforms = useMemo(
    () => ({ uColor: { value: new Color(def.atmo) }, uPower: { value: 3.2 } }),
    [def]
  )

  useFrame((_, delta) => {
    if (body.current) body.current.rotation.y += delta * def.spin
  })

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      <group ref={body}>
        <mesh>
          <sphereGeometry args={[def.radius, 48, 48]} />
          <meshStandardMaterial
            color={def.color}
            roughness={0.92}
            metalness={0.0}
            emissive={new Color(def.color).multiplyScalar(0.12)}
          />
        </mesh>
      </group>
      {/* Atmosphere halo. */}
      <mesh scale={1.09}>
        <sphereGeometry args={[def.radius, 48, 48]} />
        <shaderMaterial
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_FRAG}
          uniforms={atmoUniforms}
          side={BackSide}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default function Planets() {
  return (
    <>
      {/* Soft key light so the planet terminators read. */}
      <directionalLight position={[6, 4, -10]} intensity={1.4} color="#fff2e0" />
      {PLANETS.map((def, i) => (
        <Planet key={i} def={def} />
      ))}
    </>
  )
}
