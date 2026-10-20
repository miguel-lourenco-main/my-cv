'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'motion/react'
import useEmblaCarousel from 'embla-carousel-react'
import { useI18n } from '../../lib/i18n'
import { useProjectImagesManifest } from '../../lib/project-images-context'
import { resolveProjectsWithImages } from '../projects/projects.data'
import type { Project, ProjectVideo } from '../projects/projects.types'
import { filterProjectImagesByMode, type ProjectScreenshotMode } from '../projects/project-images'
import { getFeaturedProjects } from '../projects/project-browse'
import { assetPath } from '../../lib/asset-path'
import { useGsap, gsap, ScrollTrigger } from '../scroll/useGsap'
import { useReducedMotion } from '../../lib/use-reduced-motion'

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
        <FeaturedMedia images={project.images} video={project.video} title={title} />
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

/**
 * Tracks whether `ref`'s element is on screen. `seen` latches once it has been,
 * so heavy media can wait for the first view and then stay loaded.
 */
function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) setSeen(true)
      },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return { ref, inView, seen }
}

type FeaturedSlide = { kind: 'video' } | { kind: 'image'; src: string }

/**
 * Large media viewer: one big slide at a time plus a thumbnail strip.
 *
 * When the project has a `video` it is slide 1, ahead of the screenshots. The
 * video is not requested until the viewer first scrolls into view (the poster
 * stands in until then), then plays muted and looped while its slide is
 * selected and on screen, and pauses otherwise. With `prefers-reduced-motion`
 * the slide is the static poster instead; the dialog still has the video.
 */
function FeaturedMedia({ images, video, title }: { images: string[]; video?: ProjectVideo; title: string }) {
  const { t } = useI18n()
  const tp = t('projects')
  const reducedMotion = useReducedMotion()
  const shots = useMemo(() => filterProjectImagesByMode(images, SCREENSHOT_MODE), [images])
  const slides = useMemo<FeaturedSlide[]>(
    () => [...(video ? [{ kind: 'video' as const }] : []), ...shots.map((src) => ({ kind: 'image' as const, src }))],
    [video, shots]
  )
  // No poster of its own: fall back to the first screenshot, so the frame
  // isn't blank before the video loads (or at all, with reduced motion).
  const poster = video?.poster ?? shots[0]
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selected, setSelected] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { ref: viewRef, inView, seen } = useInView<HTMLDivElement>()
  const playVideo = Boolean(video) && !reducedMotion && seen

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  // Play only while the video slide is selected and the viewer is on screen.
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (selected === 0 && inView && !userPaused) {
      void el.play().catch(() => {
        /* autoplay blocked: the play button still starts it */
      })
    } else {
      el.pause()
    }
  }, [selected, inView, userPaused, playVideo])

  const go = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  if (slides.length === 0) {
    return <div className="sys-grid-bg aspect-[16/10] w-full rounded-lg border border-[var(--sys-line)] opacity-40" />
  }

  return (
    <div ref={viewRef}>
      <div className="relative overflow-hidden rounded-lg border border-[var(--sys-line)] bg-[var(--sys-panel)]">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {slides.map((slide, i) =>
              slide.kind === 'video' && video ? (
                <div key="video" className="aspect-[16/10] min-w-0 flex-[0_0_100%] bg-black">
                  {playVideo ? (
                    <video
                      ref={videoRef}
                      poster={poster ? assetPath(poster) : undefined}
                      muted
                      loop
                      playsInline
                      preload="auto"
                      aria-label={`${title} — ${tp('carousel.video')}`}
                      className="h-full w-full object-cover object-top"
                    >
                      {video.sources?.map((s) => (
                        <source key={s.src} src={assetPath(s.src)} type={s.type} />
                      ))}
                      <source src={assetPath(video.src)} />
                    </video>
                  ) : poster ? (
                    // Before first view, and always with reduced motion: a still.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={assetPath(poster)}
                      alt={`${title} — ${tp('carousel.video')}`}
                      decoding="async"
                      className="h-full w-full object-cover object-top"
                    />
                  ) : null}
                </div>
              ) : slide.kind === 'image' ? (
                <div key={slide.src} className="aspect-[16/10] min-w-0 flex-[0_0_100%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={assetPath(slide.src)}
                    alt={`${title} — ${tp('carousel.slide', { n: i + 1 })}`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              ) : null
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
        {playVideo && selected === 0 && (
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? tp('carousel.playVideo') : tp('carousel.pauseVideo')}
            className="sys-mono absolute bottom-3 left-3 rounded border border-white/10 bg-black/50 px-2.5 py-1 text-xs text-[var(--sys-text)]/80 backdrop-blur hover:text-[var(--sys-text)]"
          >
            {userPaused ? '▶' : '❚❚'}
          </button>
        )}
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
          {slides.map((slide, i) => {
            const thumb = slide.kind === 'video' ? poster : slide.src
            return (
              <button
                key={slide.kind === 'video' ? 'video' : slide.src}
                type="button"
                onClick={() => go(i)}
                aria-label={slide.kind === 'video' ? tp('carousel.goToVideo') : tp('carousel.goToSlide', { n: i + 1 })}
                aria-current={i === selected}
                className={`relative h-12 w-20 shrink-0 overflow-hidden rounded border bg-black transition-opacity ${
                  i === selected
                    ? 'border-[var(--sys-accent)]/70 opacity-100'
                    : 'border-[var(--sys-line)] opacity-50 hover:opacity-80'
                }`}
              >
                {thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={assetPath(thumb)} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
                )}
                {slide.kind === 'video' && !reducedMotion && (
                  // A play triangle marks the video's thumbnail, as in the dialog's dots.
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-white/90" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
