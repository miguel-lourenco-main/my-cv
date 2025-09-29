"use client";

import { useEffect, useState } from "react";

type UseInViewOptions = {
  root?: Element | null;
  margin?: string;
  threshold?: number | number[];
  once?: boolean;
};

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
            if (once) {
              observer.disconnect();
              break;
            }
          } else if (!once) {
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


