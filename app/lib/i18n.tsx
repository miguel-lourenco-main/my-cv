"use client"

import { useI18n as useCompat, TranslationProvider } from "../i18n/TranslationProvider"

/**
 * Backwards-compatible re-exports for i18n functionality.
 * Maintains existing import paths during migration to new TranslationProvider system.
 */

/**
 * Translation context provider component.
 * Wraps the app to provide translation functionality to child components.
 */
export { TranslationProvider }

/**
 * Hook to access translation functions and current locale.
 * Provides t() function for translations and locale information.
 * 
 * @returns Object with t function for translations and locale string
 * 
 * @example
 * ```tsx
 * const { t, locale } = useI18n();
 * const title = t('hero.title');
 * ```
 */
export const useI18n = useCompat
