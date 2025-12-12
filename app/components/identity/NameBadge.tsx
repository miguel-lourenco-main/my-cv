"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";

/**
 * Props for the NameBadge component.
 */
type NameBadgeProps = {
  /** Additional CSS classes */
  className?: string;
  /** HTML element type to render (default: "div") */
  as?: keyof JSX.IntrinsicElements;
  /** Layout ID for Framer Motion shared element transitions */
  layoutId?: string;
  /** Visual variant style */
  variant?: "intro" | "hero";
  /** Optional greeting text to display before name */
  greeting?: string;
};

/**
 * Name badge component displaying the name "Miguel Lourenço" with gradient styling.
 * Supports shared element transitions via Framer Motion layoutId.
 * 
 * @param props - NameBadge component props
 * @param props.className - Additional CSS classes
 * @param props.as - HTML element type (default: "div")
 * @param props.layoutId - Layout ID for shared element transitions (default: "intro-name")
 * @param props.variant - Visual variant (default: "hero")
 * @param props.greeting - Optional greeting text
 * 
 * @example
 * ```tsx
 * <NameBadge layoutId="intro-name" greeting="Hello" />
 * ```
 */
export default function NameBadge({
  className,
  as = "div",
  layoutId = "intro-name",
  variant = "hero",
  greeting,
}: NameBadgeProps) {
  const Comp: any = (motion as any)[as] ?? motion.div;
  const titleClasses =
    variant === "intro"
      ? "text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white"
      : "text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white";

  return (
    <Comp layoutId={layoutId} className={cn(className, "text-center")}>
      <h1 className={titleClasses}>
        {greeting || ' '} {""}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Miguel Lourenço
        </span>
      </h1>
    </Comp>
  );
}


