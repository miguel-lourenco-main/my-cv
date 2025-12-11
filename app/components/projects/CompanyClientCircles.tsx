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
  /**
   * Optional circles to render before the company/client circles.
   * Useful for showing a "personal" marker using a React icon (e.g. lucide User).
   */
  leadingCircles?: Array<{
    name: string;
    iconNode: React.ReactNode;
    tooltipText: string;
    url?: string;
  }>;
  /** Company information - can be string or object */
  company?: ProjectCompany;
  /** Array of client information */
  clients?: ProjectClient[];
  /** Size of each circle in pixels (default: 32) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
};

type CompanyRelationship = "employer" | "client";

type CircleEntity = {
  name: string;
  icon: string | null;
  iconNode?: React.ReactNode;
  url?: string;
  isCompany: boolean;
  tooltipText?: string;
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
  leadingCircles = [],
  company,
  clients = [],
  size = 32,
  className,
}: CompanyClientCirclesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Normalize company for consistent tooltip + rendering
  const normalizedCompany:
    | {
        name: string;
        icon: string | null;
        url?: string;
        relationship: CompanyRelationship;
      }
    | null = (() => {
    if (!company) return null;

    if (typeof company === "string") {
      return {
        name: company,
        icon: `/logos/${company.toLowerCase()}-logo.svg`,
        relationship: "employer",
      };
    }

    return {
      name: company.name,
      icon: company.icon,
      url: company.url,
      relationship: company.relationship ?? "employer",
    };
  })();

  // Build array of all entities (leading + company + clients)
  const entities: CircleEntity[] = [];

  // Add leading circles first (e.g. personal marker)
  leadingCircles.forEach((circle) => {
    entities.push({
      name: circle.name,
      icon: null,
      iconNode: circle.iconNode,
      url: circle.url,
      isCompany: false,
      tooltipText: circle.tooltipText,
    });
  });

  // Add company if available
  if (normalizedCompany) {
    entities.push({
      name: normalizedCompany.name,
      icon: normalizedCompany.icon,
      url: normalizedCompany.url,
      isCompany: true,
    });
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

          const tooltipText = entity.tooltipText ?? (() => {
            // Company circle: tooltip depends on whether it's an employer or a client
            if (entity.isCompany) {
              if (!normalizedCompany) return "Made while working at freelance";
              return normalizedCompany.relationship === "employer"
                ? `Made while working at ${normalizedCompany.name}`
                : `Made for ${normalizedCompany.name}`;
            }

            // Client circles: always "Made for {client}"
            return `Made for ${entity.name}`;
          })();

          return (
            <CompanyCircle
              key={`${entity.name}-${idx}`}
              name={entity.name}
              icon={entity.icon}
              iconNode={entity.iconNode}
              url={entity.url}
              tooltipText={tooltipText}
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

  const showBriefcase = (!icon || imageError) && !iconNode;

  const circleContent = (
    <motion.div
      className="relative rounded-full bg-white border-2 border-neutral-700 dark:border-neutral-200 shadow-md flex items-center justify-center overflow-hidden cursor-pointer"
      style={{
        width: size,
        height: size,
        marginLeft,
        zIndex,
      }}
      whileHover={{ scale: 1.30 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {iconNode ? (
        <div
          className="flex items-center justify-center"
          style={{ width: size * 0.6, height: size * 0.6 }}
        >
          {iconNode}
        </div>
      ) : showBriefcase ? (
        <Briefcase
          className="text-neutral-600 dark:text-neutral-400"
          size={size * 0.5}
        />
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
