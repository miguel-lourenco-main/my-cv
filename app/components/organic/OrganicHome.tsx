'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import ParallaxRoot from '../parallax/ParallaxRoot'
import OrganicBackground from './OrganicBackground'
import OrganicPreloader from './OrganicPreloader'
import OrganicNav from './OrganicNav'
import OrganicHero from './OrganicHero'
import OrganicAbout from './OrganicAbout'
import OrganicContact from './OrganicContact'

// Deferred so its i18n project-namespace loading runs after init.
const OrganicProjects = dynamic(() => import('./OrganicProjects'), { ssr: false })

/**
 * Organic art direction — lush WebGL shader-gradient backdrop with frosted
 * glass UI floating above it.
 */
export default function OrganicHome() {
  const [started, setStarted] = useState(false)
  const revealRef = useRef(0)

  useEffect(() => {
    const id = window.setTimeout(() => setStarted(true), 4000)
    return () => window.clearTimeout(id)
  }, [])

  // Bloom the gradient in once the preloader hands off.
  useEffect(() => {
    if (!started) return
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      revealRef.current = Math.min(1, (now - start) / 1100)
      if (revealRef.current < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started])

  return (
    <div className="organic relative h-screen overflow-hidden">
      <OrganicBackground revealRef={revealRef} />
      <OrganicPreloader onDone={() => setStarted(true)} />
      <ParallaxRoot>
        <OrganicNav />
        <div id="page-scroll-container" className="relative z-10 h-full overflow-y-auto">
          <div data-lenis-content>
            <OrganicHero started={started} />
            <OrganicAbout />
            <OrganicProjects />
            <OrganicContact />
          </div>
        </div>
      </ParallaxRoot>
    </div>
  )
}
