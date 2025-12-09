"use client";

import { useEffect, useState } from "react";

/**
 * Options for configuring the Intersection Observer behavior.
 */
type UseInViewOptions = {
  /** Root element for intersection calculation (null = viewport) */
  root?: Element | null;
  /** Margin around the root (e.g., "10px 20px") */
  margin?: string;
  /** Threshold(s) for intersection (0-1 or array) */
  threshold?: number | number[];
  /** If true, only trigger once when element enters viewport */
  once?: boolean;
};

/**
 * Hook to detect when a target element enters or leaves the viewport.
 * Uses Intersection Observer API for efficient viewport detection.
 * 
 * @param target - React ref to the element to observe
 * @param options - Configuration options for the Intersection Observer
 * @param options.root - Root element for intersection (default: null/viewport)
 * @param options.margin - Margin around root (default: "0px")
 * @param options.threshold - Intersection threshold 0-1 (default: 0.15)
 * @param options.once - Only trigger once when entering viewport (default: true)
 * @returns Boolean indicating if element is currently in view
 * 
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * const inView = useInView(ref, { threshold: 0.5 });
 * 
 * return <div ref={ref}>{inView ? 'Visible' : 'Hidden'}</div>;
 * ```
 */
export function useInView(target: React.RefObject<Element | null>, options: UseInViewOptions = {}) {
  const { root = null, margin = "0px", threshold = 0.15, once = true } = options;
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = target.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            // Disconnect observer if we only want to detect once
            if (once) {
              observer.disconnect();
              break;
            }
          } else if (!once) {
            // Only update to false if not in "once" mode
            setInView(false);
          }
        }
      },
      { root, rootMargin: margin, threshold }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [target, root, margin, JSON.stringify(threshold), once]);

  return inView;
}


