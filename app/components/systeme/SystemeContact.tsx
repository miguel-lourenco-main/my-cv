'use client'

import { useI18n } from '../../lib/i18n'
import { useGsap, gsap } from '../scroll/useGsap'

function GmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function GitlabIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="m23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0537.8585.8585 0 0 0-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 0 0 1.2197 0l1.4995-1.1321 2.4619-1.8633 5.006-3.7489.0125-.01a6.0682 6.0682 0 0 0 2.0094-7.003z" />
    </svg>
  )
}

const ENDPOINTS = [
  { method: 'POST', label: 'email', value: 'migasoulou@gmail.com', href: 'mailto:migasoulou@gmail.com', Icon: GmailIcon },
  { method: 'GET', label: 'linkedin', value: '/in/miguel-lourenço', href: 'https://www.linkedin.com/in/miguel-louren%C3%A7o-395335355/', Icon: LinkedInIcon },
  { method: 'GET', label: 'gitlab', value: '/miguel-lourenco-main', href: 'https://gitlab.com/miguel-lourenco-main', Icon: GitlabIcon },
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
                <e.Icon className="h-5 w-5 shrink-0 text-[var(--sys-muted)] transition-colors group-hover:text-[var(--sys-accent)]" />
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
        <span>© Miguel Lourenço</span>
        <span>built with Next.js · static export · WebGL</span>
      </footer>
      </div>
    </section>
  )
}
