"use client";

import { useState, useEffect } from 'react';
import { detectLaptop, LaptopDetectionResult } from './laptop-detection';

/**
 * Custom hook for laptop device detection
 * Provides reactive laptop detection that updates on window resize
 */
export function useLaptopDetection(): LaptopDetectionResult {
  const [detection, setDetection] = useState<LaptopDetectionResult>(() => {
    // Initial detection on client side
    if (typeof window !== 'undefined') {
      return detectLaptop();
    }
    
    // Default values for SSR
    return {
      isLaptop: false,
      viewportSize: { width: 0, height: 0 },
      orientation: 'landscape'
    };
  });

  useEffect(() => {
    // Update detection on mount (in case of hydration mismatch)
    setDetection(detectLaptop());

    // Debounced resize handler for better performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setDetection(detectLaptop());
      }, 100);
    };

    // Update detection on orientation change
    const handleOrientationChange = () => {
      // Small delay to ensure viewport dimensions are updated
      setTimeout(() => {
        setDetection(detectLaptop());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return detection;
}

/**
 * Simplified hook that only returns if device is a laptop
 */
export function useIsLaptop(): boolean {
  const { isLaptop } = useLaptopDetection();
  return isLaptop;
}

