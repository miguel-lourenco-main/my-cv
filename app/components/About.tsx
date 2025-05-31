export default function About() {
  return (
    <section id="about" className="py-20 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            About Me
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            I'm a passionate developer with experience in modern web technologies.
            I love building applications that solve real-world problems and create meaningful user experiences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg bg-slate-50 dark:bg-slate-700">
            <div className="flex justify-center mb-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Frontend</h3>
            <p className="text-slate-600 dark:text-slate-300">React, Next.js, TypeScript, Tailwind CSS</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-slate-50 dark:bg-slate-700">
            <div className="flex justify-center mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Backend</h3>
            <p className="text-slate-600 dark:text-slate-300">Node.js, Python, PostgreSQL, MongoDB</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-slate-50 dark:bg-slate-700">
            <div className="flex justify-center mb-4">
              <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Tools</h3>
            <p className="text-slate-600 dark:text-slate-300">Git, Docker, AWS, CI/CD</p>
          </div>
        </div>
      </div>
    </section>
  )
} 