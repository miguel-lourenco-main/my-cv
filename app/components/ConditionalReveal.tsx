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
 * Conditionally wraps children with RevealStagger based on mobile detection
 * On mobile, renders children directly (or with custom wrapper)
 * On desktop, wraps with RevealStagger for animations
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

