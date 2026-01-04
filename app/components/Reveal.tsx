"use client";

import React, { useMemo, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "../lib/hooks/use-in-view";

/**
 * Animation direction for reveal effects.
 */
type Direction = "up" | "down" | "left" | "right" | "none";

/**
 * Props for the Reveal component.
 */
type RevealProps = {
  /** HTML element type to render (default: "div") */
  as?: keyof JSX.IntrinsicElements;
  /** Content to reveal */
  children: React.ReactNode;
  /** Animation delay in seconds */
  delay?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
  /** Direction for slide animations */
  direction?: Direction;
  /** Distance in pixels for slide animations */
  distance?: number;
  /** Animation type: fade, slide, or zoom */
  type?: "fade" | "slide" | "zoom";
  /** If true, animation only plays once when element enters viewport */
  once?: boolean;
};

/**
 * Reveal component that animates content when it enters the viewport.
 * Supports fade, slide, and zoom animation types with configurable direction and timing.
 * Uses Intersection Observer for efficient viewport detection.
 * 
 * @param props - Reveal component props
 * @returns Animated motion component
 * 
 * @example
 * ```tsx
 * <Reveal type="slide" direction="up" delay={0.2}>
 *   <h1>Animated Title</h1>
 * </Reveal>
 * ```
 */
export function Reveal(props: RevealProps & any) {
  const {
    as = "div",
    children,
    delay = 0,
    duration = 0.6,
    className,
    direction = "up",
    distance = 24,
    type = "fade",
    once = true,
    ...rest
  } = props;
  // Get the motion component for the specified element type
  const Comp = useMemo(() => (((motion as any)[as] ?? motion.div) as any), [as]);
  const ref = useRef<HTMLDivElement | null>(null);
  // Detect when element enters viewport
  const inView = useInView(ref, { threshold: 0.15, once });

  // Calculate initial offset based on direction for slide animations
  const offset = useMemo(() => {
    switch (direction) {
      case "up":
        return { x: 0, y: distance };
      case "down":
        return { x: 0, y: -distance };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  }, [direction, distance]);

  // Determine initial animation state based on type
  const initial = useMemo(() => {
    if (type === "fade") return { opacity: 0 };
    if (type === "slide") return { opacity: 0, ...offset };
    if (type === "zoom") return { opacity: 0, scale: 0.95 };
    return { opacity: 0 };
  }, [type, offset]);

  // Final animation state (fully visible and in position)
  const animate = useMemo(() => ({ opacity: 1, x: 0, y: 0, scale: 1 }), []);

  return (
    <Comp
      ref={ref as any}
      initial={initial}
      animate={inView ? animate : initial}
      transition={{ delay, duration, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...(rest as any)}
    >
      {children}
    </Comp>
  );
}

/**
 * Props for the RevealStagger component.
 */
type RevealStaggerProps = {
  /** Children to animate with staggered timing */
  children: React.ReactNode;
  /** Base delay before first animation starts */
  delay?: number;
  /** Time interval between each child's animation */
  interval?: number;
  /** Direction for slide animations */
  direction?: Direction;
  /** Animation type: fade, slide, or zoom */
  type?: "fade" | "slide" | "zoom";
  /** Distance in pixels for slide animations */
  distance?: number;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the reveal items */
  revealClassName?: string;
};

/**
 * Reveal component that animates multiple children with staggered timing.
 * Each child receives an incremental delay based on the interval parameter.
 * Useful for creating cascading reveal effects.
 * 
 * @param props - RevealStagger component props
 * @returns Container with individually animated children
 * 
 * @example
 * ```tsx
 * <RevealStagger delay={0.1} interval={0.05} direction="up">
 *   <div>First item</div>
 *   <div>Second item</div>
 *   <div>Third item</div>
 * </RevealStagger>
 * ```
 */
export function RevealStagger({
  children,
  delay = 0,
  interval = 0.08,
  direction = "up",
  type = "slide",
  distance = 20,
  className,
  revealClassName,
}: RevealStaggerProps) {
  const items = React.Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, index) => (
        <Reveal
          key={index}
          // Increment delay for each child to create stagger effect
          delay={delay + index * interval}
          direction={direction}
          type={type}
          distance={distance}
          className={revealClassName}
        >
          {child}
        </Reveal>
      ))}
    </div>
  );
}
