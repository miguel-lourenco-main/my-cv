'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ProjectGrid } from './projects/ProjectGrid'
import { projects as projectsData } from './projects/projects.data'
import type { Project } from './projects/projects.types'
import { ProjectExpandedCard } from './projects/ProjectExpandedCard'

export default function Projects() {
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  return (
    <section id="projects" className="py-20">
      <div className="max-w-3xl xl:max-w-7xl 3xl:max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Projects
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Here are some of the projects I've worked on. Each project represents a learning journey and showcases different skills.
          </p>
        </div>

        <ProjectGrid
          projects={projectsData}
          onCardClick={(project) => setActiveProject(project)}
        />

        <AnimatePresence>
          {activeProject ? (
            <ProjectExpandedCard
              project={activeProject}
              onClose={() => setActiveProject(null)}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  )
}