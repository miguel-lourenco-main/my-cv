import LanguagesCard from "./categories/LanguagesCard";
import FrontendCard from "./categories/FrontendCard";
import BackendCard from "./categories/BackendCard";
import DevOpsCard from "./categories/DevOpsCard";
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
    { key: "languages", component: <LanguagesCard /> },
    { key: "frontend", component: <FrontendCard /> },
    { key: "backend", component: <BackendCard /> },
    { key: "devops", component: <DevOpsCard /> },
  ];

  // Build section classes with conditional laptop styling
  const sectionClasses = getSectionClasses(
    "max-w-9xl mx-auto",
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
        <div key={c.key}>{c.component}</div>
      ))}
    </ConditionalReveal>
  );

  // Desktop: First row with Languages and DevOps
  const desktopFirstRow = (
    <ConditionalReveal
      isMobile={isMobile}
      className={getGridClassesWithMargin()}
      delay={0.2}
      interval={0}
    >
      <FrontendCard />
      <LanguagesCard />
    </ConditionalReveal>
  );

  // Desktop: Second row with Frontend and Backend
  const desktopSecondRow = (
    <ConditionalReveal
      isMobile={isMobile}
      className={getGridClassesWithMargin()}
      delay={0.6}
      interval={0}
    >
      <BackendCard />
      <DevOpsCard />
    </ConditionalReveal>
  );

  return (
    <section id="technical-skills" className={sectionClasses}>
      {titleWrapper}
      {mobileGrid}
      <div className="lg:block hidden w-[90%] sm:w-[85%] lg:w-[80%] xl:w-[75%] 2xl:w-[70%] mx-auto">
        {desktopFirstRow}
        {desktopSecondRow}
      </div>
    </section>
  )
}