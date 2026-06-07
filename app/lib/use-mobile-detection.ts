"use client";

import { useDeviceDetectionContext } from './device-detection-context';
import type { MobileDetectionResult } from './mobile-detection';

export function useMobileDetection(): MobileDetectionResult {
  return useDeviceDetectionContext().mobile;
}

export function useIsPhone(): boolean {
  return useDeviceDetectionContext().mobile.isPhone;
}

export function useIsMobile(): boolean {
  return useDeviceDetectionContext().mobile.isMobile;
}

export function useHasTouch(): boolean {
  return useDeviceDetectionContext().mobile.hasTouch;
}
