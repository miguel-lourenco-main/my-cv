/**
 * Internationalization configuration — single source of truth for locales and namespaces.
 */

export const locales = ['en', 'pt', 'fr', 'es'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const LOCALE_META = [
  { code: 'en' as const, label: 'EN', name: 'English' },
  { code: 'pt' as const, label: 'PT', name: 'Português' },
  { code: 'fr' as const, label: 'FR', name: 'Français' },
  { code: 'es' as const, label: 'ES', name: 'Español' },
]

/** Core page namespaces loaded on every route (server + client). */
export const CORE_I18N_NAMESPACES = [
  'navigation',
  'footer',
  'categories',
  'hero',
  'about',
  'projects',
  'contact',
] as const

/** Per-project namespaces loaded when a project modal opens. */
export const PROJECT_I18N_NAMESPACES = [
  'projects/ui-components',
  'projects/sonora',
  'projects/agentic-hub',
  'projects/cash-register',
  'projects/o-guardanapo',
  'projects/oflat',
  'projects/edgen-chat',
  'projects/edgen-code',
  'projects/edgen-translate',
  'projects/job-ai-hub',
] as const

/** All namespaces (core + per-project). */
export const I18N_NAMESPACES = [
  ...CORE_I18N_NAMESPACES,
  ...PROJECT_I18N_NAMESPACES,
] as const

export type I18nNamespace = (typeof I18N_NAMESPACES)[number]

export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale)
}

/** Regex matching a locale prefix in a pathname, e.g. `/en/` or `/pt`. */
export function localePathPattern(): RegExp {
  return new RegExp(`^/(${locales.join('|')})(/|$)`)
}

/** Regex matching locale embedded after an optional base path. */
export function localeAfterBasePathPattern(): RegExp {
  return new RegExp(`^(.+?)/(${locales.join('|')})(/|$)`)
}

export function generateStaticLocaleParams() {
  return locales.map((locale) => ({ locale }))
}
