/**
 * Comprehensive mobile device detection utility
 * Uses multiple methods to accurately detect mobile devices
 */

export interface MobileDetectionResult {
  isMobile: boolean;
  isPhone: boolean;
  isTablet: boolean;
  deviceType: 'phone' | 'tablet' | 'desktop';
  userAgent: string;
  hasTouch: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  orientation: 'portrait' | 'landscape';
}

/**
 * Detect mobile devices using user agent string
 */
function detectMobileUserAgent(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // Common mobile device patterns
  const mobilePatterns = [
    /android/i,
    /webos/i,
    /iphone/i,
    /ipad/i,
    /ipod/i,
    /blackberry/i,
    /windows phone/i,
    /mobile/i,
    /opera mini/i,
    /iemobile/i,
    /mobile safari/i,
    /fennec/i,
    /minimo/i,
    /symbian/i,
    /palm/i,
    /smartphone/i,
    /htc/i,
    /samsung/i,
    /lg/i,
    /sony/i,
    /motorola/i,
    /nokia/i,
    /xiaomi/i,
    /huawei/i,
    /oneplus/i,
    /pixel/i
  ];
  
  return mobilePatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Detect if device has touch capability
 */
function hasTouchCapability(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Detect device type based on screen size and user agent
 */
function detectDeviceType(): 'phone' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const { width, height } = window.screen;
  const maxDimension = Math.max(width, height);
  const minDimension = Math.min(width, height);
  
  // iPad detection (can be tricky due to user agent changes)
  const isIPad = /ipad/i.test(userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Android tablet detection
  const isAndroidTablet = /android/i.test(userAgent) && !/mobile/i.test(userAgent);
  
  // Screen size based detection
  const isTabletBySize = maxDimension >= 768 && maxDimension <= 1024 && minDimension >= 600;
  const isPhoneBySize = maxDimension < 768;
  
  if (isIPad || isAndroidTablet || isTabletBySize) {
    return 'tablet';
  }
  
  if (isPhoneBySize || detectMobileUserAgent()) {
    return 'phone';
  }
  
  return 'desktop';
}

/**
 * Get current screen orientation
 */
function getScreenOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'landscape';
  
  const { width, height } = window.screen;
  return width > height ? 'landscape' : 'portrait';
}

/**
 * Main mobile detection function
 */
export function detectMobileDevice(): MobileDetectionResult {
  if (typeof window === 'undefined') {
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
  }
  
  const userAgent = window.navigator.userAgent;
  const hasTouch = hasTouchCapability();
  const deviceType = detectDeviceType();
  const isMobile = deviceType === 'phone' || deviceType === 'tablet';
  const isPhone = deviceType === 'phone';
  const isTablet = deviceType === 'tablet';
  const orientation = getScreenOrientation();
  
  return {
    isMobile,
    isPhone,
    isTablet,
    deviceType,
    userAgent,
    hasTouch,
    screenSize: {
      width: window.screen.width,
      height: window.screen.height
    },
    orientation
  };
}

/**
 * Check if device is specifically a phone (not tablet)
 */
export function isPhone(): boolean {
  return detectMobileDevice().isPhone;
}

/**
 * Check if device is mobile (phone or tablet)
 */
export function isMobile(): boolean {
  return detectMobileDevice().isMobile;
}

/**
 * Check if device has touch capability
 */
export function hasTouch(): boolean {
  return detectMobileDevice().hasTouch;
}
