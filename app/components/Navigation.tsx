'use client'

import { useState, useEffect, useRef } from 'react'
import EmailButton from './EmailButton'
import GitlabButton from './GitlabButton'
import LinkedInButton from './LinkedInButton'
import LanguageSwitcher from './LanguageSwitcher'

/**
 * Fixed navigation bar component with scroll-based styling changes.
 * Expands/collapses width and applies animations based on scroll position.
 * Supports both window scrolling and custom scroll containers.
 * 
 * Features:
 * - Scroll detection with 100px threshold
 * - Smooth width transitions via CSS animations
 * - Social media links and theme/language controls
 * - Responsive layout with mobile/desktop variations
 * 
 * @example
 * ```tsx
 * <Navigation />
 * ```
 */
export default function Navigation() {
  // State for scroll threshold detection (triggers at 100px)
  const [isScrolled, setIsScrolled] = useState(false)
  // Visual state that drives the actual max-width CSS class
  const [visualScrolled, setVisualScrolled] = useState(false)
  // CSS animation class name (nav-anim-expand or nav-anim-collapse)
  const [animClass, setAnimClass] = useState<string>('')
  // Prevents multiple simultaneous animations
  const isAnimatingRef = useRef(false)
  // Tracks if component has mounted (for initial state)
  const mountedRef = useRef(false)
  // Reference to the scrollable container (window or custom element)
  const scrollerRef = useRef<Window | HTMLElement | null>(null)

  // Set up scroll detection with throttling via requestAnimationFrame
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Prefer the inner scroll container if present; fallback to window
    const el = document.getElementById('page-scroll-container')
    scrollerRef.current = (el as HTMLElement) || window

    let ticking = false
    // Get scroll position from either custom container or window
    const getScrollPos = () => {
      if (el && typeof el.scrollTop === 'number') return el.scrollTop
      return window.scrollY
    }
    // Update scroll state based on 100px threshold
    const update = () => {
      const next = getScrollPos() > 100
      setIsScrolled(prev => (prev !== next ? next : prev))
    }

    // Initialize on mount to avoid wrong initial visual state
    update()

    // Throttle scroll handler using requestAnimationFrame
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          update()
          ticking = false
        })
        ticking = true
      }
    }

    const target: any = scrollerRef.current
    target?.addEventListener('scroll', handleScroll, { passive: true })
    return () => target?.removeEventListener('scroll', handleScroll)
  }, [])

  // Drive CSS animation without snapping the base width
  // This effect manages the animation state separately from visual state
  // to allow smooth transitions without jarring width changes
  useEffect(() => {
    // On first mount, sync visual state without animation
    if (!mountedRef.current) {
      mountedRef.current = true
      setVisualScrolled(isScrolled)
      return
    }
    // Prevent starting new animation while one is in progress
    if (isAnimatingRef.current) return
    // Trigger animation when scroll state changes
    if (isScrolled !== visualScrolled) {
      isAnimatingRef.current = true
      setAnimClass(isScrolled ? 'nav-anim-expand' : 'nav-anim-collapse')
    }
  }, [isScrolled, visualScrolled])

  return (
    <nav className="flex justify-center items-center fixed top-0 left-0 w-full z-50">
      <div
        className={`w-full mx-auto ${!visualScrolled && 'max-w-[98vw] sm:max-w-[70vw] 2xl:max-w-[1100px]'} ${animClass}`}
        onAnimationEnd={() => {
          // Update visual state after animation completes
          // This ensures smooth transition without width snapping
          if (isAnimatingRef.current) {
            setVisualScrolled(isScrolled)
            setAnimClass('')
            isAnimatingRef.current = false
          }
        }}
      >
        <div className={`flex justify-between items-center h-16 px-2 sm:px-6`}>
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Miguel Lourenço</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <div className="mr-4 flex items-baseline space-x-6">
                <GitlabButton width={22} height={22} className='p-0'/>
                <LinkedInButton width={20} height={20} className='p-0 text-[#2867b2] hover:text-[#0a66c2]'/>
                <EmailButton width={22} height={22} className='p-0'/>
              </div>
            </div>
            <LanguageSwitcher/>
          </div>
        </div>
      </div>
    </nav>
  )
} 