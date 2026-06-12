'use client'

import Hero from '../../Hero'
import About from '../../About'
import Projects from '../../Projects'
import Contact from '../../Contact'
import type { ScreenId } from '../camera/layout'

/**
 * Renders the real portfolio section for a given screen id. Mounted inside the
 * screen's `<Html>` (under {@link ScreenContextBridge}), so every section hook
 * — `useI18n`, `useProjectImagesManifest`, device detection — resolves exactly
 * as in the 2D shell. `isLaptop={false}` selects the natural vertical layout
 * (no full-viewport scroll-snap), which suits a panel.
 */
export default function ScreenSection({
  id,
  greeting,
}: {
  id: ScreenId
  greeting: string
}) {
  switch (id) {
    case 'about':
      return <Hero showShared greeting={greeting} isLaptop={false} />
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
