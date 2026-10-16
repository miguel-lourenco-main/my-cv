'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'
import type { LookDirection, ScreenId } from '../camera/layout'
import { SCREEN_LAYOUT, neighborScreen } from '../camera/layout'

const labelOf = (id: ScreenId | null) => SCREEN_LAYOUT.find((s) => s.id === id)?.label ?? ''

/** Where each guide arrow sits on the viewport edge, and its icon. */
const GUIDE: Record<LookDirection, { className: string; Icon: typeof ChevronLeft; keyHint: string }> = {
  left: { className: 'left-4 top-1/2 -translate-y-1/2 flex-row', Icon: ChevronLeft, keyHint: '←' },
  right: { className: 'right-4 top-1/2 -translate-y-1/2 flex-row-reverse', Icon: ChevronRight, keyHint: '→' },
  up: { className: 'left-1/2 top-6 -translate-x-1/2 flex-row', Icon: ChevronUp, keyHint: '↑' },
  down: { className: 'bottom-6 left-1/2 -translate-x-1/2 flex-row', Icon: ChevronDown, keyHint: '↓' },
}
const GUIDE_ORDER: LookDirection[] = ['up', 'left', 'right', 'down']

/**
 * 2D overlay drawn over the WebGL canvas: a "Back to space" control and guide
 * arrows to the neighbouring windows while a screen is focused, and a one-time
 * look-around hint at rest. The container is click-through; only the
 * interactive controls capture pointer events.
 */
export default function AmbientHud({
  focusedId,
  onBack,
  onNavigate,
}: {
  focusedId: ScreenId | null
  onBack: () => void
  /** Step to the neighbouring screen in a direction (same as the arrow keys). */
  onNavigate?: (dir: LookDirection) => void
}) {
  const [showHint, setShowHint] = useState(true)

  // Retire the hint shortly after the first interaction or a few seconds.
  useEffect(() => {
    if (focusedId) {
      setShowHint(false)
      return
    }
    const t = window.setTimeout(() => setShowHint(false), 6500)
    return () => window.clearTimeout(t)
  }, [focusedId])

  const label = labelOf(focusedId)

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <AnimatePresence>
        {focusedId && (
          <motion.button
            key="back"
            type="button"
            onClick={onBack}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md transition-colors hover:bg-black/60"
          >
            <ArrowLeft className="size-4" />
            Back to space
            <span className="ml-1 text-white/40">·</span>
            <span className="text-white/60">{label}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Guide arrows: one per neighbouring window, labelled with its name. */}
      <AnimatePresence>
        {focusedId &&
          onNavigate &&
          GUIDE_ORDER.map((dir) => {
            const next = neighborScreen(focusedId, dir)
            if (!next) return null
            const { className, Icon, keyHint } = GUIDE[dir]
            return (
              <motion.button
                key={`guide-${dir}`}
                type="button"
                onClick={() => onNavigate(dir)}
                aria-label={`Go to ${labelOf(next)}`}
                title={`${labelOf(next)} (${keyHint})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className={`cv-guide-arrow pointer-events-auto absolute flex items-center gap-2 rounded-full border border-white/15 bg-black/40 py-2 pl-2 pr-4 text-sm font-medium text-white/80 backdrop-blur-md transition-colors hover:bg-black/60 hover:text-white ${className}`}
              >
                <span className="cv-guide-arrow-icon flex size-7 items-center justify-center rounded-full border border-white/15">
                  <Icon className="size-4" />
                </span>
                {labelOf(next)}
              </motion.button>
            )
          })}
      </AnimatePresence>

      <AnimatePresence>
        {!focusedId && showHint && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-x-0 bottom-8 flex justify-center"
          >
            <div className="rounded-full border border-white/10 bg-black/35 px-5 py-2 text-sm text-white/70 backdrop-blur-md">
              Move the cursor or use arrow keys to look · Click a screen to open
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
