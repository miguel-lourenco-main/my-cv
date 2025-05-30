import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Miguel de Sousa Lourenço</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#about" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  About
                </a>
                <a href="#projects" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Projects
                </a>
                <a href="#contact" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Hi, I'm{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Miguel de Sousa Lourenço
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Full Stack Developer passionate about creating beautiful, functional, and user-centered digital experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="#contact"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Get In Touch
              </a>
              <a
                href="#projects"
                className="inline-flex items-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
              >
                View My Work
              </a>
            </div>
            
            {/* Social Links in Hero */}
            <div className="flex justify-center space-x-6">
              <a
                href="https://gitlab.com/miguel-lourenco-main"
                className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94L2.77 9.98 1.04 3.25a.85.85 0 0 1 .81-1.1.85.85 0 0 1 .81.7L4.5 9.98h15l1.84-7.13a.85.85 0 0 1 .81-.7.85.85 0 0 1 .81 1.1l-1.73 6.73 1.72 3.47a.84.84 0 0 1-.3.94z"/>
                </svg>
                <span className="hidden sm:inline">GitLab</span>
              </a>
              <a
                href="https://www.linkedin.com/in/miguel-louren%C3%A7o-395335355/"
                className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
              <a
                href="mailto:migasoulou@gmail.com"
                className="flex items-center space-x-2 text-slate-600 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span className="hidden sm:inline">Email</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
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

      {/* Projects Section */}
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

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              I'm always interested in new opportunities, collaborations, and interesting conversations about technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a
                href="mailto:migasoulou@gmail.com"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Send Email
              </a>
            </div>
            
            {/* Social Links */}
            <div className="flex justify-center space-x-8">
              <a
                href="https://gitlab.com/miguel-lourenco-main"
                className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94L2.77 9.98 1.04 3.25a.85.85 0 0 1 .81-1.1.85.85 0 0 1 .81.7L4.5 9.98h15l1.84-7.13a.85.85 0 0 1 .81-.7.85.85 0 0 1 .81 1.1l-1.73 6.73 1.72 3.47a.84.84 0 0 1-.3.94z"/>
                </svg>
                <span>GitLab</span>
              </a>
              <a
                href="https://www.linkedin.com/in/miguel-louren%C3%A7o-395335355/"
                className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-center">
        <p className="text-slate-400">
          Miguel de Sousa Lourenço. Built with Next.js and Tailwind CSS.
        </p>
      </footer>
    </div>
  )
} 