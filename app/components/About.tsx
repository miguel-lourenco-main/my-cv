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
        "Next.js API routes",
        "REST",
        "Authentication",
        "File processing (PDF/DOCX)",
        "RAG/LLM integration (local inference like Ollama-style systems)",
      ],
    },
    {
      title: "DevOps",
      items: ["GitLab", "CI/CD pipelines", "GitLab Pages", "Environment/config management"],
    },
    {
      title: "Testing",
      items: ["End‑to‑end/UI test automation integrated into CI"],
    },
    {
      title: "Tooling",
      items: ["Git", "Linux", "Bash", "Pragmatic use of open‑source and AI tooling"],
    },
  ];

  return (
    <section id="about" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Technical Capabilities</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-3">Hover any card to see the icons move.</p>
        </div>
      </div>
    </section>
  )
}