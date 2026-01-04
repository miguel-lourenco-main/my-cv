"use client";

import FrontendCard from "./categories/FrontendCard";
import BackendCard from "./categories/BackendCard";
import DevOpsCard from "./categories/DevOpsCard";
import TestingCard from "./categories/TestingCard";
import AutomationCard from "./categories/AutomationCard";
import AICard from "./categories/AICard";
import ConditionalReveal from "./ConditionalReveal";
import { useI18n } from "../lib/i18n";
import { useMobileDetection } from "../lib/use-mobile-detection";
import { getGridClasses, getGridClassesWithMargin } from "../lib/grid-utils";
import { getSectionClasses } from "../lib/use-section-classes";

/**
 * About section component displaying technical skills in category cards.
 * Features responsive grid layouts with different arrangements for mobile and desktop.
 * Uses conditional reveal animations based on device type.
 * 
 * @param props - Component props
 * @param props.isLaptop - Whether device is detected as laptop (affects layout and snap scrolling)
 * 
 * @example
 * ```tsx
 * <About isLaptop={false} />
 * ```
 */
export default function About({ isLaptop = false }: { isLaptop?: boolean }) {
  const { t } = useI18n();
  const { isMobile } = useMobileDetection();
  const ta = t('about');
  // Category cards configuration
  const categories = [
    { key: "frontend", component: <FrontendCard /> },
    { key: "backend", component: <BackendCard /> },
    { key: "devops", component: <DevOpsCard /> },
    { key: "testing", component: <TestingCard /> },
    { key: "automation", component: <AutomationCard /> },
    { key: "ai", component: <AICard /> },
  ];

  // Build section classes with conditional laptop styling
  const sectionClasses = getSectionClasses(
    "flex flex-col items-center justify-center max-w-9xl mx-auto",
    isLaptop,
    "h-screen flex-none snap-center flex flex-col justify-center"
  );

  // Title with conditional reveal animation
  const titleWrapper = (
    <ConditionalReveal
      isMobile={isMobile}
      className={`text-center ${isLaptop ? "mb-8" : "mb-20"}`}
      delay={0.1}
      interval={0.06}
    >
      <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{ta('title')}</h2>
    </ConditionalReveal>
  );

  // Mobile: Single column grid with all categories
  const mobileGrid = (
    <ConditionalReveal
      isMobile={isMobile}
      className={`${getGridClasses()} lg:hidden block`}
      delay={0.1}
      interval={0.06}
    >
      {categories.map((c) => (
        <div className="size-full" key={c.key}>{c.component}</div>
      ))}
    </ConditionalReveal>
  );

  // Desktop: 3-column grid
  const desktopGrid = (
    <ConditionalReveal
      isMobile={isMobile}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
      delay={0.2}
      interval={0}
    >
      {categories.map((c) => (
        <div className="size-full" key={c.key}>{c.component}</div>
      ))}
    </ConditionalReveal>
  );

  return (
    <section id="technical-skills" className={sectionClasses}>
      {titleWrapper}
      {mobileGrid}
      <div className="lg:block hidden w-full sm:w-[95%] lg:w-[90%] xl:w-[85%] 2xl:w-[90%]">
        {desktopGrid}
      </div>
    </section>
  );
}