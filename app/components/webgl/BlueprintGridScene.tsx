'use client'

import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Full-screen blueprint-grid shader for the Systeme hero.
 *
 * Quiet by default — a faint engineering grid drifting over near-black — it
 * brightens and ripples toward the pointer, with a restrained cyan signal
 * bloom. A `uReveal` uniform (0→1) lets the preloader dissolve it in, and
 * `uScroll` fades/sharpens it as the hero hands off to the next section.
 */
const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec2  uPointer;   // -1..1, aspect corrected externally
  uniform float uReveal;    // 0..1 preloader dissolve-in
  uniform float uScroll;    // 0..1 scroll progress out of hero

  // Cheap value noise
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // Distance to nearest grid line for a given cell size (in aspect space)
  float grid(vec2 uv, float cells, float width){
    vec2 g = abs(fract(uv * cells - 0.5) - 0.5) / fwidth(uv * cells);
    float line = min(g.x, g.y);
    return 1.0 - smoothstep(0.0, width, line);
  }

  void main(){
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 uv = vUv;
    vec2 auv = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

    // Pointer in aspect space
    vec2 p = vec2(uPointer.x * 0.5 * aspect, uPointer.y * 0.5);
    float d = length(auv - p);
    float glow = exp(-d * 2.6);

    // Slow flow that warps the grid subtly near the pointer
    float flow = noise(auv * 1.5 + uTime * 0.05) - 0.5;
    vec2 warp = auv + flow * 0.04 + (auv - p) * glow * 0.05;

    // Two grid scales
    float fine = grid(warp + 0.5, 18.0, 1.4);
    float coarse = grid(warp + 0.5, 4.5, 1.6);

    vec3 bg = vec3(0.039, 0.043, 0.051);
    vec3 lineCol = vec3(0.16, 0.19, 0.22);
    vec3 accent = vec3(0.36, 0.95, 0.77);

    float gridMask = max(fine * 0.7, coarse * 1.0);
    vec3 col = mix(bg, lineCol, gridMask);

    // Accent bloom: lines near the pointer glow cyan
    col += accent * gridMask * glow * 1.4;
    col += accent * glow * 0.07;

    // Vignette + scroll handoff (fade out as hero leaves)
    float vig = smoothstep(1.2, 0.15, length(uv - 0.5));
    col *= mix(0.72, 1.0, vig);
    col *= (1.0 - uScroll * 0.85);

    // Preloader dissolve-in from center
    float rev = smoothstep(0.0, 1.0, uReveal);
    float ring = smoothstep(rev + 0.15, rev - 0.05, length(uv - 0.5) * 1.2);
    col *= rev * mix(0.4, 1.0, ring);

    gl_FragColor = vec4(col, 1.0);
  }
`

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export default function BlueprintGridScene({
  revealRef,
  scrollRef,
}: {
  /** 0→1 preloader dissolve-in (read each frame to avoid React re-renders). */
  revealRef?: MutableRefObject<number>
  /** 0→1 scroll progress out of the hero. */
  scrollRef?: MutableRefObject<number>
}) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()
  const pointer = useRef(new THREE.Vector2(0, 0))
  const target = useRef(new THREE.Vector2(0, 0))

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uReveal: { value: revealRef ? revealRef.current : 1 },
      uScroll: { value: scrollRef ? scrollRef.current : 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useFrame((state, delta) => {
    const m = material.current
    if (!m) return
    target.current.set(state.pointer.x, state.pointer.y)
    // Smooth pointer follow
    pointer.current.lerp(target.current, Math.min(1, delta * 4))
    m.uniforms.uTime.value = state.clock.elapsedTime
    m.uniforms.uRes.value.set(size.width * viewport.dpr, size.height * viewport.dpr)
    m.uniforms.uPointer.value.copy(pointer.current)
    m.uniforms.uReveal.value = revealRef ? revealRef.current : 1
    m.uniforms.uScroll.value = scrollRef ? scrollRef.current : 0
  })

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={material}
        fragmentShader={fragment}
        vertexShader={vertex}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </ScreenQuad>
  )
}
