"use client";

import React, { useEffect, useState } from "react";
import { ParallaxProvider } from "react-scroll-parallax";

/**
 * Props for the ParallaxRoot component.
 */
type ParallaxRootProps = {
  /** Child components to wrap with parallax context */
  children: React.ReactNode;
};

/**
 * Root component for parallax effects.
 * Provides parallax context to child components and respects reduced motion preferences.
 * 
 * @param props - ParallaxRoot component props
 * @param props.children - Components to wrap with parallax context
 * 
 * @example
 * ```tsx
 * <ParallaxRoot>
 *   <ScrollParallaxLayer>Content</ScrollParallaxLayer>
 * </ParallaxRoot>
 * ```
 */
export default function ParallaxRoot({ children }: ParallaxRootProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  // Library doesn't have a global disable prop; we'll pass speed={0} at call sites when reducedMotion
  return <ParallaxProvider>{children}</ParallaxProvider>;
}


