/**
 * Laptop device detection utility
 * Detects laptops based on viewport dimensions and device characteristics
 * Laptops are identified by viewport height range (600px - 1200px) and exclusion of mobile/tablet devices
 */

import { detectMobileDevice } from './mobile-detection';

export interface LaptopDetectionResult {
  isLaptop: boolean;
  viewportSize: {
    width: number;
    height: number;
  };
  orientation: 'portrait' | 'landscape';
}

/**
 * Detect if device is a laptop based on viewport dimensions and device type
 * 
 * Criteria:
 * - Viewport height between 600px and 1200px (typical laptop range)
 * - Viewport width at least 1024px
 * - Landscape orientation (width > height)
 * - NOT a mobile or tablet device
 */
export function detectLaptop(): LaptopDetectionResult {
  if (typeof window === 'undefined') {
    return {
      isLaptop: false,
      viewportSize: { width: 0, height: 0 },
      orientation: 'landscape'
    };
  }

  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const isLandscape = viewportWidth > viewportHeight;
  
  // Exclude mobile and tablet devices
  const mobileDetection = detectMobileDevice();
  const isMobileDevice = mobileDetection.isMobile;
  
  // Laptop viewport height range: 600px - 1200px
  const isLaptopHeight = viewportHeight >= 600 && viewportHeight <= 1200;
  
  // Laptop viewport width should be at least 1024px
  const isLaptopWidth = viewportWidth >= 1024;
  
  // Must be in landscape orientation
  const isLaptop = !isMobileDevice && isLaptopHeight && isLaptopWidth && isLandscape;

  return {
    isLaptop,
    viewportSize: {
      width: viewportWidth,
      height: viewportHeight
    },
    orientation: isLandscape ? 'landscape' : 'portrait'
  };
}

/**
 * Check if device is a laptop
 */
export function isLaptop(): boolean {
  return detectLaptop().isLaptop;
}

