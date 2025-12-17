"use client";

import React, { useState } from "react";
import { Code } from "lucide-react";
import { motion } from "motion/react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/app/lib/utils";
import type { ProjectTechnology } from "./projects.types";

type TechStackCirclesProps = {
  /** Optional circles to render before the tech stack circles (e.g., personal marker). */
  leadingCircles?: Array<{
    name: string;
    iconNode: React.ReactNode;
    tooltipText: string;
    url?: string;
  }>;
  /** Technologies to display as overlapping circles. */
  technologies?: ProjectTechnology[];
  /** Size of each circle in pixels (default: 32). */
  size?: number;
  /** Additional CSS classes. */
  className?: string;
};

type CircleEntity = {
  name: string;
  icon: string | null;
  iconNode?: React.ReactNode;
  url?: string;
  tooltipText: string;
};

export function TechStackCircles({
  leadingCircles = [],
  technologies = [],
  size = 32,
  className,
}: TechStackCirclesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const entities: CircleEntity[] = [];

  leadingCircles.forEach((circle) => {
    entities.push({
      name: circle.name,
      icon: null,
      iconNode: circle.iconNode,
      url: circle.url,
      tooltipText: circle.tooltipText,
    });
  });

  technologies.forEach((tech) => {
    entities.push({
      name: tech.name,
      icon: tech.icon,
      tooltipText: `Built with ${tech.name}`,
    });
  });

  if (entities.length === 0) return null;

  const overlapOffset = size * 0.3;

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center" style={{ marginLeft: 0 }}>
        {entities.map((entity, idx) => {
          const isFirst = idx === 0;
          const marginLeft = isFirst ? 0 : -overlapOffset;

          const baseZIndex = entities.length + idx;
          const isHovered = hoveredIndex === idx;
          const nextCircleIndex = idx + 1;
          const hasNextCircle = nextCircleIndex < entities.length;

          const zIndex =
            isHovered && hasNextCircle
              ? entities.length + nextCircleIndex + 10
              : baseZIndex;

          return (
            <TechCircle
              key={`${entity.name}-${idx}`}
              name={entity.name}
              icon={entity.icon}
              iconNode={entity.iconNode}
              url={entity.url}
              tooltipText={entity.tooltipText}
              size={size}
              marginLeft={marginLeft}
              zIndex={zIndex}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}
      </div>
    </div>
  );
}

function TechCircle({
  name,
  icon,
  iconNode,
  url,
  tooltipText,
  size,
  marginLeft,
  zIndex,
  onMouseEnter,
  onMouseLeave,
}: {
  name: string;
  icon: string | null;
  iconNode?: React.ReactNode;
  url?: string;
  tooltipText: string;
  size: number;
  marginLeft: number;
  zIndex: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  const showFallback = (!icon || imageError) && !iconNode;

  const circleContent = (
    <motion.div
      className="relative rounded-full bg-white border-2 border-neutral-700 dark:border-neutral-200 shadow-md flex items-center justify-center overflow-hidden cursor-pointer"
      style={{
        width: size,
        height: size,
        marginLeft,
        zIndex,
      }}
      whileHover={{ scale: 1.3 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {iconNode ? (
        <div className="flex items-center justify-center" style={{ width: size * 0.6, height: size * 0.6 }}>
          {iconNode}
        </div>
      ) : showFallback ? (
        <Code className="text-neutral-600 dark:text-neutral-400" size={size * 0.5} />
      ) : icon ? (
        <img
          src={icon}
          alt={name}
          width={size * 0.6}
          height={size * 0.6}
          className="object-contain"
          onError={() => setImageError(true)}
          loading="lazy"
          decoding="async"
        />
      ) : null}
    </motion.div>
  );

  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              {circleContent}
            </a>
          ) : (
            <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
              {circleContent}
            </div>
          )}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={6}
            className="rounded bg-black text-white px-2 py-1 text-xs shadow z-50"
          >
            {tooltipText}
            <Tooltip.Arrow className="fill-black" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

