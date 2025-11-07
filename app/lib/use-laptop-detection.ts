"use client";

import { detectLaptop, LaptopDetectionResult } from './laptop-detection';
import { useDeviceDetection } from './use-device-detection';

/**
 * Custom hook for laptop device detection
 * Provides reactive laptop detection that updates on window resize
 */
export function useLaptopDetection(): LaptopDetectionResult {
  const defaultValue: LaptopDetectionResult = {
    isLaptop: false,
    viewportSize: { width: 0, height: 0 },
    orientation: 'landscape'
  };

  return useDeviceDetection(detectLaptop, defaultValue, true);
}

/**
 * Simplified hook that only returns if device is a laptop
 */
export function useIsLaptop(): boolean {
  const { isLaptop } = useLaptopDetection();
  return isLaptop;
}

