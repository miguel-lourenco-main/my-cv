import EmailButton from './EmailButton'
import GitlabButton from './GitlabButton'
import LinkedInButton from './LinkedInButton'
import ThemeToggle from './ThemeToggle'

export default function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Miguel Lourenço</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <div className="mr-4 flex items-baseline space-x-6">
                <GitlabButton width={20} height={20} className='p-0'/>
                <LinkedInButton width={20} height={20} className='p-0'/>
                <EmailButton width={20} height={20} className='p-0'/>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
} 