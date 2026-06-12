'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { assetPath } from '../../lib/asset-path'
import { useI18n } from '../../lib/i18n'
import CvFocusModal from '../cv/CvFocusModal'
import { previewBus, previewOpenBus, type PreviewEvent } from './preview-events'

// ── Dimensions ───────────────────────────────────────────────────────────────
const CV     = { w: 280, h: Math.round(280 * 297 / 210) } // 280 × 396  compact portrait
const SS     = { w: 300, h: Math.round(300 * 9  / 16)  } // 300 × 169  compact landscape

const CV_EXP = { w: 600, h: Math.round(600 * 297 / 210) } // 600 × 848  expanded portrait
const SS_EXP = { w: 700, h: Math.round(700 * 9  / 16)  } // 700 × 394  expanded landscape

// ── Easing / timing tokens ───────────────────────────────────────────────────
const E_MORPH    = 'steps(6)'    // CV ↔ screenshot mode switch — brutalist discrete
const E_EXPAND   = 'power3.out'  // hover expand — smooth deceleration
const E_COLLAPSE = 'power2.in'   // hover collapse — smooth acceleration into rest
const D_MORPH    = 0.32
const D_EXPAND   = 0.55
const D_COL      = 0.40

// x-offset placing right edge 24 px from viewport right.
// Panel is anchored at CSS left:50% + GSAP xPercent:-50, so x=0 → true viewport centre.
const compactX = (w: number) =>
  window.innerWidth / 2 - 24 - w / 2

