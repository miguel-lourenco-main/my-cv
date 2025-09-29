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
    <div className="relative min-h-screen bg-background">
      <SmoothCursor />
      <LayoutGroup id="root-shared">
        {/* Keep main stars on page; intro overlay will render its own background stars */}
        <ShootingStars className="absolute inset-0 z-0" initialDelayMs={showIntro ? 1400 : 0} />

        {/* Intro overlay handles initial reveal and shared-element start */}
        <IntroOverlay show={showIntro} onDone={handleIntroDone} />

        {/* Main content; identity renders only after intro to enable shared transition */}
        <div className={"relative z-10 transition-opacity duration-300 " + (showIntro ? "opacity-0 pointer-events-none" : "opacity-100") }>
          <Navigation />
          <Hero showShared={!showIntro} />
          <About />
          <Projects />
          <Contact />
          <Footer />
        </div>
      </LayoutGroup>
    </div>
  )
}