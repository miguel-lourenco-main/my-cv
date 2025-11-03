"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import type { Project } from "./projects.types";
import { useTheme } from "../../lib/theme-provider";
import { useI18n } from "../../lib/i18n";
import { MoreHorizontalIcon } from "lucide-react";

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
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setHovered(null);
    setMousePosition(null);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(index)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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

      {/* Water ripple effect */}
      {hovered === index && mousePosition && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {[0, 1, 2].map((rippleIndex) => (
            <div
              key={rippleIndex}
              className="absolute rounded-full border-2 border-white/40"
              style={{
                left: mousePosition.x,
                top: mousePosition.y,
                transform: "translate(-50%, -50%)",
                width: "0px",
                height: "0px",
                animation: `waterRipple 2.5s cubic-bezier(0.4, 0, 1, 1) infinite`,
                animationDelay: `${rippleIndex * 0.67}s`,
              }}
            />
          ))}
        </div>
      )}

      <button
        className="absolute right-3 top-3 z-10 bg-transparent hover:bg-slate-800 text-white rounded-full p-2"
        aria-label={`Open ${getProjectString(project, 'title')} website`}
        onClick={(e) => {
          e.stopPropagation();
          onClick(project)
        }}
      >
        {/* external link icon */}
        <MoreHorizontalIcon className="size-5" />
      </button>

      <div
        className={cn(
          "absolute inset-0 bg-black/80 flex items-end py-6 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="space-y-1">
          <div className="text-lg md:text-xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
            {getProjectString(project, 'title')}
          </div>
          <div className="text-xs md:text-sm text-neutral-200/90">
            {getProjectString(project, 'description')}
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


