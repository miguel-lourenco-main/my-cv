'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDownToLine, Eye } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import CvFocusModal from '../cv/CvFocusModal'
import { useMagnetic } from './useMagnetic'
import { useGsap, gsap } from '../scroll/useGsap'

export default function OrganicHero({ started }: { started: boolean }) {
  const { locale, t } = useI18n()
  const th = t('hero')
  const cvPath = locale === 'pt' ? '/cv_pt.pdf' : '/cv_en.pdf'
  const [focusOpen, setFocusOpen] = useState(false)
  const downloadRef = useMagnetic<HTMLButtonElement>(0.3)
  const viewRef = useMagnetic<HTMLButtonElement>(0.3)

  const cvEmbedSrc = useMemo(
    () => `${cvPath}#pagemode=none&navpanes=0&toolbar=0&zoom=page-width&view=FitH`,
    [cvPath]
  )
  const intro = (th('intro1') || '').split('\n\n').filter((p) => p.trim())[0] || ''

  const scope = useGsap<HTMLElement>((_self) => {
    gsap.set('[data-org-in]', { opacity: 0, y: 40, filter: 'blur(12px)' })
  }, [])

  useEffect(() => {
    if (!started || !scope.current) return
    const ctx = gsap.context(() => {
      gsap.to('[data-org-in]', {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.12,
      })
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

  return (
    <section ref={scope} id="hero" className="relative flex min-h-[100svh] items-center justify-center px-6 py-28">
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <span
          data-org-in
          className="org-glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[var(--org-text)]/90"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
          available for work
        </span>

        <h1
          data-org-in
          className="org-display text-[clamp(3rem,10vw,8rem)] font-semibold leading-[0.95] text-white"
          style={{ textShadow: '0 4px 40px rgba(0,0,0,0.45)' }}
        >
          Miguel
          <br />
          Lourenço
        </h1>

        <p data-org-in className="mt-6 text-lg text-white/80 sm:text-xl" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}>
          Full-stack developer · Portugal
        </p>

        <p
          data-org-in
          className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
        >
          {intro}
        </p>

        <div data-org-in className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            ref={downloadRef}
            onClick={handleDownload}
            className="org-glass org-glass-hover inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white"
          >
            {th('ctaDownloadCv')}
            <ArrowDownToLine className="size-4" />
          </button>
          <button
            ref={viewRef}
            onClick={() => setFocusOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm text-white/90 transition-colors hover:bg-white/10"
          >
            {th('ctaViewCv')}
            <Eye className="size-4" />
          </button>
        </div>
      </div>

      <div data-org-in className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-white/50">
        scroll ↓
      </div>

      <CvFocusModal open={focusOpen} onClose={() => setFocusOpen(false)} cvPath={cvEmbedSrc} title={th('ctaViewCv')} />
    </section>
  )
}
