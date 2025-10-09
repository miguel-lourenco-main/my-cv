"use client";

import React, { useMemo, useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import type { Project } from "./projects.types";
import { useTheme } from "../../lib/theme-provider";
import { useI18n } from "../../lib/i18n";

export function ProjectFocusCard({
  project,
  index,
  hovered,
  setHovered,
  onClick,
}: {
  project: Project;
  index: number;
  hovered: number | null;
  setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  onClick: (project: Project) => void;
}) {
  const { resolvedTheme } = useTheme();
  const { getProjectString } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const coverImage = useMemo(() => {
    // During SSR or before mount, always use light theme to prevent hydration mismatch
    if (!mounted) {
      return project.images.find((src) => src.endsWith("_L.png")) ?? project.images[0];
    }
    
    const isDark = resolvedTheme === "dark";
    const suffix = isDark ? "_D.png" : "_L.png";
    const themed = project.images.find((src) => src.endsWith(suffix));
    return themed ?? project.images[0];
  }, [project.images, resolvedTheme, mounted]);
  return (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-80 w-full transition-all duration-300 ease-out cursor-pointer",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
      onClick={() => onClick(project)}
    >
      <img
        src={coverImage}
        alt={getProjectString(project, 'title')}
        className="object-cover absolute inset-0 w-full h-full"
      />

      <button
        className="absolute right-3 top-3 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
        aria-label={`Open ${getProjectString(project, 'title')} website`}
        onClick={(e) => {
          e.stopPropagation();
          window.open(project.websiteUrl, "_blank");
        }}
      >
        {/* external link icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <path d="M15 3h6v6" />
          <path d="M10 14L21 3" />
        </svg>
      </button>

      <div
        className={cn(
          "absolute inset-0 bg-black/50 flex items-end py-6 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="space-y-1">
          <div className="text-lg md:text-xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
            {getProjectString(project, 'title')}
          </div>
          {project.experience ? (
            <div className="text-xs md:text-sm text-neutral-200/90">
              {project.experience.org} • {project.experience.date}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


