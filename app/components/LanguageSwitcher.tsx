"use client";

import { useEffect, useRef, useState, useTransition } from 'react'
import { useI18n } from '../lib/i18n'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDownIcon, GlobeIcon } from 'lucide-react'
import { useOutsideClick } from '../lib/hooks/use-outside-click'

const LOCALES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'es', label: 'ES', name: 'Español' }
]

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const { locale, setLocale, t } = useI18n()
  const [isPending, startTransition] = useTransition()

  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useOutsideClick(menuRef, () => setOpen(false))

  const onSelect = (next: string) => {
    if (next === locale) return
    setOpen(false)
    setLocale(next)
    const segments = pathname.split('/').filter(Boolean)
    segments[0] = next
    const target = '/' + segments.join('/') + (pathname.endsWith('/') ? '/' : '')
    startTransition(() => {
      router.replace(target)
    })
  }

  const currentLocale = LOCALES.find(l => l.code === locale) || LOCALES[0]

  if (compact) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
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

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isPending}
        className="appearance-none bg-transparent border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1 pr-8 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent cursor-pointer"
        aria-label={t('navigation')('languageSwitcher')}
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} className="bg-white dark:bg-slate-900">
            {l.label} - {l.name}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
    </div>
  )
}


