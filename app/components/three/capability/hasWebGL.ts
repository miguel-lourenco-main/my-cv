/**
 * One-time, side-effect-free probe for usable WebGL. Creates a throwaway canvas
 * and also rejects software renderers (SwiftShader / llvmpipe / Mesa software),
 * which can technically run WebGL but are far too slow for the immersive scene.
 *
 * Must only be called on the client (guards for `document`).
 */
export function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null

    if (!gl) return false

    // Reject obvious software rasterizers when the renderer string is exposed.
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const renderer = String(
        gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
      )
      if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}
