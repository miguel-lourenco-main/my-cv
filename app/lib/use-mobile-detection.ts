"use client";

import { detectMobileDevice, MobileDetectionResult } from './mobile-detection';
import { useDeviceDetection } from './use-device-detection';

/**
 * Custom hook for mobile device detection
 * Provides reactive mobile detection that updates on window resize
 */
export function useMobileDetection(): MobileDetectionResult {
  const defaultValue: MobileDetectionResult = {
    isMobile: false,
    isPhone: false,
    isTablet: false,
    deviceType: 'desktop',
    userAgent: '',
    hasTouch: false,
    screenSize: { width: 0, height: 0 },
    orientation: 'landscape'
  };

  return useDeviceDetection(detectMobileDevice, defaultValue, false);
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
