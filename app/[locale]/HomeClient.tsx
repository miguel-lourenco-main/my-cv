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
import { useIsLaptop } from '../lib/use-laptop-detection'

export default function HomeClient({ greeting }: { greeting: string }) {
  const [showIntro, setShowIntro] = useState(true);
  const isLaptop = useIsLaptop();

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

  // Build container classes conditionally
  // Only apply scroll snap if user hasn't reduced motion
  const shouldUseScrollSnap = isLaptop && !reducedMotion;
  const containerClasses = [
    "flex flex-col relative z-10 transition-opacity duration-300 overflow-y-auto h-screen gap-y-48 xl:gap-y-64 pb-12",
    shouldUseScrollSnap && "snap-y snap-mandatory",
    isLaptop ? "" : "pt-48 xl:pt-64 2xl:pt-72",
    "px-4 sm:px-6 lg:px-8",
    showIntro ? "opacity-0 pointer-events-none" : "opacity-100"
  ].filter(Boolean).join(" ");

  return (
    <div className="relative h-screen bg-background overflow-hidden">
      <SmoothCursor springConfig={{
        damping: 900,
        stiffness: 9000,
        mass: 0.011,
        restDelta: 0.9,
      }}/>
      <LayoutGroup id="root-shared">
        <IntroOverlay show={showIntro} onDone={handleIntroDone} greeting={greeting} />
        <ParallaxRoot>
          <ScrollParallaxLayer className="flex absolute inset-0 z-0 pointer-events-none h-[200%]" fromY={180} toY={-180} bleed={180}>
            <ShootingStars className='size-full' initialDelayMs={showIntro ? 1400 : 0} />
          </ScrollParallaxLayer>
          <div id="page-scroll-container" className={containerClasses}>
            {!isLaptop && <Navigation />}
            {isLaptop && <div className="fixed top-0 left-0 right-0 z-50"><Navigation /></div>}
            <Hero showShared={!showIntro} greeting={greeting} isLaptop={isLaptop} />
            <About isLaptop={isLaptop} />
            <Projects isLaptop={isLaptop} />
            <Contact isLaptop={isLaptop} />
          </div>
        </ParallaxRoot>
      </LayoutGroup>
    </div>
  )
}
