"use client";

import { useDeviceDetectionContext } from './device-detection-context';

export function useLaptopDetection(): boolean {
  return useDeviceDetectionContext().isLaptop;
}

export function useIsLaptop(): boolean {
  return useDeviceDetectionContext().isLaptop;
}

export function useIsDesktop(): boolean {
  return !useDeviceDetectionContext().isLaptop;
}
