"use client";

import React, { useState } from "react";
import { Briefcase } from "lucide-react";
import { motion } from "motion/react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/app/lib/utils";
import type { ProjectClient, ProjectCompany } from "./projects.types";

/**
 * Props for CompanyClientCircles component.
 */
type CompanyClientCirclesProps = {
  /** Company information - can be string or object */
  company?: ProjectCompany;
  /** Array of client information */
  clients?: ProjectClient[];
  /** Size of each circle in pixels (default: 32) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Component that displays overlapping circular icons for company and clients.
 * Company icon appears first, followed by client icons overlapping to the right.
 * On hover, each circle scales up slightly.
 * Falls back to Briefcase icon if company logo is not available.
 * 
 * @param props - CompanyClientCircles component props
 * 
 * @example
 * ```tsx
 * <CompanyClientCircles 
 *   company="Edgen" 
 *   clients={[{ name: "Client 1", icon: "/logos/client1.svg" }]} 
 * />
 * ```
 */
export function CompanyClientCircles({
  company,
  clients = [],
  size = 32,
  className,
}: CompanyClientCirclesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Build array of all entities (company + clients)
  const entities: Array<{ name: string; icon: string | null; url?: string; isCompany: boolean }> = [];

  // Add company if available
  if (company) {
    if (typeof company === "string") {
      // Legacy format: company is just a string
      const companyIcon = `/logos/${company.toLowerCase()}-logo.svg`;
      entities.push({
        name: company,
        icon: companyIcon,
        isCompany: true,
      });
    } else {
      // New format: company is an object with name, icon, and url
      entities.push({
        name: company.name,
        icon: company.icon,
        url: company.url,
        isCompany: true,
      });
    }
  }

  // Add clients
  clients.forEach((client) => {
    entities.push({
      name: client.name,
      icon: client.icon,
      url: client.url,
      isCompany: false,
    });
  });

  // If no entities, don't render anything
  if (entities.length === 0) {
    return null;
  }

  const overlapOffset = size * 0.3; // 60% overlap

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center" style={{ marginLeft: 0 }}>
        {entities.map((entity, idx) => {
          const isFirst = idx === 0;
          const marginLeft = isFirst ? 0 : -overlapOffset;
          
          // Calculate dynamic z-index: base z-index increases with index
          // When hovered, ensure it's above the next circle (if exists)
          const baseZIndex = entities.length + idx;
          const isHovered = hoveredIndex === idx;
          const nextCircleIndex = idx + 1;
          const hasNextCircle = nextCircleIndex < entities.length;
          
          // If this circle is hovered and there's a next circle, ensure it's above it
          const zIndex = isHovered && hasNextCircle
            ? entities.length + nextCircleIndex + 10 // High enough to be above next circle
            : baseZIndex;

          return (
            <CompanyCircle
              key={`${entity.name}-${idx}`}
              name={entity.name}
              icon={entity.icon}
              url={entity.url}
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

/**
 * Individual company/client circle component with error handling.
 */
function CompanyCircle({
  name,
  icon,
  url,
  size,
  marginLeft,
  zIndex,
  onMouseEnter,
  onMouseLeave,
}: {
  name: string;
  icon: string | null;
  url?: string;
  size: number;
  marginLeft: number;
  zIndex: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  const showBriefcase = !icon || imageError;

  const circleContent = (
    <motion.div
      className="relative rounded-full bg-white dark:bg-neutral-800 border-2 border-white dark:border-neutral-700 shadow-md flex items-center justify-center overflow-hidden cursor-pointer"
      style={{
        width: size,
        height: size,
        marginLeft,
        zIndex,
      }}
      whileHover={{ scale: 1.30 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {showBriefcase ? (
        <Briefcase
          className="text-neutral-600 dark:text-neutral-400"
          size={size * 0.5}
        />
      ) : (
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
      )}
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
            {name}
            <Tooltip.Arrow className="fill-black" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
