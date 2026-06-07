"use client";

import dynamic from 'next/dynamic'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import About from '../components/About'
import Contact from '../components/Contact'
import ShootingStars from '../components/shadcn/shooting-stars'
import IntroOverlay from '../components/intro/IntroOverlay'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { LayoutGroup } from 'motion/react'
import ParallaxRoot from '../components/parallax/ParallaxRoot'
import ScrollParallaxLayer from '../components/parallax/ScrollParallaxLayer'
import { DeviceDetectionProvider, useDeviceDetectionContext } from '../lib/device-detection-context'
import { ProjectImagesProvider, type ProjectImagesManifest } from '../lib/project-images-context'

const Projects = dynamic(() => import('../components/Projects'), { ssr: false })
const SmoothCursor = dynamic(
  () => import('../components/magic-ui/smooth-cursor').then((mod) => ({ default: mod.SmoothCursor })),
  { ssr: false }
)

function HomeClientContent({ greeting }: { greeting: string }) {
  const [showIntro, setShowIntro] = useState(true);
  const [cursorMode, setCursorMode] = useState<'default' | 'view'>('default');
  const [cursorHidden, setCursorHidden] = useState(false);
  const { isLaptop } = useDeviceDetectionContext();

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reducedMotion) setShowIntro(false);
  }, [reducedMotion]);

  const handleIntroDone = useCallback(() => {
    setShowIntro(false);
  }, []);

  const shouldUseScrollSnap = isLaptop && !reducedMotion;
  const containerClasses = [
    "flex flex-col relative z-10 transition-opacity duration-300 overflow-y-auto h-full pt-40 gap-y-48 xl:gap-y-64 pb-12",
    shouldUseScrollSnap && "snap-y snap-mandatory",
    isLaptop ? "" : "xl:pt-52 2xl:pt-64",
    "px-4 sm:px-6 lg:px-8",
    showIntro ? "opacity-0 pointer-events-none" : "opacity-100"
  ].filter(Boolean).join(" ");

  return (
    <div className="relative h-screen bg-background overflow-hidden">
      {!cursorHidden && !reducedMotion ? (
        <SmoothCursor
          springConfig={{
            damping: 900,
            stiffness: 9000,
            mass: 0.011,
            restDelta: 0.9,
          }}
          cursorMode={cursorMode}
        />
      ) : null}
      <LayoutGroup id="root-shared">
        <IntroOverlay show={showIntro} onDone={handleIntroDone} greeting={greeting} />
        <ParallaxRoot>
          <ScrollParallaxLayer
            className="flex absolute inset-0 z-0 pointer-events-none h-[200%]"
            fromY={180}
            toY={-180}
            bleed={180}
            disabled={reducedMotion}
          >
            <ShootingStars className='size-full' initialDelayMs={showIntro ? 1400 : 0} />
          </ScrollParallaxLayer>
          <div id="page-scroll-container" className={containerClasses}>
            {!isLaptop && <Navigation />}
            {isLaptop && <div className="fixed top-0 left-0 right-0 z-50"><Navigation /></div>}
            <Hero
              showShared={!showIntro}
              greeting={greeting}
              isLaptop={isLaptop}
              onCursorModeChange={setCursorMode}
              onCursorVisibilityChange={setCursorHidden}
            />
            <About isLaptop={isLaptop} />
            <Projects isLaptop={isLaptop} onCursorModeChange={setCursorMode} />
            <Contact isLaptop={isLaptop} />
          </div>
        </ParallaxRoot>
      </LayoutGroup>
    </div>
  )
}

export default function HomeClient({
  greeting,
  projectImagesManifest,
}: {
  greeting: string
  projectImagesManifest: ProjectImagesManifest
}) {
  return (
    <DeviceDetectionProvider>
      <ProjectImagesProvider manifest={projectImagesManifest}>
        <HomeClientContent greeting={greeting} />
      </ProjectImagesProvider>
    </DeviceDetectionProvider>
  )
}
