"use client";

import React, { useCallback, useState } from "react";
import type { Project } from "./projects.types";
import { ProjectFocusCard } from "./ProjectFocusCard";
import { Reveal } from "../Reveal";
import type { ProjectScreenshotMode } from "./project-images";

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
  const [hovered, setHovered] = useState<number | null>(null);

  const handleHoverChange = useCallback((index: number | null) => {
    setHovered(index);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {projects.map((project, index) => (
        <Reveal key={project.id} type="slide" direction="up" delay={index * 0.06}>
          <ProjectFocusCard
            project={project}
            index={index}
            hovered={hovered}
            setHovered={handleHoverChange}
            onClick={onCardClick}
            onCursorModeChange={onCursorModeChange}
            screenshotMode={screenshotMode}
          />
        </Reveal>
      ))}
    </div>
  );
}
