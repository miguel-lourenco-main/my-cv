'use client'

import { useState, useEffect, useRef } from 'react'
import EmailButton from './EmailButton'
import GitlabButton from './GitlabButton'
import LinkedInButton from './LinkedInButton'
import ThemeToggle from './ThemeToggle'

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false) // threshold state
  const [visualScrolled, setVisualScrolled] = useState(false) // drives base max-width
  const [animClass, setAnimClass] = useState<string>('') // nav-anim-expand/collapse
  const isAnimatingRef = useRef(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      const scrollY = window.scrollY
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Only update state when threshold crossing actually changes the value
          const next = scrollY > 100
          setIsScrolled(prev => (prev !== next ? next : prev))
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Drive CSS animation without snapping the base width
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      setVisualScrolled(isScrolled)
      return
    }
    if (isAnimatingRef.current) return
    if (isScrolled !== visualScrolled) {
      isAnimatingRef.current = true
      setAnimClass(isScrolled ? 'nav-anim-expand' : 'nav-anim-collapse')
    }
  }, [isScrolled, visualScrolled])

  return (
    <nav className="fixed top-0 w-full z-50">
      <div
        className={`w-full mx-auto ${visualScrolled ? 'max-w-[100vw]' : 'max-w-[1100px]'} ${animClass} px-4 sm:px-6 lg:px-8`}
        onAnimationEnd={() => {
          if (isAnimatingRef.current) {
            setVisualScrolled(isScrolled)
            setAnimClass('')
            isAnimatingRef.current = false
          }
        }}
      >
        <div className={`flex justify-between items-center h-16`}>
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