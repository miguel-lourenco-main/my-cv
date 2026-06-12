'use client'

import { motion } from 'motion/react'
import { RevealStaticContext } from '../../Reveal'
import ScreenSection from '../screens/ScreenSections'
import { SCREEN_ACCENT } from '../screens/screen-theme'
import type { ScreenId } from '../camera/layout'

export type SlideDir = { x: number; y: number } | null

/**
 * The real 2D page that takes over once the 3D window has zoomed to full-screen.
 * Rendered outside the R3F canvas (directly under the app providers), so the
 * section content behaves like a normal, crisp, natively-scrolling page.
 *
 * Transitions, driven by the parent's AnimatePresence + `custom`:
 *  - open/close (`dir = null`): a holographic "boot-in" — the page resolves out
 *    of blur + a slight over-scale as it sharpens, while a scanline sweeps down,
 *    so it feels like arriving out of the zoom and powering on (matches the HUD).
 *  - switch (`dir = {x,y}`): the pages slide on a shared plane, both opaque, so
 *    the 3D space is never revealed between them.
 */
const variants = {
  initial: (d: SlideDir) =>
    d
      ? { x: `${d.x * 100}%`, y: `${d.y * 100}%`, opacity: 1, scale: 1, filter: 'blur(0px)' }
      : { x: '0%', y: '0%', opacity: 0, scale: 1.06, filter: 'blur(16px)' },
  center: { x: '0%', y: '0%', opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: (d: SlideDir) =>
    d
      ? { x: `${-d.x * 100}%`, y: `${-d.y * 100}%`, opacity: 1, scale: 1, filter: 'blur(0px)' }
      : { x: '0%', y: '0%', opacity: 0, scale: 1.03, filter: 'blur(12px)' },
}

export default function FocusedPage({
  id,
  greeting,
  dir,
}: {
  id: ScreenId
  greeting: string
  dir: SlideDir
}) {
  const accent = SCREEN_ACCENT[id]
  return (
    <motion.div
      className="cv-focus-page cv-screen-surface fixed inset-0 z-40 overflow-y-auto overflow-x-hidden bg-[#05060a]"
      custom={dir}
      variants={variants}
      initial="initial"
      animate="center"
      exit="exit"
      transition={
        dir
          ? { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
          : { duration: 0.75, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {/* Power-on scanline sweep (only on open, not on slide switches). */}
      {!dir && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-[5] h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            boxShadow: `0 0 18px 3px ${accent}`,
          }}
          initial={{ top: '-2vh', opacity: 0 }}
          animate={{ top: '102vh', opacity: [0, 0.9, 0.9, 0] }}
          transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.08 }}
        />
      )}

      <RevealStaticContext.Provider value={true}>
        <ScreenSection id={id} greeting={greeting} />
      </RevealStaticContext.Provider>
    </motion.div>
  )
}
