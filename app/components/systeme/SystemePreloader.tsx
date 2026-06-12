'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../../lib/use-reduced-motion'

const SERVICES = ['frontend', 'backend', 'devops', 'testing', 'automation', 'ai']

// Locale navigation remounts the whole page (App Router keys pages by path),
// which would replay the boot sequence on every language switch. Module state
// survives client-side navigations, so the boot only plays once per session.
let hasBootedThisSession = false

/**
 * One-shot opt-out for the next full page load. The language switcher sets
 * this right before `location.assign`, so a locale change doesn't replay the
 * boot sequence — while a normal visit or manual refresh still gets it.
 */
export const SKIP_BOOT_KEY = 'sys:skip-boot'

function consumeSkipBootFlag(): boolean {
  try {
    if (sessionStorage.getItem(SKIP_BOOT_KEY) === '1') {
      sessionStorage.removeItem(SKIP_BOOT_KEY)
      return true
    }
  } catch {}
  return false
}

/**
 * "System boot" preloader: a mono counter ticks 000→100 while the six skill
 * services come online, then the panel wipes up to reveal the hero. Skippable;
 * bypassed entirely on reduced-motion.
 */
export default function SystemePreloader({ onDone }: { onDone: () => void }) {
  const reducedMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const [gone, setGone] = useState(hasBootedThisSession)
  const done = useRef(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    hasBootedThisSession = true
    onDone()
    setGone(true)
  }

  useEffect(() => {
    if (hasBootedThisSession || consumeSkipBootFlag()) {
      finish()
      return
    }
    if (reducedMotion) {
      finish()
      return
    }
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const counter = { v: 0 }
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: finish })

      tl.to('[data-svc]', { opacity: 1, x: 0, duration: 0.4, stagger: 0.08 }, 0)
        .to('[data-ok]', { opacity: 1, duration: 0.2, stagger: 0.08 }, 0.25)
        .to('[data-bar]', { scaleX: 1, duration: 1.1, ease: 'power1.inOut' }, 0)
        .to(
          counter,
          {
            v: 100,
            duration: 1.1,
            ease: 'power1.inOut',
            onUpdate: () => {
              if (counterRef.current) counterRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0')
            },
          },
          0
        )
        .to('[data-boot]', { opacity: 0, y: -10, duration: 0.4 }, '+=0.15')
        .to(root, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.1')
    }, root)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion])

  if (gone) return null

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[60] flex flex-col justify-between bg-[var(--sys-bg)] p-6 lg:p-10"
    >
      {/* top: booting services */}
      <div data-boot className="flex items-start justify-between">
        <ul className="space-y-1.5">
          {SERVICES.map((s) => (
            <li
              key={s}
              data-svc
              className="sys-mono flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[var(--sys-muted)] opacity-0"
              style={{ transform: 'translateX(-8px)' }}
            >
              <span className="text-[var(--sys-line-2)]">init</span>
              <span className="text-[var(--sys-text)]/70">{s}</span>
              <span data-ok className="sys-accent opacity-0">ok</span>
            </li>
          ))}
        </ul>
        <button
          onClick={finish}
          className="sys-mono text-[10px] uppercase tracking-[0.3em] text-[var(--sys-muted)] transition-colors hover:text-[var(--sys-text)]"
        >
          skip ↵
        </button>
      </div>

      {/* bottom: counter + bar */}
      <div data-boot>
        <div className="mb-3 h-px w-full bg-[var(--sys-line)]">
          <div data-bar className="h-px w-full origin-left bg-[var(--sys-accent)]" style={{ transform: 'scaleX(0)' }} />
        </div>
        <div className="flex items-end justify-between">
          <span className="sys-display text-[clamp(2rem,6vw,4rem)] font-bold tracking-tight text-[var(--sys-text)]">
            MIGUEL LOURENÇO
          </span>
          <span ref={counterRef} className="sys-mono text-sm text-[var(--sys-muted)]">
            000
          </span>
        </div>
      </div>
    </div>
  )
}
