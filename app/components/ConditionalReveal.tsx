"use client";

import React from "react";
import { RevealStagger } from "./Reveal";

interface ConditionalRevealProps {
  isMobile: boolean;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  interval?: number;
  mobileWrapper?: (children: React.ReactNode) => React.ReactNode;
}

/**
 * Conditionally wraps children with RevealStagger based on mobile detection.
 * On mobile devices, renders children directly (or with custom wrapper) to avoid animations.
 * On desktop, wraps with RevealStagger for smooth reveal animations.
 * 
 * @param props - ConditionalReveal component props
 * @param props.isMobile - Whether the device is detected as mobile
 * @param props.children - Content to conditionally animate
 * @param props.className - Additional CSS classes
 * @param props.delay - Animation delay in seconds (default: 0.1)
 * @param props.interval - Time interval between staggered items (default: 0.06)
 * @param props.mobileWrapper - Optional custom wrapper function for mobile rendering
 * 
 * @example
 * ```tsx
 * <ConditionalReveal isMobile={isMobile} delay={0.2}>
 *   <div>Content</div>
 * </ConditionalReveal>
 * ```
 */
export default function ConditionalReveal({
  isMobile,
  children,
  className,
  delay = 0.1,
  interval = 0.06,
  mobileWrapper,
}: ConditionalRevealProps) {
  if (isMobile) {
    if (mobileWrapper) {
      return <>{mobileWrapper(children)}</>;
    }
    return <div className={className}>{children}</div>;
  }

  return (
    <RevealStagger className={className} delay={delay} interval={interval}>
      {children}
    </RevealStagger>
  );
}

