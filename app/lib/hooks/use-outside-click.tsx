import React, { useEffect } from "react";

/**
 * Hook to detect clicks outside of a referenced element.
 * Useful for closing modals, dropdowns, or other overlays when clicking outside.
 * Handles both mouse and touch events for mobile compatibility.
 * 
 * @param ref - React ref to the element to detect outside clicks for
 * @param callback - Function to call when an outside click is detected
 * 
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useOutsideClick(ref, () => setIsOpen(false));
 * 
 * return <div ref={ref}>Content</div>;
 * ```
 */
export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  callback: Function,
) => {
  useEffect(() => {
    const listener = (event: any) => {
      // Ignore clicks inside the referenced element
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      callback(event);
    };

    // Listen for both mouse and touch events
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};