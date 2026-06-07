"use client";

import React from "react";
import CategoryCard from "./categories/CategoryCard";
import { CATEGORY_CARDS } from "./categories/category-cards.config";
import ConditionalReveal from "./ConditionalReveal";
import { TechStackDemoProvider } from "./TechStackDemo";
import { useI18n } from "../lib/i18n";
import { useMobileDetection } from "../lib/use-mobile-detection";
import { getSectionClasses } from "../lib/use-section-classes";

export default function About({ isLaptop = false }: { isLaptop?: boolean }) {
  const { t } = useI18n();
  const { isMobile, isPhone } = useMobileDetection();
  const ta = t('about');

  const sectionClasses = getSectionClasses(
    "flex flex-col items-center justify-center max-w-9xl mx-auto",
    isLaptop,
    "h-screen flex-none snap-center flex flex-col justify-center"
  );

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

  const renderCards = (className: string, delay: number, interval: number) => (
    <ConditionalReveal isMobile={isMobile} className={className} delay={delay} interval={interval}>
      {CATEGORY_CARDS.map((config) => (
        <div className="size-full" key={config.key}>
          <CategoryCard
            title={t('categories')(config.titleKey)}
            items={config.items}
            demoCardId={config.demoCardId}
            isPhone={isPhone}
          >
            {config.renderIcons()}
          </CategoryCard>
        </div>
      ))}
    </ConditionalReveal>
  );

  return (
    <TechStackDemoProvider>
      <section id="technical-skills" className={sectionClasses}>
        {titleWrapper}
        {renderCards("grid grid-cols-1 gap-12 lg:hidden block", 0.1, 0.06)}
        <div className="lg:block hidden w-full sm:w-[95%] lg:w-[90%] xl:w-[85%] 2xl:w-[90%]">
          {renderCards("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12", 0.2, 0)}
        </div>
      </section>
    </TechStackDemoProvider>
  );
}
