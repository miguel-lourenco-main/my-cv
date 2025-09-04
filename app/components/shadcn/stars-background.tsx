"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/app/lib/utils";

export type StarsBackgroundProps = {
  starDensity?: number; // stars per pixel area
  allStarsTwinkle?: boolean;
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
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function StarsBackground({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
}: StarsBackgroundProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [stars, setStars] = useState<StarDefinition[]>([]);

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
      const twinkleDurationSec = randomBetween(minTwinkleSpeed, maxTwinkleSpeed);
      const twinkleDelaySec = Math.random() * 2;
      const glowDurationSec = randomBetween(0.6, 1.2);
      const glowDelaySec = Math.random() * 1.5;
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
          const glowAnimation = `${star.glowDurationSec}s glowPulse ease-in-out ${star.glowDelaySec}s infinite alternate`;

          return (
            <span
              key={star.id}
              className="absolute rounded-full"
              style={{
                left,
                top,
                width: size,
                height: size,
                background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0.0) 70%)",
                boxShadow: "0 0 4px rgba(255,255,255,0.6), 0 0 8px rgba(255,255,255,0.35)",
                animation: `${glowAnimation}${twinkleAnimation === "none" ? "" : ", " + twinkleAnimation}`,
              }}
            />
          );
        })}
      </div>
      <style jsx global>{`
        @keyframes twinkle {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        @keyframes glowPulse {
          0% {
            box-shadow: 0 0 3px rgba(255,255,255,0.5), 0 0 6px rgba(255,255,255,0.25);
            transform: scale(1);
          }
          100% {
            box-shadow: 0 0 6px rgba(255,255,255,0.9), 0 0 12px rgba(255,255,255,0.5);
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}


