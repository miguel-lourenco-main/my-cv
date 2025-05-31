export default function Projects() {
  return (
    <section id="projects" className="py-20 bg-slate-50 dark:bg-slate-900">
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
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <span className="text-white text-lg font-medium">Project Preview</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Coming Soon</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Exciting projects are in development. Check back soon to see what I'm building!
              </p>
              <div className="flex space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 