'use client'

import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ProjectGrid } from './projects/ProjectGrid'
import { projects as projectsData } from './projects/projects.data'
import type { Project } from './projects/projects.types'
import { ProjectExpandedCard } from './projects/ProjectExpandedCard'
import { Reveal, RevealStagger } from './Reveal'
import { useI18n } from '../lib/i18n'
import type { ProjectScreenshotMode } from './projects/project-images'
import { Sun, Moon } from 'lucide-react'

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
  const [screenshotMode, setScreenshotMode] =
    useState<ProjectScreenshotMode>("dark");

  // Persist screenshot mode across sessions.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("project-screenshot-mode");
      // Migrate "auto" to "dark" (default theme)
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
          <div className="mt-5 flex items-center justify-center">
            <ScreenshotModeButton
              mode={screenshotMode}
              onModeChange={setScreenshotMode}
              t={t}
            />
          </div>
        </RevealStagger>
      </div>

      <div className={isLaptop ? "flex-1 min-h-0" : ""}>
        <Reveal type="fade">
          <ProjectGrid
            projects={projectsData}
            onCardClick={(project) => setActiveProject(project)}
            onCursorModeChange={onCursorModeChange}
            screenshotMode={screenshotMode}
          />
        </Reveal>
      </div>

      {/* Animated modal for expanded project details */}
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

/**
 * Icon button that cycles through screenshot modes: light <-> dark
 */
function ScreenshotModeButton({
  mode,
  onModeChange,
  t,
}: {
  mode: ProjectScreenshotMode;
  onModeChange: (mode: ProjectScreenshotMode) => void;
  t: ReturnType<typeof useI18n>['t'];
}) {
  const tp = t('projects');
  
  const cycleMode = () => {
    onModeChange(mode === "light" ? "dark" : "light");
  };

  const getIcon = () => {
    return mode === "light" ? <Sun className="size-5" /> : <Moon className="size-5" />;
  };

  const getTitle = () => {
    return mode === "light" ? tp("screenshots.light") : tp("screenshots.dark");
  };

  return (
    <button
      type="button"
      onClick={cycleMode}
      className="inline-flex items-center justify-center size-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      title={getTitle()}
      aria-label={getTitle()}
    >
      {getIcon()}
    </button>
  );
}