"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import StarsBackground from "../shadcn/stars-background";
import NameBadge from "../identity/NameBadge";
import ProfileAvatar from "../identity/ProfileAvatar";

type IntroOverlayProps = {
  show: boolean;
  onDone: () => void;
  starsDelayMs?: number;
  afterStarsDelayMs?: number; // time after stars appear to transition to main
  greeting?: string;
};

export default function IntroOverlay({
  show,
  onDone,
  starsDelayMs = 300,
  afterStarsDelayMs = 1200,
  greeting,
}: IntroOverlayProps) {
  const [showStars, setShowStars] = useState(false);
  const cancelledRef = useRef(false);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!show) return;
    if (reducedMotion) {
      onDone();
      return;
    }
    cancelledRef.current = false;
    const starTimer = window.setTimeout(() => {
      if (!cancelledRef.current) setShowStars(true);
    }, Math.max(0, starsDelayMs));
    const doneTimer = window.setTimeout(() => {
      if (!cancelledRef.current) onDone();
    }, Math.max(0, starsDelayMs + afterStarsDelayMs));
    return () => {
      cancelledRef.current = true;
      window.clearTimeout(starTimer);
      window.clearTimeout(doneTimer);
    };
  }, [show, starsDelayMs, afterStarsDelayMs, onDone, reducedMotion]);

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
              className="flex flex-col items-center gap-y-24"
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

            {/* Skip button - accessible and minimal */}
            <button
              onClick={handleSkip}
              className="absolute right-4 top-4 rounded-md bg-secondary/60 px-3 py-1.5 text-sm text-foreground/80 backdrop-blur hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Skip
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


