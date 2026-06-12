'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CloudDownloadIcon, EyeIcon } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import CvFocusModal from '../cv/CvFocusModal'
import SystemeBackdrop from './SystemeBackdrop'
import { useMagnetic } from './useMagnetic'
import { useGsap, gsap, ScrollTrigger } from '../scroll/useGsap'

const TECH_TERMS = [
  'TypeScript/JavaScript', 'TypeScript', 'JavaScript', 'React', 'Next.js',
  'Tailwind CSS', 'Node.js', 'SQL/Postgres', 'SQL', 'Postgres', 'REST APIs',
  'Portugal',
]

/** Wrap known tech/country terms in an accent underline. */
function decorate(text: string) {
  const pattern = new RegExp(
    `(${TECH_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  )
  const out: (string | JSX.Element)[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(
      <span key={m.index} className="sys-accent font-medium decoration-[var(--sys-accent)]/40 underline underline-offset-4">
        {m[0]}
      </span>
    )
    last = pattern.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export default function SystemeHero({ started }: { started: boolean }) {
  const { locale, t } = useI18n()
  const th = t('hero')
  const cvPath = locale === 'pt' ? '/cv_pt.pdf' : '/cv_en.pdf'
  const [focusOpen, setFocusOpen] = useState(false)
  const [today, setToday] = useState('')

  const revealRef = useRef(0)
  const scrollRef = useRef(0)
  const downloadRef = useMagnetic<HTMLButtonElement>(0.35)
  const viewRef = useMagnetic<HTMLButtonElement>(0.35)

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        .format(new Date())
        .toUpperCase()
    )
  }, [])

  const cvEmbedSrc = useMemo(() => `${cvPath}#pagemode=none&navpanes=0&toolbar=0&zoom=page-width&view=FitH`, [cvPath])
  const intro = (th('intro1') || '').split('\n\n').filter((p) => p.trim())

  const scope = useGsap<HTMLElement>(
    (_self, el) => {
      // Pre-hide intro content so it doesn't flash before the preloader hands off.
      gsap.set('[data-line]', { yPercent: 110 })
      gsap.set('[data-hero-fade]', { opacity: 0, y: 24 })

      // Scroll handoff: feed the shader + parallax the name as the hero leaves.
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => { scrollRef.current = self.progress },
      })
      const name = el.querySelector('[data-hero-name]')
      if (name) {
        gsap.to(name, {
          yPercent: -22,
          opacity: 0.15,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
        })
      }
    },
    []
  )

  // Intro reveal once the preloader hands off.
  useEffect(() => {
    if (!started || !scope.current) return
    const el = scope.current
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.to('[data-line]', { yPercent: 0, duration: 1.1, stagger: 0.12 })
        .to('[data-hero-fade]', { y: 0, opacity: 1, duration: 0.8, stagger: 0.12 }, '-=0.6')
      gsap.to(revealRef, { current: 1, duration: 0.9, ease: 'power2.out' })
    }, el)
    return () => ctx.revert()
  }, [started, scope])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = cvPath
    link.download = 'Miguel_Lourenco_CV.pdf'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => document.body.removeChild(link), 100)
  }

  return (
    <section ref={scope} id="input" className="relative flex min-h-[100svh] items-center overflow-hidden">
      <SystemeBackdrop revealRef={revealRef} scrollRef={scrollRef} />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 pt-28 pb-20 lg:grid-cols-12 lg:gap-8 lg:px-10">
        {/* Name + status */}
        <div className="lg:col-span-7" data-hero-name>
          <h1 className="sys-display text-[clamp(2.6rem,8.4vw,7rem)] font-bold leading-[0.9] tracking-[-0.03em]">
            <span className="sys-mask"><span data-line>MIGUEL</span></span>
            <span className="sys-mask"><span data-line>LOUREN&Ccedil;O</span></span>
          </h1>
          <div data-hero-fade className="sys-mono mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em] text-[var(--sys-muted)]">
            <span className="flex items-center gap-2">
              <span className="sys-pulse inline-block h-2 w-2 rounded-full bg-[var(--sys-accent)]" />
              available for work
            </span>
            <span className="text-[var(--sys-line-2)]">/</span>
            <span>Full-stack developer</span>
            <span className="text-[var(--sys-line-2)]">/</span>
            <span>Portugal {today && <span className="text-[var(--sys-muted)]/70">· {today}</span>}</span>
          </div>
        </div>

        {/* Bio + CTAs */}
        <div className="flex flex-col gap-8 lg:col-span-5 lg:pt-6">
          <div data-hero-fade className="space-y-4 text-base leading-relaxed text-[var(--sys-text)]/80 sm:text-lg">
            {intro.map((p, i) => (
              <p key={i}>{decorate(p)}</p>
            ))}
          </div>
          <div data-hero-fade className="flex flex-wrap items-center gap-4">
            <button
              ref={downloadRef}
              onClick={handleDownload}
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--sys-accent)]/40 bg-[var(--sys-accent)]/10 px-6 py-3 text-sm font-medium text-[var(--sys-accent)] transition-colors hover:bg-[var(--sys-accent)]/20"
            >
              <span className="sys-mono uppercase tracking-wider">{th('ctaDownloadCv')}</span>
              <CloudDownloadIcon className="size-4" />
            </button>
            <button
              ref={viewRef}
              onClick={() => setFocusOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--sys-line-2)] px-6 py-3 text-sm text-[var(--sys-text)]/80 transition-colors hover:border-[var(--sys-text)]/40 hover:text-[var(--sys-text)]"
            >
              <span className="sys-mono uppercase tracking-wider">{th('ctaViewCv')}</span>
              <EyeIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div data-hero-fade className="sys-mono absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-[var(--sys-muted)]">
        scroll ↓
      </div>

      <CvFocusModal open={focusOpen} onClose={() => setFocusOpen(false)} cvPath={cvEmbedSrc} title={th('ctaViewCv')} />
    </section>
  )
}
