"use client";

import React, { useState } from "react";
import type { Project } from "./projects.types";
import { ProjectFocusCard } from "./ProjectFocusCard";
import { Reveal } from "../Reveal";

export function ProjectGrid({
  projects,
  onCardClick,
}: {
  projects: Project[];
  onCardClick: (project: Project) => void;
}) {
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
          />
        </Reveal>
      ))}
    </div>
  );
}


