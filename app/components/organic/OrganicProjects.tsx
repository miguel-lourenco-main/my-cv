'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { useGsap, gsap } from '../scroll/useGsap'

const ProjectExpandedCard = dynamic(
  () => import('../projects/ProjectExpandedCard').then((m) => ({ default: m.ProjectExpandedCard })),
  { ssr: false }
)

const TYPE_LABEL: Record<string, string> = { personal: 'Personal', professional: 'Professional', hybrid: 'Hybrid' }

export default function OrganicProjects() {
  const { t, getProjectString, loadProjectNamespace } = useI18n()
  const tp = t('projects')
  const manifest = useProjectImagesManifest()
  const allProjects = useMemo(() => resolveProjectsWithImages(manifest), [manifest])

  const [screenshotMode] = useState<ProjectScreenshotMode>('dark')
  const [affiliation, setAffiliation] = useState<AffiliationFilterValue>(AFFILIATION_ALL)
  const [active, setActive] = useState<Project | null>(null)

  const companyOptions = useMemo(() => deriveCompanyFilterOptions(allProjects), [allProjects])
  const displayed = useMemo(
    () => sortProjects(filterProjectsByAffiliation(allProjects, affiliation), 'recent'),
    [allProjects, affiliation]
  )

  useEffect(() => {
    void Promise.all(displayed.map((p) => loadProjectNamespace(p.id))).catch(() => {})
  }, [displayed, loadProjectNamespace])

  const scope = useGsap<HTMLElement>(() => {
    gsap.from('[data-proj-head]', {
      opacity: 0, y: 30, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '[data-proj-head]', start: 'top 88%' },
    })
  }, [])

  // Re-animate cards whenever the filtered set changes.
  useEffect(() => {
    if (!scope.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-proj-card]', {
        opacity: 0, y: 40, filter: 'blur(8px)', duration: 0.7, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: '[data-proj-grid]', start: 'top 85%' },
      })
    }, scope.current)
    return () => ctx.revert()
  }, [displayed, scope])

  const filters: { id: AffiliationFilterValue; label: string }[] = [
    { id: AFFILIATION_ALL, label: 'All' },
    { id: AFFILIATION_PERSONAL, label: 'Personal' },
    ...companyOptions.map((c) => ({ id: c.id as AffiliationFilterValue, label: c.name })),
  ]

  const onOpen = useCallback((p: Project) => setActive(p), [])

  return (
    <section ref={scope} id="work" className="relative mx-auto max-w-6xl px-6 py-28 lg:py-32">
      <div data-proj-head className="mb-10">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-emerald-300/90">Selected work</p>
        <h2 className="org-display text-4xl font-semibold text-white sm:text-5xl">{tp('title')}</h2>
        <p className="mt-3 max-w-xl text-white/70">{tp('subtitle')}</p>

        <div className="mt-7 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={String(f.id)}
              onClick={() => setAffiliation(f.id)}
              className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                affiliation === f.id
                  ? 'org-glass text-white'
                  : 'border border-white/15 text-white/65 hover:border-white/30 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div data-proj-grid className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {displayed.map((p) => {
          const cover = getProjectCoverImageByMode(p.images, screenshotMode)
          const company = resolveCompanyFields(p.company)
          const meta = p.experience ? `${p.experience.org} · ${p.experience.date}` : company?.name ?? ''
          const title = getProjectString(p, 'title') || p.experience?.name || p.id
          const description = getProjectString(p, 'description')
          return (
            <button
              key={p.id}
              data-proj-card
              onClick={() => onOpen(p)}
              className="org-glass org-glass-hover group flex flex-col overflow-hidden rounded-3xl text-left"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={assetPath(cover)}
                    alt={title}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="org-gradient-fallback h-full w-full opacity-60" />
                )}
                <span className="absolute right-3 top-3 rounded-full bg-black/30 px-3 py-1 text-[11px] uppercase tracking-wider text-white/90 backdrop-blur">
                  {TYPE_LABEL[p.type]}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="org-display text-xl font-semibold text-white">{title}</h3>
                  <span className="shrink-0 text-xs text-white/50">{meta}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-white/65">{description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.technologies.slice(0, 5).map((tech) => (
                    <span key={tech.name} className="rounded-full border border-white/12 px-2.5 py-0.5 text-[11px] text-white/55">
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {active ? (
          <ProjectExpandedCard project={active} onClose={() => setActive(null)} screenshotMode={screenshotMode} />
        ) : null}
      </AnimatePresence>
    </section>
  )
}
