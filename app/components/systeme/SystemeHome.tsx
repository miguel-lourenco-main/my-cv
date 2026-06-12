'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ParallaxRoot from '../parallax/ParallaxRoot'
import SystemePreloader from './SystemePreloader'
import SystemeNav from './SystemeNav'
import SystemeRail from './SystemeRail'
import SystemeHero from './SystemeHero'
import SystemeAbout from './SystemeAbout'
import SystemeContact from './SystemeContact'

// Deferred (ssr:false) so its i18n project-namespace loading runs after the
// TranslationProvider has initialised — mirrors the original Projects mount.
const SystemeProjects = dynamic(() => import('./SystemeProjects'), { ssr: false })

/**
 * Top-level composition for the Systeme art direction — a single full-viewport
 * shell hosting the boot preloader, persistent nav + pipeline rail, and the
 * smooth-scrolled section stack (Input → Architecture → Output → Endpoint).
 */
export default function SystemeHome() {
  const [started, setStarted] = useState(false)

  // Safety net: if the preloader animation never completes, reveal the hero anyway.
  useEffect(() => {
    const id = window.setTimeout(() => setStarted(true), 4000)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="systeme relative h-screen overflow-hidden">
      <SystemePreloader onDone={() => setStarted(true)} />
      <ParallaxRoot>
        <SystemeNav />
        <SystemeRail />
        <div id="page-scroll-container" className="relative h-full overflow-y-auto">
          <div data-lenis-content>
            <SystemeHero started={started} />
            <SystemeAbout />
            <SystemeProjects />
            <SystemeContact />
          </div>
        </div>
      </ParallaxRoot>
    </div>
  )
}
