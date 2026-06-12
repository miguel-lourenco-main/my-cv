'use client'

import { CATEGORY_CARDS } from '../categories/category-cards.config'
import { useI18n } from '../../lib/i18n'
import { useGsap, gsap } from '../scroll/useGsap'

/**
 * "02 · ARCHITECTURE" — the six skill categories reframed as a self-assembling
 * system stack. Each layer reveals on scroll while a connecting accent line
 * draws down through the stack.
 */
export default function SystemeAbout() {
  const { t } = useI18n()
  const tc = t('categories')

  const scope = useGsap<HTMLElement>((_self, el) => {
    const layers = gsap.utils.toArray<HTMLElement>('[data-layer]')
    layers.forEach((layer) => {
      gsap.from(layer, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'expo.out',
        scrollTrigger: { trigger: layer, start: 'top 88%' },
      })
    })
    const line = el.querySelector('[data-spine]')
    if (line) {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: { trigger: el.querySelector('[data-stack]'), start: 'top 70%', end: 'bottom 80%', scrub: true },
        }
      )
    }
  }, [])

  return (
    <section ref={scope} id="architecture" className="relative mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-40">
      <header className="mb-16 max-w-2xl">
        <div className="sys-mono mb-4 text-[11px] uppercase tracking-[0.3em] text-[var(--sys-muted)]">
          02 / <span className="sys-accent">architecture</span>
        </div>
        <h2 className="sys-display text-4xl font-semibold tracking-tight sm:text-5xl">The system behind the work</h2>
        <p className="mt-4 text-[var(--sys-text)]/60">
          Six layers I design and build across — from interface to infrastructure to AI orchestration.
        </p>
      </header>

      <div data-stack className="relative pl-6 sm:pl-10">
        {/* spine */}
        <div className="absolute left-0 top-2 h-[calc(100%-1rem)] w-px bg-[var(--sys-line)] sm:left-4">
          <div data-spine className="h-full w-px bg-[var(--sys-accent)]" />
        </div>

        <ul className="space-y-px">
          {CATEGORY_CARDS.map((c, i) => (
            <li
              key={c.key}
              data-layer
              className="group relative grid grid-cols-1 gap-4 border-b border-[var(--sys-line)] py-7 transition-colors hover:bg-white/[0.015] md:grid-cols-12 md:items-center md:gap-8"
            >
              {/* node dot */}
              <span className="absolute -left-[26px] top-9 hidden h-2 w-2 rounded-full bg-[var(--sys-line-2)] ring-4 ring-[var(--sys-bg)] transition-colors group-hover:bg-[var(--sys-accent)] sm:-left-[42px] sm:block" />
              <div className="md:col-span-4">
                <div className="flex items-baseline gap-3">
                  <span className="sys-mono text-[11px] text-[var(--sys-muted)]">0{i + 1}</span>
                  <h3 className="sys-display text-2xl font-medium tracking-tight sm:text-3xl">{tc(c.titleKey)}</h3>
                </div>
              </div>
              <div className="md:col-span-5">
                <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {c.items.map((item) => (
                    <li key={item} className="sys-mono text-xs text-[var(--sys-text)]/55">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-3 opacity-80 transition-opacity group-hover:opacity-100 md:col-span-3 md:justify-end">
                {c.renderIcons()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
