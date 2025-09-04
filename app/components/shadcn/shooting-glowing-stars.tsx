"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/app/lib/utils";

type ShootingStarsProps = {
  minSpeed?: number; // px per second
  maxSpeed?: number; // px per second
  minDelay?: number; // ms
  maxDelay?: number; // ms
  starColor?: string;
  trailColor?: string;
  starWidth?: number; // px
  starHeight?: number; // px
};

type StarsBackgroundProps = {
  starDensity?: number; // stars per pixel area
  allStarsTwinkle?: boolean;
  twinkleProbability?: number; // when allStarsTwinkle is false
  minTwinkleSpeed?: number; // seconds
  maxTwinkleSpeed?: number; // seconds
};

export type ShootingGlowingStarsProps = ShootingStarsProps &
  StarsBackgroundProps & {
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

type ShootingInstance = {
  id: number;
  startLeftPx: number;
  startTopPx: number;
  deltaX: number;
  deltaY: number;
  angleRad: number;
  durationMs: number;
  isFlying: boolean;
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function ShootingGlowingStars({
  // Glowing/Twinkle background defaults (inspired by Aceternity Glowing Stars)
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  // Shooting star defaults (rarer events ~ every ~20s)
  minSpeed = 600,
  maxSpeed = 1200,
  minDelay = 1000,
  maxDelay = 2000,
  starColor = "#9E00FF",
  trailColor = "#ffffff",
  starWidth = 140,
  starHeight = 2,
  className,
}: ShootingGlowingStarsProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [stars, setStars] = useState<StarDefinition[]>([]);
  const [shooting, setShooting] = useState<ShootingInstance | null>(null);

  // Measure container size
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
    // Initial measure
    const box = element.getBoundingClientRect();
    setContainerSize({ width: Math.max(0, Math.floor(box.width)), height: Math.max(0, Math.floor(box.height)) });

    return () => resizeObserver.disconnect();
  }, []);

  // Create stars when size or density changes
  useEffect(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return;
    const area = containerSize.width * containerSize.height;
    const targetCount = Math.max(8, Math.floor(area * starDensity));
    const created: StarDefinition[] = [];
    for (let i = 0; i < targetCount; i++) {
      const willTwinkle = allStarsTwinkle || Math.random() < twinkleProbability;
      const twinkleDurationSec = randomBetween(minTwinkleSpeed, maxTwinkleSpeed);
      const twinkleDelaySec = Math.random() * 2; // small random staggers
      const glowDurationSec = randomBetween(0.6, 1.2);
      const glowDelaySec = Math.random() * 1.5;
      created.push({
        id: i,
        xPercent: Math.random() * 100,
        yPercent: Math.random() * 100,
        sizePx: Math.random() < 0.85 ? 1 : 2, // mostly tiny stars
        willTwinkle,
        twinkleDurationSec,
        twinkleDelaySec,
        glowDurationSec,
        glowDelaySec,
      });
    }
    setStars(created);
  }, [containerSize.width, containerSize.height, starDensity, allStarsTwinkle, twinkleProbability, minTwinkleSpeed, maxTwinkleSpeed]);

  // Shooting star scheduler ~ once every ~20s randomly.
  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;

    const scheduleNext = () => {
      const delay = Math.max(0, Math.floor(randomBetween(minDelay, maxDelay)));
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        triggerShootingStar();
        scheduleNext();
      }, delay);
    };

    const triggerShootingStar = () => {
      const { width, height } = containerSize;
      if (!width || !height) return;

      // Start slightly offscreen on the right/top quadrant and fly diagonally to left/bottom
      const startLeftPx = width + randomBetween(40, 140); // offscreen right
      const startTopPx = randomBetween(-60, height * 0.5);
      const endLeftPx = -randomBetween(60, 180); // offscreen left
      const endTopPx = startTopPx + randomBetween(height * 0.15, height * 0.4);

      const deltaX = endLeftPx - startLeftPx;
      const deltaY = endTopPx - startTopPx;
      const distance = Math.hypot(deltaX, deltaY);
      const speedPxPerSec = randomBetween(minSpeed, maxSpeed);
      const durationMs = Math.max(500, Math.floor((distance / speedPxPerSec) * 1000));
      const angleRad = Math.atan2(deltaY, deltaX);

      const instance: ShootingInstance = {
        id: Date.now(),
        startLeftPx,
        startTopPx,
        deltaX,
        deltaY,
        angleRad,
        durationMs,
        isFlying: false,
      };
      console.log("Setting shooting instance", instance);
      setShooting(instance);

      // Start animation next frame
      requestAnimationFrame(() => {
        setShooting((prev) => (prev && prev.id === instance.id ? { ...prev, isFlying: true } : prev));
      });
    };

    // Show the first shooting star shortly after mount so it's noticeable,
    // then schedule subsequent stars roughly every ~20s.
    const initialDelay = Math.floor(randomBetween(800, 2200));
    timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      triggerShootingStar();
      scheduleNext();
    }, initialDelay);
    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [containerSize.width, containerSize.height, minDelay, maxDelay, minSpeed, maxSpeed]);

  const handleShootingEnd = useCallback(() => {
    setShooting(null);
  }, []);

  return (
    <div ref={wrapperRef} className={cn("pointer-events-none relative h-full w-full overflow-hidden", className)}>
      {/* Stars field with twinkle and glow pulses */}
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
                // A tiny radial gradient dot for base star
                background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0.0) 70%)",
                boxShadow: "0 0 4px rgba(255,255,255,0.6), 0 0 8px rgba(255,255,255,0.35)",
                animation: `${glowAnimation}${twinkleAnimation === "none" ? "" : ", " + twinkleAnimation}`,
              }}
            />
          );
        })}
      </div>

      {/* Shooting star (single instance at a time) */}
      {shooting && (
        <div
          key={shooting.id}
          className="absolute"
          onTransitionEnd={handleShootingEnd}
          style={{
            left: 0,
            top: 0,
            transform: `translate(${shooting.isFlying ? shooting.startLeftPx + shooting.deltaX : shooting.startLeftPx}px, ${
              shooting.isFlying ? shooting.startTopPx + shooting.deltaY : shooting.startTopPx
            }px)`,
            transition: `transform ${shooting.durationMs}ms linear`,
          }}
       >
          <div
            style={{
              width: `${starWidth}px`,
              height: `${starHeight}px`,
              background: `linear-gradient(90deg, transparent 0%, ${trailColor} 60%, ${starColor} 100%)`,
              filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))",
              borderRadius: `${starHeight}px`,
              transform: `rotate(${shooting.angleRad}rad)`,
              opacity: shooting.isFlying ? 0.6 : 1,
              transition: `opacity ${Math.min(400, Math.floor(shooting.durationMs * 0.25))}ms ease-out ${Math.floor(
                shooting.durationMs * 0.75
              )}ms`,
            }}
          />
        </div>
      )}

      {/* Local keyframes for glow and twinkle */}
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

export default ShootingGlowingStars;