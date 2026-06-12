'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import i18next from 'i18next'
import { initReactI18next, useTranslation as useRT } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import {
  CORE_I18N_NAMESPACES,
  I18N_NAMESPACES,
  localeAfterBasePathPattern,
  localePathPattern,
  locales as supportedLocales,
  PROJECT_I18N_NAMESPACES,
  type I18nNamespace,
} from '../i18n'

let initialized = false

export type InitialTranslations = Partial<Record<I18nNamespace, Record<string, unknown>>>

function getBasePath(): string {
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

function buildLoadPathFn() {
  return (lngs: string[], namespaces: string[]) => {
    const basePath = getBasePath()
    const paths: string[] = []
    for (const lng of lngs) {
      for (const ns of namespaces) {
        if (basePath && basePath.length > 0) {
          const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
          paths.push(`${cleanBasePath}/locales/${lng}/${ns}.json`)
        } else {
          paths.push(`/locales/${lng}/${ns}.json`)
        }
      }
    }
    return paths
  }
}

function resourcesFromInitial(initialResources?: InitialTranslations) {
  if (!initialResources) return undefined
  const resources: Record<string, Record<string, Record<string, unknown>>> = {}
  for (const [ns, data] of Object.entries(initialResources)) {
    if (!data) continue
    for (const locale of supportedLocales) {
      resources[locale] ??= {}
      resources[locale][ns] = data
    }
  }
  return resources
}

function ensureI18nInitialized(
  locale: string,
  namespaces: string[],
  initialResources?: InitialTranslations
) {
  const loadPathFn = buildLoadPathFn()
  const embeddedResources = resourcesFromInitial(initialResources)
  const initialNamespaces = Array.from(
    new Set([...(namespaces || []), ...CORE_I18N_NAMESPACES])
  )

  if (!initialized) {
    i18next
      .use(initReactI18next)
      .use(HttpBackend)
      .init({
        lng: locale,
        fallbackLng: 'en',
        supportedLngs: Array.from(supportedLocales),
        ns: initialNamespaces,
        defaultNS: 'projects',
        interpolation: { escapeValue: false },
        resources: embeddedResources,
        partialBundledLanguages: true,
        backend: {
          loadPath: loadPathFn,
          allowMultiLoading: false,
        },
        react: { useSuspense: false },
        returnEmptyString: false,
        load: 'languageOnly',
      })
    initialized = true
    return
  }

  if (embeddedResources) {
    for (const [lng, nsMap] of Object.entries(embeddedResources)) {
      for (const [ns, data] of Object.entries(nsMap)) {
        i18next.addResourceBundle(lng, ns, data, true, true)
      }
    }
  }

  if (i18next.language !== locale) {
    if (i18next.services.backendConnector?.backend?.options) {
      i18next.services.backendConnector.backend.options.loadPath = loadPathFn
    }
    i18next.changeLanguage(locale)
  }
}

function resolveProjectField(
  obj: Record<string, unknown> | null | undefined,
  field: string,
  returnObjects: boolean
): string | string[] {
  const keyField = `${field}${returnObjects ? 'Keys' : 'Key'}`
  const directValue = obj?.[field]
  const keyPath = obj?.[keyField]

  if (typeof keyPath === 'string' && keyPath.length > 0) {
    if (keyPath.startsWith('projects.')) {
      const parts = keyPath.split('.')
      const projId = parts[1]
      const localKey = parts.slice(2).join('.') || field
      const res = i18next.t(localKey, {
        ns: `projects/${projId}`,
        returnObjects,
      }) as string | string[] | object
      if (returnObjects) return Array.isArray(res) ? res : []
      return typeof res === 'string' ? res : ''
    }
    if (obj?.id) {
      const res = i18next.t(keyPath, {
        ns: `projects/${obj.id}`,
        returnObjects,
      }) as string | string[] | object
      if (returnObjects) return Array.isArray(res) ? res : []
      return typeof res === 'string' ? res : ''
    }
  }

  if (returnObjects) {
    return Array.isArray(directValue) ? (directValue as string[]) : []
  }
  return typeof directValue === 'string' ? directValue : ''
}

export type I18nCompatContext = {
  locale: string
  setLocale: (lng: string) => void
  t: (namespace: string) => (key: string, options?: Record<string, unknown>) => string
  getProjectString: (obj: Record<string, unknown>, field: string) => string
  getProjectArray: (obj: Record<string, unknown>, field: string) => string[]
  loadProjectNamespace: (projectId: string) => Promise<void>
}

const I18nCompat = createContext<I18nCompatContext | null>(null)

export function TranslationProvider({
  children,
  locale,
  namespaces = ['projects'],
  initialResources,
}: {
  children: React.ReactNode
  locale: string
  namespaces?: string[]
  initialResources?: InitialTranslations
}) {
  const [currentLocale, setCurrentLocale] = useState(locale)
  const [loadedNamespacesVersion, setLoadedNamespacesVersion] = useState(0)
  const namespaceKey = namespaces.join('|')

  useEffect(() => {
    const requestedNamespaces = namespaceKey.split('|').filter(Boolean)
    ensureI18nInitialized(locale, requestedNamespaces, initialResources)
    setCurrentLocale(locale)
  }, [locale, namespaceKey, initialResources])

  useEffect(() => {
    // Debounce: i18next fires 'loaded' once per namespace, so a 7-namespace locale
    // switch would trigger 7 sequential re-renders. Collapse them into one.
    let timer: ReturnType<typeof setTimeout>
    const bumpLoadedNamespaces = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setLoadedNamespacesVersion((version) => version + 1), 80)
    }

    i18next.on('loaded', bumpLoadedNamespaces)
    i18next.on('languageChanged', bumpLoadedNamespaces)

    return () => {
      i18next.off('loaded', bumpLoadedNamespaces)
      i18next.off('languageChanged', bumpLoadedNamespaces)
      clearTimeout(timer)
    }
  }, [])

  const value = useMemo<I18nCompatContext>(() => {
    const compatT = (ns: string) => (key: string, options?: Record<string, unknown>) =>
      String(i18next.t(key, { ns, ...options }))

    return {
      locale: currentLocale,
      setLocale: (lng: string) => {
        setCurrentLocale(lng)
        i18next.changeLanguage(lng)
      },
      t: compatT,
      getProjectString: (obj, field) =>
        resolveProjectField(obj, field, false) as string,
      getProjectArray: (obj, field) =>
        resolveProjectField(obj, field, true) as string[],
      loadProjectNamespace: async (projectId: string) => {
        const ns = `projects/${projectId}` as I18nNamespace
        if (!(PROJECT_I18N_NAMESPACES as readonly string[]).includes(ns)) return
        if (i18next.hasResourceBundle(currentLocale, ns)) return
        await i18next.loadNamespaces(ns)
        setLoadedNamespacesVersion((version) => version + 1)
      },
    }
  }, [currentLocale, loadedNamespacesVersion])

  return <I18nCompat.Provider value={value}>{children}</I18nCompat.Provider>
}

export function useI18n(): I18nCompatContext {
  const ctx = useContext(I18nCompat)
  if (!ctx) throw new Error('useI18n must be used within TranslationProvider')
  return ctx
}

export const useTranslation = useRT

export { I18N_NAMESPACES, CORE_I18N_NAMESPACES, PROJECT_I18N_NAMESPACES }
