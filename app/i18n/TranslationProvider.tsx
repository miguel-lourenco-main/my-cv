'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import i18next from 'i18next'
import { initReactI18next, useTranslation as useRT } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import { locales as supportedLocales } from '../i18n'

let initialized = false

const DEFAULT_NAMESPACES = [
  'navigation',
  'footer',
  'categories',
  'hero',
  'about',
  'projects',
  'contact',
  'projects/ui-components',
  'projects/sonora',
  'projects/agentic-hub',
  'projects/cash-register',
]

function ensureI18nInitialized(locale: string, namespaces: string[]) {
  if (!initialized) {
    i18next
      .use(initReactI18next)
      .use(HttpBackend)
      .init({
        lng: locale,
        fallbackLng: 'en',
        supportedLngs: Array.from(supportedLocales),
        ns: Array.from(new Set([...(namespaces || []), ...DEFAULT_NAMESPACES])),
        defaultNS: 'projects',
        interpolation: { escapeValue: false },
        backend: { loadPath: '../locales/{{lng}}/{{ns}}.json' },
        react: { useSuspense: false },
        returnEmptyString: false,
      })
    initialized = true
  } else {
    if (i18next.language !== locale) {
      i18next.changeLanguage(locale)
    }
  }
}

export type I18nCompatContext = {
  locale: string
  setLocale: (lng: string) => void
  t: (namespace: string) => (key: string, options?: Record<string, any>) => any
  getProjectString: (obj: any, field: string) => string
  getProjectArray: (obj: any, field: string) => string[]
}

const I18nCompat = createContext<I18nCompatContext | null>(null)

export function TranslationProvider({
  children,
  locale,
  namespaces = ['projects'],
}: {
  children: React.ReactNode
  locale: string
  namespaces?: string[]
}) {
  const [currentLocale, setCurrentLocale] = useState(locale)

  useEffect(() => {
    ensureI18nInitialized(locale, namespaces)
    setCurrentLocale(locale)
  }, [locale, namespaces.join('|')])

  const value = useMemo<I18nCompatContext>(() => {
    const compatT = (ns: string) => (key: string, options?: Record<string, any>) => i18next.t(key, { ns, ...options })

    const getProjectString = (obj: any, field: string): string => {
      const keyField = `${field}Key`
      const directValue = obj?.[field]
      const keyPath = obj?.[keyField]

      if (typeof keyPath === 'string' && keyPath.length > 0) {
        // Support keys like 'projects.uiComponents.title' -> map to ns 'projects/ui-components' and key 'title'
        if (keyPath.startsWith('projects.')) {
          const parts = keyPath.split('.')
          const projId = parts[1]
          const localKey = parts.slice(2).join('.') || field
          return i18next.t(localKey, { ns: `projects/${projId}` }) as string
        }
        // Support bare 'title' style keys when id is present
        if (obj?.id) {
          return i18next.t(keyPath, { ns: `projects/${obj.id}` }) as string
        }
      }
      return typeof directValue === 'string' ? directValue : ''
    }

    const getProjectArray = (obj: any, field: string): string[] => {
      const keyField = `${field}Keys`
      const arrayValue = obj?.[field]
      const keyPath = obj?.[keyField]

      if (typeof keyPath === 'string' && keyPath.length > 0) {
        if (keyPath.startsWith('projects.')) {
          const parts = keyPath.split('.')
          const projId = parts[1]
          const localKey = parts.slice(2).join('.') || field
          const res = i18next.t(localKey, { ns: `projects/${projId}`, returnObjects: true }) as any
          return Array.isArray(res) ? res : []
        }
        const res = i18next.t(keyPath, { ns: `projects/${obj?.id ?? ''}`, returnObjects: true }) as any
        return Array.isArray(res) ? res : []
      }
      return Array.isArray(arrayValue) ? arrayValue : []
    }

    return {
      locale: currentLocale,
      setLocale: (lng: string) => {
        setCurrentLocale(lng)
        i18next.changeLanguage(lng)
      },
      t: compatT,
      getProjectString,
      getProjectArray,
    }
  }, [currentLocale])

  return <I18nCompat.Provider value={value}>{children}</I18nCompat.Provider>
}

export function useI18n(): I18nCompatContext {
  const ctx = useContext(I18nCompat)
  if (!ctx) throw new Error('useI18n must be used within TranslationProvider')
  return ctx
}

export const useTranslation = useRT

