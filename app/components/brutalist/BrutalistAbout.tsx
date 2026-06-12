'use client'

import { CATEGORY_CARDS } from '../categories/category-cards.config'
import { useI18n } from '../../lib/i18n'
import { useGsap, gsap } from '../scroll/useGsap'

/** "stack/" directory listing — six categories as terminal rows that type in. */
export default function BrutalistAbout() {
  const { t } = useI18n()
  const tc = t('categories')

  const scope = useGsap<HTMLElement>(() => {
    gsap.from('[data-row]', {
      opacity: 0,
      x: -12,
      duration: 0.3,
      ease: 'steps(3)',
      stagger: 0.08,
      scrollTrigger: { trigger: '[data-rows]', start: 'top 82%' },
    })
  }, [])

  return (
    <section ref={scope} id="stack" className="br-border-b">
      <div className="br-border-b bg-[var(--br-ink)] px-4 py-3 text-[var(--br-paper)] sm:px-6">
        <span className="text-[var(--br-accent)]">$</span> ls -la ./stack
        <span className="ml-3 opacity-60">{'// 6 modules'}</span>
      </div>

      <div data-rows>
        {CATEGORY_CARDS.map((c, i) => (
          <div
            key={c.key}
            data-row
            className="br-border-b grid grid-cols-12 items-center gap-3 px-4 py-5 transition-colors hover:bg-[rgba(255,59,0,0.06)] sm:px-6"
          >
            <div className="col-span-12 flex items-center gap-3 sm:col-span-3">
              <span className="text-xs text-[var(--br-accent)]">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-lg font-bold uppercase">{tc(c.titleKey)}/</span>
            </div>
            <div className="col-span-12 sm:col-span-6">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {c.items.map((item) => (
                  <span key={item} className="before:mr-1 before:text-[var(--br-accent)] before:content-['—']">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="col-span-12 flex sm:col-span-3 sm:justify-end">
              <div className="br-border flex min-h-[60px] items-center gap-2.5 bg-[rgba(13,13,13,0.5)] backdrop-blur-md px-3 py-2">
                {c.renderIcons()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
