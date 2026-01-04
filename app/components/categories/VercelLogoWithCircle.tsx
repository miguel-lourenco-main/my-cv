"use client";

import React from "react";
import { cn } from "@/app/lib/utils";

/**
 * Props for VercelLogoWithCircle component.
 */
type VercelLogoWithCircleProps = {
  /** Size of the container in pixels (default: 42) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Component that displays the Vercel logo with a black circular background.
 * The triangle is centered with padding around it.
 * Supports light/dark mode variants.
 * 
 * @param props - VercelLogoWithCircle component props
 * 
 * @example
 * ```tsx
 * <VercelLogoWithCircle size={42} />
 * <VercelLogoWithCircle size={96} className="my-4" />
 * ```
 */
export default function VercelLogoWithCircle({
  size = 42,
  className,
}: VercelLogoWithCircleProps) {
  // Icon size is 60% of container size to provide more padding around the triangle
  const iconSize = Math.max(size * 0.6, 12);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-black",
        className
      )}
      style={{ width: size, height: size }}
    >
      <div 
        className="relative" 
        style={{ 
          width: iconSize, 
          height: iconSize,
          transform: 'translateY(-2px)' // Slight upward offset for visual centering
        }}
      >
        <img
          src="/logos/vercel-icon-light.svg"
          alt="Vercel"
          className="absolute inset-0 h-full w-full object-contain  dark:hidden"
          style={{ width: iconSize, height: iconSize }}
        />
        <img
          src="/logos/vercel-icon-dark.svg"
          alt="Vercel"
          className="absolute inset-0 h-full w-full object-contain  hidden dark:block"
          style={{ width: iconSize, height: iconSize }}
        />
      </div>
    </div>
  );
}
