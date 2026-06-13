/**
 * Laptop device detection utility
 * Detects laptops based on viewport dimensions and device characteristics
 * Laptops/desktops are identified by a minimum viewport height (600px+), a minimum width, landscape orientation, and exclusion of mobile/tablet devices
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
 * - Viewport height at least 600px (no upper bound — tall desktop monitors qualify)
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
  
  // Minimum viewport height only. The previous 1200px upper bound wrongly
  // excluded tall desktop monitors (1440p/4K, viewport height > 1200px), which
  // dropped them out of the immersive 3D shell into the 2D fallback.
  const isLaptopHeight = viewportHeight >= 600;
  
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

