"use client";

import { useRef, useState, useTransition } from 'react'
import { useI18n } from '../lib/i18n'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDownIcon, GlobeIcon } from 'lucide-react'
import { useOutsideClick } from '../lib/hooks/use-outside-click'

/**
 * Available locales configuration.
 */
const LOCALES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'es', label: 'ES', name: 'Español' }
]

/**
 * Language switcher dropdown component.
 * Allows users to change the application locale.
 * Updates the URL path to reflect the selected locale.
 * 
 * @example
 * ```tsx
 * <LanguageSwitcher />
 * ```
 */
export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const { locale, setLocale, t } = useI18n()
  // Track navigation transition state
  const [isPending, startTransition] = useTransition()

  // Dropdown open/close state
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  // Close dropdown when clicking outside
  useOutsideClick(menuRef, () => setOpen(false))

  /**
   * Handle locale selection and update URL path.
   * Replaces the locale segment in the current pathname.
   */
  const onSelect = (next: string) => {
    if (next === locale) return
    setOpen(false)
    setLocale(next)
    // Update URL path with new locale
    const segments = pathname.split('/').filter(Boolean)
    segments[0] = next
    const target = '/' + segments.join('/') + (pathname.endsWith('/') ? '/' : '')
    startTransition(() => {
      router.replace(target)
    })
  }

  const currentLocale = LOCALES.find(l => l.code === locale) || LOCALES[0]

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-sm font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
        aria-label={t('navigation')('languageSwitcher')}
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
      >
        <GlobeIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLocale.label}</span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-40 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md z-50">
          <ul className="py-1">
            {LOCALES.map((l) => (
              <li key={l.code}>
                <button
                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${l.code === locale ? 'font-bold' : ''}`}
                  onClick={() => onSelect(l.code)}
                >
                  {l.label} – {l.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}


