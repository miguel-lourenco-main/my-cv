'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ProjectGrid } from './projects/ProjectGrid'
import { projects as projectsData } from './projects/projects.data'
import type { Project } from './projects/projects.types'
import { ProjectExpandedCard } from './projects/ProjectExpandedCard'
import { Reveal, RevealStagger } from './Reveal'
import { useI18n } from '../lib/i18n'

/**
 * Projects section component displaying a grid of project cards.
 * Features expandable project details modal and responsive layout.
 * Supports laptop-specific snap scrolling behavior.
 * 
 * @param props - Component props
 * @param props.isLaptop - Whether device is detected as laptop (affects layout and snap scrolling)
 * @param props.onCursorModeChange - Optional callback when cursor mode changes (for custom cursor effects)
 * 
 * @example
 * ```tsx
 * <Projects isLaptop={false} onCursorModeChange={(mode) => console.log(mode)} />
 * ```
 */
export default function Projects({ 
  isLaptop = false,
  onCursorModeChange,
}: { 
  isLaptop?: boolean;
  onCursorModeChange?: (mode: 'default' | 'view') => void;
}) {
  const { t } = useI18n()
  const tp = t('projects')
  // Track which project card is currently expanded
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  // Build section classes with conditional laptop styling
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
        </RevealStagger>
      </div>

      <div className={isLaptop ? "flex-1 min-h-0" : ""}>
        <Reveal type="fade">
          <ProjectGrid
            projects={projectsData}
            onCardClick={(project) => setActiveProject(project)}
            onCursorModeChange={onCursorModeChange}
          />
        </Reveal>
      </div>

      {/* Animated modal for expanded project details */}
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