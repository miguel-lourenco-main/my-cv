'use client'

import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Flowing mesh-gradient for the Organic art direction: domain-warped fbm noise
 * mapped through a lush palette, drifting over time and bending toward the
 * pointer. This is the always-on full-page backdrop (heavy WebGL tier).
 */
const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec2  uPointer;
  uniform float uReveal;

  vec3 hash3(vec2 p){
    vec3 q = vec3(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)), dot(p, vec2(419.2, 371.9)));
    return fract(sin(q) * 43758.5453);
  }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash3(i).x, b = hash3(i + vec2(1.0,0.0)).x;
    float c = hash3(i + vec2(0.0,1.0)).x, d = hash3(i + vec2(1.0,1.0)).x;
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  // Palette (Inigo Quilez cosine palette)
  vec3 palette(float t){
    vec3 a = vec3(0.5, 0.42, 0.55);
    vec3 b = vec3(0.45, 0.35, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.0, 0.15, 0.4);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main(){
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 uv = vUv;
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

    float t = uTime * 0.06;
    vec2 ptr = vec2(uPointer.x * 0.5 * aspect, uPointer.y * 0.5);
    p += (p - ptr) * 0.12 * exp(-length(p - ptr) * 1.5);

    // Domain warping
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 2.0 * q + vec2(1.7, 9.2) + t * 0.7),
                  fbm(p + 2.0 * q + vec2(8.3, 2.8) - t * 0.5));
    float f = fbm(p + 2.5 * r);

    vec3 col = palette(f + t * 0.5);
    col = mix(col, palette(length(q) + 0.55), 0.55);
    col *= 0.72 + 0.7 * f;
    // Lift saturation a touch for a more lush read
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(lum), col, 1.22);

    // Deepen toward edges for contrast with glass UI
    float vig = smoothstep(1.3, 0.2, length(uv - 0.5));
    col *= mix(0.58, 1.05, vig);
    col = mix(vec3(0.043, 0.024, 0.075), col, clamp(uReveal, 0.0, 1.0));

    gl_FragColor = vec4(col, 1.0);
  }
`

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

export default function GradientScene({ revealRef }: { revealRef?: MutableRefObject<number> }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()
  const pointer = useRef(new THREE.Vector2(0, 0))

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uReveal: { value: revealRef ? revealRef.current : 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useFrame((state, delta) => {
    const m = material.current
    if (!m) return
    pointer.current.lerp(state.pointer, Math.min(1, delta * 3))
    m.uniforms.uTime.value = state.clock.elapsedTime
    m.uniforms.uRes.value.set(size.width * viewport.dpr, size.height * viewport.dpr)
    m.uniforms.uPointer.value.copy(pointer.current)
    m.uniforms.uReveal.value = revealRef ? revealRef.current : 1
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
