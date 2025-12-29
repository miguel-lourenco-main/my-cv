"use client";

import React, { useState } from "react";
import type { Project } from "./projects.types";
import { ProjectFocusCard } from "./ProjectFocusCard";
import { Reveal } from "../Reveal";
import type { ProjectScreenshotMode } from "./project-images";

/**
 * Grid layout component for displaying project cards.
 * Features staggered reveal animations and hover effects.
 * 
 * @param props - ProjectGrid component props
 * @param props.projects - Array of project data to display
 * @param props.onCardClick - Callback when a project card is clicked
 * @param props.onCursorModeChange - Optional callback for cursor mode changes
 * 
 * @example
 * ```tsx
 * <ProjectGrid 
 *   projects={projectsData} 
 *   onCardClick={(project) => setActiveProject(project)} 
 * />
 * ```
 */
export function ProjectGrid({
  projects,
  onCardClick,
  onCursorModeChange,
  screenshotMode = "dark",
}: {
  projects: Project[];
  onCardClick: (project: Project) => void;
  onCursorModeChange?: (mode: 'default' | 'view') => void;
  screenshotMode?: ProjectScreenshotMode;
}) {
  // Track which card is currently hovered for focus effects
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {projects.map((project, index) => (
        <Reveal key={project.id} type="slide" direction="up" delay={index * 0.06}>
          <ProjectFocusCard
            project={project}
            index={index}
            hovered={hovered}
            setHovered={setHovered}
            onClick={onCardClick}
            onCursorModeChange={onCursorModeChange}
            screenshotMode={screenshotMode}
          />
        </Reveal>
      ))}
    </div>
  );
}


