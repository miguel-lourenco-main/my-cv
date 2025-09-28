'use client'

import Image from 'next/image'

const projects = [
  {
    title: 'UI Components Playground',
    description: 'A playground for you to explore and play with custom UI components.',
    url: 'https://ui-components-5218c2.gitlab.io/',
    image: '/projects/ui_components_preview.png',
    technologies: ['React', 'Tailwind CSS', 'TypeScript'],
  },
  {
    title: 'Sonora',
    description: 'A storytelling app for children, that uses LLMs to generate narration voices and in the future, the stories themselves.',
    url: 'https://sonora-d09e63.gitlab.io/',
    image: '/projects/sonora_preview.png',
    technologies: ['React', 'Tailwind CSS', 'TypeScript'],
  },
  {
    title: 'Agentic Hub',
    description: 'A hub for agentic systems, that allows users to invest, hire and create agents.',
    url: 'https://agentichub-64abdc.gitlab.io',
    image: '/projects/agentic_hub_preview.png',
    technologies: ['React', 'Tailwind CSS', 'TypeScript'],
  },
  {
    title: 'Cash Register',
    description: 'A very simple cash register app that allows you to add and remove items from a cart.',
    url: 'https://cash-register-a85839.gitlab.io/',
    image: '/projects/cash_register_preview.png',
    technologies: ['React', 'Tailwind CSS', 'TypeScript'],
  },
]

export default function Projects() {
  return (
    <section id="projects" className="py-20">
      <div className="max-w-3xl xl:max-w-7xl 3xl:max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Projects
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Here are some of the projects I've worked on. Each project represents a learning journey and showcases different skills.
          </p>
        </div>
        
        {/* Projects will be added here as you create them */}
        <div className="grid grid-cols-1 xl:grid-cols-2 3xl:grid-cols-3 gap-16">
          {/* Example project card - replace with your actual projects */}
          {projects.map((project) => (
            <div key={project.title} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open(project.url, '_blank')}>
              <div className="h-72 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <img src={project.image} alt={project.title} className="size-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{project.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {project.description}
                </p>
                <div className="flex space-x-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {project.technologies.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}