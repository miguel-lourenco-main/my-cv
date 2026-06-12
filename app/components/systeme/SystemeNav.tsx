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
    const segments = pathname.split('/').filter(Boolean)
    segments[0] = next
    const target = '/' + segments.join('/') + (pathname.endsWith('/') ? '/' : '')
    startTransition(() => router.replace(target))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="sys-mono flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[var(--sys-muted)] transition-colors hover:text-[var(--sys-text)]"
      >
        LANG / <span className="text-[var(--sys-text)]">{current.label}</span>
        <span className="text-[var(--sys-muted)]">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-40 border border-[var(--sys-line)] bg-[var(--sys-panel)]">
          {LOCALE_META.map((l) => (
            <button
              key={l.code}
              onClick={() => onSelect(l.code)}
              className={`sys-mono block w-full px-3 py-2 text-left text-[11px] uppercase tracking-wider transition-colors hover:bg-white/5 ${
                l.code === locale ? 'text-[var(--sys-accent)]' : 'text-[var(--sys-muted)]'
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

export default function SystemeNav() {
  const { scrollTo } = useSmoothScroll()

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-[100rem] items-center justify-between px-6 py-5 lg:px-10">
        <button
          onClick={() => scrollTo('#input', { offset: 0 })}
          className="sys-mono text-xs font-semibold uppercase tracking-[0.25em] text-[var(--sys-text)]"
        >
          ML<span className="sys-accent">.</span>
          <span className="ml-2 hidden text-[var(--sys-muted)] sm:inline">/ portfolio</span>
        </button>
        <nav className="flex items-center gap-6">
          <button
            onClick={() => scrollTo('#output', { offset: -40 })}
            className="sys-mono hidden text-[11px] uppercase tracking-[0.2em] text-[var(--sys-muted)] transition-colors hover:text-[var(--sys-text)] sm:block"
          >
            Work
          </button>
          <button
            onClick={() => scrollTo('#endpoint', { offset: -40 })}
            className="sys-mono hidden text-[11px] uppercase tracking-[0.2em] text-[var(--sys-muted)] transition-colors hover:text-[var(--sys-text)] sm:block"
          >
            Contact
          </button>
          <LangSwitch />
        </nav>
      </div>
    </header>
  )
}
