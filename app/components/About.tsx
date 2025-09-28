import LanguagesCard from "./categories/LanguagesCard";
import FrontendCard from "./categories/FrontendCard";
import BackendCard from "./categories/BackendCard";
import DevOpsCard from "./categories/DevOpsCard";
import ToolingCard from "./categories/ToolingCard";

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
    <section id="about" className="py-20">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Technical Capabilities</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-3">These are the technologies I'm most comfortable with.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:hidden block">
          {categories.map((c) => (
            <div key={c.key}>{c.component}</div>
          ))}
        </div>
        <div className="lg:block hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
            <div><LanguagesCard /></div>
            <div><FrontendCard /></div>
            <div><BackendCard /></div>
          </div>

          {/* Row 2: 2 centered cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 lg:max-w-5xl mx-auto">
            <div><DevOpsCard /></div>
            <div><ToolingCard /></div>
          </div>
        </div>
      </div>
    </section>
  )
}