'use client'

import { useI18n } from '../../lib/i18n'
import { useGsap, gsap } from '../scroll/useGsap'

const ROWS = [
  { flag: '--email', value: 'migasoulou@gmail.com', href: 'mailto:migasoulou@gmail.com' },
  { flag: '--linkedin', value: 'in/miguel-lourenço', href: 'https://www.linkedin.com/in/miguel-louren%C3%A7o-395335355/' },
  { flag: '--gitlab', value: 'gitlab.com/miguel-lourenco-main', href: 'https://gitlab.com/miguel-lourenco-main' },
]

export default function BrutalistContact() {
  const { t } = useI18n()
  const tc = t('contact')

  const scope = useGsap<HTMLElement>(() => {
    gsap.from('[data-c]', {
      opacity: 0, y: 16, duration: 0.35, ease: 'steps(3)', stagger: 0.08,
      scrollTrigger: { trigger: '#contact', start: 'top 78%' },
    })
  }, [])

  return (
    <section ref={scope} id="contact" className="br-grid">
      <div className="br-border-b bg-[var(--br-ink)] px-4 py-3 text-[var(--br-paper)] sm:px-6">
        <span className="text-[var(--br-accent)]">$</span> ./contact --init
      </div>

      <div className="px-4 py-16 sm:px-6 sm:py-24">
        <h2 data-c className="br-mono text-[clamp(2.2rem,8vw,6rem)] font-bold uppercase leading-[0.95]">
          {tc('title')}
        </h2>
        <p data-c className="mt-4 max-w-xl text-sm sm:text-base">
          <span className="text-[var(--br-accent)]"># </span>
          {tc('subtitle')}
        </p>

        <div data-c className="br-border mt-10 max-w-3xl">
          {ROWS.map((r, i) => (
            <a
              key={r.flag}
              href={r.href}
              target={r.href.startsWith('http') ? '_blank' : undefined}
              rel={r.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`group flex flex-wrap items-center justify-between gap-2 px-4 py-4 transition-colors hover:bg-[var(--br-ink)] hover:text-[var(--br-paper)] ${
                i < ROWS.length - 1 ? 'br-border-b' : ''
              }`}
            >
              <span className="text-sm font-bold uppercase">
                <span className="text-[var(--br-accent)]">contact</span> {r.flag}
              </span>
              <span className="text-sm">
                {r.value} <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </a>
          ))}
        </div>
      </div>

      <footer className="br-border-t flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11px] uppercase sm:px-6">
        <span>© {new Date().getFullYear()} miguel_lourenço</span>
        <span>build: next.js · static_export · exit 0</span>
      </footer>
    </section>
  )
}
