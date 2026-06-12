'use client'

import { useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
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
        className="text-xs font-bold uppercase hover:text-[var(--br-accent)]"
      >
        LANG=[{current.label}]
      </button>
      {open && (
        <div className="br-border absolute right-0 mt-2 w-44 bg-[var(--br-paper)]">
          {LOCALE_META.map((l) => (
            <button
              key={l.code}
              onClick={() => onSelect(l.code)}
              className={`block w-full px-3 py-2 text-left text-xs uppercase hover:bg-[var(--br-ink)] hover:text-[var(--br-paper)] ${
                l.code === locale ? 'text-[var(--br-accent)]' : ''
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

export default function BrutalistNav() {
  const { scrollTo } = useSmoothScroll()
  return (
    <header className="br-border-b fixed inset-x-0 top-0 z-40 bg-[var(--br-paper)]">
      <div className="flex items-center justify-between px-4 py-2.5 sm:px-6">
        <button onClick={() => scrollTo('#index', { offset: 0 })} className="text-sm font-bold uppercase">
          ML<span className="text-[var(--br-accent)]">::</span>portfolio
        </button>
        <div className="flex items-center gap-5">
          <button onClick={() => scrollTo('#output', { offset: 0 })} className="hidden text-xs font-bold uppercase hover:text-[var(--br-accent)] sm:block">
            WORK
          </button>
          <button onClick={() => scrollTo('#contact', { offset: 0 })} className="hidden text-xs font-bold uppercase hover:text-[var(--br-accent)] sm:block">
            CONTACT
          </button>
          <LangSwitch />
        </div>
      </div>
    </header>
  )
}
