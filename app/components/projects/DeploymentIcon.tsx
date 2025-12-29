"use client";

import React from "react";
import { cn } from "@/app/lib/utils";
import type { ProjectDeployment } from "./projects.types";

/**
 * Props for DeploymentIcon component.
 */
type DeploymentIconProps = {
  /** Deployment type */
  deployment: ProjectDeployment;
  /** Size of the icon in pixels (default: 16) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Component that displays the deployment platform icon.
 * Supports GitLab Pages, Vercel (with light/dark mode variants), and "none" (no icon).
 * 
 * @param props - DeploymentIcon component props
 * 
 * @example
 * ```tsx
 * <DeploymentIcon deployment="gitlab_pages" size={20} />
 * <DeploymentIcon deployment="vercel" />
 * ```
 */
export function DeploymentIcon({
  deployment,
  size = 16,
  className,
}: DeploymentIconProps) {
  if (deployment === "none") {
    return null;
  }

  if (deployment === "gitlab_pages") {
    return (
      <img
        src="/logos/gitlab-logo-500.svg"
        alt="GitLab"
        className={cn("object-contain", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (deployment === "vercel") {
    return (
      <>
        <img
          src="/logos/vercel-icon-light.svg"
          alt="Vercel"
          className={cn("object-contain dark:hidden", className)}
          style={{ width: size, height: size }}
        />
        <img
          src="/logos/vercel-icon-dark.svg"
          alt="Vercel"
          className={cn("hidden object-contain dark:block", className)}
          style={{ width: size, height: size }}
        />
      </>
    );
  }

  return null;
}

