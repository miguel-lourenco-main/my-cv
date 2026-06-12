'use client'

import { useI18n } from '../../lib/i18n'
import { useGsap, gsap } from '../scroll/useGsap'

const ENDPOINTS = [
  { method: 'POST', label: 'email', value: 'migasoulou@gmail.com', href: 'mailto:migasoulou@gmail.com' },
  { method: 'GET', label: 'linkedin', value: '/in/miguel-lourenço', href: 'https://www.linkedin.com/in/miguel-louren%C3%A7o-395335355/' },
  { method: 'GET', label: 'gitlab', value: '/miguel-lourenco-main', href: 'https://gitlab.com/miguel-lourenco-main' },
]

/**
 * "04 · ENDPOINT" — the contact close. Social links become mono request rows
 * (POST /email, GET /linkedin) that complete the pipeline metaphor.
 */
export default function SystemeContact() {
  const { t } = useI18n()
  const tc = t('contact')

  const scope = useGsap<HTMLElement>((_self) => {
    gsap.from('[data-contact-line]', {
      yPercent: 110,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: { trigger: '#endpoint', start: 'top 70%' },
    })
    gsap.from('[data-endpoint]', {
      opacity: 0,
      x: -16,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: '[data-endpoint-list]', start: 'top 85%' },
    })
  }, [])

  return (
    <section ref={scope} id="endpoint" className="relative bg-[var(--sys-bg)]">
      <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-40">
      <div className="sys-mono mb-6 text-[11px] uppercase tracking-[0.3em] text-[var(--sys-muted)]">
        04 / <span className="sys-accent">endpoint</span>
      </div>

      <h2 className="sys-display max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
        <span className="sys-mask"><span data-contact-line>{tc('title')}</span></span>
      </h2>
      <p className="mt-6 max-w-xl text-[var(--sys-text)]/60">{tc('subtitle')}</p>

      <ul data-endpoint-list className="mt-14 max-w-2xl divide-y divide-[var(--sys-line)] border-y border-[var(--sys-line)]">
        {ENDPOINTS.map((e) => (
          <li key={e.label} data-endpoint>
            <a
              href={e.href}
              target={e.href.startsWith('http') ? '_blank' : undefined}
              rel={e.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group flex items-center justify-between gap-4 py-5 transition-colors hover:bg-white/[0.02]"
            >
              <span className="flex items-center gap-4">
                <span className="sys-mono w-12 text-[11px] font-semibold text-[var(--sys-accent)]">{e.method}</span>
                <span className="sys-display text-xl tracking-tight text-[var(--sys-text)] sm:text-2xl">/{e.label}</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="sys-mono hidden text-xs text-[var(--sys-muted)] sm:inline">{e.value}</span>
                <span className="text-[var(--sys-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--sys-accent)]">
                  ↗
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <footer className="sys-mono mt-20 flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[0.25em] text-[var(--sys-muted)]">
        <span>© {new Date().getFullYear()} Miguel Lourenço</span>
        <span>built with Next.js · static export · WebGL</span>
      </footer>
      </div>
    </section>
  )
}
