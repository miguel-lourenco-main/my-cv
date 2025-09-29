import Navigation from './components/Navigation'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ShootingStars from './components/shadcn/shooting-stars'
import { SmoothCursor } from './components/magic-ui/smooth-cursor'

export default function Home() {
  return (
    <div className="relative min-h-screen bg-transparent">
      <SmoothCursor />
      <ShootingStars className="absolute inset-0 z-0" initialDelayMs={0} />
      <div className="relative z-10">
        <Navigation />
        <Hero />
        <About />
        <Projects />
        <Contact />
        <Footer />
      </div>
    </div>
  )
} 