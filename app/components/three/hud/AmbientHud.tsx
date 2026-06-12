'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import type { ScreenId } from '../camera/layout'
import { SCREEN_LAYOUT } from '../camera/layout'

/**
 * 2D overlay drawn over the WebGL canvas: a "Back to space" control while a
 * screen is focused, and a one-time look-around hint at rest. The container is
 * click-through; only the interactive controls capture pointer events.
 */
export default function AmbientHud({
  focusedId,
  onBack,
}: {
  focusedId: ScreenId | null
  onBack: () => void
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

  const label = focusedId
    ? SCREEN_LAYOUT.find((s) => s.id === focusedId)?.label ?? ''
    : ''

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
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
              Drag to look around · Click a screen to open
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
