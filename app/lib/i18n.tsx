"use client"

import { useI18n as useCompat, TranslationProvider } from "../i18n/TranslationProvider"

// Backwards-compatible re-exports so existing imports keep working during migration
export { TranslationProvider }
export const useI18n = useCompat
