import LanguagesCard from "./categories/LanguagesCard";
import FrontendCard from "./categories/FrontendCard";
import BackendCard from "./categories/BackendCard";
import DevOpsCard from "./categories/DevOpsCard";
import { RevealStagger } from "./Reveal";
import { useI18n } from "../lib/i18n";
import { useMobileDetection } from "../lib/use-mobile-detection";

export default function About({ isLaptop = false }: { isLaptop?: boolean }) {
  const { t } = useI18n();
  const { isMobile } = useMobileDetection();
  const ta = t('about');
  const categories = [
    { key: "languages", component: <LanguagesCard /> },
    { key: "frontend", component: <FrontendCard /> },
    { key: "backend", component: <BackendCard /> },
    { key: "devops", component: <DevOpsCard /> },
  ];

  //add to the ai tooling icon, a set that is made up of 3 ai tools that I regularly use

  const sectionClasses = [
    "max-w-9xl mx-auto",
    isLaptop ? "h-screen flex-none snap-center flex flex-col justify-center" : ""
  ].filter(Boolean).join(" ");

  const titleWrapper = isMobile ? (
    <div className={`text-center ${isLaptop ? "mb-8" : "mb-20"}`}>
      <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{ta('title')}</h2>
    </div>
  ) : (
    <RevealStagger className={`text-center ${isLaptop ? "mb-8" : "mb-20"}`} delay={0.1} interval={0.06}>
      <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{ta('title')}</h2>
    </RevealStagger>
  );

  const mobileGrid = isMobile ? (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${isLaptop ? "gap-6" : "gap-12"} lg:hidden block`}>
      {categories.map((c) => (
        <div key={c.key}>{c.component}</div>
      ))}
    </div>
  ) : (
    <RevealStagger className={`grid grid-cols-1 md:grid-cols-2 ${isLaptop ? "gap-6" : "gap-12"} lg:hidden block`} delay={0.1} interval={0.9}>
      {categories.map((c) => (
        <div key={c.key}>{c.component}</div>
      ))}
    </RevealStagger>
  );

  const desktopFirstRow = isMobile ? (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${isLaptop ? "gap-6 mb-6" : "gap-12 mb-12"}`}>
      <LanguagesCard />
      <DevOpsCard />
    </div>
  ) : (
    <RevealStagger className={`grid grid-cols-1 md:grid-cols-2 ${isLaptop ? "gap-6 mb-6" : "gap-12 mb-12"}`} delay={0.1} interval={0.9}>
      <LanguagesCard />
      <DevOpsCard />
    </RevealStagger>
  );

  const desktopSecondRow = isMobile ? (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${isLaptop ? "gap-6 mb-6" : "gap-12 mb-12"}`}>
      <FrontendCard />
      <BackendCard />
    </div>
  ) : (
    <RevealStagger className={`grid grid-cols-1 md:grid-cols-2 ${isLaptop ? "gap-6 mb-6" : "gap-12 mb-12"}`} delay={0.1} interval={0.9}>
      <FrontendCard />
      <BackendCard />
    </RevealStagger>
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