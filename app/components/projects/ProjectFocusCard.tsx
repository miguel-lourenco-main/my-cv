"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import type { Project } from "./projects.types";
import { useTheme } from "../../lib/theme-provider";
import { useI18n } from "../../lib/i18n";
import { Briefcase, User } from "lucide-react";
import { CompanyClientCircles } from "./CompanyClientCircles";

/**
 * Project card component with hover effects and focus blur.
 * Features theme-aware cover images, water ripple effect on hover,
 * and blur effect for non-hovered cards.
 * 
 * @param props - ProjectFocusCard component props
 * @param props.project - Project data to display
 * @param props.index - Card index in the grid
 * @param props.hovered - Index of currently hovered card (null if none)
 * @param props.setHovered - Function to set hovered card index
 * @param props.onClick - Click handler function
 * @param props.onCursorModeChange - Optional callback for cursor mode changes
 * 
 * @example
 * ```tsx
 * <ProjectFocusCard
 *   project={project}
 *   index={0}
 *   hovered={hovered}
 *   setHovered={setHovered}
 *   onClick={handleClick}
 * />
 * ```
 */
export function ProjectFocusCard({
  project,
  index,
  hovered,
  setHovered,
  onClick,
  onCursorModeChange,
}: {
  project: Project;
  index: number;
  hovered: number | null;
  setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  onClick: (project: Project) => void;
  onCursorModeChange?: (mode: 'default' | 'view') => void;
}) {
  const { resolvedTheme } = useTheme();
  const { getProjectString } = useI18n();
  const [mounted, setMounted] = useState(false);
  // Track mouse position for ripple effect
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Select theme-appropriate cover image (light/dark variants)
  // Prevents hydration mismatch by using light theme during SSR
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

  const handleMouseEnter = () => {
    setHovered(index);
    onCursorModeChange?.('view');
  };

  const handleMouseLeave = () => {
    setHovered(null);
    setMousePosition(null);
    onCursorModeChange?.('default');
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
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

      {/* Water ripple effect - animated circles expanding from mouse position */}
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

      {/* Project type badge and company/client circles - always visible */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 flex-wrap">        

        {/* Company and client circles */}
        {project.type === "professional" ? (
          <CompanyClientCircles
            company={project.company}
            clients={project.clients}
            size={24}
          />
        ) : (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-purple-500/90 text-white"
          )}>
            <User className="size-3" />
          </div>
        )}
      </div>

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


