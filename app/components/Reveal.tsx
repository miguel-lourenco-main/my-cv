"use client";

import React, { useMemo, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "../lib/hooks/use-in-view";

type Direction = "up" | "down" | "left" | "right" | "none";

type RevealProps = {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: Direction;
  distance?: number;
  type?: "fade" | "slide" | "zoom";
  once?: boolean;
};

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
  const Comp = useMemo(() => (((motion as any)[as] ?? motion.div) as any), [as]);
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { threshold: 0.15, once });

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

  const initial = useMemo(() => {
    if (type === "fade") return { opacity: 0 };
    if (type === "slide") return { opacity: 0, ...offset };
    if (type === "zoom") return { opacity: 0, scale: 0.95 };
    return { opacity: 0 };
  }, [type, offset]);

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

type StaggerProps = {
  children: React.ReactNode;
  delay?: number;
  interval?: number;
  direction?: Direction;
  type?: "fade" | "slide" | "zoom";
  distance?: number;
  className?: string;
};

export function RevealStagger({
  children,
  delay = 0,
  interval = 0.08,
  direction = "up",
  type = "slide",
  distance = 20,
  className,
}: StaggerProps) {
  const items = React.Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, index) => (
        <Reveal
          key={index}
          delay={delay + index * interval}
          direction={direction}
          type={type}
          distance={distance}
        >
          {child}
        </Reveal>
      ))}
    </div>
  );
}
