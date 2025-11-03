'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ProjectGrid } from './projects/ProjectGrid'
import { projects as projectsData } from './projects/projects.data'
import type { Project } from './projects/projects.types'
import { ProjectExpandedCard } from './projects/ProjectExpandedCard'
import { Reveal, RevealStagger } from './Reveal'
import { useI18n } from '../lib/i18n'

export default function Projects({ isLaptop = false }: { isLaptop?: boolean }) {
  const { t } = useI18n()
  const tp = t('projects')
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  const sectionClasses = [
    "max-w-[98%] xl:max-w-7xl 3xl:max-w-10xl w-full mx-auto",
    isLaptop ? "h-screen flex-none snap-center flex flex-col" : ""
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
        </RevealStagger>
      </div>

      <div className={isLaptop ? "flex-1 overflow-y-auto min-h-0" : ""}>
        <Reveal type="fade">
          <ProjectGrid
            projects={projectsData}
            onCardClick={(project) => setActiveProject(project)}
          />
        </Reveal>
      </div>

      <AnimatePresence>
        {activeProject ? (
          <ProjectExpandedCard
            project={activeProject}
            onClose={() => setActiveProject(null)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  )
}