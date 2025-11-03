import LanguagesCard from "./categories/LanguagesCard";
import FrontendCard from "./categories/FrontendCard";
import BackendCard from "./categories/BackendCard";
import DevOpsCard from "./categories/DevOpsCard";
import ToolingCard from "./categories/ToolingCard";
import { RevealStagger } from "./Reveal";
import { useI18n } from "../lib/i18n";

export default function About({ isLaptop = false }: { isLaptop?: boolean }) {
  const { t } = useI18n();
  const ta = t('about');
  const categories = [
    { key: "languages", component: <LanguagesCard /> },
    { key: "frontend", component: <FrontendCard /> },
    { key: "backend", component: <BackendCard /> },
    { key: "devops", component: <DevOpsCard /> },
    { key: "tooling", component: <ToolingCard /> },
  ];

  //add to the ai tooling icon, a set that is made up of 3 ai tools that I regularly use

  const sectionClasses = [
    "max-w-9xl mx-auto",
    isLaptop ? "h-screen flex-none snap-center flex flex-col justify-center" : ""
  ].filter(Boolean).join(" ");

  return (
    <section id="technical-skills" className={sectionClasses}>
      <RevealStagger className={`text-center ${isLaptop ? "mb-8" : "mb-20"}`} delay={0.1} interval={0.06}>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{ta('title')}</h2>
      </RevealStagger>
      <RevealStagger className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isLaptop ? "gap-6" : "gap-12"} lg:hidden block`} delay={0.1} interval={0.9}>
        {categories.map((c) => (
          <div key={c.key}>{c.component}</div>
        ))}
      </RevealStagger>
      <div className="lg:block hidden">
        <RevealStagger className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isLaptop ? "gap-6 mb-6" : "gap-12 mb-12"}`} delay={0.1} interval={0.9}>
          <LanguagesCard />
          <FrontendCard />
          <BackendCard />
        </RevealStagger>

        <RevealStagger className={`grid grid-cols-1 sm:grid-cols-2 ${isLaptop ? "gap-6" : "gap-12"} lg:max-w-5xl mx-auto`} delay={0.1} interval={0.9}>
          <DevOpsCard />
          <ToolingCard />
        </RevealStagger>
      </div>
    </section>
  )
}