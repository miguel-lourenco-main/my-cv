'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'motion/react'
import { useI18n } from '../../lib/i18n'
import { useProjectImagesManifest } from '../../lib/project-images-context'
import { resolveProjectsWithImages } from '../projects/projects.data'
import type { Project } from '../projects/projects.types'
import { getProjectCoverImageByMode, type ProjectScreenshotMode } from '../projects/project-images'
import {
  AFFILIATION_ALL,
  AFFILIATION_PERSONAL,
  deriveCompanyFilterOptions,
  filterProjectsByAffiliation,
  resolveCompanyFields,
  sortProjects,
  type AffiliationFilterValue,
} from '../projects/project-browse'
import { assetPath } from '../../lib/asset-path'
import { useGsap, gsap, ScrollTrigger } from '../scroll/useGsap'

const ProjectExpandedCard = dynamic(
  () => import('../projects/ProjectExpandedCard').then((m) => ({ default: m.ProjectExpandedCard })),
  { ssr: false }
)

const DEPLOY_LABEL: Record<string, string> = {
  gitlab_pages: 'GitLab Pages',
  vercel: 'Vercel',
  none: 'Private',
}

const TYPE_LABEL: Record<string, string> = {
  personal: 'Personal',
  professional: 'Professional',
  hybrid: 'Hybrid',
}

