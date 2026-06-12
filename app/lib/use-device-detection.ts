"use client";

import { useState, useEffect, useRef } from 'react';

/**
 * Generic hook for device detection that works with any detection function
 * Provides reactive detection that updates on window resize and orientation change
 * @param detectionFn - Function that returns the detection result
 * @param defaultValue - Default value for SSR
 * @param debounceResize - Whether to debounce resize events (default: true)
 */
export function useDeviceDetection<T>(
  detectionFn: () => T,
  defaultValue: T,
  debounceResize: boolean = true
): T {
  const detectionFnRef = useRef(detectionFn);
  detectionFnRef.current = detectionFn;

  // Always start from the SSR default so the first client render matches the
  // server markup exactly (no hydration mismatch). The effect below re-detects
  // immediately after mount, so the real device values apply on the next tick.
  const [detection, setDetection] = useState<T>(defaultValue);

  useEffect(() => {
    // Update detection on mount (in case of hydration mismatch)
    setDetection(detectionFnRef.current());

    // Resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      if (debounceResize) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          setDetection(detectionFnRef.current());
        }, 100);
      } else {
        setDetection(detectionFnRef.current());
      }
    };

    // Update detection on orientation change
    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(() => {
        setDetection(detectionFnRef.current());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      if (debounceResize) {
        clearTimeout(resizeTimeout);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [debounceResize]);

  return detection;
}

