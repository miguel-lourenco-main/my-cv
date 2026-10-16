'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'motion/react'
import useEmblaCarousel from 'embla-carousel-react'
import { useI18n } from '../../lib/i18n'
import { useProjectImagesManifest } from '../../lib/project-images-context'
import { resolveProjectsWithImages } from '../projects/projects.data'
import type { Project } from '../projects/projects.types'
import { filterProjectImagesByMode, type ProjectScreenshotMode } from '../projects/project-images'
import { getFeaturedProjects } from '../projects/project-browse'
import { assetPath } from '../../lib/asset-path'
import { useGsap, gsap, ScrollTrigger } from '../scroll/useGsap'

const ProjectExpandedCard = dynamic(
  () => import('../projects/ProjectExpandedCard').then((m) => ({ default: m.ProjectExpandedCard })),
  { ssr: false }
)

const SCREENSHOT_MODE: ProjectScreenshotMode = 'dark'

/**
 * "03.1 / OUTPUT — Featured": the hand-picked projects (FEATURED_PROJECT_IDS),
 * each given a full-width showcase row — a large media viewer next to the
 * project's story (subtitle, overview, stack, links) — ahead of the full
 * horizontal project track. Rows alternate media left / right on desktop.
 */
export default function SystemeFeatured() {
  const { t, getProjectString, loadProjectNamespace } = useI18n()
  const tp = t('projects')
  const tn = t('navigation')
  const manifest = useProjectImagesManifest()
  const featured = useMemo(() => getFeaturedProjects(resolveProjectsWithImages(manifest)), [manifest])
  const [active, setActive] = useState<Project | null>(null)

  useEffect(() => {
    void Promise.all(featured.map((p) => loadProjectNamespace(p.id))).catch(() => {})
  }, [featured, loadProjectNamespace])

  // This section mounts lazily above the pinned project track, which shifts
  // the track down: re-measure every ScrollTrigger once it is in the layout.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 150)
    return () => window.clearTimeout(id)
  }, [featured.length])

  const scope = useGsap<HTMLElement>(() => {
    gsap.utils.toArray<HTMLElement>('[data-featured-row]').forEach((row) => {
      gsap.from(row, {
        y: 48,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: { trigger: row, start: 'top 85%' },
      })
    })
  }, [featured.length])

  if (featured.length === 0) return null

  return (
    <section ref={scope} id="output" className="relative bg-[var(--sys-bg)]">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-24 lg:px-10 lg:pt-32">
        <header className="mb-14 max-w-2xl">
          <div className="sys-mono mb-2 text-[11px] uppercase tracking-[0.3em] text-[var(--sys-muted)]">
            03.1 / <span className="sys-accent">{tn('sections.output')}</span>
          </div>
          <h2 className="sys-display text-3xl font-semibold tracking-tight sm:text-4xl">{tp('featured.title')}</h2>
          <p className="mt-3 text-[var(--sys-text)]/60">{tp('featured.lead')}</p>
        </header>

        <div className="flex flex-col gap-24 lg:gap-32">
          {featured.map((p, i) => (
            <FeaturedRow
              key={p.id}
              project={p}
              index={i}
              total={featured.length}
              reverse={i % 2 === 1}
              title={getProjectString(p, 'title') || p.experience?.name || p.id}
              subtitle={getProjectString({ ...p.details, id: p.id }, 'subtitle')}
              overview={
                getProjectString({ ...p.details, id: p.id }, 'overview') || getProjectString(p, 'description')
              }
              onOpen={setActive}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active ? (
          <ProjectExpandedCard project={active} onClose={() => setActive(null)} screenshotMode={SCREENSHOT_MODE} />
        ) : null}
      </AnimatePresence>
    </section>
  )
}

function FeaturedRow({
  project,
  index,
  total,
  reverse,
  title,
  subtitle,
  overview,
  onOpen,
}: {
  project: Project
  index: number
  total: number
  reverse: boolean
  title: string
  subtitle: string
  overview: string
  onOpen: (p: Project) => void
}) {
  const { t } = useI18n()
  const tp = t('projects')
  const meta = project.experience ? `${project.experience.org} · ${project.experience.date}` : ''

  return (
    <article data-featured-row className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
      <div className={`lg:col-span-7 ${reverse ? 'lg:order-2' : ''}`}>
        <FeaturedMedia images={project.images} title={title} />
      </div>

      <div className={`lg:col-span-5 ${reverse ? 'lg:order-1' : ''}`}>
        <div className="flex items-baseline gap-3">
          <span className="sys-mono text-xs text-[var(--sys-muted)]">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="sys-mono text-[10px] uppercase tracking-wider text-[var(--sys-accent)]/80">
            {tp(`type.${project.type}`)}
          </span>
        </div>
        <h3 className="sys-display mt-2 flex items-center gap-3 text-3xl font-medium tracking-tight sm:text-4xl">
          {project.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={assetPath(project.logo)} alt="" className="size-8 object-contain" />
          )}
          {title}
        </h3>
        {subtitle && <p className="mt-2 text-[var(--sys-text)]/80">{subtitle}</p>}
        {overview && <p className="mt-4 text-sm leading-relaxed text-[var(--sys-text)]/55">{overview}</p>}
        {meta && (
          <div className="sys-mono mt-5 text-[11px] uppercase tracking-wider text-[var(--sys-muted)]">{meta}</div>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <span
              key={tech.name}
              className="sys-mono rounded border border-[var(--sys-line)] px-2 py-0.5 text-[10px] text-[var(--sys-text)]/50"
            >
              {tech.name}
            </span>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onOpen(project)}
            className="sys-mono rounded-full border border-[var(--sys-accent)]/50 bg-[var(--sys-accent)]/10 px-4 py-2 text-[11px] uppercase tracking-wider text-[var(--sys-accent)] transition-colors hover:bg-[var(--sys-accent)]/20"
          >
            {tp('featured.details')}
          </button>
          {project.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sys-mono rounded-full border border-[var(--sys-line)] px-4 py-2 text-[11px] uppercase tracking-wider text-[var(--sys-muted)] transition-colors hover:border-[var(--sys-text)]/30 hover:text-[var(--sys-text)]"
            >
              {tp('dialog.visit')} ↗
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

/** Large media viewer: one big slide at a time plus a thumbnail strip. */
function FeaturedMedia({ images, title }: { images: string[]; title: string }) {
  const { t } = useI18n()
  const tp = t('projects')
  const slides = useMemo(() => filterProjectImagesByMode(images, SCREENSHOT_MODE), [images])
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  const go = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  if (slides.length === 0) {
    return <div className="sys-grid-bg aspect-[16/10] w-full rounded-lg border border-[var(--sys-line)] opacity-40" />
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-lg border border-[var(--sys-line)] bg-[var(--sys-panel)]">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {slides.map((src, i) => (
              <div key={src} className="aspect-[16/10] min-w-0 flex-[0_0_100%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assetPath(src)}
                  alt={`${title} — ${tp('carousel.slide', { n: i + 1 })}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="h-full w-full object-cover object-top"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
        {slides.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label={tp('carousel.previousImage')}
              className="sys-mono rounded border border-white/10 bg-black/50 px-2.5 py-1 text-xs text-[var(--sys-text)]/80 backdrop-blur hover:text-[var(--sys-text)]"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label={tp('carousel.nextImage')}
              className="sys-mono rounded border border-white/10 bg-black/50 px-2.5 py-1 text-xs text-[var(--sys-text)]/80 backdrop-blur hover:text-[var(--sys-text)]"
            >
              →
            </button>
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {slides.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              aria-label={tp('carousel.goToSlide', { n: i + 1 })}
              aria-current={i === selected}
              className={`h-12 w-20 shrink-0 overflow-hidden rounded border transition-opacity ${
                i === selected
                  ? 'border-[var(--sys-accent)]/70 opacity-100'
                  : 'border-[var(--sys-line)] opacity-50 hover:opacity-80'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assetPath(src)} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