export default function SystemeProjects() {
  const { t, getProjectString, loadProjectNamespace } = useI18n()
  const tp = t('projects')
  const manifest = useProjectImagesManifest()
  const allProjects = useMemo(() => resolveProjectsWithImages(manifest), [manifest])

  const [screenshotMode] = useState<ProjectScreenshotMode>('dark')
  const [affiliation, setAffiliation] = useState<AffiliationFilterValue>(AFFILIATION_ALL)
  const [active, setActive] = useState<Project | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  const companyOptions = useMemo(() => deriveCompanyFilterOptions(allProjects), [allProjects])
  const displayed = useMemo(
    () => sortProjects(filterProjectsByAffiliation(allProjects, affiliation), 'recent'),
    [allProjects, affiliation]
  )

  useEffect(() => {
    // Guard: i18next may not be initialised on the very first tick.
    void Promise.all(displayed.map((p) => loadProjectNamespace(p.id))).catch(() => {})
  }, [displayed, loadProjectNamespace])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (hover: hover)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const trackRef = useRef<HTMLDivElement>(null)

  // Horizontal pinned scroll on desktop only.
  const scope = useGsap<HTMLElement>(
    (_self, el) => {
      if (!isDesktop) return
      const track = trackRef.current
      if (!track) return
      const getDistance = () => Math.max(0, track.scrollWidth - el.clientWidth)
      gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    },
    [isDesktop, displayed.length]
  )

  const filters: { id: AffiliationFilterValue; label: string }[] = [
    { id: AFFILIATION_ALL, label: 'All' },
    { id: AFFILIATION_PERSONAL, label: 'Personal' },
    ...companyOptions.map((c) => ({ id: c.id as AffiliationFilterValue, label: c.name })),
  ]

  const onOpen = useCallback((p: Project) => setActive(p), [])

  return (
    <section ref={scope} id="output" className="relative min-h-[100svh] bg-[var(--sys-bg)]">
      <div className="mx-auto max-w-7xl px-6 pt-24 lg:px-10 lg:pt-16">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <div className="sys-mono mb-2 text-[11px] uppercase tracking-[0.3em] text-[var(--sys-muted)]">
              03 / <span className="sys-accent">output</span>
            </div>
            <h2 className="sys-display text-3xl font-semibold tracking-tight sm:text-4xl">{tp('title')}</h2>
          </div>

          {/* filter strip */}
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={String(f.id)}
                onClick={() => setAffiliation(f.id)}
                className={`sys-mono rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-wider transition-colors ${
                  affiliation === f.id
                    ? 'border-[var(--sys-accent)]/50 bg-[var(--sys-accent)]/10 text-[var(--sys-accent)]'
                    : 'border-[var(--sys-line)] text-[var(--sys-muted)] hover:border-[var(--sys-text)]/30 hover:text-[var(--sys-text)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>
      </div>

      {/* Track: horizontal (desktop) / vertical stack (mobile) */}
      <div className={isDesktop ? 'overflow-hidden' : ''}>
        <div
          ref={trackRef}
          className={
            isDesktop
              ? 'flex w-max items-stretch gap-8 px-6 pb-16 lg:px-10'
              : 'flex flex-col gap-12 px-6 pb-20'
          }
        >
          {displayed.map((p, i) => (
            <ProjectSlide
              key={p.id}
              project={p}
              index={i}
              total={displayed.length}
              screenshotMode={screenshotMode}
              isDesktop={isDesktop}
              title={getProjectString(p, 'title') || p.experience?.name || p.id}
              description={getProjectString(p, 'description')}
              onOpen={onOpen}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active ? (
          <ProjectExpandedCard project={active} onClose={() => setActive(null)} screenshotMode={screenshotMode} />
        ) : null}
      </AnimatePresence>
    </section>
  )
}

function ProjectSlide({
  project,
  index,
  total,
  screenshotMode,
  isDesktop,
  title,
  description,
  onOpen,
}: {
  project: Project
  index: number
  total: number
  screenshotMode: ProjectScreenshotMode
  isDesktop: boolean
  title: string
  description: string
  onOpen: (p: Project) => void
}) {
  const cover = getProjectCoverImageByMode(project.images, screenshotMode)
  const company = resolveCompanyFields(project.company)
  const meta = project.experience
    ? `${project.experience.org} · ${project.experience.date}`
    : company?.name ?? ''

  return (
    <article
      className={
        isDesktop
          ? 'group flex w-[56vw] max-w-[50rem] shrink-0 flex-col'
          : 'group flex flex-col'
      }
    >
      <button
        onClick={() => onOpen(project)}
        className={`relative block w-full overflow-hidden rounded-lg border border-[var(--sys-line)] bg-[var(--sys-panel)] ${
          isDesktop ? 'h-[46vh]' : ''
        }`}
        style={isDesktop ? undefined : { aspectRatio: '16 / 10' }}
        aria-label={`Open ${title}`}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={assetPath(cover)}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover object-top opacity-90 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        ) : (
          <div className="sys-grid-bg h-full w-full opacity-40" />
        )}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
        <span className="sys-mono absolute right-4 top-4 rounded border border-white/10 bg-black/40 px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--sys-text)]/80 backdrop-blur">
          view ↗
        </span>
      </button>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="flex items-baseline gap-3">
            <span className="sys-mono text-xs text-[var(--sys-muted)]">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            {project.type && (
              <span className="sys-mono text-[10px] uppercase tracking-wider text-[var(--sys-accent)]/80">
                {TYPE_LABEL[project.type]}
              </span>
            )}
          </div>
          <h3 className="sys-display mt-1.5 text-2xl font-medium tracking-tight sm:text-3xl">{title}</h3>
          <p className="mt-2 max-w-xl text-sm text-[var(--sys-text)]/55">{description}</p>
        </div>
        <div className="md:col-span-5 md:text-right">
          <div className="sys-mono text-[11px] uppercase tracking-wider text-[var(--sys-muted)]">{meta}</div>
          {project.deployment && (
            <div className="sys-mono mt-1 text-[11px] text-[var(--sys-text)]/40">
              {DEPLOY_LABEL[project.deployment] ?? ''}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5 md:justify-end">
            {project.technologies.slice(0, 6).map((tech) => (
              <span
                key={tech.name}
                className="sys-mono rounded border border-[var(--sys-line)] px-2 py-0.5 text-[10px] text-[var(--sys-text)]/50"
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
