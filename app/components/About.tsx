export default function About() {
  const categories = [
    {
      title: "Languages",
      items: ["TypeScript/JavaScript", "C# (.NET for Visual Studio extensions)", "HTML/CSS"],
    },
    {
      title: "Frontend",
      items: ["React", "Next.js (App Router)", "Tailwind CSS", "shadcn/ui", "Figma", "Vercel v0"],
    },
    {
      title: "Backend",
      items: [
        "Node.js",
        "Next.js",
        "REST",
        "File processin",
        "RAG/LLM integration",
      ],
    },
    {
      title: "DevOps",
      items: ["GitLab", "CI/CD pipelines", "GitLab Pages", "Environment/config management"],
    },
    {
      title: "Testing",
      items: ["End‑to‑end/UI test automation integrated into CI with Playwright"],
    },
    {
      title: "Tooling",
      items: ["Git", "Linux", "Bash", "Pragmatic use of open‑source and AI tooling"],
    },
  ];

  return (
    <section id="about" className="py-20">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Technical Capabilities</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-3">These are the technologies I'm most comfortable with.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {categories.map((category) => (
            <div key={category.title} className="p-12 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{category.title}</h3>
              <p className="text-center text-slate-600 dark:text-slate-300">
                {category.items.join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}