'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  Vector3,
  type Group,
  type ShaderMaterial,
} from 'three'
import { sphericalToPosition } from '../camera/layout'
import { NOISE3_GLSL } from './glsl'

// Direction (planet → light): a soft key from the viewer side so the lit face
// turns toward the camera.
const LIGHT_DIR = new Vector3(0.35, 0.4, -1).normalize()

const PLANET_VERT = /* glsl */ `
  varying vec3 vObjDir;
  varying vec3 vWorldNormal;
  varying vec3 vView;
  void main() {
    vObjDir = normalize(position);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const PLANET_FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vObjDir;
  varying vec3 vWorldNormal;
  varying vec3 vView;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uLightDir;
  uniform float uScale;
  uniform float uBands;
  uniform float uCaps;
  uniform float uGlow;
  ${NOISE3_GLSL}
  void main() {
    vec3 n = vObjDir;
    vec3 q = n * uScale + vec3(0.0, 0.0, uTime * 0.008);
    float base = fbm3(q);
    float detail = fbm3(q * 3.1 + 7.3);
    float h = base * 0.65 + detail * 0.35;

    // Latitude banding for gas giants.
    if (uBands > 0.5) {
      float band = sin(n.y * uBands + base * 3.0) * 0.5 + 0.5;
      h = mix(h, band, 0.72);
    }

    vec3 col = mix(uColorA, uColorB, smoothstep(0.30, 0.55, h));
    col = mix(col, uColorC, smoothstep(0.60, 0.86, h));

    // Polar ice caps.
    col = mix(col, vec3(0.92, 0.96, 1.0), smoothstep(0.72, 0.93, abs(n.y)) * uCaps);

    // Lambert lighting with a soft terminator.
    float diff = max(dot(normalize(vWorldNormal), normalize(uLightDir)), 0.0);
    col *= 0.2 + 0.95 * diff;

    // Emissive crevice glow (lava worlds).
    col += uColorC * uGlow * smoothstep(0.5, 0.18, h);

    // Faint rim light.
    float rim = pow(1.0 - max(dot(normalize(vWorldNormal), vView), 0.0), 3.0);
    col += uColorB * rim * 0.18;

    gl_FragColor = vec4(col, 1.0);
  }
`

const RING_VERT = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const RING_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vP;
  uniform vec3 uColor;
  uniform float uInner;
  uniform float uOuter;
  void main() {
    float r = length(vP);
    float t = (r - uInner) / (uOuter - uInner);
    if (t < 0.0 || t > 1.0) discard;
    float bands = 0.5 + 0.5 * sin(t * 70.0);
    float edges = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.9, t);
    float gap = smoothstep(0.015, 0.05, abs(t - 0.46)); // Cassini-style gap
    float a = (0.3 + 0.45 * bands) * edges * gap;
    gl_FragColor = vec4(uColor * a, a);
  }
`

interface PlanetDef {
  yaw: number
  pitch: number
  dist: number
  radius: number
  colorA: string
  colorB: string
  colorC: string
  atmo: string
  scale: number
  bands: number
  caps: number
  glow: number
  spin: number
  tilt: number
  ring?: string
}

const PLANETS: PlanetDef[] = [
  // Earth-like
  {
    yaw: Math.PI - 0.72, pitch: 0.2, dist: 40, radius: 5.4, spin: 0.03, tilt: 0.35,
    colorA: '#0a294a', colorB: '#1f7a45', colorC: '#caa56a',
    atmo: '#7fb6ff', scale: 2.3, bands: 0, caps: 1, glow: 0,
  },
  // Gas giant with ring
  {
    yaw: Math.PI + 0.5, pitch: -0.16, dist: 54, radius: 8.2, spin: 0.05, tilt: 0.5,
    colorA: '#9c6a40', colorB: '#e9cfa3', colorC: '#6f4327',
    atmo: '#ffcf9a', scale: 1.7, bands: 11, caps: 0, glow: 0, ring: '#e9d8bf',
  },
  // Lava world
  {
    yaw: Math.PI + 0.08, pitch: 0.42, dist: 64, radius: 3.6, spin: 0.04, tilt: 0.2,
    colorA: '#180a06', colorB: '#3c1408', colorC: '#ff5a1e',
    atmo: '#ff7a3a', scale: 2.9, bands: 0, caps: 0, glow: 0.95,
  },
  // Icy moon
  {
    yaw: -Math.PI + 0.34, pitch: -0.3, dist: 32, radius: 2.6, spin: 0.05, tilt: 0.15,
    colorA: '#6f9cc4', colorB: '#dcefff', colorC: '#a9c8de',
    atmo: '#cfe6ff', scale: 2.6, bands: 0, caps: 0.4, glow: 0,
  },
]

function Planet({ def }: { def: PlanetDef }) {
  const body = useRef<Group>(null)
  const surfaceMat = useRef<ShaderMaterial>(null)
  const pos = useMemo(() => sphericalToPosition(def.yaw, def.pitch, def.dist), [def])

  const surfaceUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new Color(def.colorA) },
      uColorB: { value: new Color(def.colorB) },
      uColorC: { value: new Color(def.colorC) },
      uLightDir: { value: LIGHT_DIR },
      uScale: { value: def.scale },
      uBands: { value: def.bands },
      uCaps: { value: def.caps },
      uGlow: { value: def.glow },
    }),
    [def]
  )
  const atmoUniforms = useMemo(
    () => ({ uColor: { value: new Color(def.atmo) }, uPower: { value: 3.4 } }),
    [def]
  )
  const ringUniforms = useMemo(
    () =>
      def.ring
        ? {
            uColor: { value: new Color(def.ring) },
            uInner: { value: def.radius * 1.45 },
            uOuter: { value: def.radius * 2.35 },
          }
        : null,
    [def]
  )

  useFrame((_, delta) => {
    if (body.current) body.current.rotation.y += delta * def.spin
    if (surfaceMat.current) surfaceMat.current.uniforms.uTime.value += delta
  })

  return (
    <group position={[pos.x, pos.y, pos.z]} rotation={[def.tilt, 0, def.tilt * 0.5]}>
      <group ref={body}>
        <mesh>
          <sphereGeometry args={[def.radius, 64, 64]} />
          <shaderMaterial
            ref={surfaceMat}
            vertexShader={PLANET_VERT}
            fragmentShader={PLANET_FRAG}
            uniforms={surfaceUniforms}
          />
        </mesh>
      </group>

      {/* Atmosphere halo. */}
      <mesh scale={1.08}>
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

      {/* Ring system (gas giant). */}
      {ringUniforms && (
        <mesh rotation={[Math.PI / 2.1, 0, 0]}>
          <ringGeometry args={[def.radius * 1.45, def.radius * 2.35, 128]} />
          <shaderMaterial
            vertexShader={RING_VERT}
            fragmentShader={RING_FRAG}
            uniforms={ringUniforms}
            side={DoubleSide}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  )
}

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

export default function Planets() {
  return (
    <>
      {PLANETS.map((def, i) => (
        <Planet key={i} def={def} />
      ))}
    </>
  )
}
