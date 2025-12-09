import fs from 'node:fs/promises'
import path from 'node:path'
import { defaultLocale, locales } from '../i18n'

/**
 * Server-side utility to retrieve the navigation greeting text for a given locale.
 * Reads the greeting from the locale-specific navigation.json file.
 * 
 * @param locale - The locale string (e.g., 'en', 'pt'). If invalid or undefined, falls back to defaultLocale.
 * @returns Promise that resolves to the greeting string, or empty string if not found or on error.
 * 
 * @example
 * ```ts
 * const greeting = await getNavigationGreeting('en');
 * // Returns greeting from public/locales/en/navigation.json
 * ```
 */
export async function getNavigationGreeting(locale: string | undefined): Promise<string> {
  // Validate locale and fallback to default if invalid
  const effectiveLocale = locales.includes((locale as any)) ? (locale as any) : defaultLocale
  const filePath = path.join(process.cwd(), 'public', 'locales', effectiveLocale, 'navigation.json')
  
  try {
    const file = await fs.readFile(filePath, 'utf8')
    const json = JSON.parse(file)
    const value = json?.greeting
    // Validate that greeting is a non-empty string
    if (typeof value === 'string' && value.length > 0) return value
  } catch {
    // Silently handle file read errors or invalid JSON
  }
  return ''
}


