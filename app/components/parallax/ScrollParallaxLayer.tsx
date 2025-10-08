"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "@/app/lib/utils";

type ScrollParallaxLayerProps = {
  children: React.ReactNode;
  className?: string;
  /** Translate from (px) when page is at top to (px) when page is at bottom */
  fromY?: number;
  toY?: number;
  /**
   * Extra vertical bleed (in px) to extend the layer beyond its parent on both
   * top and bottom. Useful when using large parallax offsets so content never
   * reveals edges during transforms. Example: set to max(|fromY|, |toY|).
   */
  bleed?: number;
  /** Smoothing spring config */
  stiffness?: number;
  damping?: number;
  mass?: number;
  /** Disable motion entirely (e.g., reduced motion) */
  disabled?: boolean;
};

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


