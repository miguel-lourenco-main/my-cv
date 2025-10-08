import LanguagesCard from "./categories/LanguagesCard";
import FrontendCard from "./categories/FrontendCard";
import BackendCard from "./categories/BackendCard";
import DevOpsCard from "./categories/DevOpsCard";
import ToolingCard from "./categories/ToolingCard";
import { RevealStagger } from "./Reveal";

export default function About() {
  const categories = [
    { key: "languages", component: <LanguagesCard /> },
    { key: "frontend", component: <FrontendCard /> },
    { key: "backend", component: <BackendCard /> },
    { key: "devops", component: <DevOpsCard /> },
    { key: "tooling", component: <ToolingCard /> },
  ];

  //add to the ai tooling icon, a set that is made up of 3 ai tools that I regularly use

  return (
    <section id="technical-skills" className="max-w-9xl mx-auto">
      <RevealStagger className="text-center mb-20" delay={2.2} interval={0.06}>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Technical Skills</h2>
      </RevealStagger>
      <RevealStagger delay={2.4} interval={0.06}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:hidden block">
            {categories.map((c) => (
              <div key={c.key}>{c.component}</div>
            ))}
      </div>
      </RevealStagger>
      <div className="lg:block hidden">
        <RevealStagger delay={2.4} interval={0.06}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
            <LanguagesCard />
            <FrontendCard />
            <BackendCard />
          </div>
        </RevealStagger>

        <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 gap-12 lg:max-w-5xl mx-auto" delay={0.1} interval={0.06}>
          <DevOpsCard />
          <ToolingCard />
        </RevealStagger>
      </div>
    </section>
  )
}