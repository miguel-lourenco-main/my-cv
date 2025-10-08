"use client";

import React, { useEffect, useState } from "react";
import { ParallaxProvider } from "react-scroll-parallax";

type ParallaxRootProps = {
  children: React.ReactNode;
};

export default function ParallaxRoot({ children }: ParallaxRootProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  // Library doesn't have a global disable prop; we'll pass speed={0} at call sites when reducedMotion
  return <ParallaxProvider>{children}</ParallaxProvider>;
}


