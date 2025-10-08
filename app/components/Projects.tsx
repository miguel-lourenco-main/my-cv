'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ProjectGrid } from './projects/ProjectGrid'
import { projects as projectsData } from './projects/projects.data'
import type { Project } from './projects/projects.types'
import { ProjectExpandedCard } from './projects/ProjectExpandedCard'
import { Reveal, RevealStagger } from './Reveal'

export default function Projects() {
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  return (
    <section id="projects" className="max-w-[98%] xl:max-w-7xl 3xl:max-w-10xl size-full mx-auto">
      <RevealStagger className="text-center mb-16" delay={0.05} interval={0.06}>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Projects
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Here are some of the projects I've worked on.
        </p>
      </RevealStagger>

      <Reveal type="fade">
        <ProjectGrid
          projects={projectsData}
          onCardClick={(project) => setActiveProject(project)}
        />
      </Reveal>

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