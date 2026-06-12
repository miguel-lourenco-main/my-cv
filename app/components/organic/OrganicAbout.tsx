'use client'

import { CATEGORY_CARDS } from '../categories/category-cards.config'
import { useI18n } from '../../lib/i18n'
import { useGsap, gsap } from '../scroll/useGsap'

/** Skill categories as frosted glass cards floating over the gradient. */
export default function OrganicAbout() {
  const { t } = useI18n()
  const tc = t('categories')

  const scope = useGsap<HTMLElement>(() => {
    gsap.from('[data-org-card]', {
      opacity: 0,
      y: 50,
      filter: 'blur(10px)',
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: '[data-org-grid]', start: 'top 80%' },
    })
    gsap.from('[data-org-head]', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: '[data-org-head]', start: 'top 88%' },
    })
  }, [])

  return (
    <section ref={scope} id="about" className="relative mx-auto max-w-6xl px-6 py-28 lg:py-40">
      <div data-org-head className="mb-14 max-w-2xl">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-emerald-300/90">What I do</p>
        <h2 className="org-display text-4xl font-semibold text-white sm:text-5xl">
          A full stack, end to end
        </h2>
        <p className="mt-4 text-white/70">
          From interface and motion to APIs, data, and AI orchestration — six layers I design and ship across.
        </p>
      </div>

      <div data-org-grid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_CARDS.map((c) => (
          <article
            key={c.key}
            data-org-card
            className="org-glass org-glass-hover flex flex-col rounded-3xl p-7"
          >
            <div className="mb-5 flex h-12 items-center gap-3">{c.renderIcons()}</div>
            <h3 className="org-display text-xl font-semibold text-white">{tc(c.titleKey)}</h3>
            <ul className="mt-3 space-y-1.5">
              {c.items.map((item) => (
                <li key={item} className="text-sm text-white/65">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
