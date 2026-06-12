'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ParallaxRoot from '../parallax/ParallaxRoot'
import BrutalistPreloader from './BrutalistPreloader'
import BrutalistNav from './BrutalistNav'
import BrutalistHero from './BrutalistHero'
import BrutalistAbout from './BrutalistAbout'
import BrutalistContact from './BrutalistContact'

const BrutalistProjects = dynamic(() => import('./BrutalistProjects'), { ssr: false })

/**
 * Brutalist art direction — terminal / tech: monospace, hard 1px borders, raw
 * grid, command motifs. GSAP/CSS only (no WebGL).
 */
export default function BrutalistHome() {
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setStarted(true), 4000)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="brutalist relative h-screen overflow-hidden">
      <BrutalistPreloader onDone={() => setStarted(true)} />
      <ParallaxRoot>
        <BrutalistNav />
        <div id="page-scroll-container" className="relative h-full overflow-y-auto pt-11">
          <div data-lenis-content>
            <BrutalistHero started={started} />
            <BrutalistAbout />
            <BrutalistProjects />
            <BrutalistContact />
          </div>
        </div>
      </ParallaxRoot>
    </div>
  )
}
