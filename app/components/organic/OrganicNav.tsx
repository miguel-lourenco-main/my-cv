'use client'

import { useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'
import { LOCALE_META } from '../../i18n'
import { useI18n } from '../../lib/i18n'
import { useOutsideClick } from '../../lib/hooks/use-outside-click'
import { useSmoothScroll } from '../scroll/SmoothScrollProvider'

function LangSwitch() {
  const router = useRouter()
  const pathname = usePathname()
  const { locale, setLocale } = useI18n()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick(ref, () => setOpen(false))
  const current = LOCALE_META.find((l) => l.code === locale) || LOCALE_META[0]

  const onSelect = (next: string) => {
    setOpen(false)
    if (next === locale) return
    setLocale(next)
    const seg = pathname.split('/').filter(Boolean)
    seg[0] = next
    const target = '/' + seg.join('/') + (pathname.endsWith('/') ? '/' : '')
    startTransition(() => router.replace(target))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
      >
        <Globe className="size-4" />
        {current.label}
      </button>
      {open && (
        <div className="org-glass absolute right-0 mt-3 w-44 overflow-hidden rounded-2xl">
          {LOCALE_META.map((l) => (
            <button
              key={l.code}
              onClick={() => onSelect(l.code)}
              className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10 ${
                l.code === locale ? 'text-white' : 'text-white/70'
              }`}
            >
              {l.label} · {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrganicNav() {
  const { scrollTo } = useSmoothScroll()
  return (
    <header className="fixed inset-x-0 top-4 z-40 px-4">
      <div className="org-glass mx-auto flex max-w-3xl items-center justify-between rounded-full px-5 py-2.5">
        <button onClick={() => scrollTo('#hero', { offset: 0 })} className="org-display text-base font-semibold text-white">
          Miguel<span className="text-emerald-300">.</span>
        </button>
        <nav className="flex items-center gap-5 text-sm text-white/80">
          <button onClick={() => scrollTo('#work', { offset: -40 })} className="hidden transition-colors hover:text-white sm:block">
            Work
          </button>
          <button onClick={() => scrollTo('#contact', { offset: -40 })} className="hidden transition-colors hover:text-white sm:block">
            Contact
          </button>
          <LangSwitch />
        </nav>
      </div>
    </header>
  )
}
