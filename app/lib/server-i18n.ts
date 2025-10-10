import fs from 'node:fs/promises'
import path from 'node:path'
import { defaultLocale, locales } from '../i18n'

export async function getNavigationGreeting(locale: string | undefined): Promise<string> {
  const effectiveLocale = locales.includes((locale as any)) ? (locale as any) : defaultLocale
  const filePath = path.join(process.cwd(), 'public', 'locales', effectiveLocale, 'navigation.json')
  try {
    const file = await fs.readFile(filePath, 'utf8')
    const json = JSON.parse(file)
    const value = json?.greeting
    if (typeof value === 'string' && value.length > 0) return value
  } catch {}
  return ''
}


