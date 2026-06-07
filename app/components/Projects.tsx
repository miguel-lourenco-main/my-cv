'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'motion/react'
import { ProjectGrid } from './projects/ProjectGrid'
import { resolveProjectsWithImages } from './projects/projects.data'
import type { Project } from './projects/projects.types'
import { Reveal, RevealStagger } from './Reveal'
import { useI18n } from '../lib/i18n'
import type { ProjectScreenshotMode } from './projects/project-images'
import { ProjectBrowseBar } from './projects/ProjectBrowseBar'
import { ScreenshotModeButton } from './projects/ScreenshotModeButton'
import { useProjectImagesManifest } from '../lib/project-images-context'
import {
  AFFILIATION_ALL,
  filterProjectsByAffiliation,
  sortProjects,
  type AffiliationFilterValue,
  type ProjectSortMode,
} from './projects/project-browse'

const ProjectExpandedCard = dynamic(
  () =>
    import('./projects/ProjectExpandedCard').then((mod) => ({
      default: mod.ProjectExpandedCard,
    })),
  { ssr: false }
)

export default function Projects({
  isLaptop = false,
  onCursorModeChange,
}: {
  isLaptop?: boolean;
  onCursorModeChange?: (mode: 'default' | 'view') => void;
}) {
  const { t, loadProjectNamespace } = useI18n()
  const tp = t('projects')
  const manifest = useProjectImagesManifest()
  const allProjects = useMemo(
    () => resolveProjectsWithImages(manifest),
    [manifest]
  )

  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [screenshotMode, setScreenshotMode] =
    useState<ProjectScreenshotMode>("dark");
  const [affiliationFilter, setAffiliationFilter] =
    useState<AffiliationFilterValue>(AFFILIATION_ALL);
  const [sortMode, setSortMode] = useState<ProjectSortMode>("recent");

  const displayedProjects = useMemo(() => {
    const filtered = filterProjectsByAffiliation(allProjects, affiliationFilter)
    return sortProjects(filtered, sortMode)
  }, [allProjects, affiliationFilter, sortMode]);

  useEffect(() => {
    void Promise.all(displayedProjects.map((project) => loadProjectNamespace(project.id)))
  }, [displayedProjects, loadProjectNamespace])

  const handleCardClick = useCallback((project: Project) => {
    setActiveProject(project)
  }, [])

  const browseReset = () => {
    setAffiliationFilter(AFFILIATION_ALL)
    setSortMode("recent")
    setActiveProject(null)
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("project-screenshot-mode");
      if (raw === "light" || raw === "dark") {
        setScreenshotMode(raw);
      } else if (raw === "auto") {
        setScreenshotMode("dark");
        localStorage.setItem("project-screenshot-mode", "dark");
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("project-screenshot-mode", screenshotMode);
    } catch {
      // ignore
    }
  }, [screenshotMode]);

  const sectionClasses = [
    "max-w-[98%] xl:max-w-7xl 3xl:max-w-10xl w-full mx-auto",
    isLaptop ? "flex-1 snap-start flex flex-col pt-16 pb-[40rem]" : ""
  ].filter(Boolean).join(" ");

  return (
    <section id="projects" className={sectionClasses}>
      <div className={isLaptop ? "flex-shrink-0 mb-6" : ""}>
        <RevealStagger className={`text-center ${isLaptop ? "my-8" : "mb-16"}`} delay={0.05} interval={0.06}>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {tp('title')}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {tp('subtitle')}
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-0">
            <div className="flex items-center justify-center">
              <ScreenshotModeButton
                mode={screenshotMode}
                onModeChange={setScreenshotMode}
                getLabel={(key) => String(tp(key))}
              />
            </div>
            <ProjectBrowseBar
              projects={allProjects}
              affiliation={affiliationFilter}
              onAffiliationChange={(next) => {
                setAffiliationFilter(next)
                setActiveProject(null)
              }}
              sortMode={sortMode}
              onSortModeChange={(mode) => {
                setSortMode(mode)
                setActiveProject(null)
              }}
            />
          </div>
        </RevealStagger>
      </div>

      <div className={isLaptop ? "flex-1 min-h-0" : ""}>
        <Reveal type="fade">
          {displayedProjects.length === 0 ? (
            <p className="mx-auto max-w-md text-center text-slate-600 dark:text-slate-400">
              {tp("filters.empty")}
              {" "}
              <button
                type="button"
                onClick={browseReset}
                className="font-medium text-slate-900 underline decoration-slate-400 underline-offset-2 hover:decoration-slate-600 dark:text-white dark:decoration-slate-500 dark:hover:decoration-slate-300"
              >
                {tp("filters.resetBrowse")}
              </button>
            </p>
          ) : (
            <ProjectGrid
              projects={displayedProjects}
              onCardClick={handleCardClick}
              onCursorModeChange={onCursorModeChange}
              screenshotMode={screenshotMode}
            />
          )}
        </Reveal>
      </div>

      <AnimatePresence>
        {activeProject ? (
          <ProjectExpandedCard
            project={activeProject}
            onClose={() => setActiveProject(null)}
            screenshotMode={screenshotMode}
          />
        ) : null}
      </AnimatePresence>
    </section>
  )
}
