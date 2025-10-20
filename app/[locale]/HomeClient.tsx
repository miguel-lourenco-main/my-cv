"use client";

import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import About from '../components/About'
import Projects from '../components/Projects'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import ShootingStars from '../components/shadcn/shooting-stars'
import { SmoothCursor } from '../components/magic-ui/smooth-cursor'
import IntroOverlay from '../components/intro/IntroOverlay'
import React, { useEffect, useMemo, useState } from 'react'
import { LayoutGroup } from 'motion/react'
import ParallaxRoot from '../components/parallax/ParallaxRoot'
import ScrollParallaxLayer from '../components/parallax/ScrollParallaxLayer'

export default function HomeClient({ greeting }: { greeting: string }) {
  const [showIntro, setShowIntro] = useState(true);

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
      <SmoothCursor springConfig={{
        damping: 900,
        stiffness: 9000,
        mass: 0.011,
        restDelta: 0.9,
      }}/>
      <LayoutGroup id="root-shared">
        <IntroOverlay show={showIntro} onDone={handleIntroDone} greeting={greeting} />
        <ParallaxRoot>
          <ScrollParallaxLayer className="absolute inset-0 z-0 pointer-events-none h-[120%]" fromY={180} toY={-180} bleed={180}>
            <ShootingStars className='size-full' initialDelayMs={showIntro ? 1400 : 0} />
          </ScrollParallaxLayer>
          <div className={"flex flex-col gap-y-48 xl:gap-y-64 pb-12 pt-48 xl:pt-64 2xl:pt-72 px-4 sm:px-6 lg:px-8 relative z-10 transition-opacity duration-300 " + (showIntro ? "opacity-0 pointer-events-none" : "opacity-100") }>
            <Navigation />
            <Hero showShared={!showIntro} greeting={greeting} />
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
