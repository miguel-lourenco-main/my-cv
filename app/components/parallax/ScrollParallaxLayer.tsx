"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "@/app/lib/utils";

/**
 * Props for the ScrollParallaxLayer component.
 */
type ScrollParallaxLayerProps = {
  /** Content to apply parallax effect to */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Y translation in pixels when page is at top */
  fromY?: number;
  /** Y translation in pixels when page is at bottom */
  toY?: number;
  /**
   * Extra vertical bleed (in px) to extend the layer beyond its parent on both
   * top and bottom. Useful when using large parallax offsets so content never
   * reveals edges during transforms. Example: set to max(|fromY|, |toY|).
   */
  bleed?: number;
  /** Spring animation stiffness */
  stiffness?: number;
  /** Spring animation damping */
  damping?: number;
  /** Spring animation mass */
  mass?: number;
  /** Disable motion entirely (e.g., reduced motion) */
  disabled?: boolean;
};

/**
 * Scroll-based parallax layer component.
 * Creates smooth vertical parallax effect based on page scroll progress.
 * Uses Framer Motion springs for smooth animations and respects reduced motion preferences.
 * 
 * @param props - ScrollParallaxLayer component props
 * @param props.children - Content to animate
 * @param props.className - Additional CSS classes
 * @param props.fromY - Starting Y position (default: -180px)
 * @param props.toY - Ending Y position (default: 180px)
 * @param props.bleed - Vertical bleed to prevent edge reveal (default: 0)
 * @param props.stiffness - Spring stiffness (default: 120)
 * @param props.damping - Spring damping (default: 26)
 * @param props.mass - Spring mass (default: 0.4)
 * @param props.disabled - Disable parallax effect
 * 
 * @example
 * ```tsx
 * <ScrollParallaxLayer fromY={-100} toY={100} bleed={100}>
 *   <div>Parallax content</div>
 * </ScrollParallaxLayer>
 * ```
 */
export default function ScrollParallaxLayer({
  children,
  className,
  fromY = -180,
  toY = 180,
  bleed = 0,
  stiffness = 120,
  damping = 26,
  mass = 0.4,
  disabled,
}: ScrollParallaxLayerProps) {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const isDisabled = disabled || prefersReduced;

  // Global page scroll progress 0..1
  const { scrollYProgress } = useScroll();

  const yRange = useMemo<[number, number]>(() => {
    if (isDisabled) return [0, 0];
    return [fromY, toY];
  }, [isDisabled, fromY, toY]);

  const yRaw = useTransform(scrollYProgress, [0, 1], yRange);
  const y = useSpring(yRaw, { stiffness, damping, mass });

  return (
    <motion.div
      className={cn(className)}
      style={{
        y,
        willChange: "transform",
        // Expand vertically to compensate for parallax translation so edges don't show
        top: bleed > 0 ? -bleed : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}


