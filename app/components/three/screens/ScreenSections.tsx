'use client'

import Hero from '../../Hero'
import About from '../../About'
import Projects from '../../Projects'
import Contact from '../../Contact'
import type { ScreenId } from '../camera/layout'
import ScreenStage from './ScreenStage'

function SectionBody({
  id,
  greeting,
  showName,
}: {
  id: ScreenId
  greeting: string
  showName: boolean
}) {
  switch (id) {
    case 'about':
      // Only one copy may own the shared `intro-name` layoutId — the 2D page.
      return <Hero showShared={showName} greeting={greeting} isLaptop={false} />
    case 'tech':
      return <About isLaptop={false} />
    case 'projects':
      return <Projects isLaptop={false} />
    case 'contact':
      return <Contact isLaptop={false} />
    default:
      return null
  }
}

/**
 * Renders the real portfolio section for a screen, wrapped in its per-window
 * art-direction stage (background + framing + storytelling header). Mounted
 * inside the screen's `<Html>` (under {@link ScreenContextBridge}), so every
 * section hook resolves exactly as in the 2D shell.
 */
export default function ScreenSection({
  id,
  greeting,
  showName = true,
}: {
  id: ScreenId
  greeting: string
  /** False for the 3D preview copy so the 2D page solely owns shared layoutIds. */
  showName?: boolean
}) {
  return (
    <ScreenStage id={id}>
      <SectionBody id={id} greeting={greeting} showName={showName} />
    </ScreenStage>
  )
}
