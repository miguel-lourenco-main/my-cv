"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/app/lib/utils";
import { useTheme } from "@/app/lib/theme-provider";

export type StarsBackgroundProps = {
  starDensity?: number; // stars per pixel area
  allStarsTwinkle?: boolean; // if false, stars are static
  twinkleProbability?: number; // when allStarsTwinkle is false
  minTwinkleSpeed?: number; // seconds
  maxTwinkleSpeed?: number; // seconds
  className?: string;
};

type StarDefinition = {
  id: number;
  xPercent: number; // 0..100
  yPercent: number; // 0..100
  sizePx: number;
  willTwinkle: boolean;
  twinkleDurationSec: number;
  twinkleDelaySec: number;
  glowDurationSec: number;
  glowDelaySec: number;
  brightness: number; // 0..1 for static brightness
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function StarsBackground({
  starDensity = 0.00015,
  allStarsTwinkle = false,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
}: StarsBackgroundProps) {
  const { theme } = useTheme();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [stars, setStars] = useState<StarDefinition[]>([]);

  // Determine if we're in dark mode
  const isDarkMode = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const box = entry.contentRect;
        setContainerSize({ width: Math.max(0, Math.floor(box.width)), height: Math.max(0, Math.floor(box.height)) });
      }
    });
    resizeObserver.observe(element);
    const box = element.getBoundingClientRect();
    setContainerSize({ width: Math.max(0, Math.floor(box.width)), height: Math.max(0, Math.floor(box.height)) });
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return;
    const area = containerSize.width * containerSize.height;
    const targetCount = Math.max(8, Math.floor(area * starDensity));
    const created: StarDefinition[] = [];
    for (let i = 0; i < targetCount; i++) {
      const willTwinkle = allStarsTwinkle || Math.random() < twinkleProbability;
      const twinkleDurationSec = willTwinkle ? randomBetween(minTwinkleSpeed, maxTwinkleSpeed) : 0;
      const twinkleDelaySec = willTwinkle ? Math.random() * 2 : 0;
      const glowDurationSec = willTwinkle ? randomBetween(0.6, 1.2) : 0;
      const glowDelaySec = willTwinkle ? Math.random() * 1.5 : 0;
      const brightness = Math.random() * 0.6 + 0.35; // 0.35..0.95
      created.push({
        id: i,
        xPercent: Math.random() * 100,
        yPercent: Math.random() * 100,
        sizePx: Math.random() < 0.85 ? 1 : 2,
        willTwinkle,
        twinkleDurationSec,
        twinkleDelaySec,
        glowDurationSec,
        glowDelaySec,
        brightness,
      });
    }
    setStars(created);
  }, [containerSize.width, containerSize.height, starDensity, allStarsTwinkle, twinkleProbability, minTwinkleSpeed, maxTwinkleSpeed]);

  return (
    <div ref={wrapperRef} className={cn("pointer-events-none relative h-full w-full overflow-hidden", className)}>
      <div className="absolute inset-0">
        {stars.map((star) => {
          const left = `${star.xPercent}%`;
          const top = `${star.yPercent}%`;
          const size = `${star.sizePx}px`;
          const twinkleAnimation = star.willTwinkle
            ? `${star.twinkleDurationSec}s twinkle ease-in-out ${star.twinkleDelaySec}s infinite alternate`
            : "none";
          const glowAnimation = star.willTwinkle ? `${star.glowDurationSec}s glowPulse ease-in-out ${star.glowDelaySec}s infinite alternate` : "none";

          // Theme-aware colors: darker colors in light mode, lighter colors in dark mode
          const starColor = isDarkMode ? "255,255,255" : "0,0,0";
          const backgroundGradient = isDarkMode 
            ? "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0.0) 70%)"
            : "radial-gradient(circle, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.0) 70%)";
          const boxShadow = isDarkMode
            ? "0 0 4px rgba(255,255,255,0.6), 0 0 8px rgba(255,255,255,0.35)"
            : "0 0 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.35)";

          return (
            <span
              key={star.id}
              className="absolute rounded-full"
              style={{
                left,
                top,
                width: size,
                height: size,
                background: backgroundGradient,
                boxShadow: boxShadow,
                animation: `${glowAnimation}${twinkleAnimation === "none" ? "" : ", " + twinkleAnimation}`,
                opacity: star.brightness,
              }}
            />
          );
        })}
      </div>
      {/* No global animations when stars are static; twinkle/glow keyframes are omitted to reduce work */}
    </div>
  );
}


