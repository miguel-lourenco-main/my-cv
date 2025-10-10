"use client";

import React from "react";
import { motion } from "motion/react";

type NameBadgeProps = {
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  layoutId?: string;
  variant?: "intro" | "hero";
  greeting?: string;
};

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
    <Comp layoutId={layoutId} className={className}>
      <h1 className={titleClasses}>
        {greeting || ' '} {""}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Miguel Lourenço
        </span>
      </h1>
    </Comp>
  );
}


