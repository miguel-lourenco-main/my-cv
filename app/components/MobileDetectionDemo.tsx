"use client";

import { useMobileDetection } from "../lib/use-mobile-detection";

/**
 * Demo component to showcase mobile detection capabilities
 * This can be used for testing and debugging mobile detection
 */
export default function MobileDetectionDemo() {
  const detection = useMobileDetection();

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border max-w-xs text-sm">
      <h3 className="font-semibold mb-2">Mobile Detection</h3>
      <div className="space-y-1">
        <div>
          <span className="font-medium">Device Type:</span> {detection.deviceType}
        </div>
        <div>
          <span className="font-medium">Is Phone:</span> {detection.isPhone ? 'Yes' : 'No'}
        </div>
        <div>
          <span className="font-medium">Is Mobile:</span> {detection.isMobile ? 'Yes' : 'No'}
        </div>
        <div>
          <span className="font-medium">Has Touch:</span> {detection.hasTouch ? 'Yes' : 'No'}
        </div>
        <div>
          <span className="font-medium">Screen:</span> {detection.screenSize.width}×{detection.screenSize.height}
        </div>
        <div>
          <span className="font-medium">Orientation:</span> {detection.orientation}
        </div>
        <div className="mt-2 pt-2 border-t">
          <span className="font-medium text-xs">User Agent:</span>
          <div className="text-xs break-all text-slate-600 dark:text-slate-400">
            {detection.userAgent.substring(0, 50)}...
          </div>
        </div>
      </div>
    </div>
  );
}
