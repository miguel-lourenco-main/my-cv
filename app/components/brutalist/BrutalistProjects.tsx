'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
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
import { useGsap, gsap } from '../scroll/useGsap'
import { previewBus, previewOpenBus } from './preview-events'

const ProjectExpandedCard = dynamic(
  () => import('../projects/ProjectExpandedCard').then((m) => ({ default: m.ProjectExpandedCard })),
  { ssr: false }
)

export default function BrutalistProjects() {
  const { t, getProjectString, loadProjectNamespace } = useI18n()
  const tp = t('projects')
  const manifest = useProjectImagesManifest()
  const allProjects = useMemo(() => resolveProjectsWithImages(manifest), [manifest])

  const [screenshotMode] = useState<ProjectScreenshotMode>('light')
  const [affiliation, setAffiliation] = useState<AffiliationFilterValue>(AFFILIATION_ALL)
  const [active, setActive] = useState<Project | null>(null)

  const companyOptions = useMemo(() => deriveCompanyFilterOptions(allProjects), [allProjects])
  const displayed = useMemo(
    () => sortProjects(filterProjectsByAffiliation(allProjects, affiliation), 'recent'),
    [allProjects, affiliation]
  )

  const coverMap = useMemo(
    () => Object.fromEntries(
      displayed.map((p) => [p.id, getProjectCoverImageByMode(p.images, screenshotMode)])
    ),
    [displayed, screenshotMode]
  )

  useEffect(() => {
    void Promise.all(displayed.map((p) => loadProjectNamespace(p.id))).catch(() => {})
  }, [displayed, loadProjectNamespace])

  const scope = useGsap<HTMLElement>(() => {
    gsap.from('[data-prow]', {
      opacity: 0, x: -16, duration: 0.3, ease: 'steps(3)', stagger: 0.05,
      scrollTrigger: { trigger: '[data-ptable]', start: 'top 82%' },
    })
  }, [])

  const onRowEnter = useCallback((id: string, cover: string | null, title: string) => {
    if (cover) previewBus.emit({ type: 'show-ss', id, cover, title })
  }, [])

  // Preview panel clicked while showing a project → open its expanded card
  useEffect(() => {
    const openFromPreview = (id: string) => {
      const project = allProjects.find((p) => p.id === id)
      if (project) setActive(project)
    }
    previewOpenBus.on(openFromPreview)
    return () => previewOpenBus.off(openFromPreview)
  }, [allProjects])

  const filters: { id: AffiliationFilterValue; label: string }[] = [
    { id: AFFILIATION_ALL, label: 'all' },
    { id: AFFILIATION_PERSONAL, label: 'personal' },
    ...companyOptions.map((c) => ({ id: c.id as AffiliationFilterValue, label: c.name.toLowerCase() })),
  ]

  const onOpen = useCallback((p: Project) => setActive(p), [])

  return (
    <section ref={scope} id="output" className="br-border-b">
      <div className="br-border-b flex flex-wrap items-center justify-between gap-3 bg-[var(--br-ink)] px-4 py-3 text-[var(--br-paper)] sm:px-6">
        <span>
          <span className="text-[var(--br-accent)]">$</span> ./projects --list
          <span className="ml-3 opacity-60">{`// ${displayed.length} of ${allProjects.length}`}</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={String(f.id)}
              onClick={() => setAffiliation(f.id)}
              className={`border px-2 py-0.5 text-xs uppercase transition-colors ${
                affiliation === f.id
                  ? 'border-[var(--br-accent)] bg-[var(--br-accent)] text-[var(--br-ink)]'
                  : 'border-[var(--br-paper)]/40 hover:border-[var(--br-paper)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="br-border-b hidden grid-cols-12 gap-3 px-4 py-2 text-[11px] uppercase opacity-50 sm:grid sm:px-6">
        <span className="col-span-1">idx</span>
        <span className="col-span-4">project</span>
        <span className="col-span-3">org / year</span>
        <span className="col-span-3">stack</span>
        <span className="col-span-1 text-right">open</span>
      </div>

      <div data-ptable>
        {displayed.map((p, i) => {
          const company = resolveCompanyFields(p.company)
          const meta = p.experience ? `${p.experience.org} · ${p.experience.date}` : company?.name ?? ''
          const title = getProjectString(p, 'title') || p.experience?.name || p.id
          return (
            <button
              key={p.id}
              data-prow
              onClick={() => onOpen(p)}
              onMouseEnter={() => onRowEnter(p.id, coverMap[p.id] ?? null, title)}
              className="br-border-b grid w-full grid-cols-12 items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--br-ink)] hover:text-[var(--br-paper)] sm:px-6"
            >
              <span className="col-span-2 text-sm sm:col-span-1">{String(i + 1).padStart(2, '0')}</span>
              <div className="col-span-10 sm:col-span-4">
                <div className="text-lg font-bold uppercase">{title}</div>
                <div className="text-xs uppercase text-[var(--br-accent)]">{p.type}</div>
              </div>
              <span className="col-span-6 text-xs uppercase opacity-80 sm:col-span-3">{meta}</span>
              <span className="col-span-5 text-xs opacity-80 sm:col-span-3">
                {p.technologies.slice(0, 4).map((x) => x.name).join(' / ')}
              </span>
              <span className="col-span-1 text-right text-lg font-bold">→</span>
            </button>
          )
        })}
      </div>

      {active && (
        <ProjectExpandedCard project={active} onClose={() => setActive(null)} screenshotMode={screenshotMode} />
      )}
    </section>
  )
}
