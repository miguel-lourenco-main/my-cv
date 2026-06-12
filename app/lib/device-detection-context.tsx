"use client";

import { createContext, useContext, type ReactNode } from "react";
import { detectLaptop, type LaptopDetectionResult } from "./laptop-detection";
import { detectMobileDevice, type MobileDetectionResult } from "./mobile-detection";
import { useDeviceDetection } from "./use-device-detection";

const DEFAULT_MOBILE_DETECTION: MobileDetectionResult = {
  isMobile: false,
  isPhone: false,
  isTablet: false,
  deviceType: "desktop",
  userAgent: "",
  hasTouch: false,
  screenSize: { width: 0, height: 0 },
  orientation: "landscape",
};

const DEFAULT_LAPTOP_DETECTION: LaptopDetectionResult = {
  isLaptop: false,
  viewportSize: { width: 0, height: 0 },
  orientation: "landscape",
};

export type DeviceDetectionContextValue = {
  mobile: MobileDetectionResult;
  laptop: LaptopDetectionResult;
  isLaptop: boolean;
};

// Exported so the 3D shell can re-provide this value inside drei <Html> portals,
// which otherwise lose React context across the R3F renderer boundary.
export const DeviceDetectionContext = createContext<DeviceDetectionContextValue | null>(null);

export function DeviceDetectionProvider({ children }: { children: ReactNode }) {
  const mobile = useDeviceDetection(detectMobileDevice, DEFAULT_MOBILE_DETECTION, true);
  const laptop = useDeviceDetection(detectLaptop, DEFAULT_LAPTOP_DETECTION, true);

  return (
    <DeviceDetectionContext.Provider
      value={{
        mobile,
        laptop,
        isLaptop: laptop.isLaptop,
      }}
    >
      {children}
    </DeviceDetectionContext.Provider>
  );
}

export function useDeviceDetectionContext(): DeviceDetectionContextValue {
  const value = useContext(DeviceDetectionContext);
  if (!value) {
    throw new Error("useDeviceDetectionContext must be used within DeviceDetectionProvider");
  }
  return value;
}