// ─────────────────────────────────────────────────────────────────────────────
export default function BrutalistPreview() {
  const { locale, t } = useI18n()
  const [cvFocusOpen, setCvFocusOpen] = useState(false)

  const panelRef  = useRef<HTMLDivElement>(null)
  const cvAreaRef = useRef<HTMLDivElement>(null)
  const ssAreaRef = useRef<HTMLDivElement>(null)
  const imgRef    = useRef<HTMLImageElement>(null)
  const labelRef  = useRef<HTMLSpanElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const modeRef     = useRef<'cv' | 'ss'>('cv')
  const projectRef  = useRef<string | null>(null)
  const expandedRef = useRef(false)
  const timerRef    = useRef<gsap.core.Tween | null>(null)

  // ── CV iframe — lazy-loaded to not compete with initial page render ─────
  const cvSrc =
    assetPath(locale === 'pt' ? '/cv_pt.pdf' : '/cv_en.pdf') +
    '#pagemode=none&navpanes=0&toolbar=0&view=FitH'

  useEffect(() => {
    // Set src after first paint so it doesn't block SSR/initial render.
    // Runs again on locale change to reload the correct PDF.
    if (iframeRef.current) iframeRef.current.src = cvSrc
  }, [cvSrc])

  // ── content swap ────────────────────────────────────────────────────────
  const showCvContent = useCallback(() => {
    const cv = cvAreaRef.current
    const ss = ssAreaRef.current
    if (!cv || !ss) return

    gsap.to(ss, {
      opacity: 0, duration: 0.1, ease: 'steps(2)',
      onComplete: () => { ss.style.display = 'none' },
    })
    cv.style.display = 'block'
    gsap.fromTo(cv, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'steps(3)', delay: 0.08 })
    if (labelRef.current) labelRef.current.textContent = 'cat cv.pdf'
  }, [])

  const showSsContent = useCallback((cover: string, title: string) => {
    const cv  = cvAreaRef.current
    const ss  = ssAreaRef.current
    const img = imgRef.current
    if (!cv || !ss || !img) return

    img.src = assetPath(cover)
    gsap.to(cv, {
      opacity: 0, duration: 0.1, ease: 'steps(2)',
      onComplete: () => { cv.style.display = 'none' },
    })
    ss.style.display = 'block'
    gsap.fromTo(ss, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'steps(3)', delay: 0.08 })
    if (labelRef.current) {
      const slug = title.slice(0, 24).toLowerCase().replace(/\s+/g, '-')
      labelRef.current.textContent = `preview --${slug}`
    }
  }, [])

  // ── morph (dimension + content) ─────────────────────────────────────────
  const morphCv = useCallback(() => {
    modeRef.current = 'cv'
    const dims = expandedRef.current ? CV_EXP : CV
    gsap.to(panelRef.current, {
      x: compactX(dims.w), width: dims.w, height: dims.h,
      duration: D_MORPH, ease: E_MORPH, overwrite: 'auto',
    })
    showCvContent()
  }, [showCvContent])

  const morphSs = useCallback((cover: string, title: string) => {
    modeRef.current = 'ss'
    const dims = expandedRef.current ? SS_EXP : SS
    gsap.to(panelRef.current, {
      x: compactX(dims.w), width: dims.w, height: dims.h,
      duration: D_MORPH, ease: E_MORPH, overwrite: 'auto',
    })
    showSsContent(cover, title)
  }, [showSsContent])

  // ── event bus ────────────────────────────────────────────────────────────
  const handleEvent = useCallback((event: PreviewEvent) => {
    timerRef.current?.kill()
    timerRef.current = null
    projectRef.current = event.id
    morphSs(event.cover, event.title)
  }, [morphSs])

  // Click opens whatever is being previewed: the in-site CV focus modal in CV
  // mode, the project expanded card in screenshot mode.
  const onPanelClick = useCallback(() => {
    if (modeRef.current === 'cv') {
      setCvFocusOpen(true)
    } else if (projectRef.current) {
      previewOpenBus.emit(projectRef.current)
    }
  }, [])

  useEffect(() => {
    previewBus.on(handleEvent)
    return () => previewBus.off(handleEvent)
  }, [handleEvent])

  // ── initialise & panel hover ──────────────────────────────────────────────
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    // Position: centred vertically at right edge via transform only.
    // Using left:50% anchor in CSS so x-offset arithmetic is simple.
    gsap.set(panel, { xPercent: -50, yPercent: -50, x: compactX(CV.w), width: CV.w, height: CV.h })

    const onEnter = () => {
      timerRef.current?.kill()
      timerRef.current = null
      expandedRef.current = true
      const exp = modeRef.current === 'cv' ? CV_EXP : SS_EXP
      // Right edge stays fixed — panel expands leftward
      gsap.to(panel, {
        x: compactX(exp.w), width: exp.w, height: exp.h,
        duration: D_EXPAND, ease: E_EXPAND, overwrite: 'auto',
      })
    }

    const onLeave = () => {
      expandedRef.current = false
      const compact = modeRef.current === 'cv' ? CV : SS
      gsap.to(panel, {
        x: compactX(compact.w), width: compact.w, height: compact.h,
        duration: D_COL, ease: E_COLLAPSE, overwrite: 'auto',
      })
      // Content stays — only the hero IntersectionObserver reverts to CV
    }

    panel.addEventListener('mouseenter', onEnter)
    panel.addEventListener('mouseleave', onLeave)

    // Revert to CV when hero section scrolls back into view
    const hero = document.getElementById('index')
    let obs: IntersectionObserver | undefined
    if (hero && typeof IntersectionObserver !== 'undefined') {
      obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && modeRef.current !== 'cv' && !expandedRef.current) {
          timerRef.current = gsap.delayedCall(0.3, morphCv)
        }
      }, { threshold: 0.4, root: document.getElementById('page-scroll-container') })
      obs.observe(hero)
    }

    return () => {
      panel.removeEventListener('mouseenter', onEnter)
      panel.removeEventListener('mouseleave', onLeave)
      obs?.disconnect()
    }
  }, [morphCv])

  return (
    <>
    <div
      ref={panelRef}
      aria-hidden="true"
      onClick={onPanelClick}
      // will-change:transform → compositor layer; x-offset animation runs on GPU
      style={{ willChange: 'transform' }}
      className="pointer-events-auto fixed left-1/2 top-1/2 z-50 hidden cursor-pointer flex-col overflow-hidden br-border bg-[var(--br-paper)] shadow-2xl sm:flex"
    >
      {/* Terminal header */}
      <div className="br-border-b flex shrink-0 items-center gap-1 bg-[var(--br-ink)] px-3 py-1.5 text-[10px] uppercase text-[var(--br-paper)]">
        <span className="text-[var(--br-accent)]">$</span>
        <span ref={labelRef} className="truncate">cat cv.pdf</span>
      </div>

      {/* Content layer — CV and screenshot share the same slot */}
      <div className="relative min-h-0 flex-1">
        {/* CV iframe — src set lazily after 1.5 s (see useEffect) */}
        <div ref={cvAreaRef} className="absolute inset-0">
          {/* pointer-events:none so clicks reach the panel, not the PDF viewer */}
          <iframe
            ref={iframeRef}
            title="CV Preview"
            src=""
            className="pointer-events-none h-full w-full border-0 bg-white"
          />
        </div>

        {/* Project screenshot */}
        <div
          ref={ssAreaRef}
          className="absolute inset-0 bg-[var(--br-ink)]"
          style={{ display: 'none' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src=""
            alt=""
            aria-hidden="true"
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      {/* Bottom bar — brutalist info strip */}
      <div className="br-border-t flex shrink-0 items-center justify-between px-3 py-1 text-[9px] uppercase opacity-60">
        <span>hover: expand · click: open</span>
        <span className="text-[var(--br-accent)]">■</span>
      </div>
    </div>

    {/* In-site PDF view — sibling of the panel: fixed positioning breaks inside
        the GSAP-transformed panel */}
    <CvFocusModal
      open={cvFocusOpen}
      onClose={() => setCvFocusOpen(false)}
      cvPath={cvSrc}
      title={t('hero')('ctaViewCv')}
    />
    </>
  )
}
