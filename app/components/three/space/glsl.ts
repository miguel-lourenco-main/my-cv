/**
 * Shared GLSL chunks for the procedural space environment. Kept conservative
 * (value-noise fbm, no derivatives/textures) so it compiles everywhere WebGL1+
 * runs and stays cheap as a backdrop.
 */
export const NOISE_GLSL = /* glsl */ `
  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }
`

export const BASE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const NEBULA_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;
  ${NOISE_GLSL}
  void main() {
    // Concentrate the cloud toward the back hemisphere (uv.x ~ 0.5) and fade
    // out toward the screens.
    float band = smoothstep(0.52, 0.12, abs(vUv.x - 0.5));
    vec2 p = vUv * vec2(6.0, 3.0);
    float n = fbm(p + vec2(uTime * 0.012, uTime * 0.006));
    float n2 = fbm(p * 2.1 - vec2(uTime * 0.02, 0.0));
    float cloud = pow(smoothstep(0.35, 0.95, n * 0.7 + n2 * 0.4), 1.6);
    float vfade = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
    vec3 col = mix(uColorA, uColorB, n2);
    float alpha = cloud * band * vfade * uIntensity;
    gl_FragColor = vec4(col * alpha, alpha);
  }
`

export const TEAR_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorCore;
  uniform vec3 uColorEdge;
  ${NOISE_GLSL}
  void main() {
    float x = vUv.x - 0.5;
    // Wobble the rift left/right along its height.
    float warp = (fbm(vec2(vUv.y * 4.0, uTime * 0.05)) - 0.5) * 0.13;
    float d = abs(x - warp);
    // Bright thin core + soft surrounding glow.
    float core = smoothstep(0.05, 0.0, d);
    float glow = smoothstep(0.34, 0.0, d) * 0.55;
    // Tear is tallest in the middle, tapering at top/bottom.
    float vfall = smoothstep(0.0, 0.22, vUv.y) * smoothstep(1.0, 0.78, vUv.y);
    // Filaments / energy crackle along the rift.
    float fil = fbm(vec2(vUv.x * 7.0, vUv.y * 12.0 - uTime * 0.12));
    vec3 col = mix(uColorEdge, uColorCore, core);
    col += uColorCore * glow;
    float alpha = (core + glow * 0.85) * vfall * (0.65 + 0.35 * fil);
    gl_FragColor = vec4(col * alpha, alpha);
  }
`
