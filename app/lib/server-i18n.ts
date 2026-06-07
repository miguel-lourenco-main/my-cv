import fs from 'node:fs/promises'
import path from 'node:path'
import {
  CORE_I18N_NAMESPACES,
  defaultLocale,
  isValidLocale,
  type I18nNamespace,
  type Locale,
} from '../i18n'

async function readLocaleNamespace(
  locale: Locale,
  namespace: string
): Promise<Record<string, unknown>> {
  const filePath = path.join(process.cwd(), 'public', 'locales', locale, `${namespace}.json`)
  try {
    const file = await fs.readFile(filePath, 'utf8')
    return JSON.parse(file) as Record<string, unknown>
  } catch {
    return {}
  }
}

/**
 * Load multiple i18n namespaces for a locale from disk (server-only).
 */
export async function loadLocaleNamespaces(
  locale: string | undefined,
  namespaces: readonly I18nNamespace[]
): Promise<Partial<Record<I18nNamespace, Record<string, unknown>>>> {
  const effectiveLocale: Locale = isValidLocale(locale ?? '') ? (locale as Locale) : defaultLocale
  const entries = await Promise.all(
    namespaces.map(async (ns) => [ns, await readLocaleNamespace(effectiveLocale, ns)] as const)
  )
  return Object.fromEntries(entries) as Partial<Record<I18nNamespace, Record<string, unknown>>>
}

/**
 * Server-side utility to retrieve the navigation greeting text for a given locale.
 */
export async function getNavigationGreeting(locale: string | undefined): Promise<string> {
  const resources = await loadLocaleNamespaces(locale, ['navigation'])
  const value = resources.navigation?.greeting
  return typeof value === 'string' && value.length > 0 ? value : ''
}

/**
 * Load core page namespaces for SSR embedding in the client bundle.
 */
export async function loadCoreTranslations(locale: string | undefined) {
  return loadLocaleNamespaces(locale, CORE_I18N_NAMESPACES)
}

/**
 * Load the project images manifest JSON generated at build time.
 */
export async function loadProjectImagesManifest(): Promise<Record<string, string[]>> {
  const filePath = path.join(process.cwd(), 'public', 'projects-images-manifest.json')
  try {
    const file = await fs.readFile(filePath, 'utf8')
    return JSON.parse(file) as Record<string, string[]>
  } catch {
    return {}
  }
}
