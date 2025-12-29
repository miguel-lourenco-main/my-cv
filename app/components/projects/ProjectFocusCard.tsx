"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import type { Project } from "./projects.types";
import { useI18n } from "../../lib/i18n";
import { TechStackCircles } from "./TechStackCircles";
import { GlobeIcon } from "lucide-react";
import {
  getProjectCoverImageByMode,
  type ProjectScreenshotMode,
} from "./project-images";

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
  screenshotMode = "dark",
}: {
  project: Project;
  index: number;
  hovered: number | null;
  setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  onClick: (project: Project) => void;
  onCursorModeChange?: (mode: 'default' | 'view') => void;
  screenshotMode?: ProjectScreenshotMode;
}) {
  const { getProjectString } = useI18n();
  // Track mouse position for ripple effect
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Update fixed cursor position when card is hovered and window scrolls/resizes
  useEffect(() => {
    if (hovered !== index || !cardRef.current) return;

    const updateFixedPosition = () => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        const bottomCenterX = rect.left + rect.width / 2;
        const bottomCenterY = rect.bottom;
        window.dispatchEvent(new CustomEvent('cursor-fixed-position', {
          detail: { x: bottomCenterX, y: bottomCenterY }
        }));
      }
    };

    updateFixedPosition();
    window.addEventListener('scroll', updateFixedPosition, true);
    window.addEventListener('resize', updateFixedPosition);

    return () => {
      window.removeEventListener('scroll', updateFixedPosition, true);
      window.removeEventListener('resize', updateFixedPosition);
    };
  }, [hovered, index]);

  const openProjectUrl = useMemo(() => {
    const isValid = (url?: string) => Boolean(url && url !== "#" && url.trim().length > 0);
    if (isValid(project.websiteUrl)) return project.websiteUrl;
    if (isValid(project.gitlabUrl)) return project.gitlabUrl;
    return null;
  }, [project.gitlabUrl, project.websiteUrl]);

  // Select cover image based on user screenshot mode (light/dark).
  const coverImage = useMemo(() => {
    return (
      getProjectCoverImageByMode(project.images, screenshotMode) ??
      project.images[0]
    );
  }, [project.images, screenshotMode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    
    // Fix cursor to bottom center of card when hovering
    if (hovered === index) {
      const bottomCenterX = rect.left + rect.width / 2;
      const bottomCenterY = rect.bottom;
      window.dispatchEvent(new CustomEvent('cursor-fixed-position', {
        detail: { x: bottomCenterX, y: bottomCenterY }
      }));
    }
  };

  const handleMouseEnter = () => {
    setHovered(index);
    onCursorModeChange?.('view');
    // Calculate and set fixed position at bottom center
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const bottomCenterX = rect.left + rect.width / 2;
      const bottomCenterY = rect.bottom;
      window.dispatchEvent(new CustomEvent('cursor-fixed-position', {
        detail: { x: bottomCenterX, y: bottomCenterY }
      }));
    }
  };

  const handleMouseLeave = () => {
    setHovered(null);
    setMousePosition(null);
    onCursorModeChange?.('default');
    // Clear fixed position
    window.dispatchEvent(new CustomEvent('cursor-fixed-position', {
      detail: null
    }));
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-80 w-full transition-all duration-300 ease-out cursor-pointer border border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700",
        hovered !== null && hovered !== index && "scale-[0.98]"
      )}
      onClick={() => onClick(project)}
    >
      <img
        src={coverImage}
        alt={getProjectString(project, 'title')}
        className="object-cover absolute inset-0 w-full h-full"
      />

      {/* Hover fade overlay (same behavior as before, but lighter in light mode) */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none z-[15] transition-opacity duration-300 ease-out",
          "bg-black/60 dark:bg-black/80",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      />

      {/* 
        De-emphasize non-hovered cards without using CSS `filter: blur()` on the
        whole card (which can cause Brave to drop SVG rendering when combined
        with descendant `backdrop-filter` elements).
      */}
      {hovered !== null && hovered !== index ? (
        <div className="absolute inset-0 pointer-events-none z-40 backdrop-blur-sm" />
      ) : null}

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
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2 flex-wrap">
        <TechStackCircles
          technologies={project.technologies}
          size={28}
        />
      </div>

      {/* Open project icon - opposite side of the tech stack circles */}
      {openProjectUrl ? (
        <a
          href={openProjectUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => onCursorModeChange?.("default")}
          className="absolute top-3 right-3 z-30 inline-flex items-center justify-center size-9 rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur-sm transition-colors"
          aria-label="Open project"
          title="Open project"
        >
          <GlobeIcon className="size-5" />
        </a>
      ) : null}

      {/* Always-visible project title row + hover-revealed details */}
      <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-2 pt-10 pointer-events-none">
        {/* Bottom gradient to keep text readable on top of the cover */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 h-20",
            // Keep the bottom area dark for longer, then fade faster near the text
            // (improves text contrast without increasing the fade height)
            "bg-[linear-gradient(to_top,rgba(0,0,0,0.80)_0%,rgba(0,0,0,0.80)_60%,rgba(0,0,0,0.35)_82%,rgba(0,0,0,0)_100%)]",
            "dark:bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.85)_60%,rgba(0,0,0,0.45)_82%,rgba(0,0,0,0)_100%)]",
            "transition-opacity duration-300 ease-out",
            hovered === index ? "opacity-0" : "opacity-100"
          )}
        />

        <div className="relative">
          {/* Title row: always visible; moves up on hover */}
          <div
            className={cn(
              "flex items-center gap-2 text-lg md:text-xl font-medium",
              "bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200",
              "transition-transform duration-300 ease-out",
              hovered === index ? "-translate-y-2" : "translate-y-0"
            )}
          >
            {project.logo && (
              <img
                src={project.logo}
                alt={getProjectString(project, "title")}
                className="size-6 md:size-7 object-contain"
              />
            )}
            {getProjectString(project, "title")}
          </div>

          {/* Details: hidden by default; on hover slides down into place */}
          <div
            className={cn(
              "mt-1 space-y-0.5 text-xs md:text-sm text-neutral-200/90",
              "transition-all duration-700 ease-in-out",
              hovered === index
                ? "opacity-100 pb-2 translate-y-0 max-h-24"
                : "opacity-0 -translate-y-3 max-h-0"
            )}
            aria-hidden={hovered !== index}
          >
            <div>{getProjectString(project, "description")}</div>
            {project.experience ? (
              <div>
                {project.experience.org} • {project.experience.date}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}


