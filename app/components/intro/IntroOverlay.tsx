"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import StarsBackground from "../shadcn/stars-background";
import NameBadge from "../identity/NameBadge";
import ProfileAvatar from "../identity/ProfileAvatar";

/**
 * Props for the IntroOverlay component.
 */
type IntroOverlayProps = {
  /** Whether to show the intro overlay */
  show: boolean;
  /** Callback when intro animation completes or is skipped */
  onDone: () => void;
  /** Delay in milliseconds before stars appear */
  starsDelayMs?: number;
  /** Time in milliseconds after stars appear before transitioning to main content */
  afterStarsDelayMs?: number;
  /** Optional greeting text for the name badge */
  greeting?: string;
};

/**
 * Full-screen intro overlay component with animated stars background.
 * Displays profile avatar and name badge with smooth transitions.
 * Respects prefers-reduced-motion and can be skipped by user.
 * 
 * @param props - IntroOverlay component props
 * @param props.show - Whether overlay is visible
 * @param props.onDone - Completion callback
 * @param props.starsDelayMs - Stars animation delay (default: 300ms)
 * @param props.afterStarsDelayMs - Delay after stars before transition (default: 1200ms)
 * @param props.greeting - Greeting text for name badge
 * 
 * @example
 * ```tsx
 * <IntroOverlay show={true} onDone={() => setShowIntro(false)} />
 * ```
 */
export default function IntroOverlay({
  show,
  onDone,
  starsDelayMs = 300,
  afterStarsDelayMs = 1200,
  greeting,
}: IntroOverlayProps) {
  const [showStars, setShowStars] = useState(false);
  // Track if animation was cancelled (e.g., by skip button)
  const cancelledRef = useRef(false);

  // Check for reduced motion preference
  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Handle intro animation sequence
  useEffect(() => {
    if (!show) return;
    // Skip animation if user prefers reduced motion
    if (reducedMotion) {
      onDone();
      return;
    }
    cancelledRef.current = false;
    // Show stars after delay
    const starTimer = window.setTimeout(() => {
      if (!cancelledRef.current) setShowStars(true);
    }, Math.max(0, starsDelayMs));
    // Transition to main content after stars + additional delay
    const doneTimer = window.setTimeout(() => {
      if (!cancelledRef.current) onDone();
    }, Math.max(0, starsDelayMs + afterStarsDelayMs));
    return () => {
      cancelledRef.current = true;
      window.clearTimeout(starTimer);
      window.clearTimeout(doneTimer);
    };
  }, [show, starsDelayMs, afterStarsDelayMs, onDone, reducedMotion]);

  // Handle skip button click
  const handleSkip = () => {
    cancelledRef.current = true;
    onDone();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Stars behind, fade in after a delay */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: showStars ? 1 : 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <StarsBackground className="absolute inset-0" />
          </motion.div>

          {/* Centered identity */}
          <div className="relative h-full w-full flex items-center justify-center">
            <motion.div
              className="flex flex-col items-center gap-y-24 px-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Landscape, larger avatar ~5x previous visible footprint */}
              <ProfileAvatar
                layoutId="intro-avatar"
                width={500}
                height={300}
                alt="Miguel Lourenço"
                imageClassName="rounded-xl object-cover"
              />
              <NameBadge layoutId="intro-name" variant="intro" greeting={greeting} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


