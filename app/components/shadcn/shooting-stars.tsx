"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/app/lib/utils";
import { useTheme } from "@/app/lib/theme-provider";

export type ShootingStarsProps = {
  minSpeed?: number; // px per second for cruise phase
  maxSpeed?: number; // px per second for cruise phase
  minDelay?: number; // ms between spawns
  maxDelay?: number; // ms between spawns
  starColor?: string;
  trailColor?: string;
  starWidth?: number; // px trail length
  starHeight?: number; // px thickness
  minTravelPx?: number; // px minimal travel distance
  className?: string;
};

type ShootingInstance = {
  id: number;
  startLeftPx: number;
  startTopPx: number;
  endLeftPx: number;
  endTopPx: number;
  angleRad: number;
  windupDistancePx: number;
  accDistancePx: number;
  windupDurationMs: number;
  accDurationMs: number;
  explosiveDurationMs: number;
  fadeDurationMs: number;
  phase: "spawning" | "windup" | "accelerating" | "explosive" | "fading";
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pickOffscreenPoint(width: number, height: number, margin: number) {
  const side = Math.floor(Math.random() * 4); // 0 top, 1 right, 2 bottom, 3 left
  switch (side) {
    case 0:
      return { x: randomBetween(-margin, width + margin), y: -margin };
    case 1:
      return { x: width + margin, y: randomBetween(-margin, height + margin) };
    case 2:
      return { x: randomBetween(-margin, width + margin), y: height + margin };
    default:
      return { x: -margin, y: randomBetween(-margin, height + margin) };
  }
}

export default function ShootingStars({
  minSpeed = 600,
  maxSpeed = 1200,
  minDelay = 1000,
  maxDelay = 2000,
  starColor = "#9E00FF",
  trailColor = "#FFFFFF",
  starWidth = 140,
  starHeight = 2,
  minTravelPx = 700,
  className,
}: ShootingStarsProps) {
  const { theme } = useTheme();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [shooting, setShooting] = useState<ShootingInstance | null>(null);

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
      const margin = 120;
      const diagonal = Math.hypot(width, height);
      const desiredTotalDistance = Math.max(minTravelPx, diagonal + margin * 2);

      // Compute viewport rect relative to container
      const el = wrapperRef.current;
      const rect = el ? el.getBoundingClientRect() : { top: 0, height } as DOMRect;
      const viewportTopInContainer = -rect.top;
      const viewportBottomInContainer = viewportTopInContainer + window.innerHeight;

      // Choose start outside viewport but within the page (container)
      let startX = randomBetween(0, width);
      let startY = 0;
      const topRangeMax = Math.max(0, viewportTopInContainer - margin);
      const bottomRangeMin = Math.min(height, viewportBottomInContainer + margin);
      const topRangeAvailable = topRangeMax > 0;
      const bottomRangeAvailable = bottomRangeMin < height;
      if (topRangeAvailable && bottomRangeAvailable) {
        if (Math.random() < 0.5) {
          startY = randomBetween(0, topRangeMax);
        } else {
          startY = randomBetween(bottomRangeMin, height);
        }
      } else if (topRangeAvailable) {
        startY = randomBetween(0, topRangeMax);
      } else if (bottomRangeAvailable) {
        startY = randomBetween(bottomRangeMin, height);
      } else {
        // Fallback: start horizontally outside viewport
        startX = Math.random() < 0.5 ? -margin : width + margin;
        startY = randomBetween(0, height);
      }

      // Bias direction roughly towards viewport center to increase visibility
      const viewportCenterX = width / 2;
      const viewportCenterY = viewportTopInContainer + Math.min(window.innerHeight, height) / 2;
      const baseAngle = Math.atan2(viewportCenterY - startY, viewportCenterX - startX);
      const theta = baseAngle + randomBetween(-0.5, 0.5);
      const ux = Math.cos(theta);
      const uy = Math.sin(theta);

      const endX = startX + ux * desiredTotalDistance;
      const endY = startY + uy * desiredTotalDistance;

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const distance = Math.hypot(deltaX, deltaY);
      const angleRad = Math.atan2(deltaY, deltaX);

      // Phase distances
      const windupDistancePx = Math.min(120, Math.max(60, distance * 0.06));
      const accDistancePx = Math.min(260, Math.max(distance * 0.18, minTravelPx * 0.18));

      // Phase durations
      const windupDurationMs = Math.floor(randomBetween(800, 1100));
      const accDurationMs = Math.floor(randomBetween(600, 900));
      const explosiveDurationMs = Math.floor(randomBetween(1500, 2500));

      const instance: ShootingInstance = {
        id: Date.now(),
        startLeftPx: startX,
        startTopPx: startY,
        endLeftPx: endX,
        endTopPx: endY,
        angleRad,
        windupDistancePx,
        accDistancePx,
        windupDurationMs,
        accDurationMs,
        explosiveDurationMs,
        fadeDurationMs: 500,
        phase: "spawning",
      };
      setShooting(instance);
      requestAnimationFrame(() => {
        setShooting((prev) => (prev && prev.id === instance.id ? { ...prev, phase: "windup" } : prev));
      });
    };

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
  }, [containerSize.width, containerSize.height, minDelay, maxDelay, minSpeed, maxSpeed, minTravelPx]);

  const handleTransitionEnd = useCallback(() => {
    setShooting((prev) => {
      if (!prev) return prev;
      if (prev.phase === "windup") {
        return { ...prev, phase: "accelerating" };
      }
      if (prev.phase === "accelerating") {
        return { ...prev, phase: "explosive" };
      }
      if (prev.phase === "explosive") {
        return { ...prev, phase: "fading" };
      }
      return null;
    });
  }, []);

  // Compute transforms based on phase
  const getTransformForPhase = (s: ShootingInstance) => {
    const { startLeftPx, startTopPx, endLeftPx, endTopPx, windupDistancePx, accDistancePx } = s;
    const dx = endLeftPx - startLeftPx;
    const dy = endTopPx - startTopPx;
    const distance = Math.hypot(dx, dy);
    if (distance === 0) return `translate(${startLeftPx}px, ${startTopPx}px)`;
    const ux = dx / distance;
    const uy = dy / distance;
    if (s.phase === "spawning") {
      return `translate(${startLeftPx}px, ${startTopPx}px)`;
    }
    if (s.phase === "windup") {
      const wx = startLeftPx + ux * windupDistancePx;
      const wy = startTopPx + uy * windupDistancePx;
      return `translate(${wx}px, ${wy}px)`;
    }
    if (s.phase === "accelerating") {
      const ax = startLeftPx + ux * (windupDistancePx + accDistancePx);
      const ay = startTopPx + uy * (windupDistancePx + accDistancePx);
      return `translate(${ax}px, ${ay}px)`;
    }
    // explosive and fading both at end position
    return `translate(${endLeftPx}px, ${endTopPx}px)`;
  };

  const getTransitionForPhase = (s: ShootingInstance) => {
    if (s.phase === "spawning") return "none";
    if (s.phase === "windup") {
      return `transform ${s.windupDurationMs}ms cubic-bezier(0.2, 0.0, 0.0, 1)`; // very slow start
    }
    if (s.phase === "accelerating") {
      return `transform ${s.accDurationMs}ms cubic-bezier(0.8, 0.0, 1, 1)`; // fast acceleration
    }
    if (s.phase === "explosive") {
      return `transform ${s.explosiveDurationMs}ms linear`;
    }
    return "none";
  };

  const getOpacityForPhase = (s: ShootingInstance) => {
    if (s.phase === "spawning") return 0.0; // start invisible
    if (s.phase === "windup") return 0.6; // fade in during windup
    if (s.phase === "fading") return 0.0;
    return 0.6; // accelerating and explosive
  };

  const getOpacityTransitionForPhase = (s: ShootingInstance) => {
    if (s.phase === "windup") {
      return `opacity ${s.windupDurationMs}ms ease-in`;
    }
    if (s.phase === "fading") {
      return `opacity ${s.fadeDurationMs}ms ease-out`;
    }
    return "none";
  };

  const isTrailPhase = (s: ShootingInstance) => s.phase === "accelerating" || s.phase === "explosive";
  const getWidthForPhase = (s: ShootingInstance) => (isTrailPhase(s) ? starWidth : Math.max(starHeight * 2, 6));
  
  // Theme-aware colors: darker colors in light mode, lighter colors in dark mode
  const getThemeAwareColors = () => {
    if (isDarkMode) {
      return {
        starColor: starColor, // Keep original purple in dark mode
        trailColor: trailColor // Keep original white in dark mode
      };
    } else {
      return {
        starColor: "#4A0080", // Darker purple for light mode
        trailColor: "#000000" // Black trail for light mode
      };
    }
  };
  
  const getBackgroundForPhase = (s: ShootingInstance) => {
    const colors = getThemeAwareColors();
    return isTrailPhase(s)
      ? `linear-gradient(90deg, transparent 0%, ${colors.trailColor} 60%, ${colors.starColor} 100%)`
      : colors.starColor;
  };

  return (
    <div ref={wrapperRef} className={cn("pointer-events-none relative h-full w-full overflow-hidden", className)}>
      {shooting && (
        <div
          key={shooting.id}
          className="absolute"
          onTransitionEnd={handleTransitionEnd}
          style={{
            left: 0,
            top: 0,
            transform: getTransformForPhase(shooting),
            transition: getTransitionForPhase(shooting),
          }}
        >
          <div
            style={{
              width: `${getWidthForPhase(shooting)}px`,
              height: `${starHeight}px`,
              background: getBackgroundForPhase(shooting),
              filter: isDarkMode 
                ? "drop-shadow(0 0 6px rgba(255,255,255,0.9))" 
                : "drop-shadow(0 0 6px rgba(0,0,0,0.9))",
              borderRadius: `${starHeight}px`,
              transform: `rotate(${shooting.angleRad}rad)`,
              opacity: getOpacityForPhase(shooting),
              transition: getOpacityTransitionForPhase(shooting),
            }}
          />
        </div>
      )}
    </div>
  );
}