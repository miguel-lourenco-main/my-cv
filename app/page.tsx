"use client";

import Navigation from './components/Navigation'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ShootingStars from './components/shadcn/shooting-stars'
import { SmoothCursor } from './components/magic-ui/smooth-cursor'
import IntroOverlay from './components/intro/IntroOverlay'
import React, { useEffect, useMemo, useState } from 'react'
import { LayoutGroup } from 'motion/react'
import ParallaxRoot from './components/parallax/ParallaxRoot'
import ScrollParallaxLayer from './components/parallax/ScrollParallaxLayer'

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  // Opt-out for users who prefer reduced motion or already saw intro
  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reducedMotion) setShowIntro(false);
  }, [reducedMotion]);

  const handleIntroDone = () => {
    setShowIntro(false);
  };

  return (
    <div className="relative min-h-screen bg-background h-fit overflow-hidden">
      <SmoothCursor />
      <LayoutGroup id="root-shared">

        {/* Intro overlay handles initial reveal and stays screen-space (no parallax) */}
        <IntroOverlay show={showIntro} onDone={handleIntroDone} />

        <ParallaxRoot>
          {/* Background parallax layer: motion-based smoothing, absolute and non-intrusive */}
          <ScrollParallaxLayer className="absolute inset-0 z-0 pointer-events-none" fromY={-180} toY={180}>
            <ShootingStars className='size-full' initialDelayMs={showIntro ? 1400 : 0} />
          </ScrollParallaxLayer>

          {/* Foreground content defines layout height; no parallax wrapper */}
          <div className={"relative z-10 transition-opacity duration-300 " + (showIntro ? "opacity-0 pointer-events-none" : "opacity-100") }>
            <Navigation />
            <Hero showShared={!showIntro} />
            <About />
            <Projects />
            <Contact />
            <Footer />
          </div>
        </ParallaxRoot>
      </LayoutGroup>
    </div>
  )
}