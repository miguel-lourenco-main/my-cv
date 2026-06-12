'use client'

import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../lib/i18n'
import CvFocusModal from '../cv/CvFocusModal'
import { useSmoothScroll } from '../scroll/SmoothScrollProvider'
import { useGsap, gsap } from '../scroll/useGsap'

export default function BrutalistHero({ started }: { started: boolean }) {
  const { locale, t } = useI18n()
  const th = t('hero')
  const { scrollTo } = useSmoothScroll()
  const cvPath = locale === 'pt' ? '/cv_pt.pdf' : '/cv_en.pdf'
  const [focusOpen, setFocusOpen] = useState(false)

  const cvEmbedSrc = useMemo(
    () => `${cvPath}#pagemode=none&navpanes=0&toolbar=0&zoom=page-width&view=FitH`,
    [cvPath]
  )
  const intro = (th('intro1') || '').split('\n\n').filter((p) => p.trim())[0] || ''

  const scope = useGsap<HTMLElement>(() => {
    gsap.set('[data-br-in]', { opacity: 0, y: 14 })
  }, [])

  useEffect(() => {
    if (!started || !scope.current) return
    const ctx = gsap.context(() => {
      gsap.to('[data-br-in]', { opacity: 1, y: 0, duration: 0.4, ease: 'steps(4)', stagger: 0.09 })
    }, scope.current)
    return () => ctx.revert()
  }, [started, scope])

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = cvPath
    a.download = 'Miguel_Lourenco_CV.pdf'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => document.body.removeChild(a), 100)
  }

  const NAV = [
    { n: '01', label: 'WORK', id: 'output' },
    { n: '02', label: 'STACK', id: 'stack' },
    { n: '03', label: 'CONTACT', id: 'contact' },
  ]

  return (
    <section ref={scope} id="index" className="br-grid br-border-b relative flex min-h-[100svh] flex-col">
      {/* meta bar */}
      <div className="br-border-b flex items-center justify-between px-4 py-2 text-[11px] uppercase sm:px-6">
        <span data-br-in>~/miguel-lourenco/index</span>
        <span data-br-in className="hidden sm:inline">lat 38.72 N · lon 9.14 W · Portugal</span>
        <span data-br-in>[ available=true ]</span>
      </div>

      {/* name block */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <p data-br-in className="mb-4 text-sm uppercase tracking-widest text-[var(--br-accent)]">
          &gt; full-stack developer
        </p>
        <h1 className="br-mono text-[clamp(2rem,9vw,7.5rem)] font-bold uppercase leading-[0.92]">
          <span data-br-in className="block">Miguel</span>
          <span data-br-in className="block">
            Lourenço<span className="br-caret align-baseline text-[var(--br-accent)]" />
          </span>
        </h1>

        <div data-br-in className="br-border mt-10 max-w-2xl p-4 text-sm leading-relaxed sm:text-base">
          <span className="text-[var(--br-accent)]">$</span> cat bio.txt
          <p className="mt-2">{intro}</p>
        </div>

        <div data-br-in className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={handleDownload}
            className="br-border bg-[var(--br-ink)] px-5 py-2.5 text-sm font-bold uppercase text-[var(--br-paper)] transition-colors hover:bg-[var(--br-accent)] hover:text-[var(--br-ink)]"
          >
            ↓ {th('ctaDownloadCv')}
          </button>
          <button
            onClick={() => setFocusOpen(true)}
            className="br-border px-5 py-2.5 text-sm font-bold uppercase transition-colors hover:bg-[var(--br-ink)] hover:text-[var(--br-paper)]"
          >
            ◳ {th('ctaViewCv')}
          </button>
        </div>
      </div>

      {/* command nav */}
      <div data-br-in className="br-border-t grid grid-cols-3">
        {NAV.map((item, i) => (
          <button
            key={item.id}
            onClick={() => scrollTo(`#${item.id}`, { offset: 0 })}
            className={`flex items-center justify-center gap-2 py-4 text-sm font-bold uppercase transition-colors hover:bg-[var(--br-ink)] hover:text-[var(--br-paper)] ${
              i < 2 ? 'br-border-r' : ''
            }`}
            style={i < 2 ? { borderRight: '2px solid var(--br-ink)' } : undefined}
          >
            <span className="text-[var(--br-accent)]">[{item.n}]</span> {item.label}
          </button>
        ))}
      </div>

      <CvFocusModal open={focusOpen} onClose={() => setFocusOpen(false)} cvPath={cvEmbedSrc} title={th('ctaViewCv')} />
    </section>
  )
}
