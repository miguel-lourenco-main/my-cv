"use client";

import { useState, useEffect } from 'react';
import { detectMobileDevice, MobileDetectionResult } from './mobile-detection';

/**
 * Custom hook for mobile device detection
 * Provides reactive mobile detection that updates on window resize
 */
export function useMobileDetection(): MobileDetectionResult {
  const [detection, setDetection] = useState<MobileDetectionResult>(() => {
    // Initial detection on client side
    if (typeof window !== 'undefined') {
      return detectMobileDevice();
    }
    
    // Default values for SSR
    return {
      isMobile: false,
      isPhone: false,
      isTablet: false,
      deviceType: 'desktop',
      userAgent: '',
      hasTouch: false,
      screenSize: { width: 0, height: 0 },
      orientation: 'landscape'
    };
  });

  useEffect(() => {
    // Update detection on mount (in case of hydration mismatch)
    setDetection(detectMobileDevice());

    // Update detection on window resize
    const handleResize = () => {
      setDetection(detectMobileDevice());
    };

    // Update detection on orientation change
    const handleOrientationChange = () => {
      // Small delay to ensure screen dimensions are updated
      setTimeout(() => {
        setDetection(detectMobileDevice());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return detection;
}

/**
 * Simplified hook that only returns if device is a phone
 */
export function useIsPhone(): boolean {
  const { isPhone } = useMobileDetection();
  return isPhone;
}

/**
 * Simplified hook that only returns if device is mobile (phone or tablet)
 */
export function useIsMobile(): boolean {
  const { isMobile } = useMobileDetection();
  return isMobile;
}

/**
 * Hook that returns if device has touch capability
 */
export function useHasTouch(): boolean {
  const { hasTouch } = useMobileDetection();
  return hasTouch;
}
