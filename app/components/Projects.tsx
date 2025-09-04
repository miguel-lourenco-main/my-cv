'use client'

import Image from 'next/image'

export default function Projects() {
  return (
    <section id="projects" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Projects
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Here are some of the projects I've worked on. Each project represents a learning journey and showcases different skills.
          </p>
        </div>
        
        {/* Projects will be added here as you create them */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Example project card - replace with your actual projects */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('https://personal1625516.gitlab.io/ui-components', '_blank')}>
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Image src="/playground.png" alt="UI Components Playground" width={500} height={500} />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">UI Components Playground</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                A playground for you to explore and play with custom UI components.
              </p>
              <div className="flex space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  React, Tailwind CSS, TypeScript
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 