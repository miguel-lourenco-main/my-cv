"use client";

import React from "react";
import { motion } from "motion/react";
import { useI18n } from "../../lib/i18n";

type NameBadgeProps = {
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  layoutId?: string;
  variant?: "intro" | "hero";
};

export default function NameBadge({
  className,
  as = "div",
  layoutId = "intro-name",
  variant = "hero",
}: NameBadgeProps) {
  const Comp: any = (motion as any)[as] ?? motion.div;
  const titleClasses =
    variant === "intro"
      ? "text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white"
      : "text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white";

  const { t } = useI18n();
  const tn = t('navigation');

  return (
    <Comp layoutId={layoutId} className={className}>
      <h1 className={titleClasses}>
        {tn('greeting')}{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          {tn('name')}
        </span>
      </h1>
    </Comp>
  );
}


