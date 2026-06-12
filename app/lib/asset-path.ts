'use client'

import { localeAfterBasePathPattern, localePathPattern } from '../i18n'

/**
 * Detect the runtime base path the app is served under (e.g. `/my-cv` on
 * GitLab Pages). Mirrors the proven logic in `app/i18n/TranslationProvider.tsx`
 * so WebGL asset loading stays consistent with i18n JSON loading.
 */
export function getBasePath(): string {
  if (typeof window === 'undefined') return ''

  try {
    const nextData = (window as { __NEXT_DATA__?: { assetPrefix?: string } }).__NEXT_DATA__
    if (nextData?.assetPrefix) return nextData.assetPrefix

    const pathname = window.location.pathname
    if (localePathPattern().test(pathname)) return ''

    const match = pathname.match(localeAfterBasePathPattern())
    if (match?.[1]) return match[1]
  } catch (error) {
    console.warn('Error detecting basePath:', error)
  }

  return ''
}

/**
 * Resolve a public asset path against the runtime base path.
 *
 * Next.js injects `assetPrefix` into framework requests, but NOT into Three.js
 * loaders (`TextureLoader`, drei `useTexture`/`useGLTF`). Route every WebGL asset
 * URL through this helper so they resolve under a subpath deployment.
 *
 * Absolute URLs and data URIs are returned untouched.
 */
export function assetPath(path: string): string {
  if (!path) return path
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }

  const base = getBasePath()
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return cleanBase ? `${cleanBase}${normalizedPath}` : normalizedPath
}
