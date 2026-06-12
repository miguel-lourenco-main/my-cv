'use client'

import { useEffect, useState } from 'react'
import { useSmoothScroll } from '../scroll/SmoothScrollProvider'

const SECTIONS = [
  { id: 'input', label: 'INPUT' },
  { id: 'architecture', label: 'ARCHITECTURE' },
  { id: 'output', label: 'OUTPUT' },
  { id: 'endpoint', label: 'ENDPOINT' },
]

/**
 * Persistent left rail: the pipeline index (01–04) with the active layer lit in
 * accent and a scan line tracking overall scroll progress.
 */
export default function SystemeRail() {
  const { scroller, scrollTo } = useSmoothScroll()
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = scroller ?? document.getElementById('page-scroll-container')
    if (!el) return

    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? el.scrollTop / max : 0)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const idx = SECTIONS.findIndex((s) => s.id === entry.target.id)
          if (idx >= 0) setActive(idx)
        })
      },
      { root: el, rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    SECTIONS.forEach((s) => {
      const node = document.getElementById(s.id)
      if (node) io.observe(node)
    })

    return () => {
      el.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [scroller])

  return (
    <nav
      aria-label="Sections"
      className="pointer-events-none fixed left-0 top-0 z-40 hidden h-full w-16 flex-col items-center justify-center gap-10 lg:flex"
    >
      {/* scan track */}
      <div className="absolute left-8 top-[22%] h-[56%] w-px bg-[var(--sys-line)]">
        <div
          className="absolute left-0 top-0 w-px bg-[var(--sys-accent)] transition-[height] duration-150"
          style={{ height: `${progress * 100}%` }}
        />
        <div
          className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--sys-accent)] shadow-[0_0_8px_var(--sys-accent)] transition-[top] duration-150"
          style={{ top: `${progress * 100}%` }}
        />
      </div>

      <ul className="pointer-events-auto relative flex flex-col gap-9 pl-12">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <button
              onClick={() => scrollTo(`#${s.id}`, { offset: -40 })}
              className="group flex items-center gap-3"
            >
              <span
                className={`sys-mono text-[10px] tabular-nums transition-colors ${
                  i === active ? 'sys-accent' : 'text-[var(--sys-muted)]'
                }`}
              >
                0{i + 1}
              </span>
              <span
                className={`sys-mono text-[9px] uppercase tracking-[0.25em] transition-all ${
                  i === active
                    ? 'text-[var(--sys-text)] opacity-100'
                    : 'text-[var(--sys-muted)] opacity-0 group-hover:opacity-70'
                }`}
              >
                {s.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
